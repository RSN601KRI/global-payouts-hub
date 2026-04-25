# Global Payouts Hub  
### Stablecoin-Powered Cross-Border Payments on Solana

> Pay anyone, anywhere, in seconds — powered by Solana + Dodo Payments

## Overview

Global Payouts Hub is a modern cross-border payments platform designed for SaaS platforms, AI startups, and global teams. It enables businesses to send payouts instantly using stablecoins, eliminating traditional banking delays, high fees, and friction.

By combining **Solana blockchain** for fast, low-cost transactions and **Dodo Payments** for fiat infrastructure, compliance, and global coverage, this app delivers a seamless payment experience.

## Features

- **Global Payouts** — Send money to contractors worldwide
- **Instant Settlement** — Powered by Solana (sub-second transactions)
- **Stablecoin Payments** — USDC-based transfers
- **Fiat On/Off Ramp** — Integrated with Dodo Payments
- **Dashboard & Analytics** — Track payments in real-time
- **Secure Webhooks** — Event-driven payment updates
- **Recurring Payments** — Automate payroll and vendor payouts

## Tech Stack

| Layer        | Technology |
|-------------|-----------|
| Frontend     | Lovable (AI App Builder) |
| Blockchain   | Solana |
| Payments API | Dodo Payments |
| Backend (optional) | Node.js / Express |
| Webhooks     | Dodo Payments + Webhook.site (for testing) |

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/global-payouts-hub.git
cd global-payouts-hub
````

### 2. Get API Keys

1. Sign up on Dodo Payments dashboard
2. Navigate to **Developers → API Keys**
3. Copy:

   * `DODO_PAYMENTS_API_KEY`
   * `DODO_PAYMENTS_WEBHOOK_SECRET`

### 3. Setup Webhook

1. Go to **Developers → Webhooks**
2. Click **Add Endpoint**
3. Use a temporary URL from Webhook.site:

   ```
   https://webhook.site/your-unique-id
   ```
4. Subscribe to:

   * `payment.success`
   * `payment.failed`
   * `payout.completed`
   * `payout.failed`
5. Copy webhook secret

### 4. Add Environment Variables

```env
DODO_PAYMENTS_API_KEY=your_api_key
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Run the App

If using Lovable:

* Add secrets in the dashboard
* Click **Publish**

## Webhook Example (Node.js)

```javascript
app.post("/api/webhooks/dodo", (req, res) => {
  const event = req.body;

  console.log("Webhook received:", event);

  if (event.type === "payment.success") {
    // handle successful payment
  }

  res.sendStatus(200);
});
```

## How It Works

1. User initiates payout from the dashboard
2. App triggers Dodo Payments API
3. Payment settles via Solana (stablecoin transfer)
4. Dodo sends a webhook event
5. App updates UI in real-time

## Use Cases

* Pay global freelancers
* SaaS payroll automation
* AI agent payments
* Creator economy payouts
* Remote team salaries

## Notes

* Use **Test Mode** while developing
* Never expose API keys on the frontend
* Replace Webhook.site with the real backend in production

## Future Improvements

* Multi-chain support (Ethereum, Base)
* Invoice generation system
* KYC integration
* Mobile app version
* Multi-currency wallets

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## Inspiration

Built for global payments innovation using blockchain + fintech infrastructure.
