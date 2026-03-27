document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a[data-page]').forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });

  const STORAGE_KEY = 'nightpixel-cart';
  const currency = value => `${Number(value).toLocaleString('ru-RU')} ₽`;
  const getCart = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  };
  const setCart = cart => localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

  const updateBadges = () => {
    const count = getCart().reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count);
  };

  const showToast = text => {
    const toast = document.createElement('div');
    toast.className = 'notice-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 1800);
  };

  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.id;
      const name = button.dataset.name;
      const price = Number(button.dataset.price);
      const cart = getCart();
      const existing = cart.find(item => item.id === id);
      if (existing) existing.qty += 1;
      else cart.push({ id, name, price, qty: 1 });
      setCart(cart);
      updateBadges();
      showToast(`Добавлено в корзину: ${name}`);
    });
  });

  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      document.querySelectorAll('.product-card[data-category]').forEach(card => {
        card.style.display = value === 'all' || card.dataset.category === value ? '' : 'none';
      });
    });
  });

  const cartItems = document.getElementById('cart-items');
  if (cartItems) {
    const empty = document.getElementById('cart-empty');
    const totalNode = document.getElementById('summary-total');
    const countNode = document.getElementById('summary-count');

    const renderCart = () => {
      const cart = getCart();
      cartItems.innerHTML = '';
      empty.style.display = cart.length ? 'none' : 'block';

      let total = 0;
      let count = 0;
      cart.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;
        const row = document.createElement('article');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="cart-row">
            <div>
              <h3>${item.name}</h3>
              <div class="cart-meta">Цена за единицу: ${currency(item.price)}</div>
            </div>
            <strong>${currency(item.price * item.qty)}</strong>
          </div>
          <div class="cart-controls">
            <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
            <span class="qty-badge">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
            <button class="remove-btn" data-action="remove" data-id="${item.id}">Удалить</button>
          </div>`;
        cartItems.appendChild(row);
      });

      totalNode.textContent = currency(total);
      countNode.textContent = count;
      updateBadges();
    };

    cartItems.addEventListener('click', event => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const action = button.dataset.action;
      const id = button.dataset.id;
      let cart = getCart();
      const item = cart.find(entry => entry.id === id);
      if (!item) return;
      if (action === 'plus') item.qty += 1;
      if (action === 'minus') item.qty = Math.max(1, item.qty - 1);
      if (action === 'remove') cart = cart.filter(entry => entry.id !== id);
      setCart(cart);
      renderCart();
    });

    document.getElementById('clear-cart')?.addEventListener('click', () => {
      setCart([]);
      renderCart();
      showToast('Корзина очищена');
    });

    renderCart();
  }

  updateBadges();
});
