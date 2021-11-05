//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
//
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Greeter is Ownable { //is ERC20?
    using SafeMath for uint256;

    uint256 public startingpoint;
    uint256 public period;  
    address public staketoken;
    string private greeting;

    constructor(string memory _greeting, uint256 _period, address _staketoken) payable {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
        startingpoint = block.timestamp;
        period = _period;
        console.log(_staketoken);
        //console.log();

        //contract owner ads 1000 erc20 tokens of xyz
        //this sets the time at construct time
        //and sets T period 


    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function deposit () public payable {

    }

    function getstake () public {

    }

    function close () public onlyOwner {
        //require(block.timestamp);
        
    }

}
