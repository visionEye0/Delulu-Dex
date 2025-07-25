async function main() {
    const [deployer] = await ethers.getSigners();
    const Delulu_Token = await ethers.getContractFactory("Delulu_Token");
    const INR_Token = await ethers.getContractFactory("INR_Token");
    const a = await Delulu_Token.deploy(ethers.utils.parseEther("1000000"));
    const b = await INR_Token.deploy(ethers.utils.parseEther("1000000"));
    console.log("Delulu_Token deployed to", a.address);
    console.log("INR_Token deployed to", b.address);
  }
  
  main().catch(console.error);