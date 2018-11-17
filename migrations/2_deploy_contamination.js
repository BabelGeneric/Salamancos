var Contamination = artifacts.require("./Contamination.sol");

module.exports = function(deployer) {
  deployer.deploy(Contamination);
};
