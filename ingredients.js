const ingredientGrid = document.getElementById('ingredient-grid');
const ingredientSearch = document.getElementById('ingredient-search');
const ingredientCount = document.getElementById('ingredient-count');
const ingredientEntries = Object.entries(window.ingredientGuide).filter(([,item])=>!item.guideHidden);
// Index all language names as well as the unchanged scientific and pack names.
let ingredientSearchIndex;
function rebuildIngredientSearchIndex(){
  ingredientSearchIndex = new Map(ingredientEntries.map(([id,item])=>{
    const names=[item.title,item.latin,...Object.keys(window.ingredientAliases).filter(name=>window.ingredientAliases[name]===id)];
    const translated=Object.values(window.madhavTranslations||{}).flatMap(dictionary=>names.map(name=>dictionary[name]||''));
    return [id,[...names,...translated].join(' ').normalize('NFKC').toLocaleLowerCase()];
  }));
}
rebuildIngredientSearchIndex();
const selectedIngredient = new URLSearchParams(location.search).get('ingredient');
let exactIngredient=selectedIngredient&&window.ingredientGuide[selectedIngredient]&&!window.ingredientGuide[selectedIngredient].guideHidden?selectedIngredient:null;
let ingredientFilter = 'featured';
function makeIngredientCard(id,item) {
  const card=document.createElement('article');card.className='ingredient-card';card.id='ingredient-'+id;card.dataset.id=id;
  card.append(ingredientPicture(item));
  const body=document.createElement('div');body.className='ingredient-card-body';
  const eyebrow=document.createElement('p');eyebrow.className='ingredient-group';eyebrow.textContent=item.group==='familiar'?'FAMILIAR BOTANICAL':item.group==='rare'?'LESSER-KNOWN BOTANICAL':item.group==='oil'?'OIL / PREPARATION':item.group==='mineral'?'MINERAL / MATERIAL':'FORMULATION COMPONENT';
  const heading=document.createElement('h2');heading.textContent=item.title;
  const latin=document.createElement('p');latin.className='ingredient-latin';latin.textContent=item.latin || 'Identity as stated on the product label';
  const benefit=document.createElement('p');benefit.className='ingredient-benefit';benefit.textContent=item.shortBenefit;
  const paragraph=document.createElement('p');paragraph.className='ingredient-description';paragraph.textContent=item.paragraph;
  const evidence=document.createElement('span');evidence.className='evidence-label';evidence.textContent=item.evidenceLabel;
  body.append(eyebrow,heading,latin,benefit,paragraph,evidence);
  if(item.note){const note=document.createElement('p');note.className='ingredient-part-note';note.textContent=item.note;body.append(note);}
  const products=Object.entries(catalogue).filter(([,p])=>(p.formats||[p]).some(f=>f.ingredients.some(r=>window.ingredientAliases[r[0]]===id)));
  if(products.length){const details=document.createElement('details');details.className='ingredient-products';const summary=document.createElement('summary');summary.textContent='Find in '+products.length+(products.length===1?' preparation':' preparations');details.append(summary);products.forEach(([key,p])=>{const a=document.createElement('a');a.href='product.html?product='+key+'#composition';a.textContent=p.title+' ↗';details.append(a);});body.append(details);}
  const profile=document.createElement('a');profile.className='ingredient-profile-link';profile.href='ingredients.html?ingredient='+encodeURIComponent(id)+'#ingredient-'+id;profile.textContent='View ingredient profile ↗';body.append(profile);
  body.append(ingredientSources(item));card.append(body);window.MadhavIngredientSwipe?.(card,id);return card;
}
// Build only the current results. Reuse cards when a search/filter is revisited.
const ingredientCards=new Map();
function filterIngredients() {
  const query=ingredientSearch.value.trim().normalize('NFKC').toLocaleLowerCase();
  const results=ingredientEntries.filter(([id,item])=>{
    if(exactIngredient)return id===exactIngredient;
    const matchesQuery=ingredientSearchIndex.get(id).includes(query);
    const matchesGroup=ingredientFilter==='all'||(ingredientFilter==='featured'?(query||item.featured):item.group===ingredientFilter);
    return matchesQuery&&matchesGroup;
  });
  const fragment=document.createDocumentFragment();
  for(const [id,item] of results){
    let card=ingredientCards.get(id);
    if(!card){card=makeIngredientCard(id,item);ingredientCards.set(id,card);}
    card.classList.toggle('ingredient-selected',exactIngredient===id);
    fragment.append(card);
  }
  ingredientGrid.replaceChildren(fragment);
  const count=results.length;
  ingredientCount.textContent=count+(count===1?' ingredient':' ingredients');
  document.getElementById('ingredient-empty').hidden=count!==0;
}
function clearIngredientSelection(){
  if(!exactIngredient)return;exactIngredient=null;
  const url=new URL(location.href);url.searchParams.delete('ingredient');url.hash='';history.replaceState(null,'',url.href);
}
document.querySelectorAll('[data-ingredient-filter]').forEach(button=>button.addEventListener('click',()=>{clearIngredientSelection();ingredientFilter=button.dataset.ingredientFilter;document.querySelectorAll('[data-ingredient-filter]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));changeGrid(ingredientGrid,filterIngredients);}));
ingredientSearch.addEventListener('input',()=>{clearIngredientSelection();filterIngredients();});
document.addEventListener('madhav:languagechange',()=>{rebuildIngredientSearchIndex();filterIngredients();});
document.getElementById('ingredient-reset').addEventListener('click',()=>{ingredientSearch.value='';exactIngredient=null;ingredientFilter='featured';document.querySelectorAll('[data-ingredient-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ingredientFilter==='featured')));history.replaceState(null,'','ingredients.html?lang='+window.MadhavI18n.language);changeGrid(ingredientGrid,filterIngredients);ingredientSearch.focus();});
if(selectedIngredient&&window.ingredientGuide[selectedIngredient]&&!window.ingredientGuide[selectedIngredient].guideHidden){ingredientSearch.value=window.ingredientGuide[selectedIngredient].title;ingredientFilter='all';document.querySelectorAll('[data-ingredient-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.ingredientFilter==='all')));}
filterIngredients();
if(exactIngredient&&location.hash==='#ingredient-'+exactIngredient)requestAnimationFrame(()=>document.getElementById('ingredient-'+exactIngredient)?.scrollIntoView({behavior:'instant',block:'start'}));
