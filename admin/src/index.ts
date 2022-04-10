import dotenv from "dotenv";
import { scheduler } from "./cron";

dotenv.config();

if (!process.env.ADMIN_KEY) throw new Error('ADMIN_KEY was not set');
if (!process.env.STORAGE_ENDPOINT) throw new Error('STORAGE_ENDPOINT was not set');

scheduler();
