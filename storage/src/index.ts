import express from 'express';
import mongoose from 'mongoose';
import { json } from 'body-parser';
import { scriptRouter } from './routes/scripts';

const app = express();

app.use(json());
app.use(scriptRouter);

mongoose.connect('mongodb://localhost:27017/scripts', {}, () => {
    console.log("connected to database");
});

const port = 5000;

app.get('/', (_, res) => {
    res.send('Hello World');
});

app.listen(port, () => console.log(`Running on port ${port}`));
