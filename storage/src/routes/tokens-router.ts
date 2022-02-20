import express, { Request, Response } from 'express';
import { authenticate } from '../middlewares/authentication';
import { Token } from '../models/token';

export const tokensRouter = express.Router();

tokensRouter.get('/:chainId', authenticate, async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const tokens = await Token.find({ chainId: chainId });
    return res.send(tokens);
});
