const { Class } = require("./class");
const { Null } = require("./null");

const ProxyModeller = {};
ProxyModeller.fromModel = model => {
    const proxyModel = {
        name: model.name,
        properties: [],
        methods: [],
    };
    for ( const prop of model.properties ) {
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

    proxyModel.methods.push({
        name: 'init',
        instance: function () {
            this.delegate_ = new nullClass();
        }
    });

    return proxyModel;
};
ProxyModeller.fromClass = cls => ProxyModeller.fromModel(cls.toModel({ deep: true }));

module.exports = { ProxyModeller };
