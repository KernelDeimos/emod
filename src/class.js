const { conventionalConstructor } = require("./common");

const Class = {};

Class.fromModel = model => {
    const modelConstructor = model.methods.find(m => m.name === 'constructor');
    const outputClass = modelConstructor
        ? function () { modelConstructor.apply(this, arguments); }
        : function () { conventionalConstructor.apply(this, arguments) };

    Object.defineProperty(outputClass, 'name', {
        value: model.name,
        configurable: true,
    });
    
    for ( const prop of model.properties ) {
        Object.defineProperty(outputClass.prototype, prop.name, {
            enumerable: prop.enumerable !== undefined ? prop.enumerable : true,
            configurable: true,
            ...(prop.setter ? { set: prop.setter } : {}),
            ...(prop.getter ? { get: prop.getter } : {}),
        })
    }

    for ( const method of model.methods ) {
        if ( method.static ) {
            outputClass[method.name] = method.instance;
            continue;
        }
        outputClass.prototype[method.name] = method.instance;
    }

    return outputClass;
};

Class.getInheritanceChain = cls => {
    const rootProto = Reflect.getPrototypeOf(Object);
    const allClasses = [];
    let currentClass = cls;
    while ( currentClass != rootProto ) {
        // TODO: benchmark against push() followed by reverse()
        allClasses.unshift(currentClass);
        currentClass = Reflect.getPrototypeOf(currentClass)
    }
    return allClasses;
};

module.exports = { Class };
