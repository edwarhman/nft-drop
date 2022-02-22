pragma solidity >= 0.7.0 < 0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SlimeBitToken is ERC721, Ownable {
	uint public cost = 0.01 ether;
	string baseUri;
	string public notRevealedUri;
	bool public paused = false;
	bool public revealed = false;
	uint public supply;
	uint public maxSupply 1000;


	constructor (
		string memory _name,
		string memory _symbol,

	) ERC721(_name, _symbol) Ownable() {}

	// public functions

	function mint(uint _mintAmount) public payable onlyOwner {
		require(!paused);
		require(_mintAmount > 0);
		require(supply + _mintAmount <= maxSupply)
		require(_mintAmount < maxMintAmount, "You cannot exceeds the max mint amount.");
		if(msg.sender == owner()) {
			require(msg.value >= cost * _mintAmount);
		}

		for(uint i = 1, i <= _mintAmount; i++) {
			_safeMint(msg.sender, supply + i);
		}

		supply += _mintAmount;
	}

	function walletOfOwner (address _owner)
	public
	view
	returns(uint[] memory)	{
		uint ownerTokenCount = balanceOf(_owner);
		uint[] memory tokensIds = new uint[](ownerTokenCount);
		uint gotTokens;
		uint id = 1;

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

	function reveal() public onlyOwner {
		revealed = true;
	}

	function setCost(uint _newCost) public onlyOwner {
			cost = _newCost;
	}

	function setMaxMintAmount(uint _newMaxMinAmount) public onlyOwner {
		maxMintAmount = _newMaxMinAmount;
	}

	function setNotRevealedUri(string memory _notRevealedUri) public onlyOwner {
		notRevealedUri = _notRevealedUri;
	}

	function setBaseUri(string memory _newBaseUri) public onlyOwner {
		baseUri = _newBaseUri;
	}

	function pause(bool _newState) public onlyOwner {
		paused = _newState;
	}

	function withdraw() public payable onlyOwner {
		(bool os,) = payable(owner()).call{value : address(this).balance}("");
	}
}
