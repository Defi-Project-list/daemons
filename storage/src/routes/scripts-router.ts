import { utils } from 'ethers';
import express, { Request, Response } from 'express';
import { ISignedSwapAction } from '../../../messages/definitions/swap-action-messages';
import { ISignedTransferAction } from '../../../messages/definitions/transfer-action-messages';
import { SwapScript } from '../models/swap-script';
import { TransferScript } from '../models/transfer-script';

export const scriptsRouter = express.Router();

scriptsRouter.get('/:chainId', async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const scripts = await SwapScript.aggregate([
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
    ]);

    return res.send(scripts);
});

scriptsRouter.get('/:chainId/:userAddress', async (req: Request, res: Response) => {
    // adds checksum to address (uppercase characters)
    const userAddress = utils.getAddress(req.params.userAddress);
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
    ]);

    return res.send(scripts);
});

scriptsRouter.post('/transfer', async (req: Request, res: Response) => {
    const script: ISignedTransferAction = req.body;
    try {
        await TransferScript.build(script).save();
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/swap', async (req: Request, res: Response) => {
    const script: ISignedSwapAction = req.body;
    try {
        await SwapScript.build(script).save();
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/update-description', async (req: Request, res: Response) => {
    const { scriptId, scriptType, description } = req.body;

    try {
        switch (scriptType) {
            case "SwapScript":
                await SwapScript.updateOne({ scriptId: scriptId }, { $set: { description } });
                return res.send();
            case "TransferScript":
                await TransferScript.updateOne({ scriptId: scriptId }, { $set: { description } });
                return res.send();
            default:
                return res.status(400).send(`Unsupported script type ${scriptType}`);
        }
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post('/revoke', async (req: Request, res: Response) => {
    const { scriptId, scriptType } = req.body;

    try {
        switch (scriptType) {
            case "SwapScript":
                await SwapScript.deleteOne({ scriptId: scriptId });
                return res.send();
            case "TransferScript":
                await TransferScript.deleteOne({ scriptId: scriptId });
                return res.send();
            default:
                return res.status(400).send(`Unsupported script type ${scriptType}`);
        }
    } catch (error) {
        return res.status(400).send(error);
    }
});
