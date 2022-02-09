const cachedAbis: { [fileName: string]: object; } = {};

/**
 * Gets the ABI object for the specified contract.
 * NOTE: ABIs are cached
 */
export async function getAbiFor(contract: string): Promise<object> {
    if (!cachedAbis[contract]) {
        var jsonFile = `/ABI/${contract}.json`;
        var json = await (await fetch(jsonFile)).json();

        var abi = json.abi ?? json;
        cachedAbis[contract] = abi;
    }

    return cachedAbis[contract];
}
