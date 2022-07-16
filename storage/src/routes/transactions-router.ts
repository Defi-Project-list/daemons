import express, { Request, Response } from "express";
import { authenticate } from "../middlewares/authentication";
import { Transaction } from "../models/transaction";

export const transactionsRouter = express.Router();

/** Get the transactions for this user */
transactionsRouter.get("/receiver/:chainId", authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const transactions = await Transaction.find({ chainId, beneficiaryUser: req.userAddress }).sort(
        { date: "desc" }
    );
    return res.send(transactions);
});

/** Get the transactions for this executor */
transactionsRouter.get("/executor/:chainId/", authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const transactions = await Transaction.find({ chainId, executingUser: req.userAddress }).sort({
        date: "desc"
    });
    return res.send(transactions);
});
