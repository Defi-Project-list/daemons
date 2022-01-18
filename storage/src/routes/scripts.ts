import express, { Request, Response } from 'express';
import { ISignedSwapAction } from '../../../messages/definitions/swap-action-messages';
import { ISignedTransferAction } from '../../../messages/definitions/transfer-action-messages';
import { SwapScript } from '../models/swap-script';
import { TransferScript } from '../models/transfer-script';
import { utils } from 'ethers';

export const router = express.Router();

router.get('/scripts', async (req: Request, res: Response) => {
    const scripts = await SwapScript.aggregate([
        { $addFields: { type: "SwapScript" } },
        {
            $unionWith: {
                coll: "transferscripts",
                pipeline: [
                    { $addFields: { type: "TransferScript" } },
                ]
            }
        },
    ]);

    return res.send(scripts);
});

router.get('/scripts/:userAddress', async (req: Request, res: Response) => {
    // adds checksum to address (uppercase characters)
    const userAddress = utils.getAddress(req.params.userAddress);

    const scripts = await SwapScript.aggregate([
        { $addFields: { type: "SwapScript" } },
        { $match: { user: userAddress } },
        {
            $unionWith: {
                coll: "transferscripts",
                pipeline: [
                    { $addFields: { type: "TransferScript" } },
                    { $match: { user: userAddress } }
                ]
            }
        },
    ]);

    return res.send(scripts);
});

router.post('/scripts/transfer', async (req: Request, res: Response) => {
    const script: ISignedTransferAction = req.body;
    await TransferScript.build(script).save();
    return res.send();
});

router.post('/scripts/swap', async (req: Request, res: Response) => {
    const script: ISignedSwapAction = req.body;
    await SwapScript.build(script).save();
    return res.send();
});
