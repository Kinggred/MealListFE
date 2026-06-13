export interface User {
  id: string
  username: string
  email: string
}

export interface UserCreate {
  username?: string | null
  email: string
  password: string
}
