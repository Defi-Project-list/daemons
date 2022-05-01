import { CronJob } from "cron";
import { TerminatorBot } from "./daemonic-bots/terminator-bot";

export const scheduler = () => {
    console.log("Storage scheduler started");

    const cronjobs = [
        // Bots run every 10 minutes
        new CronJob("*/10 * * * *", () => TerminatorBot.execute(), null, true, "UTC"),
    ];

    cronjobs.forEach((cronjob) => {
        cronjob.start();
    });
};
