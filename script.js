document.addEventListener('DOMContentLoaded', function () {
  const cistellaOffcanvasEl = document.getElementById('cistellaOffcanvas');
  const cistellaOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(cistellaOffcanvasEl);
  const resumOffcanvasEl = document.getElementById('resumOffcanvas');
  const resumOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(resumOffcanvasEl);

  // HEADER FIX
  const header = document.querySelector('.main-header');
  const logoCenter = document.getElementById('logoCenter');
  const logoImg = document.querySelector('.logo-img');
  const logoImgScroll = document.querySelector('.logo-img-scroll');

  if (header && logoCenter) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 100) {
        header.classList.add('fixed-header');
        logoImg.style.display = 'none';
        logoImgScroll.style.display = 'block';
      } else {
        header.classList.remove('fixed-header');
        logoImg.style.display = 'block';
        logoImgScroll.style.display = 'none';
      }
    });
    logoCenter.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // SCROLL AMB OFFSET
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      const offset = parseInt(this.getAttribute('data-offset') || '0');
      const headerHeight = document.querySelector('.main-header.fixed-header')?.offsetHeight || 0;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - headerHeight - offset,
        behavior: 'smooth'
      });
      const offcanvas = document.querySelector('#offcanvasMenu');
      if (offcanvas && offcanvas.classList.contains('show')) {
        bootstrap.Offcanvas.getInstance(offcanvas).hide();
      }
    });
  });

  // CISTELLA: CONTADOR
  function updateCartCount() {
    let total = 0;
    document.querySelectorAll('.cistella-item').forEach(item => {
      total += parseInt(item.querySelector('.qty').textContent);
    });
    const badge = document.querySelector('#cistellaOffcanvas .badge');
    if (badge) badge.textContent = total + ' ' + (total === 1 ? 'article' : 'articles');
    checkEmptyCart();
  }

  function updateSubtotal() {
    let total = 0;
    document.querySelectorAll('.cistella-item').forEach(item => {
      const price = parseFloat(item.querySelector('.cistella-preu').textContent.replace(' €', '').replace(',', '.'));
      const qty = parseInt(item.querySelector('.qty').textContent);
      total += price * qty;
    });
    document.querySelector('.total-preu').textContent = total.toFixed(2).replace('.', ',') + ' €';
  }

  function checkEmptyCart() {
    const items = document.querySelectorAll('.cistella-item').length;
    const empty = document.querySelector('.cistella-empty');
    const footer = document.querySelector('.cistella-footer');
    if (items === 0) {
      empty.classList.remove('d-none');
      footer.classList.add('d-none');
    } else {
      empty.classList.add('d-none');
      footer.classList.remove('d-none');
    }
  }

  // AFEGIR PRODUCTE
  document.querySelectorAll('.product-card').forEach(card => {
    const addBtn = card.querySelector('.btn-add-cart');
    const sizeBtns = card.querySelectorAll('.size-btn');
    let selectedSize = 'M';

    sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
      });
    });

    addBtn.addEventListener('click', () => {
      const nom = card.dataset.nom;
      const preu = card.dataset.preu;
      const img = card.dataset.img;
      const fullName = `${nom} (Talla ${selectedSize})`;

      let existing = null;
      document.querySelectorAll('.cistella-item').forEach(item => {
        if (item.querySelector('.cistella-nom').textContent === fullName) existing = item;
      });

      if (existing) {
        const qty = existing.querySelector('.qty');
        qty.textContent = parseInt(qty.textContent) + 1;
      } else {
        const item = document.createElement('div');
        item.className = 'cistella-item';
        item.innerHTML = `
          <div class="cistella-img"><img src="${img}" alt="${nom}"></div>
          <div class="cistella-info">
            <h6 class="cistella-nom">${fullName}</h6>
            <p class="cistella-preu">${preu} €</p>
            <div class="cistella-quantitat">
              <button class="btn-qty btn-minus">-</button>
              <span class="qty">1</span>
              <button class="btn-qty btn-plus">+</button>
            </div>
          </div>
          <button class="btn-eliminar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        `;
        document.querySelector('.cistella-list').appendChild(item);

        item.querySelector('.btn-plus').addEventListener('click', () => {
          const qty = item.querySelector('.qty');
          qty.textContent = parseInt(qty.textContent) + 1;
          updateSubtotal(); updateCartCount();
        });
        item.querySelector('.btn-minus').addEventListener('click', () => {
          const qty = item.querySelector('.qty');
          if (parseInt(qty.textContent) > 1) {
            qty.textContent = parseInt(qty.textContent) - 1;
          } else {
            item.remove();
          }
          updateSubtotal(); updateCartCount();
        });
        item.querySelector('.btn-eliminar').addEventListener('click', () => {
          item.remove();
          updateSubtotal(); updateCartCount();
        });
      }

      updateSubtotal();
      updateCartCount();
      
      cistellaOffcanvas.show();
    });
  });

  // FINALITZAR COMPRA
  document.querySelector('.btn-finalitzar').addEventListener('click', () => {
    generateResum();
    cistellaOffcanvas.hide();
    setTimeout(() => resumOffcanvas.show(), 300);
  });

  function generateResum() {
    const list = document.querySelector('.resum-list');
    list.innerHTML = '';
    let subtotal = 0;
    document.querySelectorAll('.cistella-item').forEach(item => {
      const img = item.querySelector('.cistella-img img').src;
      const nom = item.querySelector('.cistella-nom').textContent;
      const preu = item.querySelector('.cistella-preu').textContent;
      const qty = item.querySelector('.qty').textContent;
      const total = (parseFloat(preu.replace(' €', '').replace(',', '.')) * qty).toFixed(2).replace('.', ',');
      subtotal += parseFloat(preu.replace(' €', '').replace(',', '.')) * qty;

      const div = document.createElement('div');
      div.className = 'resum-item';
      div.innerHTML = `
        <div class="d-flex align-items-center gap-3 p-3 border-bottom border-light-small">
          <div class="resum-img"><img src="${img}" alt="${nom}"></div>
          <div class="flex-grow-1">
            <h6 class="mb-1">${nom}</h6>
            <small class="text-white-50">${qty} × ${preu}</small>
          </div>
          <div class="text-end"><strong class="text-tertiary">${total} €</strong></div>
        </div>
      `;
      list.appendChild(div);
    });
    const str = subtotal.toFixed(2).replace('.', ',');
    document.querySelector('.resum-subtotal').textContent = str + ' €';
    document.querySelector('.resum-total-preu').textContent = str + ' €';
  }

  // LOGIN ÈXIT
  document.getElementById('loginForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (email && password.length >= 6 && email.includes('@') && email.includes('.')) {
      const alert = document.getElementById('loginSuccessAlert');
      alert.classList.remove('d-none');
      setTimeout(() => alert.classList.add('d-none'), 4000);
      this.reset();
    }
  });

  // MODAL COL·LECCIÓ
  document.querySelectorAll('.modal-trigger').forEach(img => {
    img.addEventListener('click', function() {
      const modal = document.getElementById('collectionModal');
      modal.querySelector('#modalImg').src = this.src;
      modal.querySelector('#modalTitle').textContent = this.dataset.title;
      modal.querySelector('#modalDesc').textContent = this.dataset.desc;
    });
  });

  updateSubtotal();
  updateCartCount();

  // TANCAR CISTELLA AMB "CONTINUAR COMPRANT"
  document.getElementById('continueShopping')?.addEventListener('click', function () {
    cistellaOffcanvas.hide();
  });

  // GSAP ANIMACIONS
  const gsap = window.gsap;
  gsap.registerPlugin(ScrollTrigger);

  // Entrada
  gsap.to('.gsap-reveal', {
    duration: 0.8,
    y: 0,
    opacity: 1,
    stagger: 0.1,
    ease: "power3.out",
    delay: 0.3
  });

  // Scroll reveal
  gsap.utils.toArray('.gsap-scroll-reveal').forEach(el => {
    gsap.to(el, {
      duration: 0.8,
      y: 0,
      opacity: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });
  });

  // Product card hover
  document.querySelectorAll('.gsap-info-swap').forEach(card => {
    const img = card.querySelector('.product-img');
    const def = card.querySelector('.info-default');
    const hov = card.querySelector('.info-hover');

    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -8, duration: 0.4 });
      gsap.to(img, { y: -30, duration: 0.6 });
      gsap.to(def, { opacity: 0, duration: 0.3 });
      gsap.to(hov, { opacity: 1, duration: 0.3 });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.3 });
      gsap.to(img, { y: 0, duration: 0.5 });
      gsap.to(def, { opacity: 1, duration: 0.3 });
      gsap.to(hov, { opacity: 0, duration: 0.3 });
    });
  });

  // Header fixed
  ScrollTrigger.create({
    trigger: ".main-header",
    start: "top top",
    onEnter: () => document.querySelector('.main-header').classList.add('fixed'),
    onLeaveBack: () => document.querySelector('.main-header').classList.remove('fixed')
  });
});