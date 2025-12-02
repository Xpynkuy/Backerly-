import { Request, Response } from "express";
import {
  loginUser,
  logout,
  refreshTokens,
  registerUser,
} from "../service/authService";


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
        password
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
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

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
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

      res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
      });

      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AuthController();
