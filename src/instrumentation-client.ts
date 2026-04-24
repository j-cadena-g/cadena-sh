// Next.js picks up `src/instrumentation-client.ts` as a global client-side
// bootstrap. This file runs once per browser session and registers which
// endpoints Vercel BotID should protect with its passive challenge.
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/contact",
      method: "POST",
    },
  ],
});
