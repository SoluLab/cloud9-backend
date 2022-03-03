// eslint-disable-next-line no-undef
require('dotenv').config();

const hre = require('hardhat');

async function main() {
	const Cloud9ICO = await hre.ethers.getContractFactory('CloudNineICO');
	const cloud9ICO = await Cloud9ICO.deploy(
		'1',
		process.env.DEPLOYMENT_ADDRESS,
		process.env.CLOUD9_TOKEN_CONTRACT_ADDRESS
	);

	await cloud9ICO.deployed();

	console.log('Cloud9ICO deployed to:', cloud9ICO.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
