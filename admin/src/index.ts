import cron from 'node-cron';
import { choco } from './cron/choco';

cron.schedule('*/1 * * * *', () => choco()).start(); //every_minute