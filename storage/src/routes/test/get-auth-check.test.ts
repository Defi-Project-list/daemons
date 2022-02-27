import supertest from 'supertest';
import { app } from '../../app';
import jwt from 'jsonwebtoken';
import faker from '@faker-js/faker';
import { expect } from 'chai';


describe('GET api/auth/is-authenticated/:userAddress', () => {

    const userAddress = '0xb79f76ef2c5f0286176833e7b2eee103b1cc3244';
    const jwToken = jwt.sign({ userAddress }, process.env.JWT_SECRET as string);

    it('returns 200 if the user is authenticated', async () => {
        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}`)
            .set('Cookie', `token=${jwToken}`)
            .expect(200);
    });

    it('returns a 401 error if the user is not authenticated', async () => {
        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}`)
            .expect(401);
    });

    it('returns a 401 error and deletes cookie if the JWT does not correspond to the user', async () => {
        const randomUser = faker.finance.ethereumAddress();
        const anotherJwt = jwt.sign({ userAddress: randomUser }, process.env.JWT_SECRET as string);

        await supertest(app)
            .get(`/api/auth/is-authenticated/${userAddress}`)
            .set('Cookie', `token=${anotherJwt}`)
            .expect(401)
            // cookie should be deleted (by clearing the value and setting a past date)
            .expect(res => expect(res.headers['set-cookie'][0]).to.equal('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'));
    });
});
