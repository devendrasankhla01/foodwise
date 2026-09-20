import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tailwindcss()],build:{rollupOptions:{output:{manualChunks:{charts:['recharts'],ui:['@radix-ui/react-dialog','@radix-ui/react-select'],react:['react','react-dom','react-router-dom']}}}},server:{allowedHosts:true,proxy:{'/api':'http://127.0.0.1:8000','/health':'http://127.0.0.1:8000'}}});
