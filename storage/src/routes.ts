import express, { Request, Response } from 'express';
import { ISignedSwapAction } from '../../messages/definitions/swap-action-messages';
import { ISignedTransferAction } from '../../messages/definitions/transfer-action-messages';
import { SwapScript } from './models/swap-script';
import { TransferScript } from './models/transfer-script';

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
    const userAddress = req.params.userAddress;

    const scripts = await SwapScript.aggregate([
        { $addFields: { type: "SwapScript", lower_user: { $toLower: "$user" } } },
        { $match: { lower_user: userAddress } },
        {
            $unionWith: {
                coll: "transferscripts",
                pipeline: [
                    { $addFields: { type: "TransferScript", lower_user: { $toLower: "$user" } } },
                    { $match: { lower_user: userAddress } }
                ]
            }
        },
    ]);

    return res.send(scripts);
});

function x() {
    SwapScript.aggregate([
        { $addFields: { type: "SwapScript" } },
        {
            $unionWith: {
                coll: "TransferScript",
                pipeline: [{ $addFields: { type: "TransferScript" } }]
            }
        },
    ]);
}

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
