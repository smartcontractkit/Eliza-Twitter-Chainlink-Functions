export * from "./providers/wallet.ts";
export * from "./types/index.ts";

import type { Plugin } from "@elizaos/core";
import { evmWalletProvider } from "./providers/wallet.ts";
import { getGiftAction } from "./actions/getGift.ts";

export const getGiftPlugin: Plugin = {
    name: "getGift",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [getGiftAction],
};

export default getGiftPlugin;
