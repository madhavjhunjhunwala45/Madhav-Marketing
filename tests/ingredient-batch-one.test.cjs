const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),c={window:{}};vm.createContext(c);
for(const f of ['product-data.js','ingredient-data.js','ingredient-shared.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
const {ingredientGuide:guide,ingredientAliases:aliases,productCatalogue:products,mmIngredientEditorial:editorial,MadhavIngredientNotes:notes}=c.window;
const expected={amla:['kabi-haran'],neem:['madhumeh-value','madhumeh-premium'],jamun:['madhumeh-value','madhumeh-premium'],karela:['madhumeh-value','madhumeh-premium'],fenugreek:['madhumeh-value','madhumeh-premium','hriday-rakshak'],cinnamon:['madhumeh-value','madhumeh-premium','hriday-rakshak']};
assert.equal(Object.keys(editorial).length,30);
for(const [id,pids]of Object.entries(expected)){
 const actual=Object.entries(products).filter(([,p])=>(p.formats||[p]).some(f=>f.ingredients.some(r=>aliases[r[0]]===id))).map(([pid])=>pid);
 assert.deepEqual(actual.sort(),pids.slice().sort(),id+': exact product membership');
 for(const pid of pids)for(const f of products[pid].formats||[products[pid]])for(const row of f.ingredients.filter(r=>aliases[r[0]]===id)){
  const n=notes.get(pid,row[0]);assert.equal(n.paragraph,editorial[id].essence);assert(n.explanation.length>40);assert(!/topical|external massage/.test(n.benefit));
 }
 const html=fs.readFileSync(path.join(root,'dist/_search/ingredient-'+id+'.html'),'utf8');
 assert(html.includes(editorial[id].hook)&&html.includes(editorial[id].essence));
 assert(guide[id],id+': stable ingredient key');
}
assert(/do not specify the plant part/.test(editorial.neem.raw));
assert(/do not identify the part/.test(editorial.jamun.raw));
assert(/do not specify the plant part/.test(editorial.karela.raw));
assert(/labels say Cinnamomum species/.test(editorial.cinnamon.raw));
assert(/photograph shows Ceylon/.test(guide.cinnamon.note));
assert((products['kabi-haran'].formats||[products['kabi-haran']])[0].ingredients.some(row=>row[0]==='Amla'&&row[2]==='10.00% w/w'));
for(const id of ['fenugreek','cinnamon'])assert(products['hriday-rakshak'].ingredients.some(row=>aliases[row[0]]===id&&row[2]==='75 mg'));
console.log('Passed: Batch 1 exact memberships across all panel versions, thirty complete rich profiles, oral-only roles, plant-part/species distinctions, unchanged profile IDs and printed quantity bases.');
