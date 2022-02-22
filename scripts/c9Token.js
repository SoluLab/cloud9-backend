// eslint-disable-next-line no-undef
const hre = require('hardhat');

async function main() {
	const Cloud9Token = await hre.ethers.getContractFactory('CloudNine');
	const cloud9Token = await Cloud9Token.deploy();

	await cloud9Token.deployed();

	console.log('Cloud9Token deployed to:', cloud9Token.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
