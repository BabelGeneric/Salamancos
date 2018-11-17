// solium-disable linebreak-style
pragma solidity ^0.4.19;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Contamination is Ownable{
   
    uint public totalAmountAvailableForOwner;
    
    event UpdatedPollutionData(
        address _companyAddress, 
        string _pollutionType, 
        uint _current, 
        uint currentDeposit, 
        uint totalAmountAvailableForOwner
    );

    struct Company{    
        string companyName;
        bool active;
        uint initialDeposit;
        uint currentDeposit;
        mapping(string => uint) warning;
        mapping(string => uint) penalty;
        mapping(string => uint) current;
        uint32 lastPollutionDate;
        uint32 totalPollutionAlerts;
        address sensor;
    }

    Company[] public companies;
    mapping (address => uint) public companyToOwner;

    function registerCompany(string _companyName) external payable returns (bool){
        require(companyToOwner[msg.sender] != 0, "Company exists!");
        Company memory company;
        company.companyName = _companyName;
        company.active = false;
        company.initialDeposit = msg.value;
        company.currentDeposit = msg.value;

        uint id = companies.push(company) - 1;
        companyToOwner[msg.sender] = id;

        return true;
    }

    function registerSensor(address _companyAddress, address _sensorAddress) external onlyOwner{
        Company memory company = companies[companyToOwner[_companyAddress]];
        company.sensor = _sensorAddress;
        companies[companyToOwner[_companyAddress]] = company;
    }

    function setCurrentDeposit(address _companyAddress) external payable{
        Company memory company = companies[companyToOwner[_companyAddress]];
        company.currentDeposit = msg.value;
        companies[companyToOwner[_companyAddress]] = company;
    }

    function activateCompany(address _companyAddress, uint amount) external onlyOwner{
        Company memory company = companies[companyToOwner[_companyAddress]];
        require(company.currentDeposit >= amount,"Company dont have enough funds");
        company.active = true;
        companies[companyToOwner[_companyAddress]] = company;
    }

    function setPollutionThreshold(address _companyAddress, string _pollutionType, uint _warning, uint _penalty) external onlyOwner{
        Company storage company = companies[companyToOwner[_companyAddress]];
        company.warning[_pollutionType] = _warning;
        company.penalty[_pollutionType] = _penalty;
        companies[companyToOwner[_companyAddress]] = company;//Verificar si es necesario
    }
    
    function getCompanyInfo(address _companyAddress) external view returns (string,bool,address){
        Company memory company = companies[companyToOwner[_companyAddress]];
        return (company.companyName, company.active, company.sensor);
    }

    function getRegisteredCompaniesCount() external view returns (uint) {
        return companies.length;
    }

    function setCurrentPollution(address _companyAddress, string _pollutionType, uint _current) external {
        Company storage company = companies[companyToOwner[_companyAddress]];
        company.current[_pollutionType] = _current;
        company.lastPollutionDate = uint32(now);
        company.totalPollutionAlerts++;
        if(company.current[_pollutionType] > company.penalty[_pollutionType]){
            uint penalty = company.initialDeposit/100;// (company.current[_pollutionType] / company.penalty[_pollutionType])**company.totalPollutionAlerts;
            company.currentDeposit -= penalty;
            totalAmountAvailableForOwner += penalty;
        }
        companies[companyToOwner[_companyAddress]] = company;

        //enviar evento
        emit UpdatedPollutionData(_companyAddress, _pollutionType, _current, company.currentDeposit, totalAmountAvailableForOwner);
    }

    function transferFundsToOwner(uint amountToRetrieve) external payable onlyOwner{
        require(amountToRetrieve > totalAmountAvailableForOwner,"You dont have enough funds");
        owner().transfer(amountToRetrieve);  
        totalAmountAvailableForOwner -= amountToRetrieve;
    }    
}