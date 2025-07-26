# 🐱 Delulu‑Dex

A minimal Uniswap‑style decentralized exchange (DEX) for swapping two ERC‑20 tokens on Ethereum (Sepolia / local Hardhat). Easy to deploy, easy to fork and powered by a delulu cat 🚀

Live Demo: [https://delulu‑dex.vercel.app/](https://delulu-dex.vercel.app/)
Repo: [github.com/visionEye0/Delulu‑Dex](github.com/visionEye0/Delulu‑Dex)

---

## 📁 Project Structure

```
.
├── artifacts/
│   ├── build‑info/
│   ├── contracts/
│   └── @openzeppelin/
├── cache/
│   └── solidity‑files‑cache.json
├── contracts/
│   └── Token_N_Dex.sol            # Contains DeluluToken, INRToken, DeluluDex
├── frontend/
│   ├── build/
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   ├── public/                    # Logo, favicon, index.html
│   ├── README.md
│   └── src/                       # React frontend (App.js, CSS, ABIs)
├── hardhat.config.js              # Configuration for compilation & deployment
├── ignition/
│   └── modules/
├── package.json
├── package-lock.json
├── README.md                      # <-- You are here
├── scripts/
│   └── deploy.js                  # Deploy tokens & DEX to network
└── test/
```
---

## 🚀 Quick Start

### Prerequisites
* Node.js (v16+)
* yarn or npm
* Metamask or another Ethereum wallet (for frontend usage)

### Install & Run Locally

```bash
git clone https://github.com/visionEye0/Delulu-Dex.git
cd Delulu-Dex
npm install
```

1. **Deploy to Sepolia (or local Hardhat)

   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```
save the deployed token & DEX addresses and updature your frontend constants

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run build # to generate build folder
   npm run start # for local dev server: http://localhost:3000
   ```

---

## 🔧 Features
* Add Liquidity — supply both tokens in balanced ratio, mint LP tokens

* Remove Liquidity — burn LP tokens to withdraw share.

* Swap Tokens — A↔B swaps using constant‑product formula (x·y=k), with 1% fee.

* Pool Stats — view reserves, price impact, slippage, and LP balances.

* React Frontend — MetaMask wallet integration, sleek dark-themed UI, loaders during txs.

* Token Details — Displays token name/symbol loaded on connect.

---

## ⚙️ Token / Smart Contracts
Located in contracts/Token_N_Dex.sol, leveraging OpenZeppelin ERC20:

* `DeluluToken` (DLT)

* `INRToken` (INRT)

* `DeluluDex` — ERC‑20 LP token, reserves, add/remove liquidity, swap functions

---

## 🎨 Frontend Details
* Built with React, ethers.js v6

* Uses ABIs from artifacts/contracts

* public/ folder holds the logo (delulu_dex.png) and favicon.ico

* Dark‑mode aesthetic, responsive layout, styled with raw CSS

---

## 🧪 Testing Tips
* Deploy on Hardhat local network

* Mint yourself both tokens via DeluluToken.deploy(...) call

* Connect frontend wallet to local test chain (via MetaMask custom RPC)

* Approve and add liquidity, swap, and remove to verify token flows.


