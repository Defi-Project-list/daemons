import { Dispatch } from "redux";
import { ActionType } from "../action-types";
import { UniswapV2RouterABI } from "@daemons-fi/contracts";
import { BigNumber, Contract, utils } from "ethers";
import { GetCurrentChain, IsChainSupported } from "../../data/chain-info";
import { PriceAction } from "../actions/price-actions";
import { bigNumberToFloat } from "@daemons-fi/contracts";

const getDEXRouterContract = async (chainId: string): Promise<Contract> => {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);

    if (!IsChainSupported(chainId)) throw new Error(`Chain ${chainId} is not supported!`);
    const contractAddress = GetCurrentChain(chainId).contracts.IUniswapV2Router01;

    return new ethers.Contract(contractAddress, UniswapV2RouterABI, provider);
};

export const fetchDAEMPriceInEth = (chainId?: string) => {
    return async (dispatch: Dispatch<PriceAction>) => {
        if (!chainId) {
            console.log("ChainId missing, retrieving DAEM price aborted");
            dispatch({
                type: ActionType.FETCH_DAEM_ETH_PRICE,
                price: undefined
            });
            return;
        }

        console.log("Retrieving DAEM price in ETH", chainId);
        const router = await getDEXRouterContract(chainId);
        const weth = await router.WETH();
        const path = [GetCurrentChain(chainId).contracts.DaemonsToken, weth];

        // Get amount of ETH for 1 DAEM
        const rawPrice: BigNumber = (await router.getAmountsOut(utils.parseEther("1"), path))[1];
        const price = bigNumberToFloat(rawPrice);

        dispatch({
            type: ActionType.FETCH_DAEM_ETH_PRICE,
            price
        });
    };
};
