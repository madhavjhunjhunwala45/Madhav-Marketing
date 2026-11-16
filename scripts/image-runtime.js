/* Generated image candidates are data, never a second copy of the catalogue. */
(() => {
  'use strict';
  const entries = __MADHAV_IMAGE_MANIFEST__;
  function sizes(source, role) {
    const ratio = entries[source]?.ratio || 1;
    // Round the painted width to a CSS pixel. Rounding upward could select a
    // 224px image for a 160.1px pack (or 384px for 320.2px at 2x density).
    const cap = height => Math.round(height * ratio) + 'px';
    if (role === 'logo-header') return '(max-width:360px) 98px, (max-width:650px) 112px, (max-width:900px) 184px, 132px';
    if (role === 'logo') return '(max-width:650px) 132px, 148px';
    if (role === 'thumbnail') return '120px';
    // Match the compact stage's inner height: 250 - 40px on tablets and
    // 280 - 28px on desktop. The image uses object-fit:contain.
    if (role === 'spotlight') return '(max-width:360px) min(calc(100vw - 123px), ' + cap(201) + '), (max-width:650px) min(calc(100vw - 123px), 394px, ' + cap(226) + '), (max-width:900px) min(calc(50vw - 114px), ' + cap(210) + '), (max-width:1150px) min(calc((100vw - 99px) / 2.07 - 92px), ' + cap(252) + '), min(calc((min(100vw - 96px, 1280px) - 56px) / 2.07 - 118px), ' + cap(252) + ')';
    if (role === 'gallery') return '(max-width:650px) min(calc(100vw - 80px), ' + cap(330) + '), min(46vw, ' + cap(426) + ')';
    return '(max-width:650px) min(calc(100vw - 74px), ' + cap(210) + '), (max-width:900px) min(calc(50vw - 85px), ' + cap(250) + '), (max-width:1150px) min(calc(25vw - 71.5px), ' + cap(205) + '), min(calc(25vw - 84px), 260px, ' + cap(240) + ')';
  }
  function apply(image, source, role) {
    const entry = entries[source];
    if (role === 'logo' && image.closest?.('.site-header,.cart-page-header')) role = 'logo-header';
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
