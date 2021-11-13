// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const fs = require("fs");
const hre = require("hardhat");
const { getContractAddress } = require('@ethersproject/address');
require("dotenv").config();

async function main() {
  const accounts = await ethers.getSigners();
  const admin = accounts[0];
  const erc20 = JSON.parse(fs.readFileSync("artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json", 'utf8')); 
  const token = new ethers.Contract(process.env.TOKENADDR, erc20.abi, admin);
  const time_days = 30;
  const transactionCount = await admin.getTransactionCount();
  const futurestaketime = getContractAddress({
    from: admin.address,
    nonce: transactionCount + 1
  });
  await token.approve(futurestaketime, ethers.utils.parseEther("1000")).then((x) => {
    console.log(`Aproval hash: ${x.hash}`);
  });
  const Staketime = await ethers.getContractFactory("Staketime");
  const staketime = await Staketime.deploy(
    time_days,
    process.env.TOKENADDR,
    ethers.utils.parseEther("200"),
    ethers.utils.parseEther("300"),
    ethers.utils.parseEther("500")
    );
  console.log("Token address:", staketime.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
  console.error(error);
  process.exit(1);
});