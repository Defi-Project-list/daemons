import express from 'express';
import dotenv from "dotenv";
import { wakeyRouter } from "./routes/wakey";

dotenv.config();

if (!process.env.ADMIN_KEY) throw new Error("ADMIN_KEY was not set");
if (!process.env.STORAGE_ENDPOINT) throw new Error("STORAGE_ENDPOINT was not set");

export const app = express();

app.use(wakeyRouter);
