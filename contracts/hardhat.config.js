require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({ path: '../.env' });

const { QIE_RPC_URL, QIE_CHAIN_ID, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {},
    qieTestnet: {
      url: QIE_RPC_URL,
      chainId: QIE_CHAIN_ID ? Number(QIE_CHAIN_ID) : 1983,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
