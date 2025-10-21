# AI Social Media Poster

เว็บแอปพลิเคชันสำหรับสร้างรูปภาพด้วย AI และโพสต์อัตโนมัติไปยัง Facebook, Instagram, X (Twitter) และ TikTok พร้อมแทรกลิงค์ Affiliate

## ✨ ฟีเจอร์หลัก

### 🎨 การสร้างรูปภาพด้วย AI
- **Text-to-Image**: สร้างรูปภาพจาก prompt ที่คุณกำหนด
- **Image-to-Image**: อัปโหลดรูปภาพอ้างอิงเพื่อสร้างรูปภาพใหม่ที่คล้ายคลึงกัน
- ใช้ Google Gemini AI สำหรับสร้างรูปภาพคุณภาพสูง
- รองรับการอัปโหลดรูปภาพขนาดสูงสุด 10 MB

### 📱 โพสต์หลายแพลตฟอร์ม
- **Facebook**: โพสต์ไปยัง Facebook Page
- **Instagram**: โพสต์ไปยัง Instagram Business Account
- **X (Twitter)**: โพสต์ไปยัง X
- **TikTok**: โพสต์ไปยัง TikTok (private mode)
- เลือกโพสต์ได้หลายแพลตฟอร์มพร้อมกัน

### 💰 ลิงค์ Affiliate
- แทรกลิงค์ Affiliate ใน caption อัตโนมัติ
- รองรับทุกประเภทของลิงค์ Affiliate

### ⏰ ตั้งเวลาโพสต์
- ตั้งเวลาโพสต์ล่วงหน้า
- เลือกวันที่และเวลาที่ต้องการโพสต์
- ดูรายการโพสต์ที่ตั้งเวลาไว้

### 📊 ประวัติการโพสต์
- ดูรายการโพสต์ทั้งหมด
- ตรวจสอบสถานะการโพสต์ไปยังแต่ละแพลตฟอร์ม
- ดูรูปภาพที่สร้างและ caption

### 🔐 ระบบ Authentication
- เข้าสู่ระบบด้วย Google Account
- ปลอดภัยและใช้งานง่าย

## 🚀 การเริ่มต้นใช้งาน

### 1. เข้าสู่ระบบ
เปิดเว็บแอปพลิเคชันและคลิก "เข้าสู่ระบบเพื่อเริ่มใช้งาน" จากนั้นล็อกอินด้วย Google Account

### 2. ตั้งค่า API Keys
คลิกที่เมนู "ตั้งค่า" และกรอก API Keys ต่างๆ:

#### Gemini API Key (จำเป็น)
สำหรับสร้างรูปภาพด้วย AI
- ไปที่ https://makersuite.google.com/app/apikey
- สร้าง API Key
- คัดลอกและวางใน Settings

#### Facebook (ถ้าต้องการโพสต์ไปยัง Facebook)
- **Page ID**: ID ของ Facebook Page
- **Access Token**: Page Access Token

#### Instagram (ถ้าต้องการโพสต์ไปยัง Instagram)
- **User ID**: Instagram Business Account ID
- **Access Token**: Instagram Access Token

#### X/Twitter (ถ้าต้องการโพสต์ไปยัง X)
- **Bearer Token**: X API Bearer Token

#### TikTok (ถ้าต้องการโพสต์ไปยัง TikTok)
- **API Key**: Upload.post API Key
- **User**: Upload.post Username

### 3. สร้างและโพสต์รูปภาพ

#### วิธีที่ 1: Text-to-Image (สร้างจาก Prompt)
1. กรอก Prompt เช่น "A serene landscape with mountains at sunset"
2. กรอก Caption (ไม่บังคับ)
3. กรอก Affiliate Link (ไม่บังคับ)
4. เลือกแพลตฟอร์มที่ต้องการโพสต์
5. คลิก "สร้างและโพสต์เลย"

#### วิธีที่ 2: Image-to-Image (สร้างจากรูปภาพอ้างอิง)
1. กรอก Prompt เช่น "Add a beautiful sunset with orange and pink colors"
2. คลิก "Choose File" และเลือกรูปภาพอ้างอิง
3. กรอก Caption (ไม่บังคับ)
4. กรอก Affiliate Link (ไม่บังคับ)
5. เลือกแพลตฟอร์มที่ต้องการโพสต์
6. คลิก "สร้างและโพสต์เลย"

#### ตั้งเวลาโพสต์
1. ติ๊กช่อง "ตั้งเวลาโพสต์"
2. เลือกวันที่และเวลา
3. คลิก "ตั้งเวลาโพสต์"

### 4. ดูประวัติ
คลิกที่เมนู "ประวัติ" เพื่อดูรายการโพสต์ทั้งหมดและโพสต์ที่ตั้งเวลาไว้

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui

### Backend
- **API**: tRPC
- **Database**: MySQL (via Drizzle ORM)
- **Authentication**: Manus Auth (Google OAuth)
- **File Storage**: Manus Storage Service
- **Image Generation**: Google Gemini AI

