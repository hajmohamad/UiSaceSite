#!/usr/bin/env bash
# ==============================================================================
# 🚀 اسکریپت جامع راه‌اندازی صفر تا صد پروژه انجمن علمی مهندسی کامپیوتر (UISACE)
# دامنه: sace.ui.ac.ir
# این اسکریپت تمام مراحل سرور خام را به صورت تمام‌خودکار انجام می‌دهد.
# ==============================================================================

set -e

# رنگ‌ها برای خروجی زیباتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   🚀 شروع راه‌اندازی خودکار سرور و سرویس‌های sace.ui.ac.ir       ${NC}"
echo -e "${CYAN}================================================================${NC}"

# ۱. بررسی دسترسی روت (Root / Sudo)
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ این اسکریپت برای نصب پکیج‌ها و تنظیم فایروال باید با دسترسی sudo اجرا شود:${NC}"
  echo -e "${YELLOW}   sudo ./setup.sh${NC}"
  exit 1
fi

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"
echo -e "${BLUE}📂 مسیر پروژه:${NC} $PROJECT_DIR"

# ۲. به‌روزرسانی سیستم و نصب پیش‌نیازها
echo -e "\n${YELLOW}📦 [۱/۷] در حال به‌روزرسانی پکیج‌های لینوکس و نصب ابزارهای پایه...${NC}"
apt-get update -y
apt-get install -y curl git ufw ca-certificates gnupg openssl p7zip-full

# ۳. تنظیم و باز کردن پورت‌های فایروال
echo -e "\n${YELLOW}🛡️ [۲/۷] در حال تنظیم فایروال (UFW) و باز کردن پورت‌ها...${NC}"
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Web'
ufw allow 443/tcp comment 'HTTPS Web'
ufw --force enable
echo -e "${GREEN}✅ پورت‌های ۲۲، ۸۰ و ۴۴۳ با موفقیت در فایروال باز شدند.${NC}"

# ۴. بررسی و نصب خودکار Docker و Docker Compose
echo -e "\n${YELLOW}🐳 [۳/۷] در حال بررسی و نصب Docker Engine و Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${BLUE}داکر یافت نشد. در حال نصب رسمی داکر...${NC}"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
  chmod a+r /etc/apt/keyrings/docker.gpg

  UBUNTU_CODENAME="$(. /etc/os-release && echo "$VERSION_CODENAME")"
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $UBUNTU_CODENAME stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable docker
  systemctl start docker
  echo -e "${GREEN}✅ داکر با موفقیت نصب شد.${NC}"
else
  echo -e "${GREEN}✅ داکر از قبل نصب است: $(docker --version)${NC}"
fi

# ۵. تنظیم میرور داکر برای سرورهای ایران (جهت جلوگیری از خطای تحریم)
echo -e "\n${YELLOW}🇮🇷 [۴/۷] بررسی تنظیمات میرور داکر (تحریم‌شکن سرورهای داخل کشور)...${NC}"
mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ] || ! grep -q "registry-mirrors" /etc/docker/daemon.json; then
  cat <<EOF > /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.arvancloud.ir",
    "https://docker.ir",
    "https://hub.iranrepo.ir"
  ]
}
EOF
  systemctl daemon-reload
  systemctl restart docker
  echo -e "${GREEN}✅ میرورهای ایرانی داکر تنظیم و فعال شدند.${NC}"
else
  echo -e "${GREEN}✅ میرورهای داکر از قبل پیکربندی شده‌اند.${NC}"
fi

# ۶. آماده‌سازی و اعتبارسنجی فایل‌های SSL دانشگاه
echo -e "\n${YELLOW}🔒 [۵/۷] بررسی و استقرار گواهی‌های SSL اختصاصی دانشگاه اصفهان...${NC}"
SSL_DIR="$PROJECT_DIR/SSL-Linux"
if [ ! -d "$SSL_DIR" ]; then
  echo -e "${RED}❌ پوشه SSL-Linux در مسیر پروژه یافت نشد!${NC}"
  exit 1
fi

# اگر فایل ui.ac.ir.key وجود نداشت، از آرشیو rar استخراج کن
if [ ! -f "$SSL_DIR/ui.ac.ir.key" ] && [ -f "$SSL_DIR/ui.ac.ir.rar" ]; then
  echo -e "${BLUE}در حال استخراج کلید ui.ac.ir.key از آرشیو rar...${NC}"
  7z x -y "$SSL_DIR/ui.ac.ir.rar" -o"$SSL_DIR/"
