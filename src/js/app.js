App = {
    web3Provider: null,
    contracts: {},
    account: null,
    instance: null,
    companyCount: 0,
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
            App.companyCount = result;
            App.updateCompanyList();
          });
          //Update contract balance
          App.instance.getCurrentBalance.call().then(function(result) {
            App.contractAmount = parseInt(result) / 1000000000000000000;
            document.getElementById("enContrato").textContent = App.contractAmount;
          });
          //Update retirable funds
          App.instance.totalAmountAvailableForOwner.call().then(function(result) {
            App.retirableFunds = parseInt(result) / 1000000000000000000;
            document.getElementById("retirable").textContent = App.retirableFunds;
          });

        });
      });
    },

    updateCompanyList: function() {
      document.getElementById("tableBody").innerHTML = "";
      console.log(App.companyCount);
      for(i = 0; i < App.companyCount; i++) {
        App.instance.getCompanyAddressById.call(i).then(function(result) {
          App.instance.getCompanyInfo.call(result).then(function(companyInfo) {
            var ultimaContaminacion;
            if (companyInfo[3].c[0] == 0) {
              ultimaContaminacion = "Never";
            } else {
              var timestamp = companyInfo[3].c[0];
              var date = new Date(timestamp * 1000),
              ultimaContaminacion = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
            }
            var waterBadge;
            if (companyInfo[5].c[0] > 30) {
              waterBadge = "<span class=\"badge badge-danger\">Danger</span>";
            } else {
              waterBadge = "<span class=\"badge badge-primary\">Normal</span>";
            }
            document.getElementById("tableBody").innerHTML = document.getElementById("tableBody").innerHTML + "<tr><th scope='row'>" + companyInfo[0] + "</th>" +
            "<td>" + companyInfo[1].c[0] + " ETH</td><td>" + companyInfo[2].c[0] + " ETH</td><td>" + ultimaContaminacion + "</td>" +
            "<td>" + companyInfo[4].c[0] + " % <span class=\"badge badge-primary\">Normal</span></td><td>" + companyInfo[5].c[0] + " % " + waterBadge + "</td><td>" + companyInfo[6] + 
            "   <input type='button' onclick='App.increasePollution(\"" + result + "\");' value='+'/></td>";
            console.log(companyInfo);
          })
        });
    }
    },
    increasePollution: function(address) {
      App.instance.setCurrentWaterPollution.sendTransaction(address, 40, {from: App.account, gas : 4712388, value : 0}).then(function(result1) {
        App.instance.setCurrentAirPollution.sendTransaction(address, 16, {from: App.account, gas : 4712388, value : 0}).then(function(result2) {
          location.reload();
        })
      })
      
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