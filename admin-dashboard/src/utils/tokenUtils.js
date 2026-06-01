export const getToken = () => localStorage.getItem("token");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const persistAuthFromResponse = (data) => {
  if (!data) return;
  if (data.token) localStorage.setItem("token", data.token);
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
  if (data.roles?.length) localStorage.setItem("userRole", data.roles[0]);
};

export const clearAuthStorage = () => {
  ["token", "refreshToken", "userRole", "adminName", "adminEmail"].forEach(
    (k) => localStorage.removeItem(k)
  );
};

export const isAdmin = () =>
  (localStorage.getItem("userRole") || "").toLowerCase() === "admin";
