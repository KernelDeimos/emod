const { Class } = require("./class");
const { conventionalConstructor, ParentOfBase } = require("./common");
const { Model } = require("./model");
const { Null } = require("./null");
const { ProxyModeller } = require("./proxy");

class Base extends ParentOfBase {
    constructor (...args) {
        super();
        conventionalConstructor.apply(this, args);
    }
    static create(...args) {
        return new this(...args);
    }
    static toModel(opt_options) {
        return Model.fromClass(this, opt_options);
    }
    static getInheritanceChain() {
        return Class.getInheritanceChain(this);
    }
    static toNullClass() {
        const nullModel = Null.fromClass(this);
        const outputClass = Class.fromModel(nullModel);
        return outputClass;
    }
    static toProxyClass () {
        const proxyModel = ProxyModeller.fromClass(this);
        const outputClass = Class.fromModel(proxyModel);
        return outputClass;
    }
    init () {}
}

module.exports = { Base };
