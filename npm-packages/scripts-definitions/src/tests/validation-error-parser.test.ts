import { expect } from "chai";
import itParam from "mocha-param";
import { parseValidationError } from "../validation-error-parser";

interface IValidationError {
    name: string;
    json: any;
    expected: string;
}

const metamaskDefaultKovanProvider: IValidationError = {
    name: "Metamask Default Kovan Provider",
    json: {
        code: -32015,
        message: "VM execution error.",
        data: "Reverted 0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000155b5343524950545f42414c414e43455d5b544d505d0000000000000000000000"
    },
    expected: "[SCRIPT_BALANCE][TMP]"
};

const otherMetamaskKovanProvider: IValidationError = {
    name: "Metamask Default Kovan 2",
    json: {
        reason: "missing revert data in call exception; Transaction reverted without a reason string",
        code: "CALL_EXCEPTION",
        data: "0x",
        transaction: {
            to: "0xEcA0c2CFF4D7a85974Da1f288A6cef588498D41A",
            data: "0xb1fe42f62f3c78eae14b60273a9285de07dbef71b86317280ea899fc3641204068215859000000000000000000000000d0a1e359811322d97991e03f863a0c30c2cf029c000000000000000000000000c35c79ae067576fcc474e51b18c4ee4ab36c027401000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000af0000000000000000000000000c35c79ae067576fcc474e51b18c4ee4ab36c0274000000000000000000000000eca0c2cff4d7a85974da1f288a6cef588498d41a000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001a467c4549e4932b14b10b7f98a1379da1a651b8b8135fd27b7dac6b2c221de435b69d0790e6e838fb8bfd9ef6e9f68cd775286d0385f81197e41c9d7e4d3cd26000000000000000000000000000000000000000000000000000000000000001b",
            accessList: null
        },
        error: {
            code: -32015,
            response:
                '{"jsonrpc":"2.0","id":2,"error":{"code":-32015,"data":"Reverted 0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001e5b52455045544954494f4e535f434f4e444954494f4e5d5b46494e414c5d0000","message":"VM execution error."}}'
        }
    },
    expected: "[REPETITIONS_CONDITION][FINAL]"
};

const infuraErrorInStorageKovan: IValidationError = {
    name: "Infura Error In Storage Kovan",
    json: {
        code: -32015,
        response:
            '{"jsonrpc":"2.0","id":3,"error":{"code":-32015,"data":"Reverted 0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001e5b52455045544954494f4e535f434f4e444954494f4e5d5b46494e414c5d0000","message":"VM execution error."}}'
    },
    expected: "[REPETITIONS_CONDITION][FINAL]"
};

const metamaskDefaultFtmTestnetProvider: IValidationError = {
    name: "Metamask Default Fantom Testnet Provider",
    json: {
        code: -32603,
        message: "Internal JSON-RPC error.",
        data: {
            code: 3,
            message: "execution reverted: [GAS][TMP]",
            data: "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a5b4741535d5b544d505d00000000000000000000000000000000000000000000"
        },
        stack: '{\n  "code": -32603,\n  "message": "Internal JSON-RPC error.",\n  "data": {\n    "code": 3,\n    "message": "execution reverted: [GAS][TMP]",\n    "data": "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a5b4741535d5b544d505d00000000000000000000000000000000000000000000"\n  },\n  "stack": "Error: Internal JSON-RPC error.\\n    at new i (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:1:182708)\\n    at s (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:1:180251)\\n    at Object.internal (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:1:180861)\\n    at u (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background-1.js:1:100455)\\n    at chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background-1.js:1:101487\\n    at async chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:18:152160"\n}\n  at new i (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:1:182708)\n  at s (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:1:180251)\n  at Object.internal (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:1:180861)\n  at u (chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background-1.js:1:100455)\n  at chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/background-1.js:1:101487\n  at async chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/common-0.js:18:152160'
    },
    expected: "[GAS][TMP]"
};

