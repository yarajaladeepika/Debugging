const checkoutItemsEl = document.getElementById("checkout-items");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const discountEl = document.getElementById("discount");
const grandTotalEl = document.getElementById("grand-total");

const promoInput = document.getElementById("promo-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoMsgEl = document.getElementById("promo-msg");

const orderForm = document.getElementById("order-form");
const studentNameInput = document.getElementById("student-name");
const rollNumberInput = document.getElementById("roll-number");
const orderMsgEl = document.getElementById("order-msg");

let cart = JSON.parse(localStorage.getItem("campus_cart")) || [];
let discountAmount = 0;

function calculateSubtotal() {
  return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty || 1), 0);
}

function calculateTotals() {
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.05;
  const grandTotal = Math.max(0, subtotal + tax - discountAmount);
  return { subtotal, tax, grandTotal };
}

function renderCheckout() {
  checkoutItemsEl.innerHTML = "";

  if (cart.length === 0) {
    checkoutItemsEl.innerHTML = '<li class="empty-state">No items found in your order.</li>';
  } else {
    cart.forEach((item) => {
      const qty = Number(item.qty || 1);
      const li = document.createElement("li");
      li.className = "cart-row";
      li.innerHTML = `
        <span>${item.name} × ${qty}</span>
        <span>₹${(Number(item.price) * qty).toFixed(2)}</span>
      `;
      checkoutItemsEl.appendChild(li);
    });
  }

  const { subtotal, tax, grandTotal } = calculateTotals();

  subtotalEl.textContent = subtotal.toFixed(2);
  taxEl.textContent = tax.toFixed(2);
  discountEl.textContent = discountAmount.toFixed(2);
  grandTotalEl.textContent = grandTotal.toFixed(2);
}

function generateOrderId() {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `CC-${randomDigits}`;
}

applyPromoBtn.addEventListener("click", () => {
  const code = promoInput.value.trim().toUpperCase();
  const subtotal = calculateSubtotal();

  if (code !== "STUDENT15") {
    discountAmount = 0;
    promoMsgEl.className = "msg-error";
    promoMsgEl.textContent = "Invalid promo code. Use STUDENT15 on orders of ₹150 or more.";
    renderCheckout();
    return;
  }

  if (subtotal < 150) {
    discountAmount = 0;
    promoMsgEl.className = "msg-error";
    promoMsgEl.textContent = "Promo code STUDENT15 requires a subtotal of ₹150 or more.";
    renderCheckout();
    return;
  }

  discountAmount = Number((subtotal * 0.15).toFixed(2));
  promoMsgEl.className = "msg-success";
  promoMsgEl.textContent = `Promo code STUDENT15 applied! 15% discount (-₹${discountAmount.toFixed(2)}) added.`;
  renderCheckout();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (cart.length === 0) {
    orderMsgEl.className = "msg-error";
    orderMsgEl.textContent = "Your cart is empty. Please add items before confirming your order.";
    return;
  }

  const studentName = studentNameInput.value.trim();
  const rollNumber = rollNumberInput.value.trim();

  if (!studentName || !rollNumber) {
    orderMsgEl.className = "msg-error";
    orderMsgEl.textContent = "Please enter both your Full Name and Roll Number.";
    return;
  }

  const { grandTotal } = calculateTotals();
  const orderId = generateOrderId();

  cart = [];
  discountAmount = 0;
  localStorage.removeItem("campus_cart");
  promoInput.value = "";
  promoMsgEl.textContent = "";
  orderForm.reset();
  renderCheckout();

  orderMsgEl.className = "msg-success";
  orderMsgEl.textContent = `Order confirmed! Order ID: ${orderId} for ${studentName} (${rollNumber}). Total: ₹${grandTotal.toFixed(2)}.`;
});

renderCheckout();
