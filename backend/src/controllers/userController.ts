import { Response } from "express";
import { Op } from "sequelize";
import User, { UserAttributes } from "../models/User";
import { hashPassword } from "../utils/functions";
import { AuthRequest, UserRole } from "../types/authRequest";
import { ROLES } from "../utils/constants";

type WhereClause = Record<string | symbol, unknown>;


export async function listUsers(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    const offset = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const role = (req.query.role as string)?.trim() || "";

    const where: WhereClause = {};

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (role && (Object.values(ROLES) as string[]).includes(role)) {
      where.role = role;
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password", "refreshToken"] },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      message: "Users fetched",
      data: {
        users: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("[listUsers]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


export async function createUser(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { email, password, role, username } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
      return;
    }

    const requestedRole: UserRole = role || "USER";

    if (
      (requestedRole === "ADMIN" || requestedRole === ROLES.SUPER_ADMIN) &&
      req.user?.role !== ROLES.SUPER_ADMIN
    ) {
      res.status(403).json({
        success: false,
        message: "Only SUPER ADMIN can create admin accounts",
      });
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
      role: requestedRole,
      username: username || null,
    });

    res.status(201).json({
      success: true,
      message: "User created",
      data: user.toSafeJSON(),
    });
  } catch (err) {
    console.error("[createUser]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


export async function updateUser(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { username, role, password } = req.body;
    console.log("req body ==>", req.body);

      const isRoleChange = role !== undefined && role !== user.role;
      if (isRoleChange && req.user?.role !== ROLES.SUPER_ADMIN) {
        res
          .status(403)
          .json({
            success: false,
            message: "Only SUPER ADMIN can change roles",
          });
        return;
      }

    const updateData: Partial<UserAttributes> = {};
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role as UserRole;
    if (password) updateData.password = await hashPassword(password);

    await user.update(updateData);

    res.json({
      success: true,
      message: "User updated",
      data: user.toSafeJSON(),
    });
  } catch (err) {
    console.error("[updateUser]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


export async function deleteUser(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    if (id === req.user?.id) {
      res
        .status(400)
        .json({ success: false, message: "Cannot delete your own account" });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    await user.destroy();

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("[deleteUser]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


export async function getUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password", "refreshToken"] },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, message: "User fetched", data: user });
  } catch (err) {
    console.error("[getUser]", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
