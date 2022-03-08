import express, { Request, Response } from 'express';
import { SwapScript } from '../models/swap-script';
import { IUserStats, UserStats } from '../models/user-stats';
import { IScriptStats, ScriptStats } from '../models/script-stats';
import { authenticateAdmin } from '../middlewares/authentication';
import { TransferScript } from '../models/transfer-script';
import { Transaction } from '../models/transaction';
import { ITotalPerChain } from '../models/total-per-chain';
import { ChainInfo } from '../models/chain-info';

export const adminRouter = express.Router();

adminRouter.post('/update-stats', authenticateAdmin, async (req: Request, res: Response) => {
    try {
        await updateUserStats();
        await updateScriptStats();

        return res.sendStatus(200);
    } catch (error) {
        return res.status(500).send(error);
    }
});

async function updateUserStats(): Promise<void> {
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

    const totalUsersPerChain = await
        SwapScript.aggregate([
            {
                $unionWith: {
                    coll: "transferscripts",
                    pipeline: [
                        { $addFields: { type: "TransferScript" } },
                    ]
                }
            },
            {
                $group: {
                    _id: { chainId: "$chainId", user: "$user" }
                },

            },
            {
                $group: {
                    _id: "$_id.chainId",
                    "total": { $sum: 1 }
                }
            }
        ]);

    const totalPerChain = totalUsersPerChain.map(t => {
        return { name: ChainInfo[t._id], total: t.total } as ITotalPerChain;
    })

    const userStats: IUserStats = {
        total: totalUsers[0]?.count,
        totalPerChain,
        date: new Date().toISOString().slice(0, 10)
    }
    await UserStats.updateOne(
        { date: { $eq: userStats.date } },
        {
            $set: {
                "total": userStats.total,
                "totalPerChain": userStats.totalPerChain,
                "date": userStats.date
            }
        },
        { upsert: true })
}

async function updateScriptStats(): Promise<void> {
    const totalSwap = await SwapScript.count();
    const totalTransfer = await TransferScript.count();
    const totalExecutions = await Transaction.count();
    const totalScriptsExecutedPerChain = await Transaction.aggregate([
        { "$group": { _id: "$chainId", total: { $sum: 1 } } }
    ]);
    const totalScriptsPerChain = await
        SwapScript.aggregate([
            {
                $unionWith: {
                    coll: "transferscripts",
                    pipeline: [
                        { $addFields: { type: "TransferScript" } },
                    ]
                }
            }, { "$group": { _id: "$chainId", total: { $sum: 1 } } }
        ]);

    const totalExecutionsPerChain = totalScriptsExecutedPerChain.map(t => {
        return { name: ChainInfo[t._id], total: t.total } as ITotalPerChain;
    });
    const totalPerChain = totalScriptsPerChain.map(t => {
        return { name: ChainInfo[t._id], total: t.total } as ITotalPerChain;
    });

    const scriptStats: IScriptStats = {
        total: totalSwap + totalTransfer,
        date: new Date().toISOString().slice(0, 10),
        totalExecutions,
        totalPerChain,
        totalExecutionsPerChain,
    }
    await ScriptStats.updateOne(
        { date: { $eq: scriptStats.date } },
        {
            $set: {
                "total": scriptStats.total,
                "date": scriptStats.date,
                "totalExecutions": scriptStats.totalExecutions,
                "totalPerChain": scriptStats.totalPerChain,
                "totalExecutionsPerChain": scriptStats.totalExecutionsPerChain
            }
        },
        { upsert: true })
}

