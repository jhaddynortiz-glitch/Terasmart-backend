import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce Multivendedor REST API (Enterprise Edition)",
      version: "2.0.0",
      description: "Documentación interactiva Swagger completa con 16+ endpoints organizados para Autenticación, Categorías, Marcas, Productos, Variantes, Inventarios, Transferencias y Checkout."
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "Servidor Local de Desarrollo"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Ingrese Token JWT de prueba (superadmin-uid-100, vendor1-uid-200 o client1-uid-400)."
        }
      },
      schemas: {
        ReviewInput: {
          type: "object",
          required: ["rating", "comment"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Excelente calidad de producto" }
          }
        },
        TransferInput: {
          type: "object",
          required: ["originWarehouseId", "destWarehouseId", "variantId", "quantity"],
          properties: {
            originWarehouseId: { type: "string", example: "uuid-almacen-origen" },
            destWarehouseId: { type: "string", example: "uuid-almacen-destino" },
            variantId: { type: "string", example: "uuid-variante" },
            quantity: { type: "integer", example: 5 }
          }
        },
        CheckoutInput: {
          type: "object",
          required: ["paymentMethod", "items"],
          properties: {
            paymentMethod: { type: "string", enum: ["PAYPAL", "COD"], example: "PAYPAL" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variantId: { type: "string", example: "uuid-variante" },
                  warehouseId: { type: "string", example: "uuid-almacen" },
                  quantity: { type: "integer", example: 2 },
                  unitPrice: { type: "number", example: 1450.00 }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      "/auth/dev-token": {
        post: {
          summary: "Generar Token JWT de desarrollo firmado a solicitud (Para Pruebas)",
          tags: ["Autenticación & Perfil"],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    role: { type: "string", enum: ["CLIENTE", "VENDEDOR", "SUPERADMIN"], example: "SUPERADMIN" },
                    email: { type: "string", example: "admin@ecommerce.com" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Token JWT generado con éxito" } }
        }
      },
            "/auth/refresh": {
        post: {
          summary: "Renovar el AccessToken usando un RefreshToken válido sin pedir relogueo",
          tags: ["Autenticación & Perfil"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1Ni..." } }
                }
              }
            }
          },
          responses: { 200: { description: "Nuevo AccessToken emitido con éxito" }, 403: { description: "RefreshToken expirado o revocado" } }
        }
      },
      "/auth/revoke": {
        post: {
          summary: "Revocar un RefreshToken al cerrar sesión (Logout)",
          tags: ["Autenticación & Perfil"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: { refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1Ni..." } }
                }
              }
            }
          },
          responses: { 200: { description: "RefreshToken revocado exitosamente" } }
        }
      },
      "/auth/sync": {
        post: {
          summary: "Sincronizar usuario de Firebase Auth con MySQL",
          tags: ["Autenticación & Perfil"],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Usuario sincronizado" } }
        }
      },
      "/auth/me": {
        get: {
          summary: "Obtener datos y rol del usuario logueado",
          tags: ["Autenticación & Perfil"],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Perfil del usuario autenticado" } }
        }
      },
      "/categories": {
        get: {
          summary: "Listar todas las categorías",
          tags: ["Categorías"],
          responses: { 200: { description: "Lista de categorías" } }
        },
        post: {
          summary: "Crear nueva categoría (SuperAdmin)",
          tags: ["Categorías"],
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Categoría creada" } }
        }
      },
      "/brands": {
        get: {
          summary: "Listar todas las marcas",
          tags: ["Marcas"],
          responses: { 200: { description: "Lista de marcas" } }
        },
        post: {
          summary: "Crear nueva marca (SuperAdmin)",
          tags: ["Marcas"],
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Marca creada" } }
        }
      },
      "/products": {
        get: {
          summary: "Listar catálogo global con búsqueda por SKU, Código de Barras, Categoría o Marca",
          tags: ["Productos & Variantes"],
          parameters: [
            { name: "categoryId", in: "query", schema: { type: "string" } },
            { name: "brandId", in: "query", schema: { type: "string" } },
            { name: "sku", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } }
          ],
          responses: { 200: { description: "Catálogo de productos" } }
        },
        post: {
          summary: "Crear un nuevo producto con SKU y Marca (Vendedor / SuperAdmin)",
          tags: ["Productos & Variantes"],
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: "Producto creado" } }
        }
      },
      "/products/{id}": {
        get: {
          summary: "Obtener producto con sus Variantes, Stock e Historial de Reseñas",
          tags: ["Productos & Variantes"],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Detalle completo del producto" } }
        }
      },
      "/products/{id}/variants": {
        post: {
          summary: "Agregar variante (Color/Talla/RAM) a un producto",
          tags: ["Productos & Variantes"],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 201: { description: "Variante agregada" } }
        }
      },
      "/products/{id}/reviews": {
        post: {
          summary: "Publicar reseña y puntuación de 1 a 5 estrellas (Cliente)",
          tags: ["Productos & Variantes"],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/ReviewInput" } } } },
          responses: { 201: { description: "Reseña registrada" } }
        }
      },
      "/inventory/warehouses": {
        get: {
          summary: "Listar todos los almacenes físicos",
          tags: ["Inventario & Almacenes"],
          responses: { 200: { description: "Lista de almacenes" } }
        }
      },
      "/inventory/my-warehouse": {
        get: {
          summary: "Obtener el inventario del almacén del vendedor autenticado",
          tags: ["Inventario & Almacenes"],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Inventario actual" } }
        }
      },
      "/inventory/stock": {
        put: {
          summary: "Actualizar directamente el stock de una variante en un almacén",
          tags: ["Inventario & Almacenes"],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Stock actualizado" } }
        }
      },
      "/inventory/transfers": {
        post: {
          summary: "Ejecutar transferencia atómica de stock de una variante entre almacenes (ACID)",
          tags: ["Inventario & Almacenes"],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/TransferInput" } } } },
          responses: { 200: { description: "Transferencia ejecutada" } }
        }
      },
      "/orders/checkout": {
        post: {
          summary: "Procesar la compra de artículos del carrito (PayPal o Pago Contra Entrega COD)",
          tags: ["Órdenes & Checkout"],
          security: [{ bearerAuth: [] }],
          requestBody: { content: { "application/json": { schema: { $ref: "#/components/schemas/CheckoutInput" } } } },
          responses: { 201: { description: "Orden procesada y stock descontado" } }
        }
      },
      "/orders/my-orders": {
        get: {
          summary: "Listar el historial de compras del cliente logueado",
          tags: ["Órdenes & Checkout"],
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Lista de órdenes" } }
        }
      },
      "/orders/{id}": {
        get: {
          summary: "Obtener detalle completo de una orden e ítems comprados",
          tags: ["Órdenes & Checkout"],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Detalle de orden" } }
        }
      }
    }
  },
  apis: []
};

export const swaggerSpec = swaggerJSDoc(options);
