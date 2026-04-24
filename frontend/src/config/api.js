export const MEDIDOC_API_URL =
  import.meta.env.VITE_MEDIDOC_API_URL || "http://127.0.0.1:8000";

export const CHATBOT_API_URL =
  import.meta.env.VITE_CHATBOT_API_URL || "http://127.0.0.1:5000";

export const BRAIN_API_URL =
  import.meta.env.VITE_BRAIN_API_URL || "https://braintumour-updated.onrender.com";

export const MEDIA_BASE_URL = MEDIDOC_API_URL.replace(/\/$/, "");
