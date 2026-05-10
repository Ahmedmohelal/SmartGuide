export const getToken = () => localStorage.getItem("token");

export const authHeader = () => ({
  Authorization: `Bearer ${getToken()}`,
});

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