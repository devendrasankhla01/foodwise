import mongoose from 'mongoose';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {dirname} from 'node:path';
import {config} from '../config.js';
import {seedData} from '../services/seedData.js';
import type {State} from '../types.js';
const schema=new mongoose.Schema({_id:String,revision:{type:Number,required:true},payload:{type:mongoose.Schema.Types.Mixed,required:true}},{versionKey:false,timestamps:true});
const Snapshot=mongoose.model('Workspace',schema);
let local:State;let queue:Promise<unknown>=Promise.resolve();
export async function initStore(){
 if(config.mongo){await mongoose.connect(config.mongo,{serverSelectionTimeoutMS:10000});const found=await Snapshot.findById('foodwise');if(!found){const data=await seedData();if(!config.demo){data.users=[];data.organizations=[];data.pos=[];data.production=[];data.inventory=[];data.surplus=[];data.recovery=[];data.notifications=[];}try{await Snapshot.create({_id:'foodwise',revision:0,payload:data});}catch(e){if((e as {code?:number}).code!==11000)throw e;}}}
 else {await mkdir(dirname(config.dataFile),{recursive:true});try{local=JSON.parse(await readFile(config.dataFile,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;local=await seedData();await persist(local);}}
}
async function persist(s:State){await writeFile(config.dataFile+'.tmp',JSON.stringify(s));await rename(config.dataFile+'.tmp',config.dataFile);}
export async function readState():Promise<State>{if(config.mongo){const doc=await Snapshot.findById('foodwise').lean();if(!doc)throw new Error('Database workspace unavailable');return doc.payload as State;}return structuredClone(local);}
export async function mutate<T>(fn:(s:State)=>T):Promise<T>{
 const task=queue.then(async()=>{if(config.mongo){for(let n=0;n<10;n++){const doc=await Snapshot.findById('foodwise').lean();if(!doc)throw new Error('Workspace unavailable');const s=doc.payload as State;const result=fn(s);if(Buffer.byteLength(JSON.stringify(s))>12000000)throw Object.assign(new Error('Prototype storage limit reached; archive older POS data.'),{status:413});const changed=await Snapshot.updateOne({_id:'foodwise',revision:doc.revision},{$set:{payload:s},$inc:{revision:1}});if(changed.modifiedCount)return result;}throw Object.assign(new Error('Another update is in progress. Please retry.'),{status:409});}const copy=structuredClone(local);const result=fn(copy);await persist(copy);local=copy;return result;});queue=task.catch(()=>{});return task;
}
export function databaseStatus(){return config.mongo?(mongoose.connection.readyState===1?'MongoDB connected':'MongoDB disconnected'):'Local JSON demo storage';}
export async function resetDemo(){if(!config.demo)throw new Error('Seed requires DEMO_MODE=true');const s=await seedData();await mutate(current=>{Object.assign(current,s);return true;});}
