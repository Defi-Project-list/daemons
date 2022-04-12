import express, { Request, Response } from "express";
import { authenticateAdmin } from "../middlewares/authentication";
import { updateScriptStats } from "../stats/script-stats-updater";
import { updateTransactionStats } from "../stats/transactions-stats-updater";
import { updateUserStats } from "../stats/user-stats-updater";

export const adminRouter = express.Router();

adminRouter.post("/update-stats", authenticateAdmin, async (req: Request, res: Response) => {
    try {
        console.log('Stats updating started...');

        await updateUserStats();
        console.log('User stats updated');

        await updateScriptStats();
        console.log('Script stats updated');

        await updateTransactionStats();
        console.log('Transaction stats updated');

        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error);
    }
});
