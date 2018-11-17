App = {
    web3Provider: null,
    contracts: {},
    account: null,
    instance: null,
    contractAmount: 0,
    retirableFunds: 0,
  
    init: async function() {
       
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
      // Is there an injected web3 instance?
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
      } else {
        // If no intected web3 instance is detected, fall back to Ganache
        App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
      }
  
      web3 = new Web3(App.web3Provider);
  
      return App.initContract();
    },
    
    initContract: function() {
      $.getJSON("../Contamination.json", function(data){
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var ContaminationArtifact = data;
        App.contracts.Contamination = TruffleContract(ContaminationArtifact);
  
        // Set the provider for our contract
        App.contracts.Contamination.setProvider(App.web3Provider);

        //Save default account for later use
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
    
          App.account = accounts[0];
        });
        
        //Save deployed contract instance
        App.contracts.Contamination.deployed().then(function(instance) {
          App.instance = instance;

          //Update company count
          App.instance.getRegisteredCompaniesCount.call().then(function(result) {
            document.getElementById("companyCount").textContent = result;
          });
          //Update contract balance
          App.instance.getCurrentBalance.call().then(function(result) {
            App.contractAmount = parseInt(result) / 1000000000000000000;
            document.getElementById("contractBalance").textContent = App.contractAmount;
          });
          //Update retirable funds
          App.instance.totalAmountAvailableForOwner.call().then(function(result) {
            App.retirableFunds = parseInt(result) / 1000000000000000000;
            document.getElementById("availableBalanceToRetrieve").textContent = App.retirableFunds;
          });
        });
      });
    },

    createCompany: function() {
        var companyName = document.getElementById("companyName").value;
        var valueEth = document.getElementById("valueEth").value;
        var valueEthInt = parseInt(valueEth);

        App.instance.registerCompany.sendTransaction(companyName, {from: App.account, gas : 4712388, value : web3.toWei(valueEthInt, 'ether')}).then(function(result) {
          alert("Compañia registrada correctamente!!"); 
        }).catch(function(err) {
          console.log(err.message);
        });
    },
    activateCompany: function() {
      var companyAddress = document.getElementById("companyAddressActive").value;
      var reqFunds = parseInt(document.getElementById("requiredFunds").value);
      App.instance.activateCompany.sendTransaction(companyAddress, reqFunds, 
        {from: App.account, gas : 4712388, value : 0}).then(function(result) {
          alert("Se ha activado correctamente la empresa con el ID " + companyAddress);
      }).catch(function(err) {
        alert("Se ha activado correctamente la empresa con el ID " + companyAddress);
      });
    },
    registerSensor: function() {
      var companyAddress = document.getElementById("companyAddressForSensor").value;
      var sensorAddressForCompany = document.getElementById("sensorAddressForCompany").value;
      App.instance.registerSensor.sendTransaction(companyAddress, sensorAddressForCompany, 
        {from: App.account, gas : 4712388, value : 0}).then(function(result) {
          alert("Se ha asignado correctamente el sensor "+ sensorAddressForCompany + " a la empresa con el ID " + companyAddress);
      }).catch(function(err) {
        alert("Se ha asignado correctamente el sensor "+ sensorAddressForCompany + " a la empresa con el ID " + companyAddress);
      });
    },
    retrieveFunds: function() {
      var amountToRetrieve = parseInt(document.getElementById("amountToRetrieve").value);
      App.instance.transferFundsToOwner.sendTransaction(web3.toWei(amountToRetrieve, 'ether'), 
        {from: App.account, gas : 4712388, value : 0}).then(function(result) {
      }).catch(function(err) {
        alert("Not enough funds on the contract to retrieve");
      });
    },
    getCompanyInfo: function() {
      var companyAddress = document.getElementById("companyAddressInfo").value;
      App.instance.getCompanyInfo.call(companyAddress).then(function(result) {
        alert(result); 
        console.log(result);
      }).catch(function(err) {
        console.log(err.message);
      });
    }
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });