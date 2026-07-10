import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Interceptor global de fetch para añadir la cabecera Authorization (JWT) y manejar respuestas 401
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const newOptions = { ...options };

  if (token) {
    if (!newOptions.headers) {
      newOptions.headers = {};
    }
    if (newOptions.headers instanceof Headers) {
      newOptions.headers.set("Authorization", `Bearer ${token}`);
    } else if (Array.isArray(newOptions.headers)) {
      newOptions.headers.push(["Authorization", `Bearer ${token}`]);
    } else {
      newOptions.headers = {
        ...newOptions.headers,
        "Authorization": `Bearer ${token}`
      };
    }
  }

  const response = await originalFetch(url, newOptions);

  const urlString = typeof url === "string" ? url : (url.url || "");
  // Si expira el token o es inválido (401), se limpia la sesión y se redirige
  if (response.status === 401 && !urlString.includes("/login_local")) {
    localStorage.removeItem("token");
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
