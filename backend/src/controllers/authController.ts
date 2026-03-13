import { Request, Response } from "express";
import {
  getUserProfile,
  loginUser,
  logout,
  refreshTokens,
  registerUser,
} from "../service/authService";
import { getAuthUserId } from "../utils/getAuthUserId";

class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Username and password are required" });
      }
      const user = await registerUser(username, password);
      res.status(201).json({ userId: user.id, username: user.username });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json("Username and password are required");
      }

      const { accessToken, refreshToken, user } = await loginUser(
        username,
        password,
      );
      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken, user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ error: "Refresh token required" });
      }

      const tokens = await refreshTokens(refreshToken);

      const isProduction = process.env.NODE_ENV === "production";

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.cookies;

      if (refreshToken) {
        await logout(refreshToken);
      }
      const isProduction = process.env.NODE_ENV === "production";

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "strict",
      });

      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async me(req: Request, res: Response) {
    try {
      const userId = getAuthUserId(req);

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await getUserProfile(userId);

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      return res.json(user);
    } catch (e: any) {
      return res.status(500).json({
        error: "Server error",
      });
    }
  }
}

export default new AuthController();
