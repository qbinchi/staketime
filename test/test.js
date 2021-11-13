//const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getContractAddress } = require('@ethersproject/address')
const secs_in_day = 60*60*24;

describe("Staketime", function () {
  var tokenXYZ, staketime;
  var admin, alice, bob;
  const time_days = 30;
  it("Should deploy, mint and send 1000 tokens to admin and 500 each usr", async function () {
    const accounts = await ethers.getSigners();
    admin = accounts[0];
    alice = accounts[1];
    bob = accounts[2];
    const Token = await ethers.getContractFactory("Token");
    tokenXYZ = await Token.deploy();
    await tokenXYZ.deployed();
    let tokenscount = await tokenXYZ.balanceOf(admin.address);
    expect(await tokenscount.toString()).to.equal(ethers.utils.parseEther("10000").toString());
    expect(await tokenXYZ.transfer(alice.address, ethers.utils.parseEther("100")), true);
    expect(await tokenXYZ.transfer(bob.address, ethers.utils.parseEther("400")), true);
  });
  it("Should fail if deployer is not loading contract with 1000xyz tokens", async function () {
    const initialOwnerBalance = await tokenXYZ.balanceOf(admin.address);
    const Staketime = await ethers.getContractFactory("Staketime");
    let token_addr = await tokenXYZ.address;
    await expect(
      Staketime.deploy(
        time_days, 
        token_addr, 
        ethers.utils.parseEther("100"), 
        ethers.utils.parseEther("100"), 
        ethers.utils.parseEther("100"))
    ).to.be.revertedWith("only 1000xyz");
    expect(await tokenXYZ.balanceOf(admin.address)).to.equal(initialOwnerBalance);
  });
  it("Should load 1000xyz tokens at deploy time and variables are set", async function () {
    const Staketime = await ethers.getContractFactory("Staketime");
    let token_addr = await tokenXYZ.address;
    const transactionCount = await admin.getTransactionCount();
    const futurestaketime = getContractAddress({
      from: admin.address,
      nonce: transactionCount + 1
    });
    await tokenXYZ.approve(futurestaketime, ethers.utils.parseEther("1000")).then((x) => {
      console.log(`Aproval hash: ${x.hash}`);
    });
    staketime = await Staketime.deploy(
      time_days,
      token_addr,
      ethers.utils.parseEther("200"),
      ethers.utils.parseEther("300"),
      ethers.utils.parseEther("500")
      );
    await staketime.deployed();
    expect(staketime.address, futurestaketime);
    expect(await staketime.startingpoint().toString(), time_days.toString());
    let tokenscount_contract = await tokenXYZ.balanceOf(staketime.address);
    expect(await tokenscount_contract.toString()).to.equal(ethers.utils.parseEther("1000").toString());    
  });
  it("Deposites should work and withdrawals should fail. More deposits for accounts should add on", async function () {
    // allowance for x tokens from alice for contract
    await tokenXYZ.connect(alice).approve(staketime.address, ethers.utils.parseEther("100")).then((x) => {
      console.log(`Aproval hash: ${x.hash}`);
    });
    await staketime.connect(alice).deposit(ethers.utils.parseEther("50"));
    await staketime.connect(alice).deposit(ethers.utils.parseEther("50"));
    expect(staketime.connect(alice).mystake().toString(), ethers.utils.parseEther("100"));
    await expect(staketime.connect(alice).withdrawal()).to.be.revertedWith("");
    await expect(staketime.connect(bob).withdrawal()).to.be.revertedWith("");
    await tokenXYZ.connect(bob).approve(staketime.address, ethers.utils.parseEther("400")).then((x) => {
      console.log(`Aproval hash: ${x.hash}`);
    });
    await staketime.connect(bob).deposit(ethers.utils.parseEther("400"));
    expect(staketime.connect(bob).mystake().toString(), ethers.utils.parseEther("400"));
    let tokenscount_contract = await tokenXYZ.balanceOf(staketime.address);
    expect(await tokenscount_contract.toString()).to.equal(ethers.utils.parseEther("1500").toString());    
  });
  it("Should revert deplosites and withdrawals in this period. should fail", async function () {
    await ethers.provider.send("evm_increaseTime", [secs_in_day * time_days])
    await expect(staketime.connect(alice).deposit(ethers.utils.parseEther("100"))).to.be.revertedWith("");
    await expect(staketime.connect(alice).withdrawal()).to.be.revertedWith("");
    await expect(staketime.connect(bob).deposit(ethers.utils.parseEther("100"))).to.be.revertedWith("");
    await expect(staketime.connect(bob).withdrawal()).to.be.revertedWith("");
  });
  it("Alice should withdraw her stake + reward", async function () {
    await ethers.provider.send("evm_increaseTime", [secs_in_day * time_days]) 
    await staketime.connect(alice).withdrawal().then((x) => {
      console.log(`Approval hash: ${x.hash}`);
    });
    expect(await tokenXYZ.balanceOf(alice.address).toString(), ethers.utils.parseEther("140").toString());    
  });
  it("Deposit and withdrawal for alice and bob deposit should fail", async function () {
    await expect(staketime.connect(alice).deposit(ethers.utils.parseEther("100"))).to.be.revertedWith("");
    await expect(staketime.connect(alice).withdrawal()).to.be.revertedWith("");
    await expect(staketime.connect(bob).deposit(ethers.utils.parseEther("100"))).to.be.revertedWith("");
  });
  it("Bob should withdraw her stake + reward", async function () {
    await ethers.provider.send("evm_increaseTime", [secs_in_day * time_days])
    await staketime.connect(bob).withdrawal().then((x) => {
      console.log(`Approval hash: ${x.hash}`);
    });
    expect(await tokenXYZ.balanceOf(bob.address).toString(), ethers.utils.parseEther("860").toString());
  });
  it("Deposit and withdrawal for alice and bob should fail", async function () {
    await expect(staketime.connect(alice).deposit(ethers.utils.parseEther("100"))).to.be.revertedWith("");
    await expect(staketime.connect(alice).withdrawal()).to.be.revertedWith("");
    await expect(staketime.connect(bob).deposit(ethers.utils.parseEther("100"))).to.be.revertedWith("");
    await expect(staketime.connect(bob).withdrawal()).to.be.revertedWith("");
  });
  it("Closing admin", async function () {
    const initialOwnerBalance = await tokenXYZ.balanceOf(admin.address);
    const initialContractsBalance = await tokenXYZ.balanceOf(staketime.address);
    await ethers.provider.send("evm_increaseTime", [secs_in_day * time_days])
    await staketime.close().then((x) => {
      console.log(`hash: ${x.hash}`);
    });
    expect(await tokenXYZ.balanceOf(staketime.address)).to.equal(ethers.utils.parseEther("0"));
    expect(await tokenXYZ.balanceOf(admin.address)).to.equal(initialOwnerBalance.add(initialContractsBalance));
  });
});
