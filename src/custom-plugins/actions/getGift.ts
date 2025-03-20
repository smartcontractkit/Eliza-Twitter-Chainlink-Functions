/**
 * @fileoverview This file contains the implementation of the GetGiftAction class and the getGiftAction handler.
 * It interacts with a smart contract on the Avalanche Fuji testnet to send a gift request.
 */

import { formatEther, parseEther, getContract } from "viem";
import {
    Action,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";
import type { GetGiftParams, Transaction } from "../types/index.ts";
import { getGiftTemplate } from "../templates/index.ts";
import getGiftJson from "../artifacts/GetGift.json" with { type: "json" };

/**
 * Class representing the GetGiftAction.
 */
export class GetGiftAction {
    /**
     * Creates an instance of GetGiftAction.
     * @param {WalletProvider} walletProvider - The wallet provider instance.
     */
    constructor(private walletProvider: WalletProvider) {}

    /**
     * Sends a gift request to the smart contract.
     * @param {GetGiftParams} params - The parameters for the gift request.
     * @returns {Promise<Transaction>} The transaction details.
     * @throws Will throw an error if contract address, slot ID, version, or subscription ID is not set.
     */
    async getGift(params: GetGiftParams): Promise<Transaction> {
        const chainName = "avalancheFuji";
        const contractAddress: `0x${string}` =  "0x00" // dev TODO
        const donHostedSecretsSlotID:number = Infinity // dev TODO
        const donHostedSecretsVersion:number = Infinity // dev TODO
        const clSubId:number = Infinity // dev TODO

        if (contractAddress === "0x00" || donHostedSecretsSlotID === Infinity || donHostedSecretsVersion === Infinity || clSubId === Infinity) {
            throw new Error("Contract address, slot ID, version, or subscription ID is not set");
        }

        console.log(
            `Get gift with Id: ${params.code} and address (${params.address})`
        );

        this.walletProvider.switchChain(chainName);

        const walletClient = this.walletProvider.getWalletClient(
            chainName
        );

        try {
            const { abi } = getGiftJson["contracts"]["GetGift.sol:GetGift"]
            const getGiftContract = getContract({
                address: contractAddress,
                abi,
                client: walletClient
            })

            const args: string[] = [params.code];
            const userAddr = params.address;

            const hash = await getGiftContract.write.sendRequest([
                donHostedSecretsSlotID,
                donHostedSecretsVersion,
                args,
                clSubId,
                userAddr
            ])

            return {
                hash,
                from: walletClient.account!.address,
                to: contractAddress,
                value: parseEther("0"),
                data: "0x",
            };
        } catch (error) {
            if(error instanceof Error) {
                throw new Error(`Function call failed: ${error.message}`);
            } else {
                throw new Error(`Function call failed: unknown error`);
            }
        }
    }
}

/**
 * Builds the function call details required for the getGift action.
 * @param {State} state - The current state.
 * @param {IAgentRuntime} runtime - The agent runtime.
 * @param {WalletProvider} wp - The wallet provider.
 * @returns {Promise<GetGiftParams>} The parameters for the gift request.
 */
const buildFunctionCallDetails = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<GetGiftParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: getGiftTemplate,
    });

    const functionCallDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as GetGiftParams;

    return functionCallDetails;
};

/**
 * The getGiftAction handler.
 * @type {Action}
 */
export const getGiftAction: Action = {
    name: "get gift",
    description: "Given a wallet address and gift code, extract that data and call a function on the Functions Consumer Smart Contract and send request",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options?: any,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Get gift action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new GetGiftAction(walletProvider);

        // Compose functionCall context
        const giftParams:GetGiftParams = await buildFunctionCallDetails(
            state,
            runtime,
            walletProvider
        );


        try {
            const callFunctionResp = await action.getGift(giftParams);
            if (callback) {
                callback({
                    text: `Successfully called function with params of gift code: ${giftParams.code} and address: ${giftParams.address}\nTransaction Hash: ${callFunctionResp.hash}`,
                    content: {
                        success: true,
                        hash: callFunctionResp.hash,
                        amount: formatEther(callFunctionResp.value),
                        recipient: callFunctionResp.to,
                        chain: "avalanchefuji",
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during get gift call:", error);
            if(error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error get gift calling: ${error.message}`,
                        content: { error: error.message },
                    });
                }
            } else {
                console.error("unknow error")
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you call function on contract",
                    action: "GET_GIFT",
                },
            },
            {
                user: "user",
                content: {
                    text: "Give me the gift to address 0x1234567890123456789012345678901234567890, ID for gift is 1010",
                    action: "GET_GIFT",
                },
            },
            {
                user: "user",
                content: {
                    text: "Can I get the gift to address 0x1234567890123456789012345678901234567890, my gift ID is 898770",
                    action: "GET_GIFT",
                },
            },
        ],
    ],
    similes: ["GET_GIFT", "GIFT_GIVE", "SEND_GIFT"],
};
