require('dotenv').config();

require('@nomiclabs/hardhat-etherscan');
require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');
require('solidity-coverage');

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
	const accounts = await hre.ethers.getSigners();

	for (const account of accounts) {
		console.log(account.address);
	}
});

module.exports = {
	solidity: {
		compilers: [{ version: '0.5.12' }, { version: '0.8.2' }],
	},
	networks: {
		mumbai: {
			url: 'https://polygon-mumbai.g.alchemy.com/v2/9wlUi2MKDoF84RDsN4PBFxYyXcHYovsP',
			accounts: [
				'0d8e00bff210f964181a269ba3ac6e764db51d81d5dbe72afa266a05eacf77d0',
			],
		},
	},
	etherscan: {
		apiKey: 'MV3KAER7SK6PBCMW3W2D8ANAD8Z9YNV5KF',
	},
};
