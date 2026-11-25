const menuGrid = document.getElementById("menu-grid");
const cartList = document.getElementById("cart-list");
const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartCountEl = document.getElementById("cart-count");
const cartMsgEl = document.getElementById("cart-msg");
const checkoutBtn = document.getElementById("checkout-btn");
const filterButtons = document.querySelectorAll(".filter-btn");
const searchInput = document.getElementById("search-input");

let cart = JSON.parse(localStorage.getItem("campus_cart")) || [];
let activeCategory = "all";
let searchQuery = "";

function renderMenu(items) {
  menuGrid.innerHTML = "";

  if (items.length === 0) {
    menuGrid.innerHTML = '<p class="empty-state">No menu items match your filter.</p>';
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div class="card-header">
        <span class="category-tag">${item.category}</span>
        <span class="price">₹${Number(item.price)}</span>
      </div>
      <h3>${item.name}</h3>
      <p style="font-size: 0.85rem; color: #6b7280;">${item.description}</p>
      <button class="btn btn-primary add-btn" data-id="${item.id}">Add to Cart</button>
    `;
    menuGrid.appendChild(card);
  });

  menuGrid.querySelectorAll(".add-btn").forEach((addButton) => {
    addButton.addEventListener("click", () => {
      const id = Number(addButton.dataset.id);
      addToCart(id);
    });
  });
}

function applyFilters() {
  const filtered = MENU_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesSearch;
  });
  renderMenu(filtered);
}

function addToCart(itemId) {
  const found = MENU_ITEMS.find((item) => item.id === itemId);
  if (!found) return;

  const existing = cart.find((item) => item.id === itemId);
  if (existing) {
    existing.qty = Number(existing.qty || 1) + 1;
  } else {
    cart.push({
      id: found.id,
      name: found.name,
      price: Number(found.price),
      qty: 1
    });
  }

  cartMsgEl.textContent = "";
  saveCart();
  renderCart();
}

function updateQuantity(itemId, delta) {
  const index = cart.findIndex((item) => item.id === itemId);
  if (index === -1) return;

  const nextQty = Number(cart[index].qty || 1) + delta;
  if (nextQty <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].qty = nextQty;
  }

  if (cart.length > 0) {
    cartMsgEl.textContent = "";
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("campus_cart", JSON.stringify(cart));
}

function renderCart() {
  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<li class="empty-state">Your cart is empty.</li>';
  } else {
    cart.forEach((item) => {
      const qty = Number(item.qty || 1);
      const lineTotal = Number(item.price) * qty;
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name}</span>
        <div class="qty-controls">
          <button type="button" class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Decrease quantity of ${item.name}">-</button>
          <span>${qty}</span>
          <button type="button" class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Increase quantity of ${item.name}">+</button>
        </div>
        <span>₹${lineTotal}</span>
      `;
      cartList.appendChild(li);
    });

    cartList.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const delta = btn.dataset.action === "inc" ? 1 : -1;
        updateQuantity(id, delta);
      });
    });
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty || 1), 0);
  const totalCount = cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  cartSubtotalEl.textContent = subtotal;
  cartCountEl.textContent = totalCount;
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeCategory = btn.dataset.category || "all";
    applyFilters();
  });
});

searchInput.addEventListener("input", () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  applyFilters();
});

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    cartMsgEl.textContent = "Your cart is empty. Please add an item before proceeding to checkout.";
    return;
  }
  cartMsgEl.textContent = "";
  window.location.href = "pages/checkout.html";
});

// Initialize page
applyFilters();
renderCart();
