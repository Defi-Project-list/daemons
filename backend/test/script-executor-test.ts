import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { domain, ISwapAction, types } from "../messages/swap-action-messages";

describe("Executor", function () {

    let owner: SignerWithAddress;
    let executor: Contract;
    let sigR: string;
    let sigS: string;
    let sigV: number;
    let message: ISwapAction;

    this.beforeEach(async () => {
        // get some wallets
        [owner] = await ethers.getSigners();

        // Executor contract
        const SwapperScriptExecutorContract = await ethers.getContractFactory("SwapperScriptExecutor");
        executor = await SwapperScriptExecutorContract.deploy();

        // Create message
        message = {
            tokenFrom: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
            tokenTo: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
            amount: ethers.utils.parseEther("100"),
            user: owner.address,
            executor: executor.address,
            balance: {
                enabled: false,
                amount: BigNumber.from(0),
                token: '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa',
                comparison: ">",
            },
            frequency: {
                enabled: false,
                blocks: BigNumber.from(0),
                startBlock: BigNumber.from(0),
            }
        };

        // Sign message
        const signature = await owner._signTypedData(domain, types, message);
        const split = ethers.utils.splitSignature(signature);
        [sigR, sigS, sigV] = [split.r, split.s, split.v];
    });

    it("verifies a correct message with no conditions", async () => {
        const result = await executor.verify(message, sigR, sigS, sigV);
        expect(result).to.equal(true);
    });

    it("spots a tampered message with no conditions", async () => {
        const tamperedMessage = { ...message };
        tamperedMessage.amount = ethers.utils.parseEther("0");

        const result = await executor.verify(tamperedMessage, sigR, sigS, sigV);
        expect(result).to.equal(false);
    });

});
