import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { UserRole } from "../types/authRequest";

export interface UserAttributes {
  id: number;
  email: string;
  password: string;
  role: UserRole;
  username: string | null;
  refreshToken: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  "id" | "username" | "refreshToken" | "createdAt" | "updatedAt"
>;

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare username: string | null;
  declare refreshToken: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toSafeJSON(): Omit<UserAttributes, "password" | "refreshToken"> {
    const { password, refreshToken, ...safe } = this.toJSON() as UserAttributes;
    return safe;
  }
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("SUPER_ADMIN", "ADMIN", "USER"),
        defaultValue: "USER",
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
      timestamps: true,
    },
  );

  return User;
}

export default User;
