import { utils } from 'ethers';
import express, { Request, Response } from 'express';
import { ITransaction, TransactionOutcome } from '../../../messages/transactions/transaction';
import { authenticate } from '../middlewares/authentication';
import { Transaction } from '../models/transaction';

export const transactionsRouter = express.Router();

transactionsRouter.post('/', authenticate, async (req: Request, res: Response) => {
    const transaction: ITransaction = req.body;

    /**
     * Users can send transactions if they put themselves as executors, but
     * nothing prevents them to spam the server with nonexistent txs about
     * other users. This will create a lot of spam on the target's page.
     *
     * How do we prevent that?
     * Some ideas:
     * - unique and verified hash
     * - ...?
     *
     * Maybe someone from the internet knows? (no good answers, like always in there)
     * https://ethereum.stackexchange.com/questions/122625/verify-a-transaction-response-correctness
     */
    if (req.userAddress !== utils.getAddress(transaction.executingUser)) {
        return res.sendStatus(403);
    }

    try {
        await Transaction.build(transaction).save();
        return res.sendStatus(200);
    } catch (error) {
        return res.status(400).send(error);
    }
});


transactionsRouter.post('/:hash/update', authenticate, async (req: Request, res: Response) => {
    const hash = req.params.hash;
    const transaction = await Transaction.findOne({ hash });

    if (!transaction || !req.userAddress || transaction.beneficiaryUser !== req.userAddress) {
        // only the owner of each transaction is allowed to verify it,
        // this to prevent other users from fabricating false transactions.
        return res.sendStatus(403);
    }

    if (transaction.outcome !== TransactionOutcome.Waiting) {
        // only waiting transactions can be updated
        return res.sendStatus(400);
    }

    const updatedValues = req.body;
    transaction.outcome = updatedValues.outcome;
    transaction.save();
    return res.send(transaction);
});


transactionsRouter.get('/:chainId/:userAddress', authenticate, async (req: Request, res: Response) => {
    // adds checksum to address (uppercase characters)
    const userAddress = utils.getAddress(req.params.userAddress);
    if (req.userAddress !== userAddress) {
        return res.sendStatus(403);
    }

    const chainId = String(req.params.chainId);

    const transactions = await Transaction
        .find({ chainId, beneficiaryUser: userAddress })
        .sort({ date: 'desc' });
    return res.send(transactions);
});
