var Migrations = artifacts.require("./Migrations.sol");
var Contamination = artifacts.require("./Contamination.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Contamination);
};
