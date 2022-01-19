import mongoose from 'mongoose';
import { app } from './app';


mongoose
    .connect("mongodb://localhost:27017/scripts")
    .then(() => {
        app.listen(5000, () => {
            console.log("Storage has started!");
        });
    });
