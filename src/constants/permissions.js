// constants/permissions.js
export const MENU_PERMISSIONS = {
  // Продуктове меню - спрощено під SQL структуру
  PRODUCTS: {
    VIEW: {
      LIST: 'products.read',
      CREATE: 'products.create',
      UPDATE: 'products.update',
      DELETE: 'products.delete',
    },
    // Об'єднано всі продуктові сутності під products.*
    MANUFACTURERS: {
      LIST: 'products.read',
      CREATE: 'products.create',
      UPDATE: 'products.update',
      DELETE: 'products.delete',
    },
    SUPPLIERS: {
      LIST: 'products.read',
      CREATE: 'products.create',
      UPDATE: 'products.update',
      DELETE: 'products.delete',
    },
    MODELS: {
      LIST: 'products.read',
      CREATE: 'products.create',
      UPDATE: 'products.update',
      DELETE: 'products.delete',
    },
    PRODUCT_TYPES: {
      LIST: 'products.read',
      CREATE: 'products.create',
      UPDATE: 'products.update',
      DELETE: 'products.delete',
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
      LIST: 'warehouses.read',
      CREATE: 'warehouses.create',
      UPDATE: 'warehouses.update',
      DELETE: 'warehouses.delete',
    },
    STOCK_MOVEMENTS: {
      LIST: 'warehouses.read',
      CREATE: 'warehouses.create',
      UPDATE: 'warehouses.update',
      DELETE: 'warehouses.delete',
    },
  },

  // Клієнти - спрощено
  CLIENTS: {
    VIEW: {
      LIST: 'clients.read',
      CREATE: 'clients.create',
      UPDATE: 'clients.update',
      DELETE: 'clients.delete',
    },
    // Документи клієнтів використовують ті ж права що й клієнти
    DOCUMENTS: {
      LIST: 'clients.read',
      CREATE: 'clients.create',
      DELETE: 'clients.delete',
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
    SYNC: {
      LIST: 'wialon_sync.read',
      CREATE: 'wialon_sync.create',
      UPDATE: 'wialon_sync.update',
      DELETE: 'wialon_sync.delete',
    },
  },

  // Support (Підтримка)
  SUPPORT: {
    TICKETS: {
      LIST: 'tickets.read',
      CREATE: 'tickets.create',
      UPDATE: 'tickets.update',
      DELETE: 'tickets.delete',
    },
    CHAT: {
      LIST: 'chat.read',
      CREATE: 'chat.create',
      UPDATE: 'chat.update',
      DELETE: 'chat.delete',
    },
  },
  // Адміністративне меню - відповідає SQL
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
      LIST: 'audit.read', // Виправлено з logs.read на audit.read
    },
    COMPANY: {
      READ: 'company_profile.read',
      LIST: 'company_profile.read', // Додаємо LIST для функції getListPermissions
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
  SUPPORT: getListPermissions(MENU_PERMISSIONS.SUPPORT),
  SETTINGS: getListPermissions(MENU_PERMISSIONS.SETTINGS),
}
