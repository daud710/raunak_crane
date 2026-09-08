import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    // Split the admin panel into its own chunk so a visitor browsing the
    // public site never downloads the admin code.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("src/pages/admin")) return "admin";
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
});
