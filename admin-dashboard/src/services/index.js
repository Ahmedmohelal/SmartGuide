/**
 * Centralized Services Configuration
 * نقطة مركزية لإدارة جميع الخدمات
 */

export const services = {
  admin: () => import("./adminService"),
  auth: () => import("./authService"),
  refreshAuth: () => import("./refreshAuth"),
};

/**
 * Service Registry Pattern
 * يسهل الوصول والتبديل بين الخدمات المختلفة
 */
export const getService = (serviceName) => {
  if (!services[serviceName]) {
    throw new Error(`Service ${serviceName} not found`);
  }
  return services[serviceName]();
};
