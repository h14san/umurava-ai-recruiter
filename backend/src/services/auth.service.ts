import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model";
import { HttpError } from "../middleware/error.middleware";
import { BCRYPT_ROUNDS, JWT_EXPIRES_IN } from "../constants";
import type { AuthTokenPayload } from "../types";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: AuthTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new HttpError(500, "Server misconfigured (JWT_SECRET missing).");
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN });
}

export async function login(email: string, password: string) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) throw new HttpError(401, "Invalid email or password.");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid email or password.");
  const token = signToken({ userId: user._id.toString(), email: user.email });
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
