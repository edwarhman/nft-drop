/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

console.log(process.env.PRIVATE_KEY);

module.exports = {
  solidity: "0.8.1",
  "networks": {
    hardhat: {

    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/d0a8b4c2deb94e57841929475e0d240d",
      accounts: [process.env.PRIVATE_KEY]
    },
  }
};
