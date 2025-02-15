// constants/permissions.js
export const MENU_PERMISSIONS = {
  // Продуктове меню
  PRODUCTS: {
    VIEW: {
      LIST: 'products.read',
      CREATE: 'products.create',
      UPDATE: 'products.update',
      DELETE: 'products.delete',
    },
    MANUFACTURERS: {
      LIST: 'manufacturers.read',
      CREATE: 'manufacturers.create',
      UPDATE: 'manufacturers.update',
      DELETE: 'manufacturers.delete',
    },
    SUPPLIERS: {
      LIST: 'suppliers.read',
      CREATE: 'suppliers.create',
      UPDATE: 'suppliers.update',
      DELETE: 'suppliers.delete',
    },
    MODELS: {
      LIST: 'models.read',
      CREATE: 'models.create',
      UPDATE: 'models.update',
      DELETE: 'models.delete',
    },
    PRODUCT_TYPES: {
      LIST: 'product_types.read',
      CREATE: 'product_types.create',
      UPDATE: 'product_types.update',
      DELETE: 'product_types.delete',
    },
  },

  // Складське меню
  WAREHOUSES: {
    VIEW: {
      LIST: 'warehouses.read',
      CREATE: 'warehouses.create',
      UPDATE: 'warehouses.update',
      DELETE: 'warehouses.delete',
    },
    STOCK: {
      LIST: 'stock.read',
      CREATE: 'stock.create',
      UPDATE: 'stock.update',
      DELETE: 'stock.delete',
    },
    STOCK_MOVEMENTS: {
      LIST: 'stock_movements.read',
      CREATE: 'stock_movements.create',
      UPDATE: 'stock_movements.update',
      DELETE: 'stock_movements.delete',
    },
  },

  // Адміністративне меню
  SETTINGS: {
    USERS: {
      LIST: 'users.read',
      CREATE: 'users.create',
      UPDATE: 'users.update',
      DELETE: 'users.delete',
    },
    ROLES: {
      LIST: 'roles.read',
      CREATE: 'roles.create',
      UPDATE: 'roles.update',
      DELETE: 'roles.delete',
    },
    PERMISSIONS: {
      LIST: 'permissions.read',
      CREATE: 'permissions.create',
      UPDATE: 'permissions.update',
      DELETE: 'permissions.delete',
    },
    RESOURCES: {
      LIST: 'resources.read',
      CREATE: 'resources.create',
      UPDATE: 'resources.update',
      DELETE: 'resources.delete',
    },
    AUDIT_LOGS: {
      LIST: 'logs.read',
    },
  },
}

// Групи прав для відображення секцій меню
const getListPermissions = (section) => {
  return Object.values(section)
    .map((subsection) => subsection.LIST)
    .filter(Boolean)
}

export const MENU_SECTIONS_PERMISSIONS = {
  PRODUCTS: getListPermissions(MENU_PERMISSIONS.PRODUCTS),
  WAREHOUSES: getListPermissions(MENU_PERMISSIONS.WAREHOUSES),
  SETTINGS: getListPermissions(MENU_PERMISSIONS.SETTINGS),
}
