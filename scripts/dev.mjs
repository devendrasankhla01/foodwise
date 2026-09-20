import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {existsSync} from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const children=[];
function run(command,args,cwd){const p=spawn(command,args,{cwd,stdio:'inherit',env:process.env});children.push(p);p.on('error',e=>{console.error(e.message);stop(1)});p.on('exit',code=>{if(code)stop(code)});return p;}
function stop(code=0){for(const p of children)p.kill();process.exit(code);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
run(process.execPath,['dist/index.js'],path.join(root,'backend'));
const python=path.join(root,'ai-service','.venv',process.platform==='win32'?'Scripts/python.exe':'bin/python');
if(existsSync(python))run(python,['-m','uvicorn','main:app','--host','0.0.0.0','--port','8001'],path.join(root,'ai-service'));else console.warn('Python environment unavailable. Start AI service separately; forecasting and vision will report unavailable until it is running.');
run(process.execPath,[path.join(root,'frontend/node_modules/vite/bin/vite.js'),'--host','0.0.0.0','--port','4173',...process.argv.slice(2)],path.join(root,'frontend'));
