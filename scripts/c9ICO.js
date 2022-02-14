// eslint-disable-next-line no-undef
const hre = require('hardhat');

async function main() {
	const Cloud9ICO = await hre.ethers.getContractFactory('CloudNineICO');
	const cloud9ICO = await Cloud9ICO.deploy();

	await cloud9ICO.deployed();

	console.log('Cloud9ICO deployed to:', cloud9ICO.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
