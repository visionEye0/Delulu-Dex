import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import LP_ABI from "./abis/DeluluDex.json";
import TOKEN_ABI from "./abis/DeluluToken.json";
import "./App.css";

const DEX_ADDR = "0xcdB55782a597EbCaA482D81216E3C710D4E4b1Ed";
const TOKEN_A = "0x84d1D56aBF4056739c6D195B3b6082d1ae490747";
const TOKEN_B = "0xA4B54Be45f6Ffe82Ee84FFdd4b31648B9b2EAEF5";

function App() {
  const [nameA, setNameA] = useState("");
  const [nameB, setNameB] = useState("");
  const [symbolA, setSymbolA] = useState("");
  const [symbolB, setSymbolB] = useState("");

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [dex, setDex] = useState(null);
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [resA, setResA] = useState("0");
  const [resB, setResB] = useState("0");
  const [amtA, setAmtA] = useState("");
  const [amtB, setAmtB] = useState("");

  // Swap states
  const [swapAmount, setSwapAmount] = useState("");
  const [swapOutput, setSwapOutput] = useState("");
  const [swapDirection, setSwapDirection] = useState("AtoB"); // "AtoB" or "BtoA"

  // Loading states
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const pr = new ethers.BrowserProvider(window.ethereum);
      setProvider(pr);
    }
  }, []);

  useEffect(() => {
    if (dex) {
      refresh();
    }
  }, [dex]);

  const connect = async () => {
  if (!provider) return;
  await provider.send("eth_requestAccounts", []);
  const s = await provider.getSigner();
  setSigner(s);

  const dexContract = new ethers.Contract(DEX_ADDR, LP_ABI.abi, s);
  const tokenAContract = new ethers.Contract(TOKEN_A, TOKEN_ABI.abi, s);
  const tokenBContract = new ethers.Contract(TOKEN_B, TOKEN_ABI.abi, s);

  setDex(dexContract);
  setTokenA(tokenAContract);
  setTokenB(tokenBContract);

  // Get names and symbols
  const [nameA_, symbolA_] = await Promise.all([
    tokenAContract.name(),
    tokenAContract.symbol()
  ]);
  const [nameB_, symbolB_] = await Promise.all([
    tokenBContract.name(),
    tokenBContract.symbol()
  ]);

  setNameA(nameA_);
  setSymbolA(symbolA_);
  setNameB(nameB_);
  setSymbolB(symbolB_);
};


  const refresh = async () => {
    if (!dex) return;
    const rA = await dex.reserveA();
    const rB = await dex.reserveB();
    setResA(ethers.formatEther(rA));
    setResB(ethers.formatEther(rB));
  };

  const addLiquidity = async () => {
    if (!tokenA || !tokenB || !dex || !signer) return;
    setLoadingAdd(true);
    try {
      const amountA = ethers.parseEther(amtA || "0");
      const amountB = ethers.parseEther(amtB || "0");
      await (await tokenA.approve(DEX_ADDR, amountA)).wait();
      await (await tokenB.approve(DEX_ADDR, amountB)).wait();
      await (await dex.addLiquidity(amountA, amountB)).wait();
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAdd(false);
    }
  };

  const swapTokens = async () => {
    if (!dex || !signer) return;
    if (!swapAmount) return;
    setLoadingSwap(true);
    try {
      const amountIn = ethers.parseEther(swapAmount || "0");
      if (swapDirection === "AtoB") {
        // Approve token A to the DEX contract before swapping
        await (await tokenA.approve(DEX_ADDR, amountIn)).wait();
        await (await dex.swapAforB(amountIn)).wait();
      } else {
        // Approve token B to the DEX contract before swapping
        await (await tokenB.approve(DEX_ADDR, amountIn)).wait();
        await (await dex.swapBforA(amountIn)).wait();
      }
      // Refresh reserves and clear input/output fields
      refresh();
      setSwapAmount("");
      setSwapOutput("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSwap(false);
    }
  };
  

  const removeLiquidity = async () => {
    if (!dex || !signer) return;
    setLoadingRemove(true);
    try {
      const lpBal = await dex.balanceOf(await signer.getAddress());
      await (await dex.removeLiquidity(lpBal)).wait();
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRemove(false);
    }
  };

  const handleSwapAmountChange = (e) => {
    const value = e.target.value;
    setSwapAmount(value);
    // Calculate output using constant product formula (naive)
    const inAmt = parseFloat(value) || 0;
    const inRes = swapDirection === "AtoB" ? parseFloat(resA) : parseFloat(resB);
    const outRes = swapDirection === "AtoB" ? parseFloat(resB) : parseFloat(resA);
    if (inRes > 0) {
      const output = (inAmt * outRes) / (inRes + inAmt);
      setSwapOutput(output.toString());
    } else {
      setSwapOutput("");
    }
  };

  const toggleDirection = () => {
    if (swapDirection === "AtoB") {
      setSwapDirection("BtoA");
      setSwapAmount(swapOutput);
      setSwapOutput(swapAmount);
    } else {
      setSwapDirection("AtoB");
      setSwapAmount(swapOutput);
      setSwapOutput(swapAmount);
    }
  };

  return (
    <div className="container">
      {!signer ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <div className="reserve">
            Reserves: {nameA} = {resA}, {nameB} = {resB}
          </div>


          {/* Add Liquidity UI */}
          <div>
            <input
              placeholder="Amount A"
              value={amtA}
              onChange={(e) => setAmtA(e.target.value)}
            />
            <input
              placeholder="Amount B"
              value={amtB}
              onChange={(e) => setAmtB(e.target.value)}
            />
            <button onClick={addLiquidity} disabled={loadingAdd}>
              {loadingAdd ? <span className="loader"></span> : "Approve + Add Liquidity"}
            </button>
          </div>

          {/* Swap UI */}
          <div className="swap-ui">
            <div className="swap-row">
              <input
                placeholder="Amount"
                value={swapAmount}
                onChange={handleSwapAmountChange}
              />
              <span>{swapDirection === "AtoB" ? symbolA : symbolB}</span>
            </div>
            <div className="swap-arrow" onClick={toggleDirection}>
              <span>⇅</span>
            </div>
            <div className="swap-row">
              <input
                placeholder="Output"
                value={swapOutput}
                disabled
              />
              <span>{swapDirection === "AtoB" ? symbolB : symbolA}</span>
            </div>
            <button onClick={swapTokens} disabled={loadingSwap}>
              {loadingSwap ? <span className="loader"></span> : "Swap"}
            </button>
          </div>


          {/* Remove Liquidity */}
          <button onClick={removeLiquidity} disabled={loadingRemove}>
            {loadingRemove ? <span className="loader"></span> : "Remove Liquidity"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
