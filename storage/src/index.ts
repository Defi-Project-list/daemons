import express from 'express';
import mongoose from 'mongoose';
import { router } from './routes';
import cors from 'cors';

mongoose
    .connect("mongodb://localhost:27017/scripts")
    .then(() => {
        const app = express();
        app.use(express.json());
        app.use(cors());

        app.use("/api", router);

        app.listen(5000, () => {
            console.log("Storage has started!");
        });
    });
