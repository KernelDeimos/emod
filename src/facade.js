const { Class } = require("./class");
const { ProxyModeller } = require("./proxy");

const EM = {};

EM.createProxy = input => {
    const proxyModel = ProxyModeller.fromClass(input);
    return Class.fromModel(proxyModel);
};

module.exports = { EM };
