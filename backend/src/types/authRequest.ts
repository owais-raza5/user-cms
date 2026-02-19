import { Request } from 'express'

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER'

export interface AuthPayload {
  id: number
  role: UserRole
}

export interface AuthRequest extends Request {
  user?: AuthPayload
}
