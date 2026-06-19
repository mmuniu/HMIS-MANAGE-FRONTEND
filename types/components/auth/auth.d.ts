type RegisterUser = {
    username: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

type User = {
  id?: number
  username: string
  email: string
  name?: string
  roles?: string[]
  permissions?: string[]
}

type Role = {
  name: string
}

export type { RegisterUser, User, Role }