import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AuthController {
  public static async syncUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, role } = req.body;
      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({ where: { firebaseUid: req.user!.firebaseUid } });

      if (!user) {
        user = userRepo.create({
          firebaseUid: req.user!.firebaseUid,
          email: req.user!.email,
          name: name || "Usuario Registrado",
          role: role || "CLIENTE"
        });
        await userRepo.save(user);
      } else if (name) {
        user.name = name;
        if (role) user.role = role;
        await userRepo.save(user);
      }

      return res.json({ message: "Usuario sincronizado exitosamente.", user });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: req.user!.id } });
      return res.json(user);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async generateDevToken(req: Request, res: Response) {
    try {
      const { email, role, firebaseUid } = req.body;
      const secret = process.env.JWT_SECRET || "secreto_desarrollo_ecommerce_123";
      const uid = firebaseUid || (role === "SUPERADMIN" ? "superadmin-uid-100" : role === "VENDEDOR" ? "vendor1-uid-200" : "client1-uid-400");
      
      const payload = {
        uid,
        email: email || `${uid}@ecommerce.com`,
        role: role || "CLIENTE"
      };

      const token = jwt.sign(payload, secret, { expiresIn: "7d" });

      return res.json({
        message: "Token JWT generado con éxito para pruebas.",
        role: payload.role,
        uid: payload.uid,
        token,
        bearerFormat: `Bearer ${token}`
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
