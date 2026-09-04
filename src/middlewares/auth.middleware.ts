import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { firebaseAdmin } from "../config/firebase";
import { AppDataSource } from "../config/data-source";
import { User, UserRole } from "../entities/User";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firebaseUid: string;
  };
}

export const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticación no provisto." });
  }

  const token = authHeader.split(" ")[1];
  try {
    let firebaseUid = "";
    let email = "";

    try {
      const decodedFirebase = await firebaseAdmin.auth().verifyIdToken(token);
      firebaseUid = decodedFirebase.uid;
      email = decodedFirebase.email || `${firebaseUid}@firebase.com`;
    } catch (firebaseErr) {
      // 2. Fallback de desarrollo para Tokens firmados localmente
      try {
        const decodedLocal = jwt.decode(token) as any;
        if (decodedLocal && (decodedLocal.uid || decodedLocal.user_id || decodedLocal.sub || decodedLocal.id)) {
          firebaseUid = decodedLocal.uid || decodedLocal.user_id || decodedLocal.sub || decodedLocal.id;
          email = decodedLocal.email || `${firebaseUid}@ecommerce.com`;
        } else {
          firebaseUid = token;
        }
      } catch {
        firebaseUid = token;
      }
    }

    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { firebaseUid } });

    if (!user) {
   
      user = userRepo.create({
        firebaseUid,
        email: email || `${firebaseUid}@ecommerce.com`,
        name: email ? email.split("@")[0] : "Usuario Firebase",
        role: "CLIENTE"
      });
      await userRepo.save(user);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firebaseUid: user.firebaseUid
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido o expirado." });
  }
};

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acceso denegado: Permisos insuficientes para esta operación." });
    }
    next();
  };
};
