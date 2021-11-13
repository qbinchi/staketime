//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";


import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



contract Token is Context, ERC20 {
        constructor () ERC20("SimpleToken", "SIM") {
        _mint(_msgSender(), 10000 * (10 ** uint256(decimals())));
        //transferFrom(address(this), );

    }
} 