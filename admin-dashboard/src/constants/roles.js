/**
 * User Roles and Permissions
 */

export const USER_ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  GUIDE: "guide",
  USER: "user",
};

export const PERMISSIONS = {
  // User Management
  VIEW_USERS: "view_users",
  EDIT_USERS: "edit_users",
  DELETE_USERS: "delete_users",

  // Guide Management
  VIEW_GUIDES: "view_guides",
  APPROVE_GUIDES: "approve_guides",
  REJECT_GUIDES: "reject_guides",
  DELETE_GUIDES: "delete_guides",

  // Booking Management
  VIEW_BOOKINGS: "view_bookings",
  CANCEL_BOOKINGS: "cancel_bookings",

  // Revenue Management
  VIEW_REVENUE: "view_revenue",
  EXPORT_REVENUE: "export_revenue",

  // Admin Management
  CREATE_ADMIN: "create_admin",
  DELETE_ADMIN: "delete_admin",

  // Audit
  VIEW_AUDIT: "view_audit",
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.VIEW_GUIDES,
    PERMISSIONS.APPROVE_GUIDES,
    PERMISSIONS.REJECT_GUIDES,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.VIEW_REVENUE,
    PERMISSIONS.VIEW_AUDIT,
  ],
};
