import mongoose from 'mongoose';
import { app } from './app';


mongoose
    .connect("mongodb://127.0.0.1:27017/balrog")
    .then(() => {
        app.listen(5000, () => {
            console.log("Storage has started!");
        });
    });
