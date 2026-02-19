import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthPayload } from "../types/authRequest";
import {
  ACCESS_EXPIRES,
  ACCESS_SECRET,
  REFRESH_EXPIRES,
  REFRESH_SECRET,
  ROUNDS,
} from "./constants";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function comparePassword(
  plain: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function generateRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, ACCESS_SECRET) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, REFRESH_SECRET) as AuthPayload;
}
