require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  solidity: "0.8.4",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: process.env.NODEENDPOINT,
      //accounts: [process.env.PRIVADMINKEY]
    },
    // local node, fork or hardhat test node
    localhost: {
      url: "http://127.0.0.1:8545"
    },
  },
};