import express from 'express';
import cors from 'cors';
import { scriptsRouter } from './routes/scripts-router';
import { tokensRouter } from './routes/tokens-router';

export const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/scripts", scriptsRouter);
app.use("/api/tokens", tokensRouter);
