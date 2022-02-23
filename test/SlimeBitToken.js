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

  xdescribe("Deployment", ()=> {
    it("should set the right owner", async ()=> {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should set token name, symbol and not revealed URI property", async ()=> {
      expect(await token.name()).to.equal(name);
      expect(await token.symbol()).to.equal(symbol);
      expect(await token.notRevealedUri()).to.equal(notRevealedUri);
    });
  });

  describe("Public functions", ()=> {
    describe("Mint function assertions", ()=> {

      it("Should mint a new Token", async ()=> {

      });

    });

    describe("Wallet of Owner function assertions", ()=> {

      it("Should return the specified address wallet", async ()=> {

      });
      
    });
  });

  xdescribe("Only Owner functions", ()=> {
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

    it("Should change the NFT cost", async ()=> {
      const newCost = ethers.utils.parseEther("0.5");
      await token.setCost(newCost);
      expect(await token.cost()).to.equal(newCost);
    });

    it("Should change the max mint amount", async ()=> {
      const newMaxMintAmount = 4;
      await token.setMaxMintAmount(newMaxMintAmount);
      expect(await token.maxMintAmountPerTx()).to.equal(newMaxMintAmount);
    });

    it("Should change the not revealed URI", async ()=> {
      const newUri = "anotherUri";
      await token.setNotRevealedUri(newUri);
      expect(await token.notRevealedUri()).to.equal(newUri);
    });

    it("Should change the paused state", async ()=> {
      const initialState = await token.paused();
      await token.pause(!initialState);
      expect(await token.paused()).to.equal(!initialState);
    });
  });

});
