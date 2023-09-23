import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";

// import { trpc } from "app/utils/trpc";

export const getToken = async () => {
  let authToken = ''

  try {
    const tokenResult = await fetch('/api/auth/get_token')
    const tokenJson = await tokenResult.json()
    
    if (tokenJson?.access_token) {
      authToken = tokenJson.access_token
    }    
  } catch (error) {
    console.log({ error })
  }

  return authToken
}

type UseSessionOptions = {
  includeUser?: boolean,
}

function useSession(options: UseSessionOptions){
  const { includeUser = false } = options || {}

  const kindeAuthPayload = useKindeAuth()
  const {
    getToken,
    isAuthenticated,
    isLoading,
    user: kindeUser,
  } = kindeAuthPayload

  // const userQuery = trpc.users.findOrCreateUserForProviderById.useQuery(
  //   {
  //     provider: 'kinde',
  //     providerAccountId: kindeUser?.id,
  //   },
  //   { enabled: !!kindeUser?.id && includeUser },
  // )
  // const { data: user } = userQuery

  return {
    getToken,
    isAuthenticated,
    isLoading,
    login: async () => {
      window.location.href = '/api/auth/login'
    },
    logout: async () => {
      window.location.href = '/api/auth/logout'
    },
    kindeUser,
    user: {},
  }
}

export default useSession
