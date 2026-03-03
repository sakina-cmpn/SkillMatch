import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.NEXT_PUBLIC_API_URL || "https://skillmatch-2-1094.onrender.com";

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
    define: {
      "process.env.NEXT_PUBLIC_API_URL": JSON.stringify(apiUrl),
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
