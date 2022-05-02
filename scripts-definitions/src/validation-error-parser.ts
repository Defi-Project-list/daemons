import { ethers } from "ethers";

/**
 * Parsing the validation error is trickier than it seems as
 * there isn't a unique standard to return the text and it depends
 * by which provider the user is using.
 *
 * This function tries to find a unique way to do it.
 *
 * @param error the error raised by the Validate or Execute functions
 * @returns a string containing the parsed error
 */
export function parseValidationError(error: any): string {
  try {
    // this will likely work on kovan with the default Metamask Provider
    if (error.data) return parseErrorDataText(error.data);
  } catch (error) {}

  try {
    // this should work with Infura
    if (error.response)
      if (
        typeof error.response === "string" ||
        error.response instanceof String
      ) {
        const parsedResponse = JSON.parse(error.response);
        return parseErrorDataText(parsedResponse.error.data);
      }
  } catch (error) {}

  // we can extract the verification failure reason
  console.error("-----------");
  console.error(
    "Could not parse RPC validation error. Please send this to Daemons so we can add your provider"
  );
  console.error("");
  console.error(JSON.stringify(error));
  console.error("");
  console.error(
    "Include the chain you are on and the RPC url/provider you are using"
  );
  console.error("-----------");

  return "Unknown";
}

function parseErrorDataText(errorText: string): string {
  const hex = "0x" + errorText.substring(147);
  const withoutTrailing0s = hex.replace(/0*$/g, "");
  return ethers.utils.toUtf8String(withoutTrailing0s);
}
