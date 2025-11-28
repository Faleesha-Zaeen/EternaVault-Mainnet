const { ethers } = require('hardhat');

async function main() {
  const LegacyVault = await ethers.getContractFactory('LegacyVault');
  const vault = await LegacyVault.deploy();
  await vault.waitForDeployment();

  console.log('LegacyVault deployed to:', await vault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
