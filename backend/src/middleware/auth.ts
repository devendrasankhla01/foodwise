import jwt from 'jsonwebtoken';
import type {Request,Response,NextFunction} from 'express';
import {config} from '../config.js';
import {readState} from '../repositories/store.js';
import type {Actor,Role} from '../types.js';
declare global {namespace Express {interface Request {actor:Actor}}}
export async function auth(req:Request,res:Response,next:NextFunction){try{const token=req.headers.authorization?.split(' ')[1];if(!token)return res.status(401).json({error:'Please sign in.'});const claim=jwt.verify(token,config.jwt,{algorithms:['HS256']}) as {sub:string};const s=await readState();const u=s.users.find(u=>u.id===claim.sub);const org=s.organizations.find(o=>o.id===u?.organizationId);if(!u?.active||!org?.active)return res.status(401).json({error:'Session unavailable. Please sign in again.'});req.actor={id:u.id,role:u.role,organizationId:u.organizationId,name:u.name};next();}catch{res.status(401).json({error:'Your session expired. Please sign in again.'});}}
export const roles=(...allowed:Role[])=>(req:Request,res:Response,next:NextFunction)=>allowed.includes(req.actor.role)?next():res.status(403).json({error:'Access denied for this role.'});
