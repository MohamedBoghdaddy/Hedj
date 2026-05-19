# Admin API Testing Checklist

Use an admin JWT from the existing MongoDB auth flow.

## Products

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `PATCH /api/admin/products/:id/stock`
- `PATCH /api/admin/products/:id/status`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/:id/image` with multipart field `image`
- `POST /api/admin/products/:id/gallery` with multipart field `images`
- Confirm public `GET /api/products` hides archived products.

## Users And Employees

- `POST /api/users/me/profile-photo` with multipart field `image`
- `GET /api/admin/employees`
- `POST /api/admin/employees`
- `PUT /api/admin/employees/:id`
- `DELETE /api/admin/employees/:id`
- `POST /api/admin/employees/:id/profile-photo`
- `POST /api/admin/employees/:id/send-invite`

## Leads And Quotes

- `GET /api/admin/leads`
- `POST /api/admin/leads`
- `PUT /api/admin/leads/:id`
- `PATCH /api/admin/leads/:id/status`
- `DELETE /api/admin/leads/:id`
- `GET /api/admin/quotes`
- `POST /api/admin/quotes`
- `PUT /api/admin/quotes/:id`
- `PATCH /api/admin/quotes/:id/status`
- `POST /api/admin/quotes/:id/send`
- `GET /api/admin/quotes/:id/pdf`

Verify quote totals ignore client-provided total values and are calculated from items, discount, and tax.

## Email Outbox

- `GET /api/admin/emails/outbox`
- `GET /api/admin/emails/outbox/:id/logs`
- `POST /api/admin/emails/outbox/:id/send`

With no provider configured, email rows must stay pending and must not be marked sent.

## ERP

- `GET /api/admin/erp/overview`
- `GET /api/admin/erp/apps`
- `GET /api/admin/erp/schema-relations`
- `GET /api/admin/erp/departments`
- `GET /api/admin/erp/job-positions`
- `GET /api/admin/erp/approvals`
- `POST /api/admin/erp/approvals/:id/approve`
- `POST /api/admin/erp/approvals/:id/reject`
- `POST /api/admin/erp/integrations/check`

## Security

- Unauthenticated requests return `401`.
- Non-admin users return `403` on admin APIs.
- Invalid image MIME types are rejected.
- Oversized images are rejected.
- React bundle does not contain `SUPABASE_SERVICE_ROLE_KEY`.
