import { ITransaction } from "@daemons-fi/shared-definitions/build";
import express, { Request, Response } from "express";
import { authenticate } from "../middlewares/authentication";
import { Transaction } from "../models/transactions/transaction";

export const transactionsRouter = express.Router();

export const TRANSACTIONS_PAGE_SIZE = 20;

export interface IFetchedTxs {
    transactions: ITransaction[];
    nrPages: number;
}

/** Get the transactions for this user */
transactionsRouter.get("/receiver/:chainId", authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);
    const currentPage = (Number(req.query.page) ?? 1) - 1;

    const query = { chainId, beneficiaryUser: req.userAddress };
    const countAll = await Transaction.countDocuments(query);
    const nrPages = Math.ceil(countAll / TRANSACTIONS_PAGE_SIZE);

    const transactions = await Transaction.find(query)
        .lean()
        .skip(currentPage * TRANSACTIONS_PAGE_SIZE)
        .limit(TRANSACTIONS_PAGE_SIZE)
        .sort({ date: "desc" });
    return res.send({ transactions, nrPages } as IFetchedTxs);
});

/** Get the transactions for this executor */
transactionsRouter.get("/executor/:chainId/", authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);
    const currentPage = (Number(req.query.page) ?? 1) - 1;

    const query = { chainId, executingUser: req.userAddress };
    const countAll = await Transaction.countDocuments(query);
    const nrPages = Math.ceil(countAll / TRANSACTIONS_PAGE_SIZE);

    const transactions = await Transaction.find(query)
        .lean()
        .skip(currentPage * TRANSACTIONS_PAGE_SIZE)
        .limit(TRANSACTIONS_PAGE_SIZE)
        .sort({ date: "desc" });
    return res.send({ transactions, nrPages } as IFetchedTxs);
});
