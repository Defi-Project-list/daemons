import express, { Request, Response } from "express";
import { authenticateAdmin } from "../middlewares/authentication";
import { updateScriptStats } from "../stats/script-stats-updater";
import { updateUserStats } from "../stats/user-stats-updater";

export const adminRouter = express.Router();

adminRouter.post("/update-stats", authenticateAdmin, async (req: Request, res: Response) => {
    try {
        await updateUserStats();
        await updateScriptStats();

        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error);
    }
});
