const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Arnen", function () {
  it("Should return the status of NFT sale", async function () {
    const Content = await ethers.getContractFactory("Contents");
    const content = await Content.deploy();
    const Arnen = await ethers.getContractFactory("Arnen");
    const arnen = await Arnen.deploy(content.address);
    await arnen.deployed();

    expect(await arnen.saleIsActive()).to.equal(false);

    const openNftSale = await arnen.openNFTSale();

    // wait until the transaction is mined
    await openNftSale.wait();

    expect(await arnen.saleIsActive()).to.equal(true);
  });
});
