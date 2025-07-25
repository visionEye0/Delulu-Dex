async function main() {
    const [deployer] = await ethers.getSigners();
    const tokenAAddr = "<TokenA_Address>";
    const tokenBAddr = "<TokenB_Address>";
    const Dex = await ethers.getContractFactory("Dex");
    const dex = await Dex.deploy(tokenAAddr, tokenBAddr);
    console.log("Dex deployed to", dex.address);
  }
  
  main().catch(console.error);