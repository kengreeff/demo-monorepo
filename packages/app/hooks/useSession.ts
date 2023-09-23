import { useEffect, useState } from 'react'

// import { trpc } from 'app/utils/trpc'
import { kindeClient } from 'app/utils/kindeClient'

type User = {
  email: string, 
  family_name: string, 
  given_name: string, 
  id: string, 
  picture: string,
}

type DefaultState = {
  isAuthenticated: boolean,
  isLoading: boolean,
  kindeUser?: User,
}

const defaultState: DefaultState = {
  isAuthenticated: false,
  isLoading: true,
  kindeUser: undefined
}

type CheckIsAuthenticatedParams = {
  setState: (state: any) => void,
}

async function checkIsAuthenticated(params: CheckIsAuthenticatedParams) {
  const { setState } = params

  const isAuthenticated = await kindeClient.isAuthenticated
  const userDetails = await kindeClient.getUserDetails()

  setState((prevState) => {
    return {
      ...prevState,
      isAuthenticated,
      isLoading: false,
      kindeUser: userDetails,
    }
  })
}

type UseSessionOptions = {
  includeUser?: boolean,
}

function useSession(options: UseSessionOptions){
  const { includeUser = false } = options || {}

  const [state, setState] = useState(defaultState)
  const { isAuthenticated, isLoading, kindeUser } = state

  useEffect(() => {
    checkIsAuthenticated({ setState })
  }, [])

//   const userQuery = trpc.users.findOrCreateUserForProviderById.useQuery(
//     {
//       provider: 'kinde',
//       providerAccountId: kindeUser?.id || 'undefined',
//     },
//     { enabled: !!kindeUser?.id && includeUser },
//   )
//   const { data: user } = userQuery

  return {
    getToken: () => kindeClient.getToken(),
    isAuthenticated,
    isLoading,
    kindeUser,
    login: async () => {
      await kindeClient.login()
      await checkIsAuthenticated({ setState })
    },
    logout: async () => {
      await kindeClient.logout()
      await checkIsAuthenticated({ setState })
    },
    user: {},
  }
}

export default useSession
