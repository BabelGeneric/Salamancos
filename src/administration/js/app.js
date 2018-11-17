App = {
    web3Provider: null,
    contracts: {},
    account: null,
    instance: null,
  
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
            document.getElementById("contractBalance").textContent = parseInt(result) / 1000000000000000000;
          });
        });
      });
    },

    createCompany: function() {
        var companyName = document.getElementById("companyName").value;
        var valueEth = document.getElementById("valueEth").value;
        var valueEthInt = parseInt(valueEth);

        App.instance.registerCompany.sendTransaction(companyName, {from: App.account, gas : 4712388, value : web3.toWei(valueEthInt, 'ether')}).then(function(result) {
          alert(result); 
        }).catch(function(err) {
          console.log(err.message);
        });
    },
    activateCompany: function() {
      
      App.instance.getCurrentBalance.call().then(function(result) {
        alert(result); 
      }).catch(function(err) {
        console.log(err.message);
      });
    },
    getCompanyInfo: function() {
      App.instance.getCurrentBalance.call().then(function(result) {
        alert(result); 
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