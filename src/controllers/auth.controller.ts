import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { firebaseAdmin } from "../config/firebase";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { RefreshToken } from "../entities/RefreshToken";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class AuthController {
    public static async registerUser(req: Request, res: Response) {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email y password son requeridos." });
      }

      const assignedRole = role || "CLIENTE";
      const userName = name || email.split("@")[0];

      let firebaseUid = "";

      try {
        const fbUser = await firebaseAdmin.auth().createUser({
          email,
          password,
          displayName: userName
        });
        firebaseUid = fbUser.uid;
      } catch (fbErr: any) {
        if (fbErr.code === "auth/email-already-exists") {
          const existingFb = await firebaseAdmin.auth().getUserByEmail(email);
          firebaseUid = existingFb.uid;
        } else {
          firebaseUid = `uid-${Date.now()}`;
        }
      }

      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({ where: { email } });

      if (!user) {
        user = userRepo.create({
          firebaseUid,
          email,
          name: userName,
          role: assignedRole as any
        });
        await userRepo.save(user);
      } else {
        user.firebaseUid = firebaseUid;
        user.name = userName;
        user.role = assignedRole as any;
        await userRepo.save(user);
      }

      const accessSecret = process.env.JWT_SECRET || "secreto_desarrollo_ecommerce_123";
      const refreshSecret = process.env.JWT_REFRESH_SECRET || "secreto_refresco_ecommerce_456";
      const accessExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
      const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

      const payload = { id: user.id, uid: user.firebaseUid, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn as any });
      const refreshTokenValue = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: refreshExpiresIn as any });

      const refreshRepo = AppDataSource.getRepository(RefreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await refreshRepo.save(refreshRepo.create({
        userId: user.id,
        token: refreshTokenValue,
        expiresAt,
        isRevoked: false
      }));

      return res.status(201).json({
        message: "Usuario registrado y sincronizado exitosamente en Firebase y MySQL.",
        user: { id: user.id, firebaseUid: user.firebaseUid, email: user.email, name: user.name, role: user.role },
        accessToken,
        accessTokenBearer: `Bearer ${accessToken}`,
        refreshToken: refreshTokenValue
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

    public static async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ message: "El correo electrónico es requerido." });
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado con el correo especificado." });
      }

      const accessSecret = process.env.JWT_SECRET || "secreto_desarrollo_ecommerce_123";
      const refreshSecret = process.env.JWT_REFRESH_SECRET || "secreto_refresco_ecommerce_456";
      const accessExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
      const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

      const payload = { id: user.id, uid: user.firebaseUid, email: user.email, role: user.role };
      const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn as any });
      const refreshTokenValue = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: refreshExpiresIn as any });

      const refreshRepo = AppDataSource.getRepository(RefreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await refreshRepo.save(refreshRepo.create({
        userId: user.id,
        token: refreshTokenValue,
        expiresAt,
        isRevoked: false
      }));

      return res.json({
        message: "Inicio de sesión exitoso.",
        user: { id: user.id, firebaseUid: user.firebaseUid, email: user.email, name: user.name, role: user.role },
        accessToken,
        accessTokenBearer: `Bearer ${accessToken}`,
        refreshToken: refreshTokenValue,
        expiresIn: accessExpiresIn
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

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
      const accessSecret = process.env.JWT_SECRET || "secreto_desarrollo_ecommerce_123";
      const refreshSecret = process.env.JWT_REFRESH_SECRET || "secreto_refresco_ecommerce_456";
      
      const uid = firebaseUid || (role === "SUPERADMIN" ? "superadmin-uid-100" : role === "VENDEDOR" ? "vendor1-uid-200" : "client1-uid-400");
      const userEmail = email || `${uid}@ecommerce.com`;
      const userRole = role || "CLIENTE";

      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({ where: { firebaseUid: uid } });
      if (!user) {
        user = await userRepo.save(userRepo.create({
          firebaseUid: uid,
          email: userEmail,
          name: `Usuario ${userRole}`,
          role: userRole as any
        }));
      }

      const payload = { id: user.id, uid: user.firebaseUid, email: user.email, role: user.role };

      const accessExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
      const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExpiresIn as any });

      const refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
      const refreshTokenValue = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: refreshExpiresIn as any });

      const refreshRepo = AppDataSource.getRepository(RefreshToken);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const refreshEntity = refreshRepo.create({
        userId: user.id,
        token: refreshTokenValue,
        expiresAt,
        isRevoked: false
      });
      await refreshRepo.save(refreshEntity);

      return res.json({
        message: "Tokens de autenticación (AccessToken + RefreshToken) generados con éxito.",
        user: { id: user.id, email: user.email, role: user.role },
        accessToken,
        accessTokenBearer: `Bearer ${accessToken}`,
        refreshToken: refreshTokenValue,
        expiresIn: accessExpiresIn
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async refreshAccessToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ message: "RefreshToken es requerido en el body." });
      }

      const refreshSecret = process.env.JWT_REFRESH_SECRET || "secreto_refresco_ecommerce_456";
      const accessSecret = process.env.JWT_SECRET || "secreto_desarrollo_ecommerce_123";

      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, refreshSecret);
      } catch {
        return res.status(403).json({ message: "RefreshToken inválido o expirado." });
      }

      const refreshRepo = AppDataSource.getRepository(RefreshToken);
      const tokenInDb = await refreshRepo.findOne({ where: { token: refreshToken, isRevoked: false } });

      if (!tokenInDb || tokenInDb.expiresAt < new Date()) {
        return res.status(403).json({ message: "RefreshToken revocado o expirado en la base de datos." });
      }

      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOne({ where: { id: decoded.id } });

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const accessExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
      const newAccessToken = jwt.sign(
        { id: user.id, uid: user.firebaseUid, email: user.email, role: user.role },
        accessSecret,
        { expiresIn: accessExpiresIn as any }
      );

      return res.json({
        message: "AccessToken renovado exitosamente.",
        accessToken: newAccessToken,
        accessTokenBearer: `Bearer ${newAccessToken}`,
        expiresIn: accessExpiresIn
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  public static async revokeRefreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const refreshRepo = AppDataSource.getRepository(RefreshToken);
      const tokenInDb = await refreshRepo.findOne({ where: { token: refreshToken } });

      if (tokenInDb) {
        tokenInDb.isRevoked = true;
        await refreshRepo.save(tokenInDb);
      }

      return res.json({ message: "RefreshToken revocado exitosamente (Logout completado)." });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }
}
