const { Class } = require('./class');
const { ParentOfBase } = require('./common');

const Model = {};

Model.fromClass = (cls, opt_options) => {
    const DEFAULT_OPTIONS = {
        deep: false,
        constructor: false,
    };
    const options = { ...DEFAULT_OPTIONS, ...(opt_options || {}) };
    const model = {
        name: cls.name,
        properties: [],
        methods: [],
    };

    // TODO: evaluate this idea
    /*
    const inheritanceChain = Class.getInheritanceChain(cls);
    const extendName = inheritanceChain[0] === ParentOfBase
        ? inheritanceChain.length > 3 ? inheritanceChain.slice(-2)[0] : null
        : inheritanceChain.length > 1 ? inheritanceChain.slice(-2)[0] : null;

    if ( extendName !== null && ! options.deep ) model.extends = extendName;
    */

    const classes = options.deep ? Class.getInheritanceChain(cls) : [cls];
    for ( const cls of classes ) {
        const proto = cls.prototype;
        const keys = Reflect.ownKeys(proto);
        for ( const key of keys ) {
            if ( ! options.constructor && key === 'constructor' ) {
                continue;
            }

            // Handle methods
            if ( typeof proto[key] === 'function' ) {
                model.methods.push({
                    name: key,
                    instance: proto[key],
                });
                continue;
            }

            // Handle properties
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            model.properties.push({
                name: key,
                ...(descriptor.get ? { getter: descriptor.get } : {}),
                ...(descriptor.set ? { setter: descriptor.set } : {}),
            });
        }
    }

    return model;
};

module.exports = { Model };
