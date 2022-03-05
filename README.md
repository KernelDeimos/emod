# EMod: EMCAScript Modelling utility

***Bring your javascript code into 2022***

This package brings the benefits of **axiomatic classes** to existing ES6
classes. We hope that this README.md will convey the benefits of axiomatic
classes and why this is a great addition to _any_ existing or new ES6 project.

## Quick Start / Demonstration of Usefulness

When using the decorator pattern it is useful to have a base class called a
"Proxy". **Here's what that looks like without EMod.**

```javascript
class Greeter {
    constructor (subject) { this.subject = subject; }
    sayHello () { return `Hello, ${this.subject}!`; }
    sayGoodbye () { return `Goodbye, ${this.subject}!`; }
}
class ProxyGreeter {
    constructor (delegate) { this.delegate = delegate; }
    sayHello () { return this.delegate.sayHello(); }
    sayGoodbye () { return this.delegate.sayGoodbye(); }
}
class ExcitedHelloGreeter extends ProxyGreeter {
    sayHello () { return this.delegate.sayHello().toUpperCase() }
}
```

ProxyGreeter allows a decorator to only override specific methods.
This saves us having to update every decorator when `Greeter` is changed,
however the same problem still exists elsewhere.
- Adding/removing a method on Greeter requires updating ProxyGreeter
- This problem is multiplied by the number of classes uising a Proxy
- This problem is _also_ multiplied by types of utility classes
  - Imagine NullGreeter, GreeterBuilder, GreeterComponent, etc

If we have proxies for many classes, this doesn't scale well.
Worse yet, Proxy is not the only utility class you might have. You may
have Null versions of classes, optimized deserializers, and so forth.

**Here's the same example using EMod.**

```javascript
const { EM } = require('emod');
class Greeter {
    constructor (subject) { this.subject = subject; }
    sayHello () { return `Hello, ${this.subject}!`; }
    sayGoodbye () { return `Goodbye, ${this.subject}!`; }
}
class ExcitedHelloGreeter extends EM.createProxy(Greeter) {
    sayHello () { return this.delegate_.sayHello().toUpperCase() }
}
```

In this example ProxyGreeter already exists _implicitly_ because there is a
class named Greeter. We get it using `EM.createProxy(Greeter)`. We may also
wish the store that in a constant named `ProxyGreeter`.

Because 'Greeter' can be turned into a model, the Greeter class can gain new
functionality without any code being added to it! It already has a Proxy class;
imagine UI generators, SQL generators, etc - all generated from Greeter.

## Diving Deeper

***So, how does this work?***

Behind the scenes the `EM` utility is converting the Greeter class into a
model first, and then using another builtin utility to make the proxy.

```javascript
const { Model, ProxyModeller, Class } = require('emod');
// ... class Greeter { ... } ...
const modelForGreeter = Model.fromClass(Greeter);
const modelForProxy = ProxyModeller.fromModel(modelForGreeter, { deep: true });
const ProxyGreeter = Class.fromModel(modelForProxy);
```

**modelForGreeter:**
```javascript
{
  name: 'Greeter',
  properties: [],
  methods: [
    { name: 'sayHello', instance: sayHello () {
        return `Hello, ${this.subject}!`; } },
    { name: 'sayGoodbye', instance: sayGoodbye () {
        return `Goodbye, ${this.subject}!`; } }
  ]
}
```

**modelForProxy:**
```javascript
{
  name: 'ProxyGreeter',
  properties: [
    {
      name: 'delegate',
      setter: [Function: setter],
      getter: [Function: getter]
    }
  ],
  methods: [
    { name: 'sayHello', instance: function (...a) {
        return this.delegate_.sayHello(...a) } },
    { name: 'sayGoodbye', instance: function (...a) {
        return this.delegate_.sayGoodbye(...a) } },
    { name: 'init', instance: function () {
        if ( ! this.delegate_ ) {
            this.delegate_ = new Null.fromModel(modelForGreeter)();
        }
    } }
  ]
}
```

## Background

### What is an axiomatic class?
An axiomatic class is defined using **models**. You may be familiar with models
in frameworks like these:
[Django](https://www.djangoproject.com/),
[Rails](rubyonrails.org),
[Entity Framework](https://docs.microsoft.com/en-us/ef/).

By modelling your classes, you allow your classes to gain new features over time
without adding any code to them explicitly. This is because models are
essentially just data: from a modelled class you can generate database schemas,
user interfaces, other utility classes, parsers, DSLs, and the list goes on.

EMod's class models are **axiomatic**. This means the model is built up from
smaller components called **axioms**. Properties and methods are examples of
axioms, however it is possible to define more axioms after a class is converted
to a model. Think about this like attaching additional data to your class which
new features can later build upon to imply functionality - functionality that
you never had to write manually!

### Some Backstory
In 2016, Kevin G. R. Greer, a famous computer scientist, wrote
[this article](https://medium.com/@kgrgreer/this-video-explains-what-i-see-to-be-the-big-problem-with-standard-classes-ie-211068e44971)
describing how the origins of
Javascript's prototypical inheritance reveal dormant modelling capabilities
within the language. This is key to understanding the motivation behind his
framework [FOAM](https://github.com/kgrgreer/foam3)
             (Feature-Oriented Active Modeller).

The implementation of axiomatic class models used by EMod is inspired by
[FOAM](https://github.com/kgrgreer/foam3).
Kevin attributes the idea of axiomatic classes to a family of languages called
Description Logics.

FOAM is packed with features including a common interface for data access,
code generation targeting Java and Swift, and much more. EMod, in contrast,
intends to be a tiny utility that does nothing more than provide modelling.
