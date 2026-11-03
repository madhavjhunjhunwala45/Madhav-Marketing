/* Generated image candidates are data, never a second copy of the catalogue. */
(() => {
  'use strict';
  const entries = __MADHAV_IMAGE_MANIFEST__;
  function sizes(source, role) {
    const ratio = entries[source]?.ratio || 1;
    const cap = height => Math.ceil(height * ratio) + 'px';
    if (role === 'logo-header') return '(max-width:360px) 98px, (max-width:650px) 112px, (max-width:900px) 184px, 132px';
    if (role === 'logo') return '(max-width:650px) 156px, 184px';
    if (role === 'thumbnail') return '120px';
    if (role === 'spotlight') return '(max-width:650px) min(calc(100vw - 100px), ' + cap(226) + '), (max-width:900px) min(40vw, ' + cap(275) + '), min(42vw, ' + cap(300) + ')';
    if (role === 'gallery') return '(max-width:650px) min(calc(100vw - 80px), ' + cap(330) + '), min(46vw, ' + cap(426) + ')';
    return '(max-width:650px) min(calc(50vw - 38px), ' + cap(250) + '), (max-width:900px) min(30vw, ' + cap(205) + '), min(23vw, ' + cap(270) + ')';
  }
  function apply(image, source, role) {
    const entry = entries[source];
    if (role === 'logo' && image.closest?.('.site-header')) role = 'logo-header';
    if (entry) {
      image.setAttribute('sizes', sizes(source, role));
      image.setAttribute('srcset', entry.srcset);
    } else {
      image.removeAttribute('srcset');
      image.removeAttribute('sizes');
    }
    // Retain the original as fallback and for the existing enlarged-photo feature.
    image.src = source;
  }
  window.MadhavImages = { apply, sizes, entries };
})();
