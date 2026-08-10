export interface AuthUser {
  id: number
  name: string
  slug: string
}

export interface LoginResponse {
  token: string
  user_email: string
  user_nicename: string
  user_display_name: string
}

const AUTH_URL = '/api/wp-json/jwt-auth/v1/token'
const CURRENT_USER_URL = '/api/wp-json/wp/v2/users/me'

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ username, password }),
  })

  if (!response.ok) {
    throw new Error('No se ha podido iniciar sesión')
  }

  return response.json()
}

export async function getCurrentUser(
  token: string,
): Promise<AuthUser> {
  const response = await fetch(CURRENT_USER_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('No se ha podido verificar la sesión')
  }

  return response.json()
}

export function logout() {
  sessionStorage.removeItem('reactafy.authToken')
}
