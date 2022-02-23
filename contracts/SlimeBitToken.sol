pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SlimeBitToken is ERC721, Ownable {
	///@notice cost of each token
	uint public cost = 0.01 ether;
	string baseUri;
	///@notice Uri that points to the img showed when the NFT are not revealed
	string public notRevealedUri;
	///@notice Indicate if the drop is paused (true) or not (false)
	bool public paused = false;
	///@notice Indicates if the drop has already been revealed 
	bool public revealed = false;
	///@notice The minted tokens total supply
	uint public supply;
	///@notice Max amount of token permited to mint
	uint public maxSupply = 1000;
	///@notice Max amount of token permited to mint per transaction
	uint public maxMintAmountPerTx = 10;


	constructor (
		string memory _name,
		string memory _symbol,
		string memory _baseUri,
		string memory _notRevealedUri

	) ERC721(_name, _symbol) Ownable() {
		baseUri = _baseUri;
		notRevealedUri = _notRevealedUri;
	}

	// public functions

	///@notice Allows the sender to mint a new token if it's possible.
	///@param _mintAmount Specify the amount of tokens to mind,
	///cannot exceed the max mint amount permited by transaction
	///@dev It rejects if doing the operation exceeds the maximum token amount
	function mint(uint _mintAmount) public payable onlyOwner {
		require(!paused);
		require(_mintAmount > 0);
		require(supply + _mintAmount <= maxSupply);
		require(_mintAmount < maxMintAmountPerTx, "You cannot exceeds the max mint amount.");
		if(msg.sender == owner()) {
			require(msg.value >= cost * _mintAmount);
		}

		for(uint i = 1; i <= _mintAmount; i++) {
			_safeMint(msg.sender, supply + i);
		}

		supply += _mintAmount;
	}


	///@notice Gets all the tokens in the specified address wallet
	///@param _owner Address that have the tokens
	///@return An array of tokens IDs that specified owner have in his wallet 
	function walletOfOwner (address _owner)
	public
	view
	returns(uint[] memory)	{
		uint ownerTokenCount = balanceOf(_owner);
		uint[] memory tokensIds = new uint[](ownerTokenCount);
		uint gotTokens;
		uint id = 1;
		// iterate throgh id total to get all the owner tokens 
		while(id <= supply && gotTokens < ownerTokenCount) {
			if(ownerOf(id) == _owner) {
				tokensIds[gotTokens] = id;
				gotTokens++; 
			}
			i++;
		}
		return tokensIds;
	}

	// only owner functions

	///@notice reveal the smart contract
	function reveal() public onlyOwner {
		revealed = true;
	}

	///@notice set cost of tokens
	///@param _newCost The new cost to set
	function setCost(uint _newCost) public onlyOwner {
			cost = _newCost;
	}

	///@notice set the maximun mint amount per transaction
	function setMaxMintAmount(uint _newMaxMinAmount) public onlyOwner {
		maxMintAmountPerTx = _newMaxMinAmount;
	}


	function setNotRevealedUri(string memory _notRevealedUri) public onlyOwner {
		notRevealedUri = _notRevealedUri;
	}

	function setBaseUri(string memory _newBaseUri) public onlyOwner {
		baseUri = _newBaseUri;
	}

	///@notice Set the pause state of the nft drop to true or false
	///@param _newState A bool value that set the drop paused state   
	function pause(bool _newState) public onlyOwner {
		paused = _newState;
	}

	///@notice let the contract owner to withdraw the funds
	function withdraw() public payable onlyOwner {
		(bool os,) = payable(owner()).call{value : address(this).balance}("");
	}
}
