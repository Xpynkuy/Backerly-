import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { TokenService } from "./tokenService";

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const registerUser = async (username: string, password: string) => {
  const uniqueUser = await prisma.user.findUnique({ where: { username } });

  if (uniqueUser) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await hashPassword(password);

  try {
  } catch (error: any) {
    if (error?.code === "P2002") throw new Error("Username already exists");
    throw error;
  }

  return prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
};

export const loginUser = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = TokenService.generateAccessToken({ userId: user.id });
  const refreshToken = TokenService.generateRefreshToken({ userId: user.id });

  await TokenService.saveRefreshToken(user.id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
    },
  };
};

export const refreshTokens = async (refreshToken: string) => {
  const storedToken = await TokenService.verifyRefreshToken(refreshToken);

  const newAccessToken = TokenService.generateAccessToken({
    userId: storedToken.userId,
  });
  const newRefreshToken = TokenService.generateRefreshToken({
    userId: storedToken.userId,
  });

  await TokenService.revokeRefreshToken(refreshToken);
  await TokenService.saveRefreshToken(storedToken.userId, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (refreshToken: string) => {
  await TokenService.revokeRefreshToken(refreshToken);
};
