# KastBite – Online Food Ordering System

Offline-ready online food ordering system (React + Vite + TypeScript, PWA). It implements the
Level-0 and Level-1 DFDs designed by team COMEBACK.

## Accounts
Everyone signs in with their own email and password. Customers create their own account on the sign-in screen;
staff, riders and extra admins are created by an admin (Admin > User management > Add account).
The avatar menu at the top right opens "My profile" (name, phone, default address, password) and "Sign out".
Admins can also switch between the four views from that menu.

Starter accounts: `customer@kastbite.com` / `customer123`, `staff@kastbite.com` / `staff123`,
`rider@kastbite.com` / `rider123`, `admin@kastbite.com` / `admin123`.

Note: accounts live in the browser's localStorage and passwords use a simple hash. This is fine for a class
project but is not real security; a production system needs a backend with proper password hashing.

## Roles (external entities)
| Role | What it does |
|---|---|
| Customer | Browse menu, order, pay (card gateway simulation or cash), track order |
| Restaurant | Accept or reject incoming orders |
| Delivery person | Take ready orders and mark them delivered |
| Admin | Manage menu, suspend/reactivate users, view payments, deliveries and logs |
| Payment gateway | Simulated: card payments are confirmed instantly |

## Level-1 processes and data stores
| Process | Where in the app | Data store (localStorage key) |
|---|---|---|
| 1.1 Account & admin management | Role sign-in, Admin > User management | D1 Users (`kastbite-users`) |
| 1.2 Menu & order management | Customer menu/checkout, Restaurant queue, Admin menu | D2 Menu & orders (`kastbite-menu`, `kastbite-orders`) |
| 1.3 Payment processing | Checkout payment choice | D3 Payments (`kastbite-payments`) |
| 1.4 Delivery management | Delivery console | D4 Deliveries (`kastbite-deliveries`) |

Activity logs for the admin are kept in `kastbite-logs`.

## Order flow
Placed > (restaurant accepts) Preparing > (rider takes it) Out for Delivery > (rider confirms) Delivered.
A restaurant can also reject an order, which cancels or refunds its payment.

## Run
```
pnpm install
pnpm dev
```
All data is stored in the browser (localStorage), so each device has its own data.

## Live delivery tracking
When a rider takes an order, the customer's tracking screen shows a map with the kitchen, the customer's location and a
moving KastBite marker (a pink pin with a "K"). The map is drawn in SVG so it also works offline. The rider's position is
simulated along the route by default; on the Delivery console the rider can tap "Share my live GPS" to send real GPS
positions instead. Positions are stored in the browser (D4 Deliveries), so tracking works between views/tabs of the same
browser. Tracking between different phones needs a backend (WebSocket or polling API), which is not included yet.

## Live backend (Cloudflare)
`worker/index.ts` is a small Cloudflare Worker with one Durable Object. It keeps the shared orders, payments, deliveries
(including the rider's live position), menu and sections, so a customer, the restaurant, a rider and an admin can each use
their own phone or computer. The app syncs with `POST /api/sync` every 2.5 seconds. If the backend is not available
(for example when the site is hosted as plain static files), the app keeps working from the browser's local storage.

Deploy settings on Cloudflare (Workers Builds):
- Build command: `pnpm exec vite build`
- Deploy command: `npx wrangler deploy` (settings come from `wrangler.jsonc`)

Still stored per device: user accounts. Starter accounts exist on every device; new customer sign-ups stay on the device
where they signed up. Anyone who knows the `/api/sync` address could read the shared data, so add proper sign-in on the
server before using real customer information.
