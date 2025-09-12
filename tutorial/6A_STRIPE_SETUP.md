#!/bin/bash
set -e

# Stripe Setup Script
echo "Stripe Setup Script"
echo "=================="

# 1. Create Premium Subscription Product and Price
echo -e "\n1. Creating Premium Subscription Product..."
PREMIUM_SUBSCRIPTION_PRICE_ID=$(stripe prices create \
  --currency=usd \
  --unit-amount=1000 \
  --recurring interval=month \
  --recurring trial_period_days=14 \
  --product-data name="TaskMaster Premium" \
  --id=price_premium_monthly \
  | jq -r '.id')

echo "Created Premium subscription price ID: $PREMIUM_SUBSCRIPTION_PRICE_ID"

# 2. Configure Customer Portal
echo -e "\n2. Configuring Customer Portal..."
CUSTOMER_PORTAL_CONFIG_ID=$(stripe billing_portal configurations create \
  --business-profile privacy_policy_url=https://your-site.com/privacy \
  --business-profile terms_of_service_url=https://your-site.com/terms \
  --default_return_url=http://localhost:3000/profile \
  --features customer_update=enabled \
  --features customer_update allowed_updates=email,address \
  --features subscription_cancel=enabled \
  --features payment_method_update=enabled \
  --features invoice_history=enabled \
  | jq -r '.id')

echo "Created customer portal config ID: $CUSTOMER_PORTAL_CONFIG_ID"

# 3. Set up Webhook (requires ngrok or tunnel)
echo -e "\n3. Setting up Webhook..."
STRIPE_WEBHOOK_SECRET=$(stripe webhook create \
  --url=https://[YOUR-PROJECT-ID].supabase.co/functions/v1/stripe-webhook \
  --events checkout.session.completed \
  --events customer.subscription.deleted \
  --events customer.subscription.updated \
  --events invoice.payment_failed \
  | jq -r '.secret')

echo "Webhook secret: $STRIPE_WEBHOOK_SECRET"

# 4. Collect required values
echo -e "\n4. Collecting Required Values:"
echo "Stripe API Keys:"
stripe config list

echo -e "\nProduct and Price IDs:"
stripe products list
stripe prices list

# 5. Environment Variables Setup
echo -e "\nEnvironment Variables Setup:"
echo "Add these to your .env.test.local file:"
echo "STRIPE_SECRET_KEY=\"$(stripe config get --field=secret_key)\""
echo "STRIPE_PREMIUM_PRICE_ID=\"$PREMIUM_SUBSCRIPTION_PRICE_ID\""
echo "STRIPE_WEBHOOK_SECRET=\"$STRIPE_WEBHOOK_SECRET\""