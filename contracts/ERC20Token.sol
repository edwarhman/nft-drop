pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Token is ERC20, Ownable {
	constructor(string memory name, string memory symbol) ERC20 (name, symbol) {
		_mint(msg.sender, 10000 * 10**18);
	}


	///@notice Allow the contract owner to mint new tokens
	///@param recipient Address which will have the new minted tokens
	///@param amount Amount of new tokens to mint
	///@dev only the contract owner can mint new tokens
	function mint(address recipient, uint amount) public onlyOwner {
		_mint(recipient, amount);
	}

	///@notice Allow users to burn their tokens
	///@param amount Amount of coins to burn
	function burn(uint amount) public {
		_burn(msg.sender, amount);
	}
}