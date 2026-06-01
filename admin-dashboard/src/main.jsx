import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./services/setupAxios";
import { AdminDataProvider } from "./context/AdminDataContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AdminDataProvider>
        <App />
      </AdminDataProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--admin-glass)",
            color: "var(--admin-text)",
            border: "1px solid var(--admin-border)",
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>
);

