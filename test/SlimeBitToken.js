const {expect} = require('chai');

describe('Slime Token Contract', ()=> {
  let Token, token, owner, addr1, addr2;

  beforeEach(async ()=> {
    Token = await ethers.getContractFactory('SlimeBitToken');
    token = await Token.deploy("Slime Bit Token", "SBT", "", "");
    [owner, addr1, addr2, _] = await ethers.getSigners();
  });

  describe("Deployment", ()=> {
    it("should set the right owner", async ()=> {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

});
