// Centralized API configuration



export const API_BASE = "https://smartguide.runasp.net/api";







export const ENDPOINTS = {

  TOURS: `${API_BASE}/Tours`,
  DASHBOARD: `${API_BASE}/guide/dashboard`,
  DASHBOARD_DOCUMENTS: `${API_BASE}/guide/dashboard/documents`,
  DASHBOARD_TOUR: `${API_BASE}/guide/dashboard/tour`,

  AUTH: `${API_BASE}/Auth`,

  GUIDES: `${API_BASE}/tour-guides`,



  PROFILE: `${API_BASE}/tour-guides/profile`,



  PLACES: `${API_BASE}/Places`,



  SAVED_PLACES: `${API_BASE}/tourists/me/savedplaces`,

  TOURIST_SAVED_GUIDES: `${API_BASE}/tourists/me/savedguides`,

  BOOKINGS: `${API_BASE}/Users/bookings`,


};