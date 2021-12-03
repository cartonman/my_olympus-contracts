import "@nomiclabs/hardhat-waffle";

const { privateKey } = require('./secrets.json');

module.exports = {
    defaultNetwork: "localhost",
    networks: {
      localhost: {
        url: "http://127.0.0.1:8545"
      },
      hardhat: {
      },
      rinkeby: {
      	url: "http://127.0.0.1:8545"
      },
      fantomtestnet: {
      	url: "https://rpc.testnet.fantom.network/",
      	chainID : 4002,
      	  accounts: [privateKey]
      }
    },
    solidity: {
	compilers: [
	    {
		version: "0.7.5",
		settings:
		{
		    optimizer:
		    {
			enabled: true,
			runs: 200
		    },
		},
	    },
	    {
		version: "0.5.16",
		settings:
		{
		    optimizer: {
			enabled: true,
			runs: 200,
		    },
		},
	    },
	],
    },
};