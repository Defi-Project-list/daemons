import { CronJob } from "cron";
import { updateStorageStats } from "./update-storage-stats";

export const scheduler = () => {
    console.log("Admin scheduler started");

    const cronjobs = [new CronJob("40 7 * * *", () => updateStorageStats(), null, true, "UTC")];

    cronjobs.forEach((cronjob) => {
        console.log("Next job time:", cronjob.nextDates().toISOString());
        cronjob.start();
    });
};
