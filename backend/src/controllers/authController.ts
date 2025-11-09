import { Request, Response } from "express";
import { loginUser, registerUser } from "../service/authService";

class AuthController {
  async registration(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const user = await registerUser(username, password);
      res.status(201).json({ userId: user.id, username: user.username });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const { token, user } = await loginUser(username, password);
      res.json({ token, user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}

export default new AuthController();
