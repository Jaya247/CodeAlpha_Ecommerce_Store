// ---- API helpers ----
async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---- Header (auth state + cart count) ----
async function renderHeader() {
  const userSlot = document.getElementById("user-slot");
  const cartCountEl = document.getElementById("cart-count");

  try {
    const user = await api("/auth/me");
    if (userSlot) {
      userSlot.innerHTML = `
        <span class="user-chip">Hi, ${escapeHtml(user.name.split(" ")[0])}</span>
        <a href="/pages/orders.html">Orders</a>
        <a href="#" id="logout-link">Logout</a>
      `;
      document.getElementById("logout-link").addEventListener("click", async (e) => {
        e.preventDefault();
        await api("/auth/logout", { method: "POST" });
        window.location.href = "/";
      });
    }
  } catch {
    if (userSlot) {
      userSlot.innerHTML = `<a href="/pages/login.html">Login</a><a href="/pages/register.html">Register</a>`;
    }
  }

  if (cartCountEl) {
    try {
      const cart = await api("/cart");
      const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      cartCountEl.textContent = count;
      cartCountEl.style.display = count > 0 ? "inline-block" : "none";
    } catch {
      cartCountEl.style.display = "none";
    }
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatPrice(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

document.addEventListener("DOMContentLoaded", renderHeader);
