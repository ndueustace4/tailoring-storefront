(function () {
  "use strict";

  /* ===== EDIT THIS BLOCK FIRST: her details live here ===== */
  var CONFIG = {
    businessName: "Nita's Boutique",
    whatsapp: "2340000000000",   // placeholder country code + number, no + and no spaces
    instagram: "yourhandle",     // without the @
    paystackPublicKey: "",       // paste her pk_test_... key to switch on card payments
    currency: "NGN",
    deliveryNote: "Please confirm the delivery fee."
  };

  var $ = function (s) { return document.querySelector(s); };
  var naira = function (n) { return "₦" + Number(n).toLocaleString("en-NG"); };
  var waLink = function (t) { return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(t); };

  /* ===== Branding and links ===== */
  document.querySelectorAll("[data-name]").forEach(function (e) { e.textContent = CONFIG.businessName; });
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink(a.dataset.wa); a.target = "_blank"; a.rel = "noopener";
  });
  document.querySelectorAll("[data-ig]").forEach(function (a) {
    a.href = "https://instagram.com/" + CONFIG.instagram; a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Instagram @" + CONFIG.instagram;
  });
  $("#yr").textContent = new Date().getFullYear();

  /* ===== Mobile menu ===== */
  var menu = $("#menu"), links = $("#links");
  menu.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    menu.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { links.classList.remove("open"); menu.setAttribute("aria-expanded", "false"); }
  });

  /* ===== Custom outfit request form (opens WhatsApp) ===== */
  $("#orderForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(e.target);
    var text = [
      "New custom order request",
      "Name: " + f.get("name"),
      "Item: " + f.get("item"),
      "Needed by: " + (f.get("date") || "not sure yet"),
      "Details: " + (f.get("details") || "-")
    ].join("\n");
    window.open(waLink(text), "_blank", "noopener");
  });

  /* ===== Shop ===== */
  if (typeof PRODUCTS === "undefined") { return; }
  var byId = function (id) { return PRODUCTS.find(function (p) { return p.id === id; }); };

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem("cart") || "[]"); } catch (e) { cart = []; }
  cart = cart.filter(function (l) { return byId(l.id); });
  var save = function () { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {} };
  var cartCount = function () { return cart.reduce(function (n, l) { return n + l.qty; }, 0); };
  var cartTotal = function () { return cart.reduce(function (n, l) { return n + byId(l.id).price * l.qty; }, 0); };

  function renderProducts(cat) {
    var list = PRODUCTS.filter(function (p) { return cat === "All" || p.category === cat; });
    $("#products").innerHTML = list.map(function (p) {
      return '<article class="product">' +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
        '<h3>' + p.name + '</h3>' +
        '<p class="price">' + naira(p.price) + '</p>' +
        '<div class="szrow"><label for="size-' + p.id + '">Size</label><a class="sg" href="#size-guide">Size guide</a></div>' +
        '<select class="szsel" id="size-' + p.id + '" data-size="' + p.id + '">' +
        p.sizes.map(function (s) { return "<option>" + s + "</option>"; }).join("") +
        '</select>' +
        '<button class="btn primary" data-add="' + p.id + '">Add to cart</button>' +
        '</article>';
    }).join("");
  }

  var cats = ["All"].concat(Array.from(new Set(PRODUCTS.map(function (p) { return p.category; }))));
  $("#filters").innerHTML = cats.map(function (c, i) {
    return '<button class="chip' + (i ? "" : " on") + '" data-cat="' + c + '">' + c + "</button>";
  }).join("");
  $("#filters").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]"); if (!b) return;
    document.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("on", c === b); });
    renderProducts(b.dataset.cat);
  });

  $("#products").addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var id = b.dataset.add;
    var size = document.querySelector('[data-size="' + id + '"]').value;
    var line = cart.find(function (l) { return l.id === id && l.size === size; });
    if (line) { line.qty++; } else { cart.push({ id: id, size: size, qty: 1 }); }
    save(); renderCart();
    b.textContent = "Added";
    setTimeout(function () { b.textContent = "Add to cart"; }, 900);
  });

  /* ===== Cart drawer ===== */
  var drawer = $("#drawer"), overlay = $("#overlay"), form = $("#checkout");

  function renderCart() {
    $("#cartCount").textContent = cartCount();
    $("#cartTotal").textContent = naira(cartTotal());
    var box = $("#cartItems");
    if (!cart.length) {
      box.innerHTML = '<p class="empty">Your cart is empty.</p>';
      form.hidden = true; return;
    }
    form.hidden = false;
    box.innerHTML = cart.map(function (l, i) {
      var p = byId(l.id);
      return '<div class="line"><img src="' + p.image + '" alt="">' +
        '<div><strong>' + p.name + '</strong>' +
        '<div class="muted">Size ' + l.size + ' · ' + naira(p.price) + '</div>' +
        '<div class="qty">' +
        '<button data-q="' + i + '" data-d="-1" aria-label="Decrease quantity">−</button>' +
        '<span>' + l.qty + '</span>' +
        '<button data-q="' + i + '" data-d="1" aria-label="Increase quantity">+</button>' +
        '<button class="rm" data-rm="' + i + '">Remove</button></div></div>' +
        '<strong>' + naira(p.price * l.qty) + '</strong></div>';
    }).join("");
  }

  $("#cartItems").addEventListener("click", function (e) {
    var q = e.target.closest("[data-q]"), r = e.target.closest("[data-rm]");
    if (q) {
      var l = cart[+q.dataset.q]; l.qty += +q.dataset.d;
      if (l.qty < 1) cart.splice(+q.dataset.q, 1);
    } else if (r) {
      cart.splice(+r.dataset.rm, 1);
    } else { return; }
    save(); renderCart();
  });

  function openCart() {
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false; $("#closeCart").focus();
  }
  function closeCart() {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  }
  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });

  /* ===== Checkout ===== */
  function details() {
    var f = new FormData(form);
    return {
      name: String(f.get("name")).trim(), phone: String(f.get("phone")).trim(),
      email: String(f.get("email")).trim(), address: String(f.get("address")).trim()
    };
  }
  function itemsText() {
    return cart.map(function (l) {
      var p = byId(l.id);
      return l.qty + " x " + p.name + " (size " + l.size + ") - " + naira(p.price * l.qty);
    }).join("\n");
  }
  function orderText(d, extra) {
    return ["New order", itemsText(), "Total: " + naira(cartTotal()),
      "Name: " + d.name, "Phone: " + d.phone, "Address: " + d.address, extra || ""]
      .filter(Boolean).join("\n");
  }

  // Option 1: send the order to her on WhatsApp (works with no setup)
  $("#waBtn").addEventListener("click", function () {
    if (!form.reportValidity()) return;
    window.open(waLink(orderText(details(), CONFIG.deliveryNote)), "_blank", "noopener");
  });

  // Option 2: pay by card with Paystack (switches on when a public key is set)
  if (CONFIG.paystackPublicKey) {
    $("#payBtn").hidden = false;
    var s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(s);
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = details();
    if (!d.email) { alert("Please enter your email to pay by card."); return; }
    if (!window.PaystackPop) { alert("Payment is still loading. Try again in a moment."); return; }
    var handler = PaystackPop.setup({
      key: CONFIG.paystackPublicKey,
      email: d.email,
      amount: cartTotal() * 100,          // Paystack uses kobo
      currency: CONFIG.currency,
      ref: "ORD-" + Date.now(),
      metadata: { custom_fields: [
        { display_name: "Name", variable_name: "name", value: d.name },
        { display_name: "Phone", variable_name: "phone", value: d.phone },
        { display_name: "Address", variable_name: "address", value: d.address },
        { display_name: "Items", variable_name: "items", value: itemsText() }
      ] },
      callback: function (res) { paid(d, res.reference); },
      onClose: function () {}
    });
    handler.openIframe();
  });

  function paid(d, ref) {
    var text = orderText(d, "Paid by card. Reference: " + ref);
    cart = []; save(); renderCart();
    $("#cartItems").innerHTML =
      '<p>Thank you! Your payment went through (reference ' + ref + '). ' +
      'Send your order details on WhatsApp so we can start.</p>' +
      '<a class="btn primary" target="_blank" rel="noopener" href="' + waLink(text) + '">Send details on WhatsApp</a>';
  }

  renderProducts("All");
  renderCart();
})();
