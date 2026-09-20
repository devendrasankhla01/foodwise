import 'dotenv/config';
import {randomBytes} from 'node:crypto';
export const config={port:Number(process.env.PORT||8000),demo:process.env.DEMO_MODE==='true',mongo:process.env.MONGODB_URI||'',jwt:process.env.JWT_SECRET||'',origins:(process.env.FRONTEND_URL||'http://localhost:4173,http://localhost:5173').split(','),ai:process.env.AI_SERVICE_URL||'http://127.0.0.1:8001',aiToken:process.env.AI_SERVICE_TOKEN||'',dataFile:process.env.DATA_FILE||'.data/demo.json'};
if(!config.jwt){if(!config.demo)throw new Error('JWT_SECRET is required');config.jwt=randomBytes(48).toString('hex');console.info('Demo session secret generated; sessions expire on restart.');}
if(!config.demo&&config.jwt.length<32)throw new Error('JWT_SECRET must contain at least 32 characters');
if(!config.demo&&!config.mongo)throw new Error('MONGODB_URI is required outside demo mode');
