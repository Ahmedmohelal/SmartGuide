export const getToken = () => localStorage.getItem("token");

export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const persistAuthFromResponse = (data) => {
  if (!data) return;

  if (data.token) localStorage.setItem("token", data.token);
  if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
  if (data.id) localStorage.setItem("userId", data.id);
  if (data.userName != null) localStorage.setItem("userName", data.userName || "");
  if (data.email != null) localStorage.setItem("email", data.email || "");
  if (data.country != null) localStorage.setItem("country", data.country || "");

  if (data.roles?.length) {
    localStorage.setItem("userRole", data.roles[0]);
  } else if (data.role) {
    localStorage.setItem("userRole", data.role);
  }
};

export const clearAuthStorage = () => {
  [
    "token",
    "refreshToken",
    "userId",
    "userName",
    "email",
    "country",
    "userRole",
  ].forEach((key) => localStorage.removeItem(key));
};

export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;

  const payload = JSON.parse(atob(token.split(".")[1]));
  return payload.sub;
};

export const getUserRole = () => localStorage.getItem("userRole");

export const isGuide = () => {
  const role = getUserRole();
  return role?.toLowerCase() === "tourguide" || role?.toLowerCase() === "guide";
};

export const isTourist = () => {
  const role = getUserRole();
  return role?.toLowerCase() === "tourist";
};
