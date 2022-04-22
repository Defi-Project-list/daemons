import { utils } from "ethers";
import express, { Request, Response } from "express";
import { authenticate } from "../middlewares/authentication";
import { TransferScript } from "../models/scripts/transfer-script";
import { Script } from "../models/scripts/script";
import { SwapScript } from "../models/scripts/swap-script";
import { MmBaseScript } from "../models/scripts/mm-base-script";
import {
    ISignedMMBaseAction,
    ISignedSwapAction,
    ISignedTransferAction,
    ITransferAction
} from "@daemons-fi/shared-definitions";

export const scriptsRouter = express.Router();

scriptsRouter.get("/:chainId", authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);
    const scripts = await Script.find({ chainId: chainId });
    return res.send(scripts);
});

scriptsRouter.get("/:chainId/:userAddress", authenticate, async (req: Request, res: Response) => {
    // adds checksum to address (uppercase characters)
    const userAddress = utils.getAddress(req.params.userAddress);
    if (req.userAddress !== userAddress) {
        return res.sendStatus(403);
    }

    const chainId = String(req.params.chainId);
    const scripts = await Script.find({ user: userAddress, chainId: chainId });
    return res.send(scripts);
});

scriptsRouter.post("/", authenticate, async (req: Request, res: Response) => {
    const { script, type } = req.body;
    if (req.userAddress !== utils.getAddress(script.user)) {
        return res.sendStatus(403);
    }

    try {
        await buildScript(script, type);
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

async function buildScript(script: any, type: string): Promise<any> {
    switch (type) {
        case "TransferScript":
            await TransferScript.build(script as ISignedTransferAction).save();
            break;
        case "SwapScript":
            await SwapScript.build(script as ISignedSwapAction).save();
            break;
        case "MmBaseScript":
            await MmBaseScript.build(script as ISignedMMBaseAction).save();
            break;
        default:
            throw new Error(`Unsupported script type ${type}`);
    }
}

scriptsRouter.post("/update-description", authenticate, async (req: Request, res: Response) => {
    const { scriptId, description } = req.body;

    try {
        await Script.updateOne(
            { user: req.userAddress, scriptId: scriptId },
            { $set: { description } }
        );
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});

scriptsRouter.post("/revoke", authenticate, async (req: Request, res: Response) => {
    const { scriptId } = req.body;

    try {
        await Script.deleteOne({ user: req.userAddress, scriptId: scriptId });
        return res.send();
    } catch (error) {
        return res.status(400).send(error);
    }
});
