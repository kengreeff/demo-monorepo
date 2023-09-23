'use client'

/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from '@trpc/next'
import type { HTTPHeaders } from '@trpc/react-query'

import { transformer } from '@my/api/transformer'

import { getToken } from "app/hooks/useSession.web";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@my/api/index";

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3001}` // dev SSR should use localhost
}

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer,
      links: [
        loggerLink({
          enabled: opts => process.env.NODE_ENV === 'development'
            || (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          async headers() {
            const authToken = await getToken()
            return { Authorization: `Bearer ${authToken}` } as HTTPHeaders
          },
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      },
    }
  },
  ssr: false,
})

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
