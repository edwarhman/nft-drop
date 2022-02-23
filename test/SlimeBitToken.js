const {expect} = require('chai');

describe('Slime Token Contract', ()=> {
  // contract interaction variables
  let Token, token, owner, addr1, addr2;
  // deployment arguments variables
  let name = "Slime Bit Token";
  let symbol = "SBT";
  let baseUri = "";
  let notRevealedUri = "";

  beforeEach(async ()=> {
    Token = await ethers.getContractFactory('SlimeBitToken');
    token = await Token.deploy(name, symbol, baseUri, notRevealedUri);
    [owner, addr1, addr2, _] = await ethers.getSigners();
  });

  describe("Deployment", ()=> {
    it("should set the right owner", async ()=> {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should set token name, symbol and not revealed URI property", async ()=> {
      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.notRevealedUri()).to.equal(notRevealedUri);
    });
  });

  describe("Only Owner functions", ()=> {
    it("Should retrive if a not owner addrress try to call these functions", async ()=> {
      await expect(token.connect(addr1).setCost(10000))
      .to
      .be
      .revertedWith("");
    });

    it("Should set the state to revealed", async ()=> {
      expect(await token.revealed()).to.equal(false);
      await token.reveal();
      expect(await token.revealed()).to.equal(true);
    });
  });

});
