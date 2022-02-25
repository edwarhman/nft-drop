const hre = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("deploying with the account: ", deployer.address);

  const SlimeToken = await hre.ethers.getContractFactory("SlimeBitToken");
  const slimeToken = await SlimeToken.deploy(
    "Slime Bit Token",
    "SBT",
    "ipfs://Qmci4xZ5WvhtqS9tCyzWVry7XXiALyNYzimfFpJ5roGsJ1",
    "https://gateway.pinata.cloud/ipfs/QmWRxGJ2v99nWFdhxmvBFhTA8Q8S8wGbuK7VGJUx7NNVyw/notRevealed.png"
  );

  await slimeToken.deployed();

  console.log("SlimeBitToken deployed to: ", slimeToken.address);
}

main()
.then(()=> process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1)
});
