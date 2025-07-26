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
  const [resA, setResA] = useState("");
  const [resB, setResB] = useState("");
  const [amtA, setAmtA] = useState("");
  const [amtB, setAmtB] = useState("");

  const [swapAmount, setSwapAmount] = useState("");
  const [swapOutput, setSwapOutput] = useState("");
  const [swapDirection, setSwapDirection] = useState("AtoB");

  const [loadingData, setLoadingData] = useState(true);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.BrowserProvider(window.ethereum));
    }
  }, []);

  useEffect(() => {
    if (dex) refresh();
  }, [dex]);

  const connect = async () => {
    if (!provider) return;
    setLoadingData(true);
    await provider.send("eth_requestAccounts", []);
    const s = await provider.getSigner();
    setSigner(s);

    const dexC = new ethers.Contract(DEX_ADDR, LP_ABI.abi, s);
    const aC = new ethers.Contract(TOKEN_A, TOKEN_ABI.abi, s);
    const bC = new ethers.Contract(TOKEN_B, TOKEN_ABI.abi, s);
    setDex(dexC);
    setTokenA(aC);
    setTokenB(bC);

    // load token metadata
    const [[nA, sA], [nB, sB]] = await Promise.all([
      Promise.all([aC.name(), aC.symbol()]),
      Promise.all([bC.name(), bC.symbol()]),
    ]);
    setNameA(nA);
    setSymbolA(sA);
    setNameB(nB);
    setSymbolB(sB);

    setLoadingData(false);
  };

  const refresh = async () => {
    if (!dex) return;
    setLoadingData(true);
    const [rA, rB] = await Promise.all([dex.reserveA(), dex.reserveB()]);
    setResA(parseFloat(ethers.formatEther(rA)).toFixed(2));
    setResB(parseFloat(ethers.formatEther(rB)).toFixed(2));
    setLoadingData(false);
  };

  const addLiquidity = async () => {
    if (!tokenA || !tokenB || !dex || !signer) return;
    setLoadingAdd(true);
    try {
      const a = ethers.parseEther(amtA || "0");
      const b = ethers.parseEther(amtB || "0");
      await (await tokenA.approve(DEX_ADDR, a)).wait();
      await (await tokenB.approve(DEX_ADDR, b)).wait();
      await (await dex.addLiquidity(a, b)).wait();
      refresh();
    } catch (e) {
      console.error(e);
    }
    setLoadingAdd(false);
  };

  const swapTokens = async () => {
    if (!dex || !signer || !swapAmount) return;
    setLoadingSwap(true);
    try {
      const amt = ethers.parseEther(swapAmount);
      if (swapDirection === "AtoB") {
        await (await tokenA.approve(DEX_ADDR, amt)).wait();
        await (await dex.swapAforB(amt)).wait();
      } else {
        await (await tokenB.approve(DEX_ADDR, amt)).wait();
        await (await dex.swapBforA(amt)).wait();
      }
      refresh();
      setSwapAmount("");
      setSwapOutput("");
    } catch (e) {
      console.error(e);
    }
    setLoadingSwap(false);
  };

  const removeLiquidity = async () => {
    if (!dex || !signer) return;
    setLoadingRemove(true);
    try {
      const lp = await dex.balanceOf(await signer.getAddress());
      await (await dex.removeLiquidity(lp)).wait();
      refresh();
    } catch (e) {
      console.error(e);
    }
    setLoadingRemove(false);
  };

  const handleSwapAmountChange = (e) => {
    const v = e.target.value;
    setSwapAmount(v);
    const inAmt = parseFloat(v) || 0;
    const inRes = swapDirection === "AtoB" ? +resA : +resB;
    const outRes = swapDirection === "AtoB" ? +resB : +resA;
    setSwapOutput(
      inRes > 0 ? ((inAmt * outRes) / (inRes + inAmt)).toFixed(4) : ""
    );
  };

  const toggleDirection = () => {
    setSwapDirection((d) => (d === "AtoB" ? "BtoA" : "AtoB"));
    setSwapAmount(swapOutput);
    setSwapOutput(swapAmount);
  };

  const disabledAll =
    loadingData || loadingAdd || loadingSwap || loadingRemove;

    return (
      <div className="container">
        <img className="logo" width={300} src="/delulu_dex.png" alt="Delulu Dex Logo" />
        {!signer ? (
          <button onClick={connect}>
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="reserve-box">
              <div className="reserve-title">Reserves</div>
              <div className="reserve-pair">
                {loadingData ? (
                  <span className="spinner" />
                ) : (
                  `${nameA} = ${resA}`
                )}
                ,&nbsp;
                {loadingData ? (
                  <span className="spinner" />
                ) : (
                  `${nameB} = ${resB}`
                )}
              </div>
            </div>
  
            <div className="liquidity-ui">
              <input
                placeholder={loadingData ? "Loading..." : `Amount (${symbolA})`}
                value={amtA}
                onChange={(e) => setAmtA(e.target.value)}
                disabled={disabledAll || loadingData}
              />
              <input
                placeholder={loadingData ? "Loading..." : `Amount (${symbolB})`}
                value={amtB}
                onChange={(e) => setAmtB(e.target.value)}
                disabled={disabledAll || loadingData}
              />
              <button onClick={addLiquidity} disabled={disabledAll}>
                {loadingAdd ? <span className="spinner" /> : "Approve + Add Liquidity"}
              </button>
            </div>
  
            <div className="swap-ui">
              <div className="swap-row">
                <input
                  placeholder="Amount"
                  value={swapAmount}
                  onChange={handleSwapAmountChange}
                  disabled={disabledAll}
                />
                {loadingData ? (
                  <span className="spinner" />
                ) : (
                  <span>{swapDirection === "AtoB" ? symbolA : symbolB}</span>
                )}
              </div>
              <div className="swap-arrow" onClick={toggleDirection}>
                ⇅
              </div>
              <div className="swap-row">
                <input
                  placeholder="Output"
                  value={swapOutput}
                  disabled
                />
                {loadingData ? (
                  <span className="spinner" />
                ) : (
                  <span>{swapDirection === "AtoB" ? symbolB : symbolA}</span>
                )}
              </div>
              <button onClick={swapTokens} disabled={disabledAll}>
                {loadingSwap ? <span className="spinner" /> : "Swap"}
              </button>
            </div>
  
            <button onClick={removeLiquidity} disabled={disabledAll}>
              {loadingRemove ? <span className="spinner" /> : "Remove Liquidity"}
            </button>
          </>
        )}
      </div>
    );
}

export default App;
