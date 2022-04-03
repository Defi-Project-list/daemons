import { utils } from 'ethers';
import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middlewares/authentication';


export const authenticationRouter = express.Router();
const OTPs: { [address: string]: number; } = {};


authenticationRouter.get('/is-authenticated/:userAddress', authenticate, async (req: Request, res: Response) => {
    const userAddress = utils.getAddress(req.params.userAddress);

    // if the address in the JWT is the same passed as query, we're good to go!
    if (req.userAddress === userAddress) {
        return res.sendStatus(200);
    }

    // otherwise let's delete the cookie altogether
    res.clearCookie("token");
    res.sendStatus(401);
});

authenticationRouter.get('/message-to-sign/:userAddress', async (req: Request, res: Response) => {
    const userAddress = utils.getAddress(req.params.userAddress);

    // create a one time password and cache it
    const otp = Math.floor(Math.random() * 1000000);
    OTPs[userAddress] = otp;

    const message = composeMessage(userAddress, otp);
    return res.json({ message });
});

const composeMessage = (userAddress: string, otp: number): string =>
    `Sign this message to verify you are the owner of the address ${userAddress}. [OTP: ${otp}]`;

authenticationRouter.post('/login', async (req: Request, res: Response) => {
    const signedMessage = req.body.signedMessage;
    const userAddress = utils.getAddress(req.body.userAddress);

    // retrieve and delete the OTP of the user
    const otp = OTPs[userAddress];
    delete OTPs[userAddress];
    const message = composeMessage(userAddress, otp);

    const decodedAddress = utils.verifyMessage(message, signedMessage);

    if (userAddress !== decodedAddress) {
        return res.status(403).send("Invalid signature");
    }

    // generate JWT and send back
    const authToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string, { expiresIn: '2592000s' });
    res.cookie('token', authToken, { httpOnly: true, secure: true, sameSite: "none" });
    return res.send();
});
