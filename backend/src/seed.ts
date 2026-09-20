import {initStore,resetDemo} from './repositories/store.js';
if(process.env.DEMO_MODE!=='true'){console.error('Set DEMO_MODE=true explicitly. This command replaces only the foodwise prototype workspace.');process.exit(1);}
if(!process.argv.includes('--reset-demo')){console.error('Run npm run seed -- --reset-demo to explicitly replace prototype demo data.');process.exit(1);}
await initStore();await resetDemo();console.info('FoodWise demo workspace reset.');process.exit(0);
