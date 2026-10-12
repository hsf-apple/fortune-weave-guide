import {cp,mkdir} from 'node:fs/promises';
await mkdir('public/data',{recursive:true});
await cp('assets','public/assets',{recursive:true});
for(const file of ['cai.html','styles.css','theme.css','app.js'])await cp(file,'public/'+file);
await cp('data/cai.js','public/data/cai.js');
