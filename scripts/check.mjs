import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..'),dist=join(root,'dist');
const html=await readFile(join(dist,'index.html'),'utf8');
for(const file of await readdir(dist))if(file.endsWith('.js'))execFileSync(process.execPath,['--check',join(dist,file)],{stdio:'inherit'});
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'HTML IDs must be unique');
for(const match of html.matchAll(/(?:src|href)="(\/[^"]+)"/g)){
  const path=resolve(dist,'.'+match[1]);assert.ok(path.startsWith(dist+'/'),'Asset must stay inside dist');assert.ok((await stat(path)).isFile(),`Missing local asset ${match[1]}`);
}
for(const match of html.matchAll(/href="#([^"/]+)"/g))assert.ok(ids.includes(match[1]),`Missing anchor #${match[1]}`);
const content=await import(join(dist,'content.js'));
assert.equal(Object.keys(content.projects).length,4,'Four project routes are required');
assert.deepEqual(Object.keys(content.media),Object.keys(content.projects),'Every project needs a media configuration');
for(const [key,config]of Object.entries(content.media)){
  assert.match(config.type,/^(image|video)$/);assert.ok(config.alt,`Missing media description for ${key}`);
  if(config.src){assert.ok(config.src.startsWith('/assets/'),'Bundle media in /assets/');await stat(join(dist,config.src));}
}
const headers=await readFile(join(dist,'_headers'),'utf8');assert.ok(headers.includes("media-src 'self' blob:"),'Local audio files need the blob media source');
const manifest=JSON.parse(await readFile(join(root,'.openai/hosting.json'),'utf8'));assert.equal(manifest.static.directory,'dist');assert.ok(manifest.project_id,'Site identity must be retained');
console.log('PASS: JavaScript syntax, unique IDs, local assets, anchors, four project/media routes, audio policy, and hosting manifest.');
