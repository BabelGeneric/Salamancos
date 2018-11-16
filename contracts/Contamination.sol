pragma solidity ^0.4.19;


contract Contamination{

    enum PollutionType {Aire, Agua}
   
    struct Company{    
        bool active;

        uint initialDeposit;
        uint currentDeposit;

        mapping(PollutionType => uint) warning;
        mapping(PollutionType => uint) penalty;
        mapping(PollutionType => uint) current;

        uint32 lastPollutionDate;
        uint32 totalPollutionAggregated;

        address sensor;
    }

    
}