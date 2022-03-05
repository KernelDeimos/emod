const { assert } = require('chai');
const { Base } = require('../src/base');
const { Class } = require('../src/class');
const { EM } = require('../src/facade');
const { Model } = require('../src/model');
const { Null } = require('../src/null');
const { ProxyModeller } = require('../src/proxy');

class TestClassA extends Base {
    init () {
        this.value_ = null;
    }
    testVoidFn (sideEffect) {
        if ( sideEffect ) sideEffect('testVoidFn');
    }
    testValueFn () {
        return 'hello';
    }
    set value (val) {
        this.value_ = val;
    }
    get value () {
        return this.value_;
    }
}

class TestClassNotExtendsBase {
    constructor (val) {
        this.hello = val;
    }
}

class TestExtendsNonBase extends TestClassNotExtendsBase {
    constructor (val) {
        super(val);
        this.world = 'world';
    }
}

describe('Base', () => {
    it('should produce its own model', () => {
        const model = Base.toModel();
        const expectedModel = {
            name: 'Base',
            methods: [
                {
                    name: 'init',
                    instance: Base.prototype.init
                }
            ],
            properties: []
        };
        assert.deepEqual(model, expectedModel);
    });
    it('uses "conventional constructor"', () => {
        const base = new Base({ a: 'a', b: 'y' }, { b: 'b', c: 'c' });
        assert.sameMembers([base.a, base.b, base.c], ['a', 'b', 'c']);
    });
});

describe('Class', () => {
    it('preserves constructor for non-conventional classes', () => {
        // TODO: this is currently not supported
    })
});

describe('Null', () => {
    it('allows method calls', () => {
        const nullModel = Null.fromClass(TestClassA);
        for ( const method of nullModel.methods ) {
            assert.doesNotThrow(() => {
                method.instance();
            }, 'null method should be callable')
        }
    });
    it('allows property setters', () => {
        const nullModel = Null.fromClass(TestClassA);
        const prop = nullModel.properties.find(prop => prop.name == 'value');
        assert.exists(prop.setter, 'setter must exist');
        assert.doesNotThrow(() => {
            prop.setter.call({})
        })
    });
    it('disallows property getters', () => {
        const nullModel = Null.fromClass(TestClassA);
        const prop = nullModel.properties.find(prop => prop.name == 'value');
        assert.exists(prop.setter, 'setter must exist');
        assert.throws(() => {
            prop.getter.call()
        })
    });
});

describe('Proxy', () => {
    var proxyModelA, proxyClassA, proxyA;
    beforeEach(() => {
        proxyModelA = ProxyModeller.fromClass(TestClassA);
        proxyClassA = Class.fromModel(proxyModelA);
        proxyA = new proxyClassA();
    });
    it('defaults to null delegate', () => {
        const nullDelegate = proxyA.delegate_;
        assert.equal(nullDelegate.constructor.name, 'NullTestClassA');
    });
    it('proxies methods', () => {
        proxyA.delegate_ = {
            testValueFn: () => 'yes',
        };
        assert.equal(
            proxyA.testValueFn(),
            'yes',
        );
    });
    it('proxies getters', () => {
        proxyA.delegate_ = { value: 'yes' };
        assert.equal(proxyA.value, 'yes');
    })
    it('proxies setters', () => {
        const o = { value: false };
        proxyA.delegate_ = o;
        proxyA.value = true;
        assert.isTrue(o.value);
    })
})

describe('README.md example', () => {
    describe('Proxy Without EMod', () => {
        it('works', () => {
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

            let greeter = new Greeter('World');
            greeter = new ExcitedHelloGreeter(greeter);
            assert.equal(greeter.sayHello(), 'HELLO, WORLD!');
        })
    })
    describe('Proxy Using EMod', () => {
        it('works', () => {
            class Greeter {
                constructor (subject) { this.subject = subject; }
                sayHello () { return `Hello, ${this.subject}!`; }
                sayGoodbye () { return `Goodbye, ${this.subject}!`; }
            }
            const ProxyGreeter = EM.createProxy(Greeter);
            class ExcitedHelloGreeter extends ProxyGreeter {
                sayHello () { return this.delegate_.sayHello().toUpperCase() }
            }

            let greeter = new Greeter('World');
            greeter = new ExcitedHelloGreeter({ delegate: greeter });
            assert.equal(greeter.sayHello(), 'HELLO, WORLD!');
        })
    })
})
