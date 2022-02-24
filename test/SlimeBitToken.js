const {expect} = require('chai');
const provider = waffle.provider;

describe('Slime Token Contract', ()=> {
  // contract interaction variables
  let Token, token, owner, addr1, addr2;
  // deployment arguments variables
  let name = "Slime Bit Token";
  let symbol = "SBT";
  let baseUri = "";
  let notRevealedUri = "";

  before(async ()=> {
    Token = await ethers.getContractFactory('SlimeBitToken');
  });

  beforeEach(async ()=> {
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

  xdescribe("Public functions", ()=> {
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
      
      it("Should not allow exceeding the maximum mint operations allowed per transaction", async ()=> {
        await expect(token.mint(15))
        .to
        .be
        .revertedWith("You cannot exceeds the max mint amount.");
      });

      it("Should require a payment of total mint tokens if sender is not the owner", async ()=> {
        const mintCost = await token.cost();
        let tx, result;

        await expect(token.connect(addr1).mint(3))
        .to
        .be
        .revertedWith("You have to pay the token price");

        // transaction response (may not be included in the blockchain yet
        tx = await token.connect(addr1).mint(3, {value: mintCost.mul(3)});
        // wait until the transaction is confirmed
        result = await tx.wait();
        expect(result.status).to.equal(1);
        expect(await provider.getBalance(token.address)).to.equal(mintCost.mul(3));
      });

    });

    describe("Wallet of Owner function assertions", ()=> {

      it("Should return the specified address wallet", async ()=> {
        const expectedIds = ['1', '2', '3', '4'];
        const mintCost = await token.cost();
        let wallet;
        
        await token.connect(addr1).mint(4, {value: mintCost.mul(4)});
        wallet = await token.walletOfOwner(addr1.address)
        wallet = wallet.map(el => el.toString());
        // arrays are different pointers so we need to use deep
        expect(wallet).to.deep.equal(expectedIds);
      });

      it("Should return an empty array when sender is not a owner", async ()=> {
        expect(await token.walletOfOwner(addr1.address)).to.deep.equal([]);
      });
      
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

    it("Should let the owner to withdraw contract funds", async ()=> {
      let mintCost = await token.cost();
      let ownerBalance = await provider.getBalance(owner.address);
      let contractBalance;
      let newBalance;

      await token.connect(addr1).mint(5, {value: mintCost.mul(5)});
      contractBalance = await provider.getBalance(token.address);
      tx = await token.withdraw();
      tx = await tx.wait();

      newBalance = ownerBalance.add(contractBalance).sub(tx.effectiveGasPrice.mul(tx.gasUsed));
      expect(await provider.getBalance(owner.address)).to.equal(newBalance);
      expect(await provider.getBalance(token.address)).to.equal(0);
    });
  });

});
