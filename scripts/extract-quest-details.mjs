import fs from 'node:fs';
const paths=['cai','dietrich','theodora','leda'];
const clean=s=>s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
const raw=JSON.parse(fs.readFileSync('research/game8-quest-collection.json','utf8'));
const details={};
for(const q of raw.collectionArraySchema.collectionItems){
 const file=`research/quest-pages/${q.id}.html`;if(!fs.existsSync(file))continue;
 const h=fs.readFileSync(file,'utf8');const section=h.match(/Quest Information<\/h3>\s*(<table[\s\S]*?<\/table>)/i)?.[1];if(!section){details[q.id]={review:'No standard quest information table'};continue;}
 const rows=[...section.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m=>m[1]);
 const cells=r=>[...r.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m=>clean(m[1]));
 const first=rows[0].split(/<hr[^>]*>/i).pop();
 const availability=rows.findIndex(r=>/Chapter Availability/.test(r));
 const deadlines=availability>=0?cells(rows[availability+3]||''):[];
 const rewardsRow=rows.find(r=>/>Rewards<\/th>/.test(r));
 const objectiveIndex=rows.findIndex(r=>/>Quest Objective<\/th>/.test(r));
 const objectiveText=objectiveIndex>=0?clean(rows[objectiveIndex+1]||''):'';
 const requirements=objectiveText.match(/\(([^)]*(?:Requires|Required|Complete|Renown)[^)]*)\)/i)?.[1]||null;
 details[q.id]={requirements,location:clean(first),deadlines:Object.fromEntries(paths.map((p,i)=>[p,deadlines.length===4&&deadlines[i]!=='-'?deadlines[i]:null])),rewards:rewardsRow?cells(rewardsRow)[1]||null:null};
}
fs.writeFileSync('research/quest-details.json',JSON.stringify(details,null,2));
console.log({entries:Object.keys(details).length,locations:Object.values(details).filter(d=>d.location).length,rewards:Object.values(details).filter(d=>d.rewards).length});
