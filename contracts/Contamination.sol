// solium-disable linebreak-style
pragma solidity ^0.4.19;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Contamination is Ownable{
   
    struct Company{    
        string companyName;
        bool active;
        uint initialDeposit;
        uint currentDeposit;
        mapping(string => uint) warning;
        mapping(string => uint) penalty;
        mapping(string => uint) current;
        uint32 lastPollutionDate;
        uint32 totalPollutionAggregated;
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

    function registerSensor(address _companyAddress, address _sensorAddress) external {
        Company memory company = companies[companyToOwner[_companyAddress]];
        company.sensor = _sensorAddress;
        companies[companyToOwner[_companyAddress]] = company;
    }

    function activateCompany(address _companyAddress) external {
        Company memory company = companies[companyToOwner[_companyAddress]];
        company.active = true;
        companies[companyToOwner[_companyAddress]] = company;
    }
    
    function getCompanyInfo(address _companyAddress) external view returns (string,bool,address){
        Company memory company = companies[companyToOwner[_companyAddress]];
        return (company.companyName, company.active, company.sensor);
    }

}