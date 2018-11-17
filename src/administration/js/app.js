App = {
    web3Provider: null,
    contracts: {},
  
    init: async function() {
       
      return await App.initWeb3();
    },
  
    initWeb3: async function() {
      // Is there an injected web3 instance?
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
      } else {
        // If no intected web3 instance is detected, fall back to Ganache
        App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
      }
  
      web3 = new Web3(App.web3Provider);
  
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON("../Contamination.json", function(data){
        console.log(data);
        // Get the necessary contract artifact file and instantiate it with truffle-contract
        var ContaminationArtifact = data;
        App.contracts.Contamination = TruffleContract(ContaminationArtifact);
        console.log(App.contracts.Contamination);
  
        // Set the provider for our contract
        App.contracts.Contamination.setProvider(App.web3Provider);

        var contaminationInstance;

        console.log(App.contracts.Contamination);
        App.contracts.Contamination.deployed().then(function(instance) {
          contaminationInstance = instance;
    
        console.log(contaminationInstance.testView.call());
        }).then(function(company) {
          console.log(company);
        }).catch(function(err) {
          console.log("ERROR!!!!");
          console.log(err.message);
        });
      });
    },

    createCompany: function() {
        var companyName = document.getElementById("companyName").value;
        alert("Created company with name " + companyName);
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