import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRES_IN,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../config/env";

export class TokenService {
  static generateAccessToken = (payload: { userId: string }) => {
    if (!JWT_ACCESS_SECRET) {
      throw new Error("JWT_ACCESS_SECRET is not defined");
    }

    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  };

  static generateRefreshToken = (payload: { userId: string }) => {
    if (!JWT_REFRESH_SECRET) {
      throw new Error("JWT_REFRESH_TOKEN is not defined");
    }

    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  };

  static saveRefreshToken = async (userId: string, token: string) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return await prisma?.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  };

  static verifyRefreshToken = async (token: string) => {
    try {
      if (!JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_TOKEN");
      }

      const decode = jwt.verify(token, JWT_REFRESH_SECRET) as {
        userId: string;
      };

      const storedToken = await prisma?.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!storedToken) {
        throw new Error("Refresh token not found in database");
      }

      if (decode.userId !== storedToken.userId) {
        await prisma?.refreshToken.delete({ where: { token } });
        throw new Error("Refresh token expired");
      }

      return storedToken;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        await prisma?.refreshToken.deleteMany({ where: { token } });
        throw new Error("Refresh token expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid refresh token signature");
      }

      throw new Error("Invalid refresh token");
    }
  };

  static revokeRefreshToken = async (token: string) => {
    return await prisma?.refreshToken.deleteMany({ where: { token } });
  };

  static revokeAllUserToken = async (userId: string) => {
    return await prisma?.refreshToken.deleteMany({ where: { userId } });
  };
}
