// One image and identity model is shared by the guide and every composition table.
function ingredientPicture(item, compact = false) {
  const figure = document.createElement('figure'); figure.className = compact ? 'component-picture' : 'ingredient-picture';
  const image = document.createElement('img'); image.draggable=false;image.loading = 'lazy'; image.decoding = 'async'; image.referrerPolicy = 'no-referrer'; image.width = compact ? 72 : 500; image.height = compact ? 72 : 375;
  const caption = document.createElement('figcaption');
  const illustration = item.illustration || 'botanical';
  const photo = compact ? (item.compositionPhoto || item.photo) : item.photo;
  if(photo?.fit === 'contain') figure.classList.add('ingredient-picture-contain');
  if(compact&&photo?.position) image.style.objectPosition = photo.position;
  image.src = photo?.remoteThumbnailUrl || photo?.remoteUrl || 'assets/ingredients/' + illustration + '.svg';
  image.alt = photo ? item.title + ' — ' + photo.caption : item.title + ' — representative ' + illustration + ' illustration';
  caption.textContent = photo ? photo.caption : 'Representative illustration';
  let triedOriginal=false,usedFallback=false;
  if (photo) image.addEventListener('error', () => {
    // A missing thumbnail should still try the credited original photograph.
    if(!triedOriginal&&photo.remoteUrl&&image.src!==photo.remoteUrl){triedOriginal=true;image.src=photo.remoteUrl;return;}
    if(usedFallback)return;usedFallback=true;
    image.src = 'assets/ingredients/' + illustration + '.svg'; image.alt = item.title + ' — representative illustration; source photo unavailable';
    caption.textContent = 'Illustration · photo unavailable'; figure.classList.add('photo-unavailable');
  });
  if(photo){
    const button=document.createElement('button');button.type='button';button.className='ingredient-photo-button ingredient-image-frame';button.setAttribute('aria-label','View larger photo of '+item.title);button.setAttribute('aria-haspopup','dialog');
    const icon=document.createElement('span');icon.className='ingredient-photo-expand';icon.textContent='⤢';icon.setAttribute('aria-hidden','true');button.append(image,icon);button.addEventListener('click',()=>openIngredientPhoto(item,photo));figure.append(button,caption);
  }else{const frame=document.createElement('div');frame.className='ingredient-photo-static ingredient-image-frame';frame.append(image);figure.append(frame,caption);}
  return figure;
}
let ingredientPhotoViewer;
let photoViewerRequest = 0;
function openIngredientPhoto(item,photo) {
  if(!ingredientPhotoViewer){
    const dialog=document.createElement('dialog');dialog.className='ingredient-photo-dialog';dialog.setAttribute('aria-labelledby','ingredient-photo-heading');
    const top=document.createElement('div');top.className='ingredient-photo-dialog-top';const title=document.createElement('h2');title.id='ingredient-photo-heading';const close=document.createElement('button');close.type='button';close.className='dialog-close';close.textContent='Close ×';close.setAttribute('aria-label','Close ingredient photo');close.addEventListener('click',()=>dialog.close());top.append(title,close);
    const stage=document.createElement('div');stage.className='ingredient-photo-dialog-stage';const image=document.createElement('img');image.referrerPolicy='no-referrer';image.decoding='async';stage.append(image);
    const caption=document.createElement('p');caption.className='ingredient-photo-dialog-caption';const credit=document.createElement('p');credit.className='ingredient-photo-dialog-credit';
    const source=document.createElement('a');source.className='text-link';source.textContent='View Wikimedia source ↗';source.target='_blank';source.rel='noopener noreferrer';
    const status=document.createElement('p');status.className='ingredient-photo-status';status.setAttribute('role','status');status.hidden=true;
    dialog.append(top,stage,caption,credit,source,status);document.body.append(dialog);dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
    dialog.addEventListener('close',()=>{photoViewerRequest++;});
    ingredientPhotoViewer={dialog,title,image,caption,credit,source,status};
  }
  const view=ingredientPhotoViewer;const request=++photoViewerRequest;
  view.title.textContent=item.title;view.caption.textContent=photo.caption;view.credit.textContent=photo.author+' · '+photo.license;view.source.href=photo.sourceUrl;view.image.alt=item.title+' — '+photo.caption;view.image.hidden=false;view.status.hidden=true;
  const preview=photo.remoteThumbnailUrl||photo.remoteUrl;
  view.image.src=preview;
  // Keep the credited preview. Do not automatically fetch a multi-megabyte original on mobile.
  view.image.onerror=()=>{if(request===photoViewerRequest){view.image.hidden=true;view.status.textContent='This photo cannot load right now. Open the Wikimedia source to view it.';view.status.hidden=false;}};
  if(!view.dialog.open)view.dialog.showModal();
}
function ingredientFor(name) {
  const id = window.ingredientAliases[name];
  return window.ingredientGuide[id];
}
function ingredientSources(item) {
  const details = document.createElement('details'); details.className = 'ingredient-sources';
  const summary = document.createElement('summary');summary.textContent='Sources & photo credit';details.append(summary);
  (item.sources || []).forEach(source => { const link=document.createElement('a');link.href=source.url;link.textContent=source.title+' ↗';link.target='_blank';link.rel='noopener noreferrer';details.append(link);});
  [item.photo,item.compositionPhoto].filter(Boolean).forEach((photo,index)=>{const credit=document.createElement('p');credit.textContent=(index?'Composition photo: ':'')+photo.author+' · '+photo.license;const link=document.createElement('a');link.href=photo.sourceUrl;link.textContent='View photo source ↗';link.target='_blank';link.rel='noopener noreferrer';const license=document.createElement('a');license.href=photo.licenseUrl;license.textContent='Reuse licence ↗';license.target='_blank';license.rel='noopener noreferrer';details.append(credit,link,license);});
  return details;
}
