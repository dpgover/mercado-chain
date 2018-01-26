let MercadoChain = artifacts.require("./MercadoChain.sol");

module.exports = function(deployer) {
  deployer.deploy(MercadoChain);
};
