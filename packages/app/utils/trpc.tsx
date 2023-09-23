import { HTTPHeaders, createTRPCReact } from '@trpc/react-query'

import type { AppRouter } from "@my/api/index";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
import Constants from 'expo-constants'

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
import React, { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink } from '@trpc/client'

import { transformer } from '@my/api/transformer'

import { kindeClient } from 'app/utils/kindeClient'

/**
 * A set of typesafe hooks for consuming your API.
 */
export const trpc = createTRPCReact<AppRouter>()

const getBaseUrl = () => {
  /**
   * If you're running in production, you'll need to set the productionApiUrl as an
   * extra field in your expo app.config.ts or app.json. This is because localhost
   * will not be available in production.
   */
  if (!__DEV__) {
    const productionApiUrl = Constants.expoConfig?.extra?.productionApiUrl as string;
    
    if (!productionApiUrl){
      throw new Error(
        "failed to get productionApiUrl, missing in extra section of app.config.ts",
      );
    }

    return productionApiUrl;
  }

  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3001 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   */
  const localhost = Constants.expoConfig?.debuggerHost?.split(':')[0]

  if (!localhost) throw new Error('failed to get localhost, configure it manually')
  return `http://${localhost}:3001`
}

type TRPCProviderProps = {
  children: React.ReactNode
}

export const TRPCProvider: React.FC<TRPCProviderProps> = ({ children }) => {
  const authTokenRef = useRef<string>('')

  useEffect(() => {
    async function getAuthToken() {
      const { access_token } = await kindeClient.getToken()
      authTokenRef.current = access_token
    }

    getAuthToken()
  }, [])
  
  // Query Client
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  }))
  
  // TRPC Client
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      transformer,
      links: [
        httpBatchLink({
          async headers() {
            return {
              Authorization: `Bearer ${authTokenRef.current}`
            } as HTTPHeaders
          },
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}