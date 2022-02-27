const {expect} = require('chai');
const provider = waffle.provider;

describe("ERC20Token contract", ()=> {
	//Contract interaction variables
	let Token, token, owner, addr1, addr2;
	//deployment arguments variables;
	let name = "Musscoin";
	let symbol = "MUSS";

	before(async ()=> {
		Token = await ethers.getContractFactory("ERC20Token");
	});

	beforeEach(async ()=> {
		token = await Token.deploy(name, symbol);
    	[owner, addr1, addr2, _] = await ethers.getSigners();
	});

	describe("Deployment", ()=> {
		it("Should set token name and symbol", async ()=> {
			expect(await token.name())
			.to 
			.equal(name);

			expect(await token.symbol())
			.to
			.equal(symbol);
		})
	});

	it("Should allow to mint new tokens", async ()=> {
		let initialSupply = await token.totalSupply();
		await token.mint(owner.address, 30);
		expect(await token.totalSupply())
		.to
		.equal(initialSupply.add(30));
	});

	it("Should allow to burn tokens", async ()=> {
		let initialSupply = await token.totalSupply();
		await token.burn(30);
		expect(await token.totalSupply())
		.to
		.equal(initialSupply.sub(30));
	});
});