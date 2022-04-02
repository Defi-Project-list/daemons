import { utils } from 'ethers';
import express, { Request, Response } from 'express';
import { ISignedMMBaseAction } from '@daemons-fi/shared-definitions';
import { ISignedSwapAction } from '@daemons-fi/shared-definitions';
import { ISignedTransferAction } from '@daemons-fi/shared-definitions';
import { authenticate } from '../middlewares/authentication';
import { SwapScript } from '../models/scripts/swap-script';
import { TransferScript } from '../models/scripts/transfer-script';
import { MmBaseScript } from '../models/scripts/mm-base-script';

export const scriptsRouter = express.Router();

scriptsRouter.get('/:chainId', authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const scripts = await SwapScript
        .aggregate([
            { $addFields: { type: "SwapScript" } },
            { $match: { chainId: chainId } },
            {
                $unionWith: {
                    coll: "transferscripts",
                    pipeline: [
                        { $addFields: { type: "TransferScript" } },
                        { $match: { chainId: chainId } },
                    ]
                }
            },
            {
                $unionWith: {
                    coll: "mmbasescripts",
                    pipeline: [
                        { $addFields: { type: "MmBaseScript" } },
                        { $match: { chainId: chainId } },
                    ]
                }
            },
        ]);

    return res.send(scripts);
});

scriptsRouter.get('/:chainId/:userAddress', authenticate, async (req: Request, res: Response) => {
    // adds checksum to address (uppercase characters)
    const userAddress = utils.getAddress(req.params.userAddress);
    if (req.userAddress !== userAddress) {
        return res.sendStatus(403);
    }

    const chainId = String(req.params.chainId);

    const scripts = await SwapScript.aggregate([
        { $addFields: { type: "SwapScript" } },
        { $match: { user: userAddress, chainId: chainId } },
        {
            $unionWith: {
                coll: "transferscripts",
                pipeline: [
                    { $addFields: { type: "TransferScript" } },
                    { $match: { user: userAddress, chainId: chainId } }
                ]
            }
        },
        {
            $unionWith: {
                coll: "mmbasescripts",
                pipeline: [
                    { $addFields: { type: "MmBaseScript" } },
                    { $match: { user: userAddress, chainId: chainId } }
                ]
            }
        },
    ]);

    return res.send(scripts);
});

scriptsRouter.post('/transfer', authenticate, async (req: Request, res: Response) => {
    const script: ISignedTransferAction = req.body;
    if (req.userAddress !== utils.getAddress(script.user)) {
        return res.sendStatus(403);
    }

    try {
        await TransferScript.build(script).save();
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/swap', authenticate, async (req: Request, res: Response) => {
    const script: ISignedSwapAction = req.body;
    if (req.userAddress !== utils.getAddress(script.user)) {
        return res.sendStatus(403);
    }

    try {
        await SwapScript.build(script).save();
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/mm-base', authenticate, async (req: Request, res: Response) => {
    const script: ISignedMMBaseAction = req.body;
    if (req.userAddress !== utils.getAddress(script.user)) {
        return res.sendStatus(403);
    }

    try {
        await MmBaseScript.build(script).save();
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/update-description', authenticate, async (req: Request, res: Response) => {
    const { scriptId, scriptType, description } = req.body;

    try {
        switch (scriptType) {
            case "SwapScript":
                await SwapScript.updateOne(
                    { user: req.userAddress, scriptId: scriptId },
                    { $set: { description } }
                );
                return res.send();
            case "TransferScript":
                await TransferScript.updateOne(
                    { user: req.userAddress, scriptId: scriptId },
                    { $set: { description } }
                );
                return res.send();
            case "MmBaseScript":
                await MmBaseScript.updateOne(
                    { user: req.userAddress, scriptId: scriptId },
                    { $set: { description } }
                );
                return res.send();
            default:
                return res.status(400).send(`Unsupported script type ${scriptType}`);
        }
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/revoke', authenticate, async (req: Request, res: Response) => {
    const { scriptId, scriptType } = req.body;

    try {
        switch (scriptType) {
            case "SwapScript":
                await SwapScript.deleteOne({ user: req.userAddress, scriptId: scriptId });
                return res.send();
            case "TransferScript":
                await TransferScript.deleteOne({ user: req.userAddress, scriptId: scriptId });
                return res.send();
            case "MmBaseScript":
                await MmBaseScript.deleteOne({ user: req.userAddress, scriptId: scriptId });
                return res.send();
            default:
                return res.status(400).send(`Unsupported script type ${scriptType}`);
        }
    } catch (error) {
        return res.status(400).send(error);
    }
});
