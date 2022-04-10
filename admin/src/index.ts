import express from "express";
import dotenv from "dotenv";
import { scheduler } from "./cron";

dotenv.config();

if (!process.env.ADMIN_KEY) throw new Error("ADMIN_KEY was not set");
if (!process.env.STORAGE_ENDPOINT) throw new Error("STORAGE_ENDPOINT was not set");

const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Admin has started! Listening on port ${port}`);
    scheduler();
});
