import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
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
    // Para desarrollo, soporta simulación JWT de prueba o Firebase Token
    let firebaseUid = "";
    let email = "";

    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && (decoded.uid || decoded.user_id || decoded.sub)) {
        firebaseUid = decoded.uid || decoded.user_id || decoded.sub;
        email = decoded.email || "usuario@ejemplo.com";
      } else {
        firebaseUid = token; // Fallback mock
      }
    } catch {
      firebaseUid = token;
    }

    const userRepo = AppDataSource.getRepository(User);
    let user = await userRepo.findOne({ where: { firebaseUid } });

    if (!user) {
      // Crear usuario por defecto si no existe en BD local
      user = userRepo.create({
        firebaseUid,
        email: email || `${firebaseUid}@ecommerce.com`,
        name: "Usuario Registrado",
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
