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

});
