const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('LegacyVault', function () {
  async function deployFixture() {
    const [owner, heir] = await ethers.getSigners();
    const LegacyVault = await ethers.getContractFactory('LegacyVault');
    const vault = await LegacyVault.deploy();
    await vault.waitForDeployment();
    return { vault, owner, heir };
  }

  it('registers heirs and respects unlock timestamp', async function () {
    const { vault, heir } = await deployFixture();

    await vault.registerHeirs([heir.address]);
    const now = (await ethers.provider.getBlock('latest')).timestamp;
    const ts = now + 3600;
    await vault.setUnlockTimestamp(ts);

    expect(await vault.canAccess(heir.address)).to.equal(false);

    await ethers.provider.send('evm_setNextBlockTimestamp', [ts + 1]);
    await ethers.provider.send('evm_mine', []);

    expect(await vault.canAccess(heir.address)).to.equal(true);
  });

  it('markDeceased flips access immediately', async function () {
    const { vault, heir } = await deployFixture();

    await vault.registerHeirs([heir.address]);

    expect(await vault.canAccess(heir.address)).to.equal(false);

    await vault.markDeceased();

    expect(await vault.canAccess(heir.address)).to.equal(true);
  });

  it('registers validators', async function () {
    const { vault, owner } = await deployFixture();
    const [_, validator] = await ethers.getSigners();
    await vault.registerValidator(validator.address);
    expect(await vault.isValidator(validator.address)).to.equal(true);
  });
});
