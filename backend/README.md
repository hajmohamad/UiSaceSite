# UISACE Go Backend (بک‌اند انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان)

بک‌اند پرسرعت و مدرن با زبان **Golang** و فریم‌ورک‌های **Gin** و **GORM** به همراه پایگاه‌داده SQLite/Postgres، احراز هویت JWT، مدیریت آپلود فایل، سید خودکار داده‌های موجود انجمن و اتصال کامل به فرانت‌اند React + Vite.

---

## 🚀 ویژگی‌ها (Features)

- **ساختار ماژولار و تمیز (Clean Architecture)** بر اساس استانداردهای Go
- **پایگاه‌داده قدرتمند با GORM**: اتصال به SQLite خالص (بدون نیاز به CGO) با قابلیت تعویض آسان به PostgreSQL
- **سید خودکار داده‌ها (Auto-Seeding)**: در اولین اجرا، تمامی اعضا، برنامه‌ها، دوره‌ها و فرصت‌های شغلی اولیه از فایل‌های json تعبیه‌شده در باینری لود و در دیتابیس ذخیره می‌شوند.
- **احراز هویت ادمین با JWT**: صدور توکن امن با انقضای ۷ روزه و رمزنگاری bcrypt
- **آپلود فایل و تصویر**: ذخیره عکس رسید و تصاویر در دایرکتوری `uploads/` با هندلینگ استاتیک
- **سیستم ثبت‌نام رویدادها**: با اعتبارسنجی دانشجویی و آپلود رسید و شمارش خودکار تعداد نفرات ثبت‌نامی
- **سیستم تماس با ما**: دریافت و ثبت پیام‌ها به همراه وضعیت خوانده شده / پاسخ داده شده
- **پنل مدیریت (Admin Endpoints)**: عملیات CRUD کامل برای برنامه‌ها، اعضا، دوره‌ها، فرصت‌های شغلی، ثبت‌نام‌ها و پیام‌ها
- **کانفیگ آماده Docker & Docker Compose**

---

## 🛠 نحوه راه‌اندازی و اجرا

### روش اول: اجرای مستقیم با Go
```bash
cd backend
go run ./cmd/server
```
یا بیلد باینری:
```bash
go build -o server ./cmd/server
./server
```
سرویس روی پورت `http://localhost:8080` در دسترس خواهد بود.

### روش دوم: اجرا با Docker Compose
```bash
cd backend
docker-compose up -d --build
```

---

## 🔑 اطلاعات ورود پیش‌فرض ادمین

- **نام کاربری**: `admin`
- **رمز عبور**: `admin123`
*(قابل تغییر از طریق فایل `.env`)*

---

## 📡 مستندات API (API Documentation)

### عمومی (Public APIs)

| متد | مسیر | توضیحات |
|---|---|---|
| `GET` | `/api/health` | بررسی سلامت سرویس |
| `GET` | `/api/stats` | آمار کلی سایت (تعداد اعضا، برنامه‌ها، دوره‌ها، کارها) |
| `GET` | `/api/programs` | لیست برنامه‌ها (فیلتر: `status`, `year`, `search`) |
| `GET` | `/api/programs/:id` | جزئیات یک برنامه |
| `GET` | `/api/members` | لیست اعضای انجمن (فیلتر: `year`) |
| `GET` | `/api/members/:id` | جزئیات عضو و برنامه‌هایی که در آن‌ها همکاری داشته |
| `GET` | `/api/courses` | لیست دوره‌ها |
| `GET` | `/api/courses/:id` | جزئیات دوره به همراه فصول، ویدیوها و فایل‌ها |
| `GET` | `/api/jobs` | لیست فرصت‌های شغلی |
| `GET` | `/api/jobs/:id` | جزئیات فرصت شغلی |
| `POST` | `/api/registrations` | ثبت‌نام در رویداد (Multipart Form Data با آپلود رسید) |
| `POST` | `/api/contact` | ارسال پیام تماس با ما |
| `POST` | `/api/auth/login` | ورود ادمین و دریافت توکن JWT |

### بخش ادمین (Admin APIs - نیازمند هدر `Authorization: Bearer <token>`)

| متد | مسیر | توضیحات |
|---|---|---|
| `GET` | `/api/admin/me` | دریافت اطلاعات حساب کاربری ادمین |
| `POST` | `/api/admin/upload` | آپلود فایل عمومی و دریافت آدرس آن |
| `POST` | `/api/admin/programs` | ایجاد برنامه جدید |
| `PUT` | `/api/admin/programs/:id` | ویرایش برنامه |
| `DELETE` | `/api/admin/programs/:id` | حذف برنامه |
| `POST` | `/api/admin/members` | ایجاد عضو جدید |
| `PUT` | `/api/admin/members/:id` | ویرایش عضو |
| `DELETE` | `/api/admin/members/:id` | حذف عضو |
| `POST` | `/api/admin/courses` | ایجاد دوره جدید |
| `PUT` | `/api/admin/courses/:id` | ویرایش دوره |
| `DELETE` | `/api/admin/courses/:id` | حذف دوره |
| `POST` | `/api/admin/jobs` | ایجاد فرصت شغلی جدید |
| `PUT` | `/api/admin/jobs/:id` | ویرایش فرصت شغلی |
| `DELETE` | `/api/admin/jobs/:id` | حذف فرصت شغلی |
| `GET` | `/api/admin/registrations` | مشاهده لیست ثبت‌نام‌ها (فیلتر: `programId`, `status`) |
| `PATCH` | `/api/admin/registrations/:id/status` | تغییر وضعیت ثبت‌نام (`approved` / `rejected`) |
| `DELETE` | `/api/admin/registrations/:id` | حذف ثبت‌نام |
| `GET` | `/api/admin/contact` | مشاهده پیام‌های تماس با ما |
| `PATCH` | `/api/admin/contact/:id/status` | تغییر وضعیت پیام (`read` / `replied`) |
| `DELETE` | `/api/admin/contact/:id` | حذف پیام |