fi

# ساخت فایل زنجیره کامل گواهینامه (bundle.crt)
if [ -f "$SSL_DIR/ui.ac.ir.crt" ] && [ -f "$SSL_DIR/certum-chain-another-copy.crt" ]; then
  echo -e "${BLUE}در حال ادغام گواهی اصلی و Intermediate Chain به bundle.crt...${NC}"
  cat "$SSL_DIR/ui.ac.ir.crt" "$SSL_DIR/certum-chain-another-copy.crt" > "$SSL_DIR/bundle.crt"
fi

# اعتبارسنجی نهایی وجود فایل‌ها
if [ ! -f "$SSL_DIR/bundle.crt" ] || [ ! -f "$SSL_DIR/ui.ac.ir.key" ]; then
  echo -e "${RED}❌ فایل‌های SSL کامل نیستند! bundle.crt یا ui.ac.ir.key یافت نشد.${NC}"
  exit 1
fi

chmod 644 "$SSL_DIR/bundle.crt" "$SSL_DIR/ui.ac.ir.key"
echo -e "${GREEN}✅ فایل‌های SSL با موفقیت آماده شدند و در کانتینر Nginx مونت خواهند شد.${NC}"

# ۷. ایجاد پوشه‌های داده‌های ذخیره‌سازی و فایل .env
echo -e "\n${YELLOW}⚙️ [۶/۷] آماده‌سازی دایرکتوری‌های پایگاه داده، آپلود و متغیرهای محیطی...${NC}"
mkdir -p "$PROJECT_DIR/backend/data"
mkdir -p "$PROJECT_DIR/backend/uploads/receipts"
mkdir -p "$PROJECT_DIR/backend/uploads/general"

if [ ! -f "$PROJECT_DIR/.env" ]; then
  echo -e "${BLUE}فایل .env یافت نشد. در حال ایجاد از روی .env.production.example...${NC}"
  cp "$PROJECT_DIR/.env.production.example" "$PROJECT_DIR/.env"
  # تولید یک رشته تصادفی امن برای JWT_SECRET
  RANDOM_SECRET=$(openssl rand -hex 24)
  sed -i "s/super_secret_jwt_random_string_replace_in_production_2026/$RANDOM_SECRET/g" "$PROJECT_DIR/.env"
  echo -e "${GREEN}✅ فایل .env با کلید امن JWT جدید ساخته شد.${NC}"
fi

# ۸. بیلد و اجرای کانتینرهای داکر
echo -e "\n${YELLOW}🚀 [۷/۷] در حال بیلد و بالا آوردن کانتینرهای فرانت‌اند و بک‌اند...${NC}"
docker compose down --remove-orphans 2>/dev/null || true
docker compose up -d --build

# ۹. تست سلامت و راستی‌آزمایی سرویس‌ها
echo -e "\n${CYAN}⏳ در حال بررسی سلامت سرویس‌ها (Health Check)...${NC}"
sleep 5

docker compose ps

echo -e "\n${BLUE}تست اتصال داخلی به بک‌اند از طریق Nginx HTTPS:${NC}"
HEALTH_HTTP_CODE=$(curl -k -s -o /dev/null -w "%{http_code}" https://127.0.0.1/api/health || echo "failed")

if [ "$HEALTH_HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ وضعیت بک‌اند: عالی (HTTP 200 OK)${NC}"
else
  echo -e "${YELLOW}⚠️ توجه: کد پاسخ دریافتی: $HEALTH_HTTP_CODE (کانتینرها در حال راه‌اندازی هستند)${NC}"
fi

echo -e "\n${CYAN}================================================================${NC}"
echo -e "${GREEN}🎉 پروژه با موفقیت کامل راه‌اندازی شد و در حال اجرا است!${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}🌐 آدرس وب‌سایت:      ${NC}https://sace.ui.ac.ir"
echo -e "${GREEN}🔗 تست سلامت API:     ${NC}https://sace.ui.ac.ir/api/health"
echo -e "\n${YELLOW}📌 دستورات کاربردی:${NC}"
echo -e "   مشاهده لاگ‌های زنده:    ${CYAN}docker compose logs -f${NC}"
echo -e "   مشاهده وضعیت کانتینرها: ${CYAN}docker compose ps${NC}"
echo -e "   ری‌استارت سرویس‌ها:      ${CYAN}docker compose restart${NC}"
echo -e "   توقف سرویس‌ها:          ${CYAN}docker compose down${NC}"
echo -e "${CYAN}================================================================${NC}"
