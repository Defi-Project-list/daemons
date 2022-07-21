import mongoose from "mongoose";
import { ExpressApp } from "./app";
import { scheduler } from "./cron";

mongoose.connect(process.env.MONGO_DB_CONN_STRING!).then(() => {
  const port = process.env.PORT || 5000;
  const app = ExpressApp.instantiate();
  app.listen(port, () => {
    console.log(`Storage has started! Listening on port ${port}`);
    scheduler();
  });
});
