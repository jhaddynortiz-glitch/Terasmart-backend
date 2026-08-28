import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce Multivendedor REST API (Enterprise Edition)",
      version: "2.0.0",
      description: "Documentación interactiva Swagger completa con esquemas de RequestBody e interactividad para creación de Categorías, Marcas, Productos, Variantes, Inventario y Checkout."
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
          description: "Ingrese el Token JWT de prueba obtenido desde POST /auth/dev-token (ej: superadmin-uid-100, vendor1-uid-200)."
        }
      },
      schemas: {
        CategoryInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Deportes & Fitness" },
            description: { type: "string", example: "Equipos de entrenamiento, pesas y accesorios deportivos." },
            imageUrl: { type: "string", example: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd" }
          }
        },
        BrandInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", example: "Adidas" },
            logoUrl: { type: "string", example: "https://logo.clearbit.com/adidas.com" }
          }
        },
        ProductInput: {
          type: "object",
          required: ["name", "sku", "categoryId", "basePrice"],
          properties: {
            categoryId: { type: "string", example: "ID-DE-CATEGORIA-EXISTENTE" },
            brandId: { type: "string", example: "ID-DE-MARCA-EXISTENTE" },
            name: { type: "string", example: "Teclado Mecánico RGB Corsair K95" },
            sku: { type: "string", example: "KEYB-CORSAIR-K95" },
            barcode: { type: "string", example: "0843591032125" },
            description: { type: "string", example: "Teclado mecánico para gaming con switches Cherry MX Speed." },
            basePrice: { type: "number", example: 199.99 },
            weightKg: { type: "number", example: 1.30 },
            mainImageUrl: { type: "string", example: "https://images.unsplash.com/photo-1587829741301-dc798b83add3" }
          }
        },
        VariantInput: {
          type: "object",
          required: ["sku", "variantName", "price"],
          properties: {
            sku: { type: "string", example: "KEYB-CORSAIR-K95-BLK" },
            barcode: { type: "string", example: "0843591032126" },
            variantName: { type: "string", example: "Negro Gunmetal / Switches MX Speed" },
            color: { type: "string", example: "Negro Gunmetal" },
            size: { type: "string", example: "Full Size 100%" },
            attributesJson: { type: "object", example: { switches: "Cherry MX Speed", rgb: true } },
            price: { type: "number", example: 199.99 },
            imageUrl: { type: "string", example: "https://images.unsplash.com/photo-1587829741301-dc798b83add3" }
          }
        },
        StockUpdateInput: {
          type: "object",
          required: ["warehouseId", "variantId", "stock"],
          properties: {
            warehouseId: { type: "string", example: "ID-DE-ALMACEN-EXISTENTE" },
            variantId: { type: "string", example: "ID-DE-VARIANTE-EXISTENTE" },
            stock: { type: "integer", example: 50 }
          }
        },
        ReviewInput: {
          type: "object",
          required: ["rating", "comment"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Excelente calidad de producto, envío muy rápido." }
          }
        },
        TransferInput: {
          type: "object",
          required: ["originWarehouseId", "destWarehouseId", "variantId", "quantity"],
          properties: {
            originWarehouseId: { type: "string", example: "ID-ALMACEN-ORIGEN" },
            destWarehouseId: { type: "string", example: "ID-ALMACEN-DESTINO" },
            variantId: { type: "string", example: "ID-VARIANTE-A-TRANSFERIR" },
            quantity: { type: "integer", example: 3 }
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
                  variantId: { type: "string", example: "ID-DE-VARIANTE" },
                  warehouseId: { type: "string", example: "ID-DE-ALMACEN" },
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
          summary: "Generar Token JWT de desarrollo firmado (Para Pruebas)",
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
      "/auth/login": {
        post: {
          summary: "Iniciar sesión de usuario con Email y obtener Tokens (AccessToken + RefreshToken)",
          tags: ["Autenticación & Perfil"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", example: "admin@ecommerce.com" },
                    password: { type: "string", example: "Password123!" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Inicio de sesión exitoso" } }
        }
      },
      "/auth/register": {
        post: {
          summary: "Registrar un nuevo usuario simultáneamente en Firebase Auth y MySQL",
          tags: ["Autenticación & Perfil"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    name: { type: "string", example: "Nuevo Usuario" },
                    email: { type: "string", example: "nuevo.usuario@gmail.com" },
                    password: { type: "string", example: "Password123!" },
                    role: { type: "string", enum: ["CLIENTE", "VENDEDOR", "SUPERADMIN"], example: "CLIENTE" }
                  }
                }
              }
            }
          },
          responses: { 201: { description: "Usuario registrado en Firebase Auth y MySQL" } }
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
                  properties: { refreshToken: { type: "string", example: "eyJhbGci..." } }
                }
              }
            }
          },
          responses: { 200: { description: "Nuevo AccessToken emitido" } }
        }
      },
      "/auth/sync": {
        post: {
          summary: "Sincronizar usuario de Firebase Auth con MySQL",
          tags: ["Autenticación & Perfil"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "María Vargas" },
                    role: { type: "string", enum: ["CLIENTE", "VENDEDOR", "SUPERADMIN"], example: "CLIENTE" }
                  }
                }
              }
            }
          },
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
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CategoryInput" }
              }
            }
          },
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
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BrandInput" }
              }
            }
          },
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
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductInput" }
              }
            }
          },
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
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/VariantInput" }
              }
            }
          },
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
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StockUpdateInput" }
              }
            }
          },
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
