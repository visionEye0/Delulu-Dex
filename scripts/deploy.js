const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const DT = await ethers.getContractFactory("DeluluToken", deployer);
  const IT = await ethers.getContractFactory("INRToken", deployer);
  const DEX = await ethers.getContractFactory("DeluluDex", deployer);

  const dlt = await DT.deploy(ethers.parseEther("1000000"));
  await dlt.waitForDeployment();

  const inrt = await IT.deploy(ethers.parseEther("1000000"));
  await inrt.waitForDeployment();

  const dex = await DEX.deploy(dlt.target, inrt.target);
  await dex.waitForDeployment();

  console.log("DLT:", dlt.target);
  console.log("INRT:", inrt.target);
  console.log("DeluluDex:", dex.target);
}
main().catch(e=>{ console.error(e); process.exitCode=1; });
