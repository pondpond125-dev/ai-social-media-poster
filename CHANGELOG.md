# Changelog

All notable changes to AI Social Media Poster will be documented in this file.

## [5.0.0] - 2025-10-21

### ✨ Added
- **Image-to-Image Generation**: ฟีเจอร์ใหม่ที่ให้คุณอัปโหลดรูปภาพอ้างอิงเพื่อใช้ร่วมกับ prompt ในการสร้างรูปภาพ
  - รองรับการอัปโหลดไฟล์รูปภาพทุกประเภท (JPG, PNG, WebP, etc.)
  - ขนาดไฟล์สูงสุด 10 MB
  - แสดง preview รูปภาพที่อัปโหลด
  - สามารถลบและเปลี่ยนรูปภาพได้
- **File Upload API**: เพิ่ม `/api/upload` endpoint สำหรับอัปโหลดรูปภาพ
  - ใช้ multer สำหรับจัดการ file upload
  - เก็บไฟล์ใน storage system อัตโนมัติ
  - คืนค่า URL ของไฟล์ที่อัปโหลด
- **Reference Image Support**: อัปเดต database schema และ API routers
  - เพิ่ม `referenceImageUrl` field ใน posts table
  - เพิ่ม `referenceImageUrl` field ใน scheduledPosts table
  - รองรับการส่ง reference image ไปยัง Google Gemini AI

### 🔧 Changed
- อัปเดต `posts.create` router ให้รองรับ `referenceImageUrl` parameter
- อัปเดต `scheduledPosts.create` router ให้รองรับ `referenceImageUrl` parameter
- ปรับปรุง UI ในหน้า Home ให้รองรับการอัปโหลดรูปภาพ
- เพิ่ม loading state สำหรับการอัปโหลดรูปภาพ

### 🐛 Fixed
- แก้ไข TypeScript errors ใน server/_core/index.ts
- แก้ไข validation errors ใน scheduledPosts input schema

### 📚 Documentation
- เพิ่มคู่มือการใช้งานฟีเจอร์ Image-to-Image Generation (IMAGE_TO_IMAGE_GUIDE.md)
- เพิ่มตัวอย่างการเขียน prompt ที่ดี
- เพิ่มเทคนิคการใช้งานและการแก้ปัญหา

---

## [4.0.0] - 2025-10-20

### ✨ Added
- **Web Application**: เปลี่ยนจาก Desktop Application เป็น Web Application
  - ใช้ Next.js 14 (App Router), React, TypeScript
  - ใช้ Tailwind CSS สำหรับ styling
  - Dark theme with modern gradient design
- **Authentication**: ระบบ login ด้วย Google Account
- **Settings Page**: หน้าตั้งค่า API keys และ tokens
  - Gemini API Key
  - Facebook Page ID & Token
  - Instagram User ID & Token
  - X (Twitter) Token
  - Upload.post API Key & User (สำหรับ TikTok)
- **History Page**: หน้าแสดงประวัติการโพสต์
  - แสดงรายการโพสต์ที่สร้างแล้ว
  - แสดงโพสต์ที่ตั้งเวลาไว้
  - แสดงสถานะการโพสต์ไปยังแต่ละแพลตฟอร์ม
- **Scheduled Posts**: ระบบตั้งเวลาโพสต์
  - เลือกวันที่และเวลาที่ต้องการโพสต์
  - แสดงรายการโพสต์ที่ตั้งเวลาไว้
  - สามารถยกเลิกโพสต์ที่ตั้งเวลาไว้

### 🔧 Changed
- เปลี่ยนจาก Stable Diffusion เป็น Google Gemini AI สำหรับสร้างรูปภาพ
- ใช้ tRPC สำหรับ API communication
- ใช้ Prisma ORM และ SQLite database
- Deploy บน Manus platform

### 🐛 Fixed
- แก้ไข error ในหน้า Settings ที่ query return undefined
- แก้ไขให้ return null แทน undefined

---

## [3.0.0] - 2025-10-15

### ✨ Added
- **Desktop Application**: สร้าง Desktop Application ด้วย Python + Tkinter
  - GUI ครบถ้วนสำหรับการใช้งาน
  - รองรับการสร้างรูปภาพด้วย AI
  - รองรับการโพสต์ไปยัง 4 แพลตฟอร์ม

### ❌ Deprecated
- Portable Edition ติดตั้งไม่ได้ จึงเปลี่ยนเป็น Web Application แทน

---

## [2.0.0] - 2025-10-12

### ✨ Added
- **n8n Workflow**: สร้าง workflow สำหรับ automation
  - รองรับการสร้างรูปภาพด้วย Hugging Face API
  - รองรับการโพสต์ไปยัง Facebook, Instagram, X, TikTok
  - รองรับการแทรกลิงค์ Affiliate

### 🔧 Changed
- ผู้ใช้ต้องการ Desktop Application แทน n8n workflow

---

## [1.0.0] - 2025-10-10

### ✨ Added
- **Initial Release**: เริ่มต้นโปรเจกต์
- วิจัยและรวบรวมข้อมูล API ต่างๆ
- สร้างเอกสาร requirements และ research findings

---

## Legend

- ✨ Added: ฟีเจอร์ใหม่
- 🔧 Changed: การเปลี่ยนแปลงในฟีเจอร์เดิม
- 🐛 Fixed: การแก้ไขบั๊ก
- ❌ Deprecated: ฟีเจอร์ที่เลิกใช้
- 🔒 Security: การแก้ไขด้านความปลอดภัย
- 📚 Documentation: การอัปเดตเอกสาร

