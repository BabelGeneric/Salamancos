// solium-disable linebreak-style
pragma solidity ^0.4.19;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

contract Contamination is Ownable{
   
    struct Company{    
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
    

}