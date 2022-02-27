import express from 'express';
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import { tokensRouter } from './routes/tokens-router';
import { scriptsRouter } from './routes/scripts-router';
import { authenticationRouter } from './routes/authentication-router';
import { corsWhitelisting } from './middlewares/cors-whitelisting';
import { transactionsRouter } from './routes/transactions-router';

dotenv.config();

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET was not set');

export const app = express();

app.use(corsWhitelisting);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authenticationRouter);
app.use("/api/scripts", scriptsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/tokens", tokensRouter);
