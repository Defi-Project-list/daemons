import mongoose from 'mongoose';
import { app } from './app';


mongoose
    .connect(process.env.MONGO_DB_CONN_STRING!)
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("Storage has started!");
        });
    });
