/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require("@nomiclabs/hardhat-waffle");
require('dotenv').config()

module.exports = {
  solidity: "0.8.1",
  "network": {
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/d0a8b4c2deb94e57841929475e0d240d",
      accounts: [access.env.PRIVATE_KEY]
    },
  }
};
