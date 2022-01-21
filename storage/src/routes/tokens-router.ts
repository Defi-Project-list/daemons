import express, { Request, Response } from 'express';
import { Token } from '../models/token';

export const tokensRouter = express.Router();

tokensRouter.get('/:chainId', async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const tokens = await Token.find({ chainId: chainId });
    return res.send(tokens);
});

tokensRouter.get('/price-feed-tokens/:chainId', async (req: Request, res: Response) => {
    const chainId = String(req.params.chainId);

    const tokens = await Token.find({ chainId: chainId, hasPriceFeed: true });
    return res.send(tokens);
});
