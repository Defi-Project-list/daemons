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
    data: "Reverted 0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000155b5343524950545f42414c414e43455d5b544d505d0000000000000000000000",
  },
  expected: "[SCRIPT_BALANCE][TMP]",
};

const infuraErrorInStorageKovan: IValidationError = {
  name: "Infura Error In Storage Kovan",
  json: {
    code: -32015,
    response:
      '{"jsonrpc":"2.0","id":3,"error":{"code":-32015,"data":"Reverted 0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001e5b52455045544954494f4e535f434f4e444954494f4e5d5b46494e414c5d0000","message":"VM execution error."}}',
  },
  expected: "[REPETITIONS_CONDITION][FINAL]",
};

describe("Validation Error Parser", () => {
  itParam(
    "parses all known errors: '${value.name}'",
    [metamaskDefaultKovanProvider, infuraErrorInStorageKovan],
    async (error: IValidationError) => {
      const result = parseValidationError(error.json);
      expect(result).to.be.equal(error.expected);
    }
  );

  it("Returns 'unknown' for anything that cannot be parsed", async () => {
      const result = parseValidationError({something: 'else'});
      expect(result).to.be.equal('Unknown');
    }
  );
});
