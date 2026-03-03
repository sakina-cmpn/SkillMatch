export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://skillmatch-2-1094.onrender.com";
