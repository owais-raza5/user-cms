import { Request, Response } from "express";
import User from "../models/User";
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/functions";
import { AuthRequest, UserRole } from "../types/authRequest";
import { sendPasswordResetEmail } from "../utils/email";
import crypto from "crypto";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        res
          .status(409)
          .json({ success: false, message: "Username already taken" });
        return;
      }
    }

    const hashed = await hashPassword(password);

    const user = await User.create({
      email,
      password: hashed,
      role: "USER",
      username: username || null,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user.toSafeJSON(),
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const payload = { id: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await user.update({ refreshToken });

    res.json({
      success: true,
      message: "Login successful",
      data: { accessToken, refreshToken, user: user.toSafeJSON() },
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
      return;
    }

    let payload: { id: number; role: UserRole };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
      return;
    }

    const user = await User.findOne({
      where: { id: payload.id, refreshToken },
    });
    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Refresh token not recognised" });
      return;
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });

    res.json({
      success: true,
      message: "Token refreshed",
      data: { accessToken },
    });
  } catch (err) {
    console.error("[refresh]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (req.user) {
      await User.update({ refreshToken: null }, { where: { id: req.user.id } });
    }
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("[logout]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function profile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({
      success: true,
      message: "Profile fetched",
      data: user.toSafeJSON(),
    });
  } catch (err) {
    console.error("[profile]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      res.json({ success: true, message: "If that email exists, a reset link was sent" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({ resetToken: token, resetTokenExpiry: expiry });
    await sendPasswordResetEmail(email, token);

    res.json({ success: true, message: "If that email exists, a reset link was sent" });
  } catch (err) {
    console.error("[forgotPassword]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ success: false, message: "Token and password are required" });
      return;
    }

    const user = await User.findOne({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      res.status(400).json({ success: false, message: "Invalid or expired reset token" });
      return;
    }

    const hashed = await hashPassword(password);

    await user.update({
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("[resetPassword]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
