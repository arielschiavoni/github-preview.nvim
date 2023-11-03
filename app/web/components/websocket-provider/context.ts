import { createContext } from "react";
import { type GithubPreview } from "../../../github-preview.ts";
import { type WsBrowserMessage, type WsServerMessage } from "../../../types.ts";

export type MessageHandler = (message: WsServerMessage) => void | Promise<void>;

export const websocketContext = createContext<{
    isConnected: boolean;
    registerHandler: (id: string, cb: MessageHandler) => void;
    currentPath: string | undefined;
    repoName: string;
    wsRequest: (m: WsBrowserMessage) => void;
    config: GithubPreview["config"] | undefined;
}>({
    isConnected: false,
    registerHandler: () => null,
    currentPath: undefined,
    repoName: "",
    wsRequest: () => null,
    config: undefined,
});
