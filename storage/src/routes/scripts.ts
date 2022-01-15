import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/api/scripts', (req: Request, res: Response) => {
    return res.send('the script');
});

router.post('/api/scripts', (req: Request, res: Response) => {
    return res.send('new script created');
});

export { router as scriptRouter };
