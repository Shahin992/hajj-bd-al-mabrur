/* Al-Mabrur Hajj & Umrah — navigation, header and forms. Animations live in motion.js.
   Progressive enhancement only; the page works without this file. */
(() => {
  const WA_NUMBER = '8801190468215';

  /* Sticky header shadow */
  const header = document.querySelector('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile navigation */
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });
  }

  /* Finder + enquiry forms → prefilled WhatsApp message */
  document.querySelectorAll('[data-wa-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const lines = ['আসসালামু আলাইকুম, আমি আল-মাবরুর হজ ও ওমরাহ থেকে একটি কোটেশন চাই।'];
      // Use each field's visible Bangla label and option text, not its English name/value
      [...form.elements].forEach((el) => {
        if (!el.name || !String(el.value).trim()) return;
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');
        const choice = el.type === 'radio' || el.type === 'checkbox';
        const label = choice ? text(el.closest('fieldset')?.querySelector('legend')) || el.name : text(el.labels?.[0]) || el.name;
        const value = el.tagName === 'SELECT' ? text(el.selectedOptions[0]) : choice ? text(el.labels?.[0]) || el.value : el.value.trim();
        lines.push(`${label}: ${value}`);
      });
      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  });

  /* Footer year */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear().toLocaleString('bn-BD', { useGrouping: false });
})();
