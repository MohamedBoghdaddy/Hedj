# Hedj Hybrid MongoDB + Supabase Architecture

MongoDB Atlas remains the business source of truth for Hedj Commerce. Supabase is used only for storage-adjacent concerns: image/file storage, image metadata, email templates, email outbox/logs, and email attachments.

## MongoDB Source Of Truth

- Users, auth, roles, and sessions
- Products, pricing, stock, SKU, status, collections, gallery references
- Employees and invitation status references
- Leads and quotes
- ERP apps, departments, positions, approvals, hierarchy data, and integration status snapshots

## Supabase Responsibilities

- Storage buckets:
  - `product-images`
  - `profile-images`
  - `employee-images`
  - `email-attachments`
- Metadata tables:
  - `image_assets`
  - `email_templates`
  - `email_outbox`
  - `email_logs`

## Data Flow

Product image upload:
Admin React UI -> Express admin upload route -> Supabase Storage -> `image_assets` metadata -> MongoDB `Product.imageUrl/imageAssetId`.

Profile photo upload:
React customer dashboard -> Express user upload route -> Supabase Storage -> `image_assets` metadata -> MongoDB `User.profilePhotoUrl/profilePhotoAssetId`.

Employee invite:
Admin React UI -> Express employee invite route -> Supabase `email_outbox` -> configured SMTP/Resend/SendGrid delivery attempt -> MongoDB employee invitation status.

Quote send:
Admin React UI -> Express quote send route -> MongoDB quote lookup -> Supabase `email_outbox` -> configured provider delivery attempt -> MongoDB quote email status reference.

## Security Notes

- `SUPABASE_SERVICE_ROLE_KEY` is read only by `server/config/supabase.js`.
- React never receives or uses the Supabase service role key.
- Admin APIs are protected by the existing JWT auth and require an admin role.
- User profile photo upload updates only the authenticated user.
- Client-provided storage paths are ignored; backend generates safe paths.
- Quote totals are calculated on the backend.
