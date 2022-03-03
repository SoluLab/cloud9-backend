// eslint-disable-next-line no-undef
const hre = require('hardhat');

async function main() {
	const Cloud9ICO = await hre.ethers.getContractFactory('CloudNineICO');
	const cloud9ICO = await Cloud9ICO.deploy(
		'1',
		'0x3941Fa693608240B82B241670Be1e301a7871c94',
		'0xF4D5B20e565a8834d63be5672fC4Fc769d0Aa2E6'
	);

	await cloud9ICO.deployed();

	console.log('Cloud9ICO deployed to:', cloud9ICO.address);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
