import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import chaiAlmost from "chai-almost";
import { Contract } from "ethers";
import { ethers, network } from "hardhat";

const chai = require("chai");

describe("Vesting contract", function () {
  let snapshotId: string;
  let owner: SignerWithAddress;
  let beneficiary1: SignerWithAddress;
  let beneficiary2: SignerWithAddress;
  let fooToken: Contract;

  const oneDay = () => 60 * 60 * 24;
  const now = () => Math.floor(new Date().getTime() / 1000);
  const tomorrow = () => now() + oneDay();

  this.beforeEach(async () => {
    // save snapshot (needed because we advance/reset time)
    snapshotId = await network.provider.send("evm_snapshot", []);

    // get some wallets
    [owner, beneficiary1, beneficiary2] = await ethers.getSigners();

    // Deploy mock token contracts
    const MockTokenContract = await ethers.getContractFactory("MockToken");
    fooToken = await MockTokenContract.deploy("Foo Token", "FOO");
  });

  this.afterEach(async () => {
    // restore from snapshot
    await network.provider.send("evm_revert", [snapshotId]);
  });

  async function initializeVestingContract(
    start: number,
    duration: number
  ): Promise<Contract> {
    const VestingContract = await ethers.getContractFactory("Vesting");
    return await VestingContract.deploy(fooToken.address, start, duration);
  }

  it("allows adding beneficiaries", async () => {
    const vestingContract = await initializeVestingContract(
      tomorrow(),
      oneDay()
    );
    await fooToken.mint(
      vestingContract.address,
      ethers.utils.parseEther("200")
    );

    // no error means it all went through as expected!
    await vestingContract.addBeneficiary(
      beneficiary1.address,
      ethers.utils.parseEther("100")
    );
    await vestingContract.addBeneficiary(
      beneficiary2.address,
      ethers.utils.parseEther("100")
    );
  });

  it("throws an error if trying to give to a beneficiary an amount higher than the contract balance", async () => {
    const vestingContract = await initializeVestingContract(
      tomorrow(),
      oneDay()
    );
    await fooToken.mint(
      vestingContract.address,
      ethers.utils.parseEther("200")
    );

    await expect(
      vestingContract.addBeneficiary(
        beneficiary1.address,
        ethers.utils.parseEther("201")
      )
    ).to.be.revertedWith("Amount is higher than available for vesting");
  });

  it("throws an error if trying to add the same beneficiary twice", async () => {
    const vestingContract = await initializeVestingContract(
      tomorrow(),
      oneDay()
    );
    await fooToken.mint(
      vestingContract.address,
      ethers.utils.parseEther("200")
    );

    await vestingContract.addBeneficiary(
      beneficiary1.address,
      ethers.utils.parseEther("50")
    );
    await expect(
      vestingContract.addBeneficiary(
        beneficiary1.address,
        ethers.utils.parseEther("50")
      )
    ).to.be.revertedWith("Beneficiary is already in use");
  });

  it("throws an error if trying to add beneficiaries after the start date", async () => {
    const yesterday = now() - oneDay();
    const twoDays = oneDay() + oneDay();
    const vestingContract = await initializeVestingContract(yesterday, twoDays);
    await fooToken.mint(
      vestingContract.address,
      ethers.utils.parseEther("200")
    );

    await expect(
      vestingContract.addBeneficiary(
        beneficiary1.address,
        ethers.utils.parseEther("50")
      )
    ).to.be.revertedWith("Vesting started. Modifications forbidden");
  });

  describe("Unallocated tokens", () => {
    it("keeps track of unallocated tokens", async () => {
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        oneDay()
      );
      await fooToken.mint(
        vestingContract.address,
        ethers.utils.parseEther("200")
      );
      expect((await vestingContract.unallocatedTokens()).toString()).to.equal(
        ethers.utils.parseEther("200").toString()
      );

      await vestingContract.addBeneficiary(
        beneficiary1.address,
        ethers.utils.parseEther("125")
      );
      expect((await vestingContract.unallocatedTokens()).toString()).to.equal(
        ethers.utils.parseEther("75").toString()
      );

      await vestingContract.addBeneficiary(
        beneficiary2.address,
        ethers.utils.parseEther("73")
      );
      expect((await vestingContract.unallocatedTokens()).toString()).to.equal(
        ethers.utils.parseEther("2").toString()
      );
    });

    it("allows the owner to claim unallocated tokens", async () => {
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        oneDay()
      );
      await fooToken.mint(
        vestingContract.address,
        ethers.utils.parseEther("200")
      );

      // partially allocate tokens (75 are left)
      await vestingContract.addBeneficiary(
        beneficiary1.address,
        ethers.utils.parseEther("100")
      );
      await vestingContract.addBeneficiary(
        beneficiary2.address,
        ethers.utils.parseEther("25")
      );
      expect((await vestingContract.unallocatedTokens()).toString()).to.equal(
        ethers.utils.parseEther("75").toString()
      );

      await ethers.provider.send("evm_mine", [now() + oneDay() + 5]); // 5 seconds after the vesting started
      await vestingContract.claimUnallocatedTokens();

      // The tokens have been transferred to the owner
      expect((await vestingContract.unallocatedTokens()).toNumber()).to.equal(
        0
      );
      expect((await fooToken.balanceOf(owner.address)).toString()).to.equal(
        ethers.utils.parseEther("75").toString()
      );
    });

    it("throws an error if trying to claim back unassigned tokens before the start date", async () => {
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        oneDay()
      );
      await fooToken.mint(
        vestingContract.address,
        ethers.utils.parseEther("200")
      );

      // partially allocate tokens (75 are left)
      await vestingContract.addBeneficiary(
        beneficiary1.address,
        ethers.utils.parseEther("100")
      );
      await vestingContract.addBeneficiary(
        beneficiary2.address,
        ethers.utils.parseEther("25")
      );
      expect((await vestingContract.unallocatedTokens()).toString()).to.equal(
        ethers.utils.parseEther("75").toString()
      );

      await expect(vestingContract.claimUnallocatedTokens()).to.be.revertedWith(
        "Vesting has not started yet"
      );
    });
  });

  describe("Vesting calculation", () => {
    it("at creation no token is vested", async () => {
      const twoDays = oneDay() + oneDay();
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        twoDays
      );
      await fooToken.mint(vestingContract.address, 200000);
      await vestingContract.addBeneficiary(beneficiary1.address, 200000);

      expect(
        await vestingContract.vestedAmount(beneficiary1.address)
      ).to.be.equal(0);
    });

    it("before the start date, no token is vested", async () => {
      const twoDays = oneDay() + oneDay();
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        twoDays
      );
      await fooToken.mint(vestingContract.address, 200000);
      await vestingContract.addBeneficiary(beneficiary1.address, 200000);

      await network.provider.send("evm_setNextBlockTimestamp", [
        now() + oneDay() - 60,
      ]);
      await network.provider.send("evm_mine");
      expect(
        await vestingContract.vestedAmount(beneficiary1.address)
      ).to.be.equal(0);
    });

    it("just after the start date, tokens start getting vested", async () => {
      chai.use(chaiAlmost(5)); // we have a tolerance of 5 WEY
      const twoDays = oneDay() + oneDay();
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        twoDays
      );
      await fooToken.mint(vestingContract.address, 200000);
      await vestingContract.addBeneficiary(beneficiary1.address, 200000);

      await network.provider.send("evm_setNextBlockTimestamp", [
        now() + oneDay() + 1,
      ]);
      await network.provider.send("evm_mine");
      expect(
        (await vestingContract.vestedAmount(beneficiary1.address)).toNumber()
      ).to.be.almost.equal(1);
    });

    it("after the end date, all tokens are vested", async () => {
      const twoDays = oneDay() + oneDay();
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        twoDays
      );
      await fooToken.mint(vestingContract.address, 200000);
      await vestingContract.addBeneficiary(beneficiary1.address, 200000);

      await ethers.provider.send("evm_mine", [now() + oneDay() * 3]);
      expect(
        await vestingContract.vestedAmount(beneficiary1.address)
      ).to.be.equal(200000);
    });

    it("tokens are vested proportionally to the beneficiary balance", async () => {
      const twoDays = oneDay() + oneDay();
      const vestingContract = await initializeVestingContract(
        tomorrow(),
        twoDays
      );
      await fooToken.mint(vestingContract.address, 200000);
      await vestingContract.addBeneficiary(beneficiary1.address, 170000);
      await vestingContract.addBeneficiary(beneficiary2.address, 30000);

      await ethers.provider.send("evm_mine", [now() + oneDay() * 2]); // half way through the vesting
      expect(
        await vestingContract.vestedAmount(beneficiary1.address)
      ).to.be.equal(85000);
      expect(
        await vestingContract.vestedAmount(beneficiary2.address)
      ).to.be.equal(15000);
    });
  });

  it("releases to the beneficiary its due amount", async () => {
    chai.use(chaiAlmost(5)); // we have a tolerance of 5 WEY
    const twoDays = oneDay() + oneDay();
    const vestingContract = await initializeVestingContract(
      tomorrow(),
      twoDays
    );
    await fooToken.mint(vestingContract.address, 200000);
    await vestingContract.addBeneficiary(beneficiary1.address, 200000);

    // before the start the releasable amount is 0
    expect(
      await vestingContract.releasableAmount(beneficiary1.address)
    ).to.be.equal(0);

    // half way through it should be 100000
    await ethers.provider.send("evm_mine", [now() + oneDay() * 2 + 1]); // half way through the vesting
    expect(
      (await vestingContract.releasableAmount(beneficiary1.address)).toNumber()
    ).to.be.almost.equal(100000);

    // after releasing, the tokens should be in the beneficiary wallet and the releasable should be 0
    await vestingContract.release(beneficiary1.address);
    expect(
      (await fooToken.balanceOf(beneficiary1.address)).toNumber()
    ).to.almost.equal(100000);
    expect(
      (await vestingContract.releasableAmount(beneficiary1.address)).toNumber()
    ).to.be.equal(0);

    // after a while the releasable amount is increased again
    await ethers.provider.send("evm_mine", [now() + oneDay() * 3]); // half way through the vesting
    expect(
      (await vestingContract.releasableAmount(beneficiary1.address)).toNumber()
    ).to.be.almost.equal(100000);

    // again, after releasing we should see the tokens in the beneficiary wallet and the releasable amount going to 0
    await vestingContract.release(beneficiary1.address);
    expect(
      (await fooToken.balanceOf(beneficiary1.address)).toNumber()
    ).to.equal(200000);
    expect(
      (await vestingContract.releasableAmount(beneficiary1.address)).toNumber()
    ).to.be.equal(0);
  });

  it("throws an error if nothing can be released", async () => {
    const twoDays = oneDay() + oneDay();
    const vestingContract = await initializeVestingContract(
      tomorrow(),
      twoDays
    );
    await fooToken.mint(vestingContract.address, 200000);
    await vestingContract.addBeneficiary(beneficiary1.address, 200000);

    // before the start the releasable amount is 0, thus releasing should fail
    expect(
      await vestingContract.releasableAmount(beneficiary1.address)
    ).to.be.equal(0);
    await expect(
      vestingContract.release(beneficiary1.address)
    ).to.be.revertedWith("Nothing to release");
  });
});
