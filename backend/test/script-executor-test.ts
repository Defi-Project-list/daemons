import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from "chai";
import { BigNumber, Contract } from 'ethers';
import { ethers } from 'hardhat';
import { domain, ISwapAction, types } from "../messages/swap-action-messages";

describe("SwapperScriptExecutor", function () {

    describe("With No Conditions", function () {

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
                id: '0x7465737400000000000000000000000000000000000000000000000000000000',
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
            await executor.verify(message, sigR, sigS, sigV);
            // no error means success!
        });

        it("spots a tampered message with no conditions", async () => {
            const tamperedMessage = { ...message };
            tamperedMessage.amount = ethers.utils.parseEther("0");

            await expect(executor.verify(tamperedMessage, sigR, sigS, sigV)).to.be.revertedWith('Signature does not match');
        });

    });

    describe("With Frequency Condition", function () {

        it('verifies something', async () => { });

    });


});
