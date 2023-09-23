import { createNextApiHandler } from "@trpc/server/adapters/next";

import { appRouter } from "@my/api/index";
import { createTRPCContext } from "@my/api/src/context";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
});
