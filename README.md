# CodeAlpha — Simple E-commerce Store (Task 1)

A full-stack e-commerce store built for the **CodeAlpha Full Stack Development Internship**.

- **Frontend:** HTML, CSS, vanilla JavaScript (no framework, calls the backend via `fetch`)
- **Backend:** Node.js + Express.js
- **Database:** JSON file (`data/db.json`) — no external DB server needed, works out of the box
- **Auth:** Session-based login/register with hashed passwords (bcryptjs)

## Features

- Product listing with category filters and search
- Product details page with quantity selector
- Shopping cart (add / update quantity / remove), stored in the session
- User registration & login (passwords hashed, sessions via cookies)
- Order processing / checkout with a shipping address, stock validation and stock deduction
- Order history page per logged-in user

## Project structure

```
CodeAlpha_Ecommerce_Store/
├── server.js              # Express app entry point
├── package.json
├── data/db.json            # JSON "database" (products, users, orders)
├── models/db.js             # read/write helpers for db.json
├── middleware/auth.js        # requireAuth middleware
├── routes/
│   ├── auth.js              # /api/auth  (register, login, logout, me)
│   ├── products.js          # /api/products
│   ├── cart.js               # /api/cart
│   └── orders.js             # /api/orders (checkout, order history)
└── public/
    ├── css/style.css
    ├── js/common.js          # shared fetch helpers, header, toast
    └── pages/
        ├── index.html         # home / product listing
        ├── product.html        # product detail
        ├── cart.html            # cart + checkout
        ├── login.html
        ├── register.html
        └── orders.html          # order history
```

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open your browser at:
   ```
   http://localhost:3000
   ```

The database starts pre-seeded with 6 sample products, so you can browse immediately. Register a new account to place an order — checkout requires being logged in, but you can add items to the cart as a guest.

## API overview

| Method | Endpoint              | Description                     | Auth required |
|--------|------------------------|----------------------------------|----------------|
| GET    | /api/products           | List products (supports `?category=` and `?search=`) | No |
| GET    | /api/products/:id        | Get one product                  | No |
| POST   | /api/auth/register        | Create an account                | No |
| POST   | /api/auth/login            | Log in                           | No |
| POST   | /api/auth/logout            | Log out                          | No |
| GET    | /api/auth/me                  | Current logged-in user            | Yes |
| GET    | /api/cart                       | View cart                          | No |
| POST   | /api/cart                        | Add item to cart                    | No |
| PUT    | /api/cart/:productId               | Update quantity                       | No |
| DELETE | /api/cart/:productId                 | Remove item                            | No |
| POST   | /api/orders                            | Checkout (creates an order)              | Yes |
| GET    | /api/orders                             | Order history for current user            | Yes |

## Submitting this task (per CodeAlpha instructions)

1. Create a GitHub repo named `CodeAlpha_Ecommerce_Store` and push this code.
2. Record a short video walking through the store (browsing, cart, checkout) and post it on LinkedIn, tagging **@CodeAlpha**, with the GitHub link.
3. Submit the task through the internship Submission Form shared in your WhatsApp group.
