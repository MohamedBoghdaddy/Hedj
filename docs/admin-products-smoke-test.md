# Admin Products — Smoke Test Runbook

## 1. Restart backend cleanly

```powershell
# Kill anything on 4000
netstat -ano | findstr ":4000"
Stop-Process -Id <PID> -Force

# Start backend
cd server
node server.js
```

Expect startup logs:
```
MongoDB config: using MONGO_URI (...)
Connected to MongoDB Atlas using MONGO_URI.
Server running on port 4000
```

---

## 2. Required environment variables (`server/.env`)

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | ✅ | Atlas direct or +srv connection string |
| `JWT_SECRET` | ✅ | Long random string — change in production |
| `SESSION_SECRET` | ✅ | Long random string — change in production |
| `FRONTEND_URL` | ✅ | `http://localhost:3000` (dev) or Netlify URL |
| `CORS_ORIGIN` | ✅ | Same as FRONTEND_URL |
| `SUPABASE_URL` | Required for uploads | Project URL from Supabase dashboard |
| `SUPABASE_ANON_KEY` | Required for uploads | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for uploads | **Backend only. Never expose to frontend.** |
| `SUPABASE_PRODUCT_IMAGES_BUCKET` | Required for uploads | Default: `product-images` |
| `SUPABASE_PROFILE_IMAGES_BUCKET` | Required for uploads | Default: `profile-images` |
| `SUPABASE_EMPLOYEE_IMAGES_BUCKET` | Required for uploads | Default: `employee-images` |
| `SUPABASE_EMAIL_ATTACHMENTS_BUCKET` | Optional | Default: `email-attachments` |

Required frontend (`src/.env` or Netlify env):

| Variable | Notes |
|---|---|
| `REACT_APP_API_URL` | Render backend URL in production |

### Required Supabase buckets

Create these in Supabase Dashboard → Storage → Buckets (set to **public** for product images):
- `product-images`
- `profile-images`
- `employee-images`
- `email-attachments`

---

## 3. Seed admin user (first deploy only)

```bash
node server/scripts/seed-admin.js
```

Default credentials created:
- Email: `admin@hedj.com`
- Password: `HEDJAdmin2024!`

**Change the password via MongoDB after first login.**

---

## 4. curl smoke tests

### Health check
```bash
curl http://localhost:4000/
# → {"message":"Hedj API is running in mongo mode",...}
```

### No token → 401
```bash
curl http://localhost:4000/api/admin/products
# → {"success":false,"message":"Access denied. No token provided."}
```

### Login and get token
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hedj.com","password":"HEDJAdmin2024!"}' \
  | jq -r .token)
echo $TOKEN
```

### List products (admin)
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/admin/products
# → {"success":true,"count":N,"total":N,"products":[...]}
```

### Create product
```bash
curl -X POST http://localhost:4000/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Console","description":"Test desc","price":5000,"stock":10,"category":"Living","status":"active"}'
# → {"success":true,"product":{...}}
```

### Update product
```bash
curl -X PATCH http://localhost:4000/api/admin/products/<id> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":5500,"stock":8}'
# → {"success":true,"product":{...}}
```

### Update stock
```bash
curl -X PATCH http://localhost:4000/api/admin/products/<id>/stock \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock":15}'
```

### Archive product
```bash
curl -X PATCH http://localhost:4000/api/admin/products/<id>/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"archived"}'
```

### Public visibility (active only)
```bash
curl http://localhost:4000/api/products
# Active products appear; archived/draft do NOT
```

### Image upload (needs SUPABASE_SERVICE_ROLE_KEY)
```bash
curl -X POST http://localhost:4000/api/admin/products/<id>/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/photo.jpg"
# With key: → {"success":true,"product":{...},"imageUrl":"https://..."}
# Without key: → HTTP 503 {"success":false,"message":"Supabase storage is not configured."}
```

---

## 5. Expected HTTP response codes

| Scenario | Expected |
|---|---|
| No token | `401` JSON |
| Invalid/expired token | `403` JSON |
| Non-admin token | `403` JSON |
| Valid admin, good payload | `200` / `201` JSON |
| Missing required fields | `400` JSON |
| Product not found | `404` JSON |
| MongoDB down | `503` JSON |
| Supabase not configured | `503` JSON |
| File too large | `413` JSON |
| Wrong MIME type | `415` JSON |

---

## 6. Deployment checklist (Render + Netlify + Supabase)

### Render (backend)
- [ ] All required env vars set in Render dashboard
- [ ] `MONGO_URI` uses Atlas allowlist for Render IPs (or 0.0.0.0/0)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set and never committed to git
- [ ] `FRONTEND_URL` = Netlify URL (e.g. `https://hedj.netlify.app`)
- [ ] `CORS_ORIGIN` = same Netlify URL
- [ ] Start command: `node server/server.js` from `server/` directory
- [ ] Health check path: `/`

### Netlify (frontend)
- [ ] `REACT_APP_API_URL` = Render backend URL
- [ ] Build command: `npm run build`
- [ ] Publish directory: `build`
- [ ] `_redirects` file: `/* /index.html 200` (for React Router)

### Supabase
- [ ] Project URL and anon key copied to backend `.env`
- [ ] Service role key copied to backend `.env` only (never frontend)
- [ ] Buckets created: `product-images`, `profile-images`, `employee-images`, `email-attachments`
- [ ] Bucket policies: `product-images` public read, others private

### Atlas MongoDB
- [ ] IP allowlist includes Render outbound IPs
- [ ] Admin user seeded: `node server/scripts/seed-admin.js`
- [ ] Admin password changed after first login
