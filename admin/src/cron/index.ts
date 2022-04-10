import cron from "node-cron";
import { updateStorageStats } from "./update-storage-stats";

export const scheduler = () => {
    console.log("Admin scheduler started");

    cron.schedule("0 22 * * *", () => updateStorageStats()).start(); //every day at 21.00
};
