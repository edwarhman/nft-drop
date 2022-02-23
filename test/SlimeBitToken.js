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

      beforeEach(async ()=> {
        await token.pause(false);
      });

      it("Should mint a new Token", async ()=> {
        const mintAmount = 3;
        const initialSupply = await token.supply();
        await token.mint(mintAmount);

        expect(await token.ownerOf(1)).to.equal(owner.address);
        expect(await token.balanceOf(owner.address)).to.equal(mintAmount);
        expect(await token.supply()).to.equal(initialSupply + mintAmount);
      });

      it("Should not allow to  mint if the contract is paused", async ()=> {
        await token.pause(true);
        await expect(token.mint(3))
        .to
        .be
        .revertedWith("Drop is paused");
      });

      it("Should require at least an amount of one token to mint", async ()=> {
        await expect(token.mint(0))
        .to
        .be
        .revertedWith("You need to specify at least an amount of one token to mint");
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
