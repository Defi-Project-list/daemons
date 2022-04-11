import cron from "node-cron";
import { updateStorageStats } from "./update-storage-stats";

export const scheduler = () => {
    console.log("Admin scheduler started");

    cron.schedule("18 17 * * *", () => updateStorageStats()).start(); //every day at 00.05
};
