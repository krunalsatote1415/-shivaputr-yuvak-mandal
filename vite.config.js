import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Optional: Isse aapka app port 3000 par chalega
    open: true  // Optional: Server start hote hi browser apne aap khul jayega
  }
})