import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { CategoryController } from "../controllers/category.controller";
import { BrandController } from "../controllers/brand.controller";
import { ProductController } from "../controllers/product.controller";
import { InventoryController } from "../controllers/inventory.controller";
import { OrderController } from "../controllers/order.controller";
import { authenticateJwt, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// Rutas de Autenticación & Usuarios Admin
router.post("/auth/register", AuthController.registerUser as any);
router.post("/auth/login", AuthController.loginUser as any);
router.post("/auth/dev-token", AuthController.generateDevToken as any);
router.post("/auth/refresh", AuthController.refreshAccessToken as any);
router.post("/auth/revoke", AuthController.revokeRefreshToken as any);
router.post("/auth/sync", authenticateJwt, AuthController.syncUser as any);
router.get("/auth/me", authenticateJwt, AuthController.getProfile as any);
router.get("/admin/users", authenticateJwt, authorizeRoles("SUPERADMIN"), AuthController.getUsers as any);
router.put("/admin/users/:id/role", authenticateJwt, authorizeRoles("SUPERADMIN"), AuthController.updateUserRole as any);

// Categorías
router.get("/categories", CategoryController.getCategories as any);
router.post("/categories", authenticateJwt, authorizeRoles("SUPERADMIN"), CategoryController.createCategory as any);
router.put("/categories/:id", authenticateJwt, authorizeRoles("SUPERADMIN"), CategoryController.updateCategory as any);
router.delete("/categories/:id", authenticateJwt, authorizeRoles("SUPERADMIN"), CategoryController.deleteCategory as any);

// Marcas
router.get("/brands", BrandController.getBrands as any);
router.post("/brands", authenticateJwt, authorizeRoles("SUPERADMIN"), BrandController.createBrand as any);

// Productos
router.get("/products", ProductController.getProducts as any);
router.get("/products/:id", ProductController.getProductDetail as any);
router.post("/products", authenticateJwt, authorizeRoles("VENDEDOR", "SUPERADMIN"), ProductController.createProduct as any);
router.put("/products/:id", authenticateJwt, authorizeRoles("VENDEDOR", "SUPERADMIN"), ProductController.updateProduct as any);
router.delete("/products/:id", authenticateJwt, authorizeRoles("SUPERADMIN"), ProductController.deleteProduct as any);
router.post("/products/:id/variants", authenticateJwt, authorizeRoles("VENDEDOR", "SUPERADMIN"), ProductController.createVariant as any);
router.post("/products/:id/reviews", authenticateJwt, authorizeRoles("CLIENTE", "SUPERADMIN"), ProductController.addReview as any);

// Inventarios, Almacenes y Transferencias
router.get("/inventory/warehouses", InventoryController.getWarehouses as any);
router.post("/inventory/warehouses", authenticateJwt, authorizeRoles("SUPERADMIN"), InventoryController.createWarehouse as any);
router.get("/inventory/my-warehouse", authenticateJwt, authorizeRoles("VENDEDOR", "SUPERADMIN"), InventoryController.getMyInventory as any);
router.put("/inventory/stock", authenticateJwt, authorizeRoles("VENDEDOR", "SUPERADMIN"), InventoryController.updateStock as any);
router.get("/inventory/transfers", authenticateJwt, authorizeRoles("SUPERADMIN"), InventoryController.getTransfers as any);
router.post("/inventory/transfers", authenticateJwt, authorizeRoles("VENDEDOR", "SUPERADMIN"), InventoryController.transferStock as any);
router.put("/inventory/stock-distribution", authenticateJwt, authorizeRoles("SUPERADMIN"), InventoryController.saveStockDistribution as any);

// Ordenes
router.post("/orders/checkout", authenticateJwt, authorizeRoles("CLIENTE", "SUPERADMIN"), OrderController.checkout as any);
router.get("/orders/my-orders", authenticateJwt, authorizeRoles("CLIENTE", "SUPERADMIN"), OrderController.getMyOrders as any);
router.get("/orders/:id", authenticateJwt, OrderController.getOrderDetail as any);

export default router;
