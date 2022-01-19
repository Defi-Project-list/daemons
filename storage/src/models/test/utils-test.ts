import { expect } from 'chai';
import { stringifyBigNumber } from '../utils';
import { utils } from 'ethers';


describe('stringifyBigNumber', () => {

    it('returns the untouched string passed as argument', async () => {
        const argument = "00001_TEST";
        expect(stringifyBigNumber(argument)).to.equal(argument);
    });

    it('returns the string representation of the BigNumber passed as argument', async () => {
        const argument = utils.parseEther("3.141592653589793238");
        const stringified = "3141592653589793238";

        expect(stringifyBigNumber(argument)).to.equal(stringified);
    });

    it('returns the string representation of the serialized BigNumber passed as argument', async () => {
        const argument = JSON.parse(JSON.stringify(utils.parseEther("3.141592653589793238")));
        // equal to { type: 'BigNumber', hex: '0x2b992ddfa23249d6' }
        const stringified = "3141592653589793238";

        expect(stringifyBigNumber(argument)).to.equal(stringified);
    });

    it('throws if the argument is unrecognized', async () => {
        const argument = 1;
        const functionThatWillThrow = () => stringifyBigNumber(argument);

        expect(functionThatWillThrow).to.throw();
    });

});
