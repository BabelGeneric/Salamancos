App = {
    web3Provider: null,
    contracts: {},
    promise: null,
  
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

        var contaminationInstance;
        App.contracts.Contamination.deployed().then(function(instance) {
          contaminationInstance = instance;
    
        App.promise = contaminationInstance.getRegisteredCompaniesCount.call().then(function(result) {
          document.getElementById("companyCount").textContent = result;
        });
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    },

    createCompany: function() {
        var companyName = document.getElementById("companyName").value;
        var valueEth = document.getElementById("valueEth").value;
        var valueEthInt = parseInt(valueEth);


        var contaminationInstance;
        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.log(error);
          }
    
          var account = accounts[0];
        

        App.contracts.Contamination.deployed().then(function(instance) {
          contaminationInstance = instance;

        App.promise = contaminationInstance.registerCompany.sendTransaction(companyName, {from: account, gas : 4712388, value : web3.toWei(valueEthInt, 'ether')}).then(function(result) {
          alert(result); 
        }).catch(function(err) {
          console.log(err.message);
        });
      });
    });
    },
    activateCompany: function() {
      
      App.contracts.Contamination.deployed().then(function(instance) {
        contaminationInstance = instance;

      App.promise = contaminationInstance.getCurrentBalance.call().then(function(result) {
        alert(result); 
      }).catch(function(err) {
        console.log(err.message);
      });
  });
  }
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });

function activateCompany() {
    alert("Activated!");
}

function getCompanyInfo() {
    alert("Company info here!");
}