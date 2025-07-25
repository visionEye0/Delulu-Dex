// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dex is ERC20 {
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public constant FEE_PERCENT = 1; // 1% fee

    constructor(address _tokenA, address _tokenB) ERC20("LP Token", "LPT") {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    // Add liquidity
    function addLiquidity(uint256 amtA, uint256 amtB) external {
        require(amtA > 0 && amtB > 0, "Amounts > 0");
        uint256 totalSupply = totalSupply();
        if (totalSupply == 0) {
            _mint(msg.sender, sqrt(amtA * amtB));
        } else {
            uint256 share = min((amtA * totalSupply) / reserveA(), (amtB * totalSupply) / reserveB());
            _mint(msg.sender, share);
        }
        tokenA.transferFrom(msg.sender, address(this), amtA);
        tokenB.transferFrom(msg.sender, address(this), amtB);
    }

    // Remove liquidity
    function removeLiquidity(uint256 lpAmount) external {
        require(lpAmount > 0, "LP > 0");
        uint256 totalSupply = totalSupply();
        uint256 amtA = (reserveA() * lpAmount) / totalSupply;
        uint256 amtB = (reserveB() * lpAmount) / totalSupply;
        _burn(msg.sender, lpAmount);
        tokenA.transfer(msg.sender, amtA);
        tokenB.transfer(msg.sender, amtB);
    }

    // Swap tokens
    function swapAforB(uint256 amtA) external {
        require(amtA > 0, "AmtA > 0");
        uint256 feeAmt = (amtA * FEE_PERCENT) / 100;
        uint256 amtAAfterFee = amtA - feeAmt;
        uint256 y = reserveB();
        uint256 x = reserveA();
        uint256 amtB = (y * amtAAfterFee) / (x + amtAAfterFee);
        tokenA.transferFrom(msg.sender, address(this), amtA);
        tokenB.transfer(msg.sender, amtB);
    }

    function swapBforA(uint256 amtB) external {
        require(amtB > 0, "AmtB > 0");
        uint256 feeAmt = (amtB * FEE_PERCENT) / 100;
        uint256 amtBAfterFee = amtB - feeAmt;
        uint256 x = reserveA();
        uint256 y = reserveB();
        uint256 amtA = (x * amtBAfterFee) / (y + amtBAfterFee);
        tokenB.transferFrom(msg.sender, address(this), amtB);
        tokenA.transfer(msg.sender, amtA);
    }

    function reserveA() public view returns (uint256) {
        return tokenA.balanceOf(address(this));
    }
    function reserveB() public view returns (uint256) {
        return tokenB.balanceOf(address(this));
    }

    // Helpers
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}