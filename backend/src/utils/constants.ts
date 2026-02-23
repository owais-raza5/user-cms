import { SignOptions } from "jsonwebtoken";

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);
export const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
export const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
export const ACCESS_EXPIRES = (process.env.JWT_ACCESS_EXPIRES_IN ||
  "15m") as SignOptions["expiresIn"];
export const REFRESH_EXPIRES = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];
