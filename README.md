# Tailoring Storefront

A mobile-friendly online store for a tailoring and clothing business.

**Live demo:** [tailoring-storefront.vercel.app](https://tailoring-storefront.vercel.app/)

<img width="800" alt="Home page of the Tailoring Storefront" src="https://github.com/user-attachments/assets/7cbd6280-1639-437e-9b1a-262aa2888bb8" />

## Features
- Product catalogue with category filters
- Size guide with measuring instructions
- Persistent shopping cart (saved between visits)
- WhatsApp checkout
- Responsive design for phones and desktops

Checkout currently sends the order to the seller on WhatsApp. Card payments are planned (see Roadmap).

## Built with
HTML, CSS and vanilla JavaScript. No frameworks or build step.

## Run locally
1. Clone the repo
2. Open the folder in VS Code
3. Right-click `index.html` and choose **Open with Live Server**

## Configuration
Edit the `CONFIG` block at the top of `script.js` (business name, WhatsApp number, Instagram handle). Add or change products in `products.js`.

## Roadmap
- Card payments with Paystack and server-side payment verification
- Order storage and admin view

