import mongoose from 'mongoose';
import { app } from './app';


mongoose
    .connect("mongodb://localhost:27017/balrog")
    .then(() => {
        app.listen(5000, () => {
            console.log("Storage has started!");
        });
    });
