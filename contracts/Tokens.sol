// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Delulu_Token is ERC20 {
    constructor(uint256 initialSupply) ERC20("Delulu Token", "DLT") {
        _mint(msg.sender, initialSupply);
    }
}

contract INR_Token is ERC20 {
    constructor(uint256 initialSupply) ERC20("INR Token", "INRT") {
        _mint(msg.sender, initialSupply);
    }
}