### Deployment
- **Platform**: Manus WebDev
- **Server**: Node.js + Express

## 📖 เอกสารเพิ่มเติม

- [คู่มือการใช้งานฟีเจอร์ Image-to-Image](../IMAGE_TO_IMAGE_GUIDE.md)
- [Changelog](./CHANGELOG.md)
- [วิธีการรับ API Tokens](../upload_post_api_info.md)

## 🎯 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: สร้างรูปภาพสำหรับโปรโมทสินค้า
```
Prompt: "A professional product photography of a smartphone on a clean 
white background with dramatic lighting"

Caption: "🔥 New smartphone just arrived! Limited stock available!"

Affiliate Link: "https://example.com/affiliate/smartphone123"

Platforms: Facebook, Instagram, X
```

### ตัวอย่างที่ 2: สร้างรูปภาพจากรูปเดิม
```
Prompt: "Transform this landscape into a magical fantasy scene with 
glowing flowers and mystical fog"

Reference Image: [อัปโหลดรูปภาพ landscape]

Caption: "✨ Discover the magic of nature! #Fantasy #Nature"

Affiliate Link: "https://example.com/affiliate/travel"

Platforms: Instagram, TikTok
```

### ตัวอย่างที่ 3: ตั้งเวลาโพสต์
```
Prompt: "A delicious breakfast spread with coffee, pancakes, and fruits"

Caption: "Good morning! Start your day right 🌅 #Breakfast #FoodLover"

Scheduled Time: Tomorrow at 7:00 AM

Platforms: Facebook, Instagram
```

## 🔧 การพัฒนา

### ติดตั้ง Dependencies
```bash
pnpm install
```

### รัน Development Server
```bash
pnpm dev
```

### Build สำหรับ Production
```bash
pnpm build
```

### รัน Production Server
```bash
pnpm start
```

## 📝 โครงสร้างโปรเจกต์

```
ai-social-poster-web/
├── client/                 # Frontend code
│   ├── src/
│   │   ├── pages/         # React pages
│   │   │   ├── Home.tsx   # หน้าหลัก
│   │   │   ├── Settings.tsx # หน้าตั้งค่า
│   │   │   └── History.tsx  # หน้าประวัติ
│   │   ├── components/    # React components
│   │   └── lib/          # Utilities
│   └── public/           # Static files
├── server/                # Backend code
│   ├── _core/            # Core functionality
│   │   ├── index.ts      # Express server
│   │   ├── imageGeneration.ts # AI image generation
│   │   └── trpc.ts       # tRPC setup
│   ├── routers.ts        # API routes
│   ├── db.ts            # Database functions
│   └── storage.ts       # File storage
├── drizzle/              # Database schema
│   └── schema.ts        # Database tables
├── shared/               # Shared types
└── package.json         # Dependencies
```

## 🐛 การแก้ปัญหา

### ปัญหา: อัปโหลดรูปภาพไม่ได้
- ตรวจสอบว่าไฟล์เป็นรูปภาพจริง (JPG, PNG, WebP, etc.)
- ตรวจสอบขนาดไฟล์ไม่เกิน 10 MB
- ลองเปลี่ยนเบราว์เซอร์หรือล้าง cache

### ปัญหา: สร้างรูปภาพไม่สำเร็จ
- ตรวจสอบว่าได้ตั้งค่า Gemini API Key แล้ว
- ตรวจสอบว่า API Key ยังใช้งานได้
- ลองเขียน prompt ใหม่ให้ชัดเจนขึ้น

### ปัญหา: โพสต์ไปยังแพลตฟอร์มไม่สำเร็จ
- ตรวจสอบว่าได้ตั้งค่า API Keys ของแพลตฟอร์มนั้นๆ แล้ว
- ตรวจสอบว่า Token ยังไม่หมดอายุ
- สำหรับ Facebook/Instagram: ตรวจสอบว่า Page/Business Account มีสิทธิ์โพสต์

## 📞 ติดต่อและสนับสนุน

หากมีคำถามหรือต้องการความช่วยเหลือ:
- 📧 ติดต่อผ่าน: https://help.manus.im
- 🐛 รายงานปัญหา: https://help.manus.im
- 💡 แนะนำฟีเจอร์ใหม่: https://help.manus.im

## 📜 License

MIT License - ใช้งานได้อย่างอิสระ

## 🙏 ขอบคุณ

- Google Gemini AI สำหรับ image generation
- Manus Platform สำหรับ hosting และ infrastructure
- shadcn/ui สำหรับ UI components
- ชุมชน open source ทั้งหมด

---

**เวอร์ชัน**: 5.0.0 (Image-to-Image Generation)  
**อัปเดตล่าสุด**: 21 ตุลาคม 2025  
**ผู้พัฒนา**: AI Social Media Poster Team

🚀 **เริ่มต้นใช้งานได้ทันที!**