const metamaskDefaultRinkeby: IValidationError = {
    name: "Metamask Default Rinkeby Provider",
    json: {
        reason: "cannot estimate gas; transaction may fail or may require manual gas limit",
        code: "UNPREDICTABLE_GAS_LIMIT",
        error: {
            code: -32603,
            message: "execution reverted: [REPETITIONS_CONDITION][FINAL]",
            data: {
                originalError: {
                    code: 3,
                    data: "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001e5b52455045544954494f4e535f434f4e444954494f4e5d5b46494e414c5d0000",
                    message: "execution reverted: [REPETITIONS_CONDITION][FINAL]"
                }
            }
        },
        method: "call",
        transaction: {
            from: "0xC35C79aE067576FcC474E51B18c4eE4Ab36C0274",
            to: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
            data: "0xf86ad4252f611b0257ff6f0beb4c105d7492981954808f0fb9c30ef266d3347d7ea292a50000000000000000000000004aaded56bd7c69861e8654719195fca9c670eb45000000000000000000000000c35c79ae067576fcc474e51b18c4ee4ab36c027401000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000032000000000000000000000000c35c79ae067576fcc474e51b18c4ee4ab36c02740000000000000000000000002fbbbd586edc580f0db8f9620db6e153b1ad1136000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001d4954ac1a4cc611bb48a98d83e96157f2051b6d30327ca329680e32e09f8033a2a1b71e69161c6f44895d972f64a7b36dbdc1489add7207c3afbd95aec8a938e000000000000000000000000000000000000000000000000000000000000001c",
            accessList: null
        }
    },
    expected: "[REPETITIONS_CONDITION][FINAL]"
};

const infuraRinkeby: IValidationError = {
    name: "Infura Rinkeby Provider",
    json: {
        reason: "cannot estimate gas; transaction may fail or may require manual gas limit",
        code: "UNPREDICTABLE_GAS_LIMIT",
        error: {
            code: 3,
            response:
                '{"jsonrpc":"2.0","id":2,"error":{"code":3,"data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001e5b52455045544954494f4e535f434f4e444954494f4e5d5b46494e414c5d0000","message":"execution reverted: [REPETITIONS_CONDITION][FINAL]"}}'
        },
        method: "call",
        transaction: {
            to: "0x2FbBBd586eDC580F0dB8F9620db6E153b1aD1136",
            data: "0xf86ad4252f611b0257ff6f0beb4c105d7492981954808f0fb9c30ef266d3347d7ea292a50000000000000000000000004aaded56bd7c69861e8654719195fca9c670eb45000000000000000000000000c35c79ae067576fcc474e51b18c4ee4ab36c027401000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000032000000000000000000000000c35c79ae067576fcc474e51b18c4ee4ab36c02740000000000000000000000002fbbbd586edc580f0db8f9620db6e153b1ad1136000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001d4954ac1a4cc611bb48a98d83e96157f2051b6d30327ca329680e32e09f8033a2a1b71e69161c6f44895d972f64a7b36dbdc1489add7207c3afbd95aec8a938e000000000000000000000000000000000000000000000000000000000000001c",
            accessList: null
        }
    },
    expected: "[REPETITIONS_CONDITION][FINAL]"
};

const otherDefaultRinkeby: IValidationError = {
    name: "Yet another Rinkeby Provider",
    json: {
        reason: "[NO_DEBT][TMP]",
        code: "CALL_EXCEPTION",
        method: "verify((bytes32,address,address,bytes1,bytes1,bytes1,uint256,address,address,address,uint256,(bool,address,bytes1,uint256),(bool,uint256,uint256),(bool,address,bytes1,uint256),(bool,uint32),(bool,uint256,bytes32,address),(bool,address,bytes1,uint256)),bytes32,bytes32,uint8)",
        data: "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e5b4e4f5f444542545d5b544d505d000000000000000000000000000000000000",
        errorArgs: ["[NO_DEBT][TMP]"],
        errorName: "Error",
        errorSignature: "Error(string)",
        address: "0xAB3B0A5631E10786a19F950FD73af7b6724111AA",
        args: [
            /* ... */
        ],
        transaction: {
            /* ... */
        }
    },
    expected: "[NO_DEBT][TMP]"
};

describe("Validation Error Parser", () => {
    itParam(
        "parses all known errors: '${value.name}'",
        [
            metamaskDefaultKovanProvider,
            otherMetamaskKovanProvider,
            infuraErrorInStorageKovan,
            metamaskDefaultFtmTestnetProvider,
            metamaskDefaultRinkeby,
            infuraRinkeby,
            otherDefaultRinkeby
        ],
        async (error: IValidationError) => {
            const result = parseValidationError(error.json);
            expect(result).to.be.equal(error.expected);
        }
    );

    it("Returns 'unknown' for anything that cannot be parsed", async () => {
        const result = parseValidationError({ something: "else" });
        expect(result).to.be.equal("Unknown");
    });
});
