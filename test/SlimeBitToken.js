const {expect} = require('chai');
const provider = waffle.provider;

describe('Slime Token Contract', ()=> {
  // contract interaction variables
  let Token, token, Coin, coin, owner, addr1, addr2;
  // deployment arguments variables
  let name = "Slime Bit Token";
  let symbol = "SBT";
  let baseUri = "";
  let notRevealedUri = "";

  before(async ()=> {
    Token = await ethers.getContractFactory('SlimeBitToken');
    Coin = await ethers.getContractFactory('ERC20Token');
  });

  beforeEach(async ()=> {
    [owner, addr1, addr2, _] = await ethers.getSigners();
    token = await Token.deploy(name, symbol, baseUri, notRevealedUri, owner.address);
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

  describe("Public functions", ()=> {
    describe("Mint function assertions", ()=> {

      beforeEach(async ()=> {
        await token.pause(false);
      });

      it("Should mint a new Token", async ()=> {
        const mintAmount = 3;
        const initialSupply = await token.supply();
        await token.mint(mintAmount, false);

        expect(await token.ownerOf(1)).to.equal(owner.address);
        expect(await token.balanceOf(owner.address)).to.equal(mintAmount);
        expect(await token.supply()).to.equal(initialSupply + mintAmount);
      });

      describe("assertions when drop and presale are paused ", ()=> {
        it("Should not allow to  mint if the drop and presale are paused", async ()=> {
          await token.pause(true);
          await expect(token.mint(3, false))
          .to
          .be
          .revertedWith("The token drop and the presale are close");
        });

        it("Should not allow to mint if the sender is not a MINTER", async ()=> {
          await token.pause(true);
          await token.setWhitelistStatus(true);
          await 
            expect(token.mint(1, false))
            .to
            .be
            .revertedWith("The token drop is paused and you are not in the presale whitelist");
        });

        it("Should allow to mint if sender is MINTER, drop is paused and presale is open", async ()=> {
          const mintCost = await token.cost();
          const minterHex = await token.MINTER();
          await token.pause(true);
          await token.setWhitelistStatus(true);
          
          
          await token.grantRole(minterHex, addr1.address);
          await token.connect(addr1).mint(1, false, {value: mintCost});

          expect(await token.ownerOf(1)).to.equal(addr1.address);
          expect(await token.balanceOf(addr1.address)).to.equal(1);
          expect(await token.supply()).to.equal(1);
        });
      });

      it("Should require at least an amount of one token to mint", async ()=> {
        await expect(token.mint(0, false))
        .to
        .be
        .revertedWith("You need to specify at least an amount of one token to mint");
      });
      
      it("Should not allow exceeding the maximum mint operations allowed per transaction", async ()=> {
        await expect(token.mint(15, false))
        .to
        .be
        .revertedWith("You cannot exceeds the max mint amount.");
      });

      it("Should require a payment of total mint tokens if sender is not the owner", async ()=> {
        const mintCost = await token.cost();
        let tx, result;

        await expect(token.connect(addr1).mint(3, false))
        .to
        .be
        .revertedWith("You have to pay the token price");

        // transaction response (may not be included in the blockchain yet
        tx = await token.connect(addr1).mint(3, false, {value: mintCost.mul(3)});
        // wait until the transaction is confirmed
        result = await tx.wait();
        expect(result.status).to.equal(1);
        expect(await provider.getBalance(token.address)).to.equal(mintCost.mul(3));
      });

      describe("On payment with external token assertions", ()=> {
        beforeEach(async ()=> {
          coin = await Coin.deploy("fungible", "FNG");
        });

        it("Should not allow to mint if contract is not approved to transfer coins", async ()=> {
          const costInCoin = await token.costInCoin();
          await token.setERC20TokenAddress(coin.address);
          await coin.transfer(addr1.address, costInCoin.mul(3));
          await expect(token.connect(addr1).mint(1, true))
          .to
          .be
          .revertedWith("ERC20: insufficient allowance");
        });

        it("Should not allow to mint if sender has not sufficient coins", async ()=> {
          const costInCoin = await token.costInCoin();
          await token.setERC20TokenAddress(coin.address);
          await coin.connect(addr1).approve(token.address, costInCoin);
          await expect(token.connect(addr1).mint(1, true))
          .to
          .be
          .revertedWith("ERC20: transfer amount exceeds balance");
        });

        it("Should allow to mint using extenal coin", async ()=> {
          const costInCoin = await token.costInCoin();
          await token.setERC20TokenAddress(coin.address);
          await coin.transfer(addr1.address, costInCoin.mul(3));
          await coin.connect(addr1).approve(token.address, costInCoin);
          await token.connect(addr1).mint(1, true);

          expect(await token.ownerOf(1)).to.equal(addr1.address);
          expect(await token.balanceOf(addr1.address)).to.equal(1);
          expect(await token.supply()).to.equal(1);
          expect(await coin.balanceOf(token.address))
          .to
          .equal(costInCoin);

        })

      })
    });

    describe("Wallet of Owner function assertions", ()=> {

      it("Should return the specified address wallet", async ()=> {
        const expectedIds = ['1', '2', '3', '4'];
        const mintCost = await token.cost();
        let wallet;
        
        await token.connect(addr1).mint(4, false, {value: mintCost.mul(4)});
        wallet = await token.walletOfOwner(addr1.address)
        wallet = wallet.map(el => el.toString());
        // arrays are different pointers so we need to use deep
        expect(wallet).to.deep.equal(expectedIds);
      });

      it("Should return an empty array when sender is not a owner", async ()=> {
        expect(await token.walletOfOwner(addr1.address)).to.deep.equal([]);
      });
      
    });

    describe("tokenURI function assertions", ()=> {
      it("Should reject if the token ID does not exist", async ()=> {
          await expect(token.tokenURI(3))
          .to
          .be
          .revertedWith("ERC721Metadata: URI query for nonexistent token");
      });

      it("Should return not revealed uri if revealed status is false", async ()=> {
        await token.mint(1, false);
        expect(await token.tokenURI(1))
        .to
        .equal(await token.notRevealedUri());
      });

      it("Should retrieve an empty string because tokenUri is empty", async ()=> {
        await token.mint(1, false);
        await token.reveal();
        expect(await token.tokenURI(1))
        .to
        .equal("");
      });

      it("Should return the token URI property", async ()=> {
        let notBlankUri = "myUri/abc/";
        let baseExtension = await token.baseExtension();
        await token.setBaseUri(notBlankUri);
        await token.mint(1, false);
        await token.reveal();

        expect(await token.tokenURI(1))
        .to
        .equal(notBlankUri + 1 + baseExtension);
      });
    });

    describe("Burn token function assertions", ()=> {
      it("Should not allow to burn tokens that do not exist or that do not belong to the sender", async ()=> {
        await
        expect(token.burn(1))
        .to
        .be
        .revertedWith("The specified token does not exist");
        
        await token.mint(1, false);
        await
          expect(token.connect(addr1).burn(1))
        .to
        .be
        .revertedWith("You can only burn tokens that belong to you");
      });

      it("Should burn a token", async ()=> {
        let prevBurnBalance, prevBurnSupply;

        await token.mint(1, false);
        prevBurnBalance = await token.balanceOf(owner.address);
        prevBurnSupply = await token.supply();

        await token.burn(1);
        await 
          expect(token.ownerOf(1))
        .to
        .be
        .revertedWith("ERC721: owner query for nonexistent token");
        
        expect(await token.balanceOf(owner.address))
        .to
        .equal(prevBurnBalance - 1);

        expect(await token.supply())
        .to
        .equal(prevBurnSupply - 1);
        
      });
    });
  });

  describe("Only ADMIN functions", ()=> {
    it("Should retrive if a not ADMIN addrress try to call these functions", async ()=> {
      await expect(token.connect(addr1).setCost(10000))
      .to
      .be
      .revertedWith("");
    });

    it("Should allow an ADMIN other than the owner to do ADMIN OPERATIONS", async()=> {
      const adminHex = await token.ADMIN();
      await token.grantRole(adminHex, addr1.address);
      expect(await token.revealed()).to.equal(false);
      await token.connect(addr1).reveal();
      expect(await token.revealed()).to.equal(true);
    })

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

    it("Should change the base URI", async ()=> {
      let tx;
      tx = await token.setBaseUri("New URI");
      tx = await tx.wait();
      expect(tx.status).to.equal(1);
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

      await token.connect(addr1).mint(5, false, {value: mintCost.mul(5)});
      contractBalance = await provider.getBalance(token.address);
      tx = await token.withdraw();
      tx = await tx.wait();

      newBalance = ownerBalance.add(contractBalance).sub(tx.effectiveGasPrice.mul(tx.gasUsed));
      expect(await provider.getBalance(owner.address)).to.equal(newBalance);
      expect(await provider.getBalance(token.address)).to.equal(0);
    });

    it("Should allow the owner to set the whitelist status", async ()=> {
      await token.setWhitelistStatus(true);

      expect(await token.whiteListActive()).to.equal(true);
    })

    it("Should allow set the external token contract address", async ()=> {
      expect(await token.ERC20TokenAddress())
      .to
      .not
      .equal(addr1.address);
      await token.setERC20TokenAddress(addr1.address);
      expect(await token.ERC20TokenAddress())
      .to
      .equal(addr1.address);
    })
  });

});
