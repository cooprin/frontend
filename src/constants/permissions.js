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
  // Клієнти
  CLIENTS: {
    VIEW: {
      LIST: 'clients.read',
      CREATE: 'clients.create',
      UPDATE: 'clients.update',
      DELETE: 'clients.delete',
    },
    DOCUMENTS: {
      LIST: 'client_documents.read',
      CREATE: 'client_documents.create',
      DELETE: 'client_documents.delete',
    },
  },

  // Послуги та тарифи
  SERVICES: {
    VIEW: {
      LIST: 'services.read',
      CREATE: 'services.create',
      UPDATE: 'services.update',
      DELETE: 'services.delete',
    },
    TARIFFS: {
      LIST: 'tariffs.read',
      CREATE: 'tariffs.create',
      UPDATE: 'tariffs.update',
      DELETE: 'tariffs.delete',
    },
    INVOICES: {
      LIST: 'invoices.read',
      CREATE: 'invoices.create',
      UPDATE: 'invoices.update',
      DELETE: 'invoices.delete',
    },
    PAYMENTS: {
      LIST: 'payments.read',
      CREATE: 'payments.create',
      UPDATE: 'payments.update',
      DELETE: 'payments.delete',
    },
  },

  // Wialon об'єкти
  WIALON: {
    OBJECTS: {
      LIST: 'wialon_objects.read',
      CREATE: 'wialon_objects.create',
      UPDATE: 'wialon_objects.update',
      DELETE: 'wialon_objects.delete',
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
    COMPANY: {
      READ: 'company_profile.read',
      CREATE: 'company_profile.create',
      UPDATE: 'company_profile.update',
      DELETE: 'company_profile.delete',
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
  CLIENTS: getListPermissions(MENU_PERMISSIONS.CLIENTS),
  SERVICES: getListPermissions(MENU_PERMISSIONS.SERVICES),
  WIALON: getListPermissions(MENU_PERMISSIONS.WIALON),
  SETTINGS: getListPermissions(MENU_PERMISSIONS.SETTINGS),
}
