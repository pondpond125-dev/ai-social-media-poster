# Supabase Configuration for AI Social Media Poster

## ✅ Supabase Project Created

**Project Details:**
- **Name:** ai-social-poster
- **Project ID:** txjlntoqwdkyqfeswgke
- **Region:** ap-southeast-1 (Singapore)
- **Status:** ACTIVE_HEALTHY
- **PostgreSQL Version:** 17.6.1
- **Cost:** $0/month (Free tier)

## 🔑 API Keys

### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amxudG9xd2RreXFmZXN3Z2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzc1NDcsImV4cCI6MjA3NjYxMzU0N30.Cz2vsPxP82VZRydyzSKvkoDitP3g1WxUymqnknv27vo
```

### Service Role Key (Private)
> ⚠️ ต้องดึงจาก Supabase Dashboard: https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/api

## 🔗 Connection Strings

### REST API URL
```
https://txjlntoqwdkyqfeswgke.supabase.co
```

### Database Connection (Direct)
```
postgresql://postgres.[txjlntoqwdkyqfeswgke]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

> **หมายเหตุ:** Database password ต้องดึงจาก Supabase Dashboard:
> https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/database

### Database Connection (Pooler - แนะนำสำหรับ Production)
```
postgresql://postgres.[txjlntoqwdkyqfeswgke]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 📊 Database Schema

สร้าง 5 tables แล้ว:
1. ✅ **users** - ผู้ใช้งาน
2. ✅ **api_configs** - API keys configuration
3. ✅ **posts** - โพสต์ที่สร้าง
4. ✅ **scheduled_posts** - โพสต์ที่ตั้งเวลา
5. ✅ **facebook_pages** - Facebook Pages

## 🔧 Environment Variables

เพิ่ม environment variables เหล่านี้ใน `.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://txjlntoqwdkyqfeswgke.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4amxudG9xd2RreXFmZXN3Z2tlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwMzc1NDcsImV4cCI6MjA3NjYxMzU0N30.Cz2vsPxP82VZRydyzSKvkoDitP3g1WxUymqnknv27vo
SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_DASHBOARD]

# Database Connection (Direct)
DATABASE_URL=postgresql://postgres.[txjlntoqwdkyqfeswgke]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# หรือใช้ Pooler (แนะนำ)
DATABASE_URL=postgresql://postgres.[txjlntoqwdkyqfeswgke]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## 📝 ขั้นตอนต่อไป

### 1. ดึง Database Password
1. ไปที่ https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/database
2. คัดลอก **Database Password**
3. แทนที่ `[YOUR-PASSWORD]` ใน `DATABASE_URL`

### 2. ดึง Service Role Key
1. ไปที่ https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/api
2. คัดลอก **service_role** key
3. แทนที่ `[GET_FROM_DASHBOARD]` ใน `SUPABASE_SERVICE_ROLE_KEY`

### 3. อัปเดตโค้ด
- แปลง Drizzle schema จาก MySQL เป็น PostgreSQL
- อัปเดต database connection
- ทดสอบการเชื่อมต่อ

### 4. Deploy
- Push โค้ดไปยัง GitHub
- อัปเดต environment variables ใน production
- Rebuild production deployment

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke
- **API Settings:** https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/api
- **Database Settings:** https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/settings/database
- **Table Editor:** https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/editor
- **SQL Editor:** https://supabase.com/dashboard/project/txjlntoqwdkyqfeswgke/sql

## ⚠️ Security Notes

1. **ห้าม commit** Service Role Key ลง Git
2. **ใช้ Environment Variables** สำหรับ sensitive data
3. **ใช้ Pooler** สำหรับ production (เพื่อ connection pooling)
4. **Enable RLS (Row Level Security)** สำหรับ tables ที่ต้องการ security

## 📚 Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Drizzle ORM PostgreSQL:** https://orm.drizzle.team/docs/get-started-postgresql
- **Supabase + Drizzle:** https://supabase.com/docs/guides/database/drizzle

---

**สถานะ:** ✅ Database พร้อมใช้งาน  
**ขั้นตอนต่อไป:** ดึง credentials และอัปเดตโค้ด

