import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";

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
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1d" });
  return { token, user: { id: user.id, username: user.username } };
};
