# Seguimiento de Tareas - Backend TypeORM + JWT Auth

- [x] **Fase 1: Configuración e Infraestructura**
  - [x] Inicializar proyecto Node.js con TypeScript, Express y TypeORM.
  - [x] Configurar conexión a MySQL `DataSource` y Firebase Admin SDK.
- [x] **Fase 2: Modelado de Entidades TypeORM**
  - [x] Crear entidades: `User`, `Warehouse`, `Category`, `Product`, `Inventory`, `InventoryTransfer`, `Review`, `Order`, `OrderItem`.
- [x] **Fase 3: Autenticación y Middlewares**
  - [x] Crear middleware `authenticateJwt` con verificación Firebase Admin.
  - [x] Crear middleware de autorización por roles RBAC `authorizeRoles`.
- [x] **Fase 4: Servicios y Controladores**
  - [x] Desarrollar servicio de catálogo de productos y reseñas.
  - [x] Desarrollar servicio de transferencia atómica de inventario con `AppDataSource.transaction()`.
