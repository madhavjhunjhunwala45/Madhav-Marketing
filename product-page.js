const requestedProduct = new URLSearchParams(window.location.search).get('product');
const product = Object.prototype.hasOwnProperty.call(catalogue, requestedProduct) ? catalogue[requestedProduct] : null;
const setText = (id, text) => {document.getElementById(id).textContent = text;};
if (!product) {
  document.title = 'Product not found | Madhav Marketing';
  document.querySelector('main').replaceChildren();
  const section = document.createElement('section'); section.className='section wrap not-found';
  const title=document.createElement('h1');title.textContent='Find your preparation.';
  const copy=document.createElement('p');copy.textContent='This product link is unavailable. Explore our current range to choose a product.';
  const link=document.createElement('a');link.href='index.html#products';link.className='button button-primary';link.textContent='Browse all products ↗';section.append(title,copy,link);document.querySelector('main').append(section);
} else {
  document.title = product.title + ' | Madhav Marketing';
  document.querySelector('meta[name="description"]').content = product.description;
  setText('breadcrumb-product',product.title);setText('product-category',product.category);setText('product-title',product.title);setText('product-description',product.description);setText('product-precautions',product.precautions);setText('product-benefits',product.benefits);
  let activePhoto;
  const dialog = document.getElementById('image-dialog');
  function selectPhoto(photo, button) {
    activePhoto=photo;const image=document.getElementById('product-image'); changeImage(image,photo.src,product.title+' — '+photo.label);setText('gallery-caption',photo.label);
    document.querySelectorAll('.gallery-thumb').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  }
  function renderFormat(format) {
    setText('product-pack',format.pack);setText('composition-count',format.ingredients.length+' listed components');setText('composition-basis',format.basis);setText('product-directions',format.directions);setText('table-caption',product.title+' — '+format.basis);
    const purchase=document.getElementById('product-amazon');const amazon=makeAmazonLink(product,format);amazon.classList.add('button','button-outline');purchase.replaceChildren(amazon);
    const note=document.getElementById('formulation-note');note.hidden=!product.formulaNote;note.textContent=product.formulaNote||'';
    const body=document.getElementById('composition-body');body.replaceChildren();
    format.ingredients.forEach(([name, detail, quantity])=>{
      const item=ingredientFor(name);const row=document.createElement('tr');const heading=document.createElement('th');heading.scope='row';
      const component=document.createElement('div');component.className='composition-component';
      const picture=document.createElement('div');picture.className='component-image-link';picture.append(ingredientPicture(item,true));
      const identity=document.createElement('div');const title=document.createElement(item.guideHidden?'span':'a');if(!item.guideHidden)title.href='ingredients.html?ingredient='+encodeURIComponent(window.ingredientAliases[name]);title.className='component-name';title.textContent=name;const identityDetail=document.createElement('span');identityDetail.className='component-identity';identityDetail.textContent=detail;identity.append(title,identityDetail);component.append(picture,identity);heading.append(component);
      const benefit=document.createElement('td');const copy=document.createElement('span');copy.textContent=window.componentBenefits[name]||item.shortBenefit;const evidence=document.createElement('small');evidence.className='component-evidence';evidence.textContent=window.componentEvidence?.[name]||item.evidenceLabel;benefit.append(copy,evidence);
      const amount=document.createElement('td');amount.className='component-quantity';amount.textContent=quantity;row.append(heading,benefit,amount);body.append(row);
      if(!item.guideHidden)window.MadhavIngredientSwipe?.(row,window.ingredientAliases[name]);
    });
    const thumbs=document.getElementById('gallery-thumbs');thumbs.replaceChildren();
    format.gallery.forEach((photo,index)=>{const button=document.createElement('button');button.type='button';button.className='gallery-thumb';button.dataset.photoLabel=photo.label;button.setAttribute('aria-label','Show '+photo.label);button.setAttribute('aria-pressed',String(index===0));const image=document.createElement('img');image.src=photo.src;image.alt='';image.loading='lazy';const label=document.createElement('span');label.textContent=photo.label;button.append(image,label);button.addEventListener('click',()=>selectPhoto(photo,button));thumbs.append(button);if(index===0) selectPhoto(photo,button);});
  }
  if(product.formats){const options=document.getElementById('format-options');options.hidden=false;options.setAttribute('aria-label',product.formatLabel||'Select pack size');product.formats.forEach((format,index)=>{const button=document.createElement('button');button.type='button';button.textContent=format.label;button.setAttribute('aria-pressed',String(index===0));button.addEventListener('click',()=>{options.querySelectorAll('button').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));renderFormat(format);softReveal(document.getElementById('composition-body'),5);});options.append(button);});renderFormat(product.formats[0]);} else renderFormat(product);
  const siblings = {'arshharan':['arshharan-capsules','Also available: capsules'], 'arshharan-capsules':['arshharan','Also available: syrup'], 'madhumeh-value':['madhumeh-premium','Compare the Premium formula →'], 'madhumeh-premium':['madhumeh-value','Compare the Value formula →']};
  if(siblings[requestedProduct]){const [id,label]=siblings[requestedProduct];const link=document.createElement('a');link.href='product.html?product='+id;link.textContent=label;document.getElementById('sibling-links').append(link);}
  function openPhotoDialog() {
    document.getElementById('dialog-image').src=activePhoto.original||activePhoto.src;
    document.getElementById('dialog-image').alt=product.title+' — '+activePhoto.label;
    setText('dialog-caption',product.title+' · '+activePhoto.label);
    document.getElementById('image-original').href=activePhoto.original||activePhoto.src;
    dialog.showModal();
  }
  document.getElementById('gallery-enlarge').addEventListener('click',openPhotoDialog);
  document.getElementById('view-label-photo').addEventListener('click',()=>{
    const labelButton=Array.from(document.querySelectorAll('.gallery-thumb')).find(button=>button.dataset.photoLabel.toLowerCase().includes('composition'));
    if(labelButton) labelButton.click();
    openPhotoDialog();
  });
  document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  const related=Object.entries(catalogue).filter(([id])=>id!==requestedProduct).sort(([,a],[,b])=>Number(b.group===product.group)-Number(a.group===product.group)).slice(0,3);
  related.forEach(([id,p])=>document.getElementById('related-grid').append(makeProductCard(id,p)));
}
