import faker from "@faker-js/faker";

export const randomScriptType = () =>
    faker.helpers.arrayElement(["Swap", "Transfer", "MmBase", "MmAdvanced", "Pass"]);

export const randomChainId = () => faker.helpers.arrayElement(["1", "42", "4002", "80001"]);
