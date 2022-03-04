import express, { Request, Response } from 'express';
import { SwapScript } from '../models/swap-script';
import { IStats, Stats } from '../models/stats';
import { authenticateAdmin } from '../middlewares/authentication';

export const adminRouter = express.Router();

adminRouter.post('/update-stats', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        // Count total of users 
        const totalUsers = await
            SwapScript.aggregate([
                {
                    $unionWith: {
                        coll: "transferscripts",
                        pipeline: [
                            { $addFields: { type: "TransferScript" } },
                        ]
                    }
                }, { $group: { _id: "$user" } },
                { $count: "count" }
            ]);

        // Count total of scripts 
        const totalScripts = await
            SwapScript.aggregate([
                {
                    $unionWith: {
                        coll: "transferscripts",
                        pipeline: [
                            { $addFields: { type: "TransferScript" } },
                        ]
                    }
                }, { $count: "count" }
            ]);


        const stats: IStats = {
            totalUsers: totalUsers[0]?.count,
            totalScripts: totalScripts[0]?.count,
            date: new Date().toISOString().slice(0, 10)
        }

        // Check if the stats have already been saved today
        // If not save, if yes update
        await Stats.updateOne(
            { date: { $eq: stats.date } },
            {
                $set: {
                    "totalUsers": stats.totalUsers,
                    "totalScripts": stats.totalScripts,
                    "date": stats.date
                }
            },
            { upsert: true })
        return res.send({ stats });
    } catch (error) {
        return res.status(500).send(error);
    }
});
