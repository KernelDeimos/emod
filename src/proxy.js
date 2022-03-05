const { Class } = require("./class");
const { Model } = require("./model");
const { Null } = require("./null");

const ProxyModeller = {};
ProxyModeller.fromModel = model => {
    const proxyModel = {
        name: `Proxy${model.name}`,
        properties: [],
        methods: [],
    };
    for ( const prop of model.properties ) {
        // TODO: With this approach it is not possible to forward a property
        //       named 'delegate'.
        if ( prop.name === 'delegate' ) continue;
        proxyModel.properties.push({
            name: prop.name,
            getter: function () {
                return this.delegate_[prop.name];
            },
            setter: function (val) {
                this.delegate_[prop.name] = val;
            }
        });
    }
    for ( const method of model.methods ) {
        if ( method.name === 'init' ) continue;
        proxyModel.methods.push({
            name: method.name,
            instance: function (...args) {
                return this.delegate_[method.name](...args);
            }
        });
    }

    const nullModel = Null.fromModel(model);
    const nullClass = Class.fromModel(nullModel);

    proxyModel.properties.push({
        name: 'delegate',
        setter (v) {
            this.delegate_ = v;
        },
        getter () {
            return this.delegate_;
        },
    });
    proxyModel.methods.push({
        name: 'init',
        instance: function () {
            if ( ! this.delegate_ ) {
                this.delegate_ = new nullClass();
            }
        }
    });

    return proxyModel;
};
ProxyModeller.fromClass = cls => ProxyModeller.fromModel(Model.fromClass(cls, { deep: true }));

module.exports = { ProxyModeller };
