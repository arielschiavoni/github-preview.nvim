import { type Server } from "bun";
import { renderToReadableStream } from "react-dom/server";
import { ENV } from "../env.ts";
import { GP_STATIC_PREFIX, Index } from "../web/index.tsx";
import { GP_LOCALIMAGE_PREFIX } from "../web/markdown/index.tsx";

const webRoot = import.meta.dir + "/../web/";

const host = "localhost";

export function httpHandler(port: number, root: string) {
    return async (req: Request, server: Server) => {
        const upgradedToWs = server.upgrade(req, {
            data: {}, // this data is available in socket.data
            headers: {},
        });
        if (upgradedToWs) {
            // If client (browser) requested to upgrade connection to websocket
            // and we successfully upgraded request
            return;
        }

        const { pathname } = new URL(req.url);

        // files included in base html (js,css) are prefixed with GP_STATIC_PREFIX
        if (pathname.startsWith(GP_STATIC_PREFIX)) {
            const requested = pathname.slice(GP_STATIC_PREFIX.length);

            // hydrate.js hydrates the server components generated and sent below
            // hydrate.js is built from typescript files on request
            if (requested === "hydrate.js") {
                const { outputs } = await Bun.build({
                    entrypoints: [webRoot + "hydrate.tsx"],
                    define: {
                        __GP_HOST__: JSON.stringify(host),
                        __GP_PORT__: JSON.stringify(port),
                        __DEV__: JSON.stringify(Boolean(ENV.GP_LOG_LEVEL)),
                    },
                });

                return new Response(outputs[0]);
            }

            const file = Bun.file(webRoot + requested);
            return new Response(file);
        }

        // images referenced in html or markdown that point to the currently
        // previewed repo, are prefixed with GP_LOCALIMAGE_PREFIX
        if (pathname.startsWith(GP_LOCALIMAGE_PREFIX)) {
            const requested = pathname.slice(GP_LOCALIMAGE_PREFIX.length);
            const file = Bun.file(root + requested);
            return new Response(file);
        }

        // If none of the previous cases matches the request, the client (browser) is
        // probably making its first request to get the server rendered react app
        const stream = await renderToReadableStream(<Index />, {
            bootstrapModules: [`${GP_STATIC_PREFIX}hydrate.js`],
        });

        return new Response(stream);
    };
}