# Supabase Setup

Run `server/supabase/schema.sql` in the Supabase SQL Editor.

## Required Environment Variables

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PRODUCT_IMAGES_BUCKET=product-images
SUPABASE_PROFILE_IMAGES_BUCKET=profile-images
SUPABASE_EMPLOYEE_IMAGES_BUCKET=employee-images
SUPABASE_EMAIL_ATTACHMENTS_BUCKET=email-attachments
EMAIL_FROM_NAME=Hedj Commerce
EMAIL_FROM_ADDRESS=noreply@hedjcommerce.com
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
RESEND_API_KEY=
SENDGRID_API_KEY=
FRONTEND_URL=http://localhost:3000
```

## Buckets

Create these buckets in Supabase Storage:

- `product-images`
- `profile-images`
- `employee-images`
- `email-attachments`

Product, profile, and employee image buckets must be readable by the public URL strategy used by the app. If you make buckets private, switch callers to signed URLs.

## Schema

The schema creates:

- `email_templates`
- `email_outbox`
- `email_logs`
- `image_assets`

Indexes are included for outbox status, recipient, related entity lookups, logs, and image bucket/path lookups.

## Email Delivery

Emails are queued in Supabase first. Delivery is attempted only when one provider is configured:

- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- Resend: `RESEND_API_KEY`
- SendGrid: `SENDGRID_API_KEY`

If no provider is configured, the outbox row remains pending and the API reports that delivery is not configured. It does not mark the email as sent.
