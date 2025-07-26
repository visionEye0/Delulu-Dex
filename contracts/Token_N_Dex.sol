// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// ERC20 tokens
contract DeluluToken is ERC20 {
    constructor(uint256 supply) ERC20("Delulu Token","DLT") {
        _mint(msg.sender, supply);
    }
}
contract INRToken is ERC20 {
    constructor(uint256 supply) ERC20("INR Token","INRT") {
        _mint(msg.sender, supply);
    }
}

// Dex contract
contract DeluluDex is ERC20 {
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public constant FEE = 1; // 1%

    constructor(address _A, address _B) ERC20("Delulu LP","DLPLP") {
        tokenA = IERC20(_A);
        tokenB = IERC20(_B);
    }

    function reserveA() public view returns(uint256){ return tokenA.balanceOf(address(this)); }
    function reserveB() public view returns(uint256){ return tokenB.balanceOf(address(this)); }

    function addLiquidity(uint256 amtA,uint256 amtB) external {
        require(amtA>0 && amtB>0,">0");
        uint256 ts = totalSupply();
        if(ts==0){
            _mint(msg.sender, sqrt(amtA*amtB));
        } else {
            uint256 share = min((amtA*ts)/reserveA(),(amtB*ts)/reserveB());
            _mint(msg.sender, share);
        }
        tokenA.transferFrom(msg.sender,address(this),amtA);
        tokenB.transferFrom(msg.sender,address(this),amtB);
    }

    function removeLiquidity(uint256 lp) external {
        require(lp>0,"lp>0");
        uint256 ts = totalSupply();
        uint256 amtA = reserveA()*lp/ts;
        uint256 amtB = reserveB()*lp/ts;
        _burn(msg.sender,lp);
        tokenA.transfer(msg.sender,amtA);
        tokenB.transfer(msg.sender,amtB);
    }

    function swapAforB(uint256 amtA) external {
        require(amtA>0,">0");
        uint256 fee = amtA*FEE/100;
        uint256 inAmt = amtA - fee;
        uint256 y = reserveB();
        uint256 x = reserveA();
        uint256 outB = (y*inAmt)/(x+inAmt);
        tokenA.transferFrom(msg.sender,address(this),amtA);
        tokenB.transfer(msg.sender,outB);
    }

    function swapBforA(uint256 amtB) external {
        require(amtB>0,">0");
        uint256 fee = amtB*FEE/100;
        uint256 inAmt = amtB - fee;
        uint256 x = reserveA();
        uint256 y = reserveB();
        uint256 outA = (x*inAmt)/(y+inAmt);
        tokenB.transferFrom(msg.sender,address(this),amtB);
        tokenA.transfer(msg.sender,outA);
    }

    function min(uint256 a,uint256 b) internal pure returns(uint256){ return a<b?a:b; }
    function sqrt(uint256 y) internal pure returns(uint256 z) {
        if(y>3){ z=y; uint256 x=y/2+1; while(x<z){ z=x; x=(y/x + x)/2;} }
        else if(y!=0) z=1;
    }
}
