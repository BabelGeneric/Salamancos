// solium-disable linebreak-style
pragma solidity ^0.4.19;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Contamination is Ownable{
   
    uint public totalAmountAvailableForOwner;

    event UpdatedAirPollutionData(
        address _companyAddress, 
        uint _current, 
        uint currentDeposit, 
        uint totalAmountAvailableForOwner
    );

    event UpdatedWaterPollutionData(
        address _companyAddress, 
        uint _current, 
        uint currentDeposit, 
        uint totalAmountAvailableForOwner
    );

    struct Company{    
        address companyAddress;
        string companyName;
        bool active;
        uint initialDeposit;
        uint currentDeposit;
        uint warningAir;
        uint warningWater;
        uint penaltyAir;
        uint penaltyWater;
        uint currentAir;
        uint currentWater;
        uint32 lastPollutionDate;
        uint32 totalPollutionAlerts;
        address sensor;
    }

    Company[] public companies;
    mapping (address => uint) public companyToOwner;

    function registerCompany(string _companyName) external payable returns (bool){
        //require(companyToOwner[msg.sender] == 0, "Company exists!");
        Company memory company;
        company.companyAddress = msg.sender;
        company.companyName = _companyName;
        company.active = false;
        company.initialDeposit = msg.value;
        company.currentDeposit = msg.value;
        company.warningAir = 20;
        company.warningWater = 20;
        company.penaltyAir = 30;
        company.penaltyWater = 30;
        company.currentAir = 0;
        company.currentWater = 0;
        company.totalPollutionAlerts = 0;
        company.lastPollutionDate = 0;

        uint id = companies.push(company) - 1;
        companyToOwner[msg.sender] = id;

        return true;
    }

    function registerSensor(address _companyAddress, address _sensorAddress) external onlyOwner returns (bool){
        Company memory company = companies[companyToOwner[_companyAddress]];
        company.sensor = _sensorAddress;
        companies[companyToOwner[_companyAddress]] = company;
        return true;
    }

    function setCurrentDeposit(address _companyAddress) external payable{
        Company memory company = companies[companyToOwner[_companyAddress]];
        company.currentDeposit = msg.value;
        companies[companyToOwner[_companyAddress]] = company;
    }

    function activateCompany(address _companyAddress, uint amount) external onlyOwner returns(bool){
        Company memory company = companies[companyToOwner[_companyAddress]];
        //require(company.currentDeposit >= amount,"Company dont have enough funds");
        company.active = true;
        companies[companyToOwner[_companyAddress]] = company;
        return true;
    }
    
    function getCompanyInfo(address _companyAddress) external view returns (string,uint, uint, uint32, uint, uint, address){
        Company memory company = companies[companyToOwner[_companyAddress]];
        return (company.companyName, company.initialDeposit/(10**18), company.currentDeposit/(10**18), company.lastPollutionDate, 
        company.currentAir, company.currentWater, company.sensor);
    }

    function getCompanyAddressById(uint position) external view returns (address) {
        return companies[position].companyAddress;
    }

    function getRegisteredCompaniesCount() external view returns (uint) {
        return companies.length;
    }

    function setCurrentAirPollution(address _companyAddress, uint _current) external {
        Company storage company = companies[companyToOwner[_companyAddress]];
        company.currentAir = _current;
        if(company.currentAir > company.penaltyAir){
            company.lastPollutionDate = uint32(now);
            company.totalPollutionAlerts++;
            company.currentDeposit -= 1;
            totalAmountAvailableForOwner += 1;
        }
        companies[companyToOwner[_companyAddress]] = company;

        //enviar evento
        emit UpdatedAirPollutionData(_companyAddress, _current, company.currentDeposit, totalAmountAvailableForOwner);
    }

    function setCurrentWaterPollution(address _companyAddress, uint _current) external {
        Company storage company = companies[companyToOwner[_companyAddress]];
        company.currentWater = _current;
        if(company.currentWater > company.penaltyWater){
            company.lastPollutionDate = uint32(now);
            company.totalPollutionAlerts++;
            company.currentDeposit -= 1*(10**18);
            totalAmountAvailableForOwner += 1*(10**18);
        }
        companies[companyToOwner[_companyAddress]] = company;

        //enviar evento
        emit UpdatedWaterPollutionData(_companyAddress, _current, company.currentDeposit, totalAmountAvailableForOwner);
    }

    function transferFundsToOwner(uint amountToRetrieve) external payable onlyOwner returns (bool) {
        require(amountToRetrieve <= totalAmountAvailableForOwner,"You dont have enough funds");
        owner().transfer(amountToRetrieve);  
        totalAmountAvailableForOwner -= amountToRetrieve;
        return true;
    } 

    function getCurrentBalance() external view returns(uint) {
        return address(this).balance;
    }   
}