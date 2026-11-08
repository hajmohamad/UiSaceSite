#!/usr/bin/env bash
# ==============================================================================
# 🚀 اسکریپت خودکار استقرار پروژه انجمن علمی مهندسی کامپیوتر دانشگاه اصفهان (UISACE)
# دامنه: sace.ui.ac.ir
# این اسکریپت بیلد را به صورت لوکال انجام داده و خروجی را به سرور منتقل و اجرا می‌کند.
# ==============================================================================

set -e

# رنگ‌ها جهت زیباتر شدن خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # بدون رنگ

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# ۱. بارگذاری تنظیمات از فایل .deploy.env در صورت وجود
if [ -f "$PROJECT_ROOT/.deploy.env" ]; then
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.deploy.env"
fi

# مقادیر پیش‌فرض
SERVER_IP="${SERVER_IP:-192.168.48.151}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
REMOTE_DIR="${REMOTE_DIR:-/root/UiSaceSite}"
TARGET_ARCH="${TARGET_ARCH:-amd64}"
SSH_KEY="${SSH_KEY:-}"

DRY_RUN=false
SKIP_BUILD=false
SKIP_PING=false

# نمایش راهنما
show_help() {
  echo -e "${CYAN}================================================================${NC}"
  echo -e "${BOLD}🚀 راهنمای دستور استقرار خودکار UISACE${NC}"
  echo -e "${CYAN}================================================================${NC}"
  echo -e "استفاده: ./deploy.sh [گزینه‌ها]"
  echo -e ""
  echo -e "گزینه‌ها:"
  echo -e "  ${YELLOW}--dry-run${NC}         فقط بیلد لوکال را انجام می‌دهد و فایلی به سرور ارسال نمی‌کند."
  echo -e "  ${YELLOW}--skip-build${NC}      از مرحله بیلد لوکال رد شده و فایل‌های بیلد موجود را ارسال می‌کند."
  echo -e "  ${YELLOW}--skip-ping${NC}       تست ارتباط شبکه اولیه را نادیده می‌گیرد."
  echo -e "  ${YELLOW}--ip <IP>${NC}         تغییر آی‌پی سرور (پیش‌فرض: 192.168.48.151)"
  echo -e "  ${YELLOW}--user <USER>${NC}     تغییر نام کاربری سرور (پیش‌فرض: root)"
  echo -e "  ${YELLOW}--port <PORT>${NC}     تغییر پورت SSH (پیش‌فرض: 22)"
  echo -e "  ${YELLOW}--key <PATH>${NC}      مسیر کلید SSH اختصاصی (مثال: ~/.ssh/id_ed25519)"
  echo -e "  ${YELLOW}--arch <ARCH>${NC}     معماری پردازنده سرور (پیش‌فرض: amd64)"
  echo -e "  ${YELLOW}-h, --help${NC}        نمایش این راهنما"
  echo -e ""
  echo -e "مثال‌ها:"
  echo -e "  ./deploy.sh"
  echo -e "  ./deploy.sh --dry-run"
  echo -e "  ./deploy.sh --ip 192.168.48.151 --key ~/.ssh/id_ed25519"
  exit 0
}

# پارس کردن آرگومان‌های ورودی
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --skip-ping)
      SKIP_PING=true
      shift
      ;;
    --ip)
      SERVER_IP="$2"
      shift 2
      ;;
    --user)
      SERVER_USER="$2"
      shift 2
      ;;
    --port)
      SERVER_PORT="$2"
      shift 2
      ;;
    --key)
      SSH_KEY="$2"
      shift 2
      ;;
    --arch)
      TARGET_ARCH="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      ;;
    *)
      echo -e "${RED}❌ گزینه ناشناخته: $1${NC}"
      echo -e "برای مشاهده راهنما از ${YELLOW}./deploy.sh --help${NC} استفاده کنید."
      exit 1
      ;;
  esac
done

# تنظیم آپشن کلید SSH
SSH_KEY_ARG=""
if [ -n "$SSH_KEY" ]; then
  SSH_KEY_ARG="-i $SSH_KEY"
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_KEY_ARG="-i $HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_rsa" ]; then
  SSH_KEY_ARG="-i $HOME/.ssh/id_rsa"
fi

SSH_CMD="ssh -p $SERVER_PORT $SSH_KEY_ARG -o StrictHostKeyChecking=accept-new"
SCP_CMD="scp -P $SERVER_PORT $SSH_KEY_ARG -o StrictHostKeyChecking=accept-new"

echo -e "\n${CYAN}================================================================${NC}"
echo -e "${BOLD}${CYAN}   🚀 فرآیند بیلد و استقرار پروژه انجمن علمی مهندسی کامپیوتر     ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${BLUE}🎯 سرور مقصد:${NC}      ${BOLD}$SERVER_USER@$SERVER_IP:$SERVER_PORT${NC}"
echo -e "${BLUE}📂 مسیر در سرور:${NC}    $REMOTE_DIR"
echo -e "${BLUE}💻 معماری هدف:${NC}     linux/$TARGET_ARCH"
if [ "$DRY_RUN" = true ]; then
  echo -e "${PURPLE}🔍 حالت:${NC}             Dry Run (فقط تست بیلد لوکال)"
fi
echo -e "${CYAN}----------------------------------------------------------------${NC}"

# ==============================================================================
# مرحله ۱: بررسی پیش‌نیازهای سیستم لوکال
# ==============================================================================
echo -e "\n${YELLOW}🔍 [۱/۵] در حال بررسی پیش‌نیازهای لوکال...${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ Node.js نصب نیست! لطفاً Node.js را نصب کنید.${NC}"
  exit 1
fi

if ! command -v npm &>/dev/null; then
  echo -e "${RED}❌ npm نصب نیست!${NC}"
  exit 1
fi

if ! command -v go &>/dev/null; then
  echo -e "${RED}❌ Golang نصب نیست! برای کامپایل بک‌اند نیاز به Go دارید.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ ابزارهای لوکال آماده هستند: Node $(node -v) | $(go version | awk '{print $3}') | npm v$(npm -v)${NC}"

# بررسی اتصال به سرور (در صورتی که dry-run نباشد)
if [ "$DRY_RUN" = false ] && [ "$SKIP_PING" = false ]; then
  echo -e "\n${YELLOW}📡 در حال تست اتصال اولیه به سرور ($SERVER_IP)...${NC}"
  if ! $SSH_CMD -o ConnectTimeout=4 "$SERVER_USER@$SERVER_IP" "echo 'SSH_OK'" &>/dev/null; then
    echo -e "${RED}❌ برقراری ارتباط SSH با سرور $SERVER_USER@$SERVER_IP برقرار نشد!${NC}"
    echo -e "${YELLOW}💡 نکات راهنما:${NC}"
    echo -e "   ۱. اگر آی‌پی $SERVER_IP مربوط به شبکه داخلی دانشگاه است، مطمئن شوید به ${BOLD}VPN دانشگاه اصفهان${NC} یا اینترنت داخل دانشگاه متصل هستید."
    echo -e "   ۲. اگر فیلترشکن لوکال با قابلیت TUN (مثل v2rayN/sing-box) فعال است، ممکن است روت آی‌پی‌های محلی را مسدود کرده باشد."
    echo -e "   ۳. مطمئن شوید کلید SSH شما به سرور اضافه شده یا پورت SSH صحیح است."
    echo -e "\nآیا می‌خواهید با وجود عدم برقراری تست اولیه، ادامه دهید؟ (y/N) "
    read -r CONTINUE_CHOICE
    if [[ ! "$CONTINUE_CHOICE" =~ ^[Yy]$ ]]; then
      echo -e "${RED}عملیات لغو شد.${NC}"
      exit 1
    fi
  else
    echo -e "${GREEN}✅ ارتباط SSH با سرور با موفقیت تایید شد.${NC}"
  fi
fi

# ==============================================================================
# مرحله ۲: بیلد پروژه‌ها روی سیستم لوکال
# ==============================================================================
if [ "$SKIP_BUILD" = false ]; then
  echo -e "\n${YELLOW}🔨 [۲/۵] در حال بیلد فرانت‌اند React با Vite...${NC}"
  npm run build
  if [ ! -f "$PROJECT_ROOT/dist/index.html" ]; then
    echo -e "${RED}❌ بیلد فرانت‌اند با شکست مواجه شد! فایل dist/index.html یافت نشد.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ بیلد فرانت‌اند با موفقیت تولید شد ($(du -sh "$PROJECT_ROOT/dist" | awk '{print $1}')).${NC}"

  echo -e "\n${YELLOW}🔨 در حال کراس‌کامپایل بک‌اند Go برای لینوکس (GOOS=linux GOARCH=$TARGET_ARCH)...${NC}"
  (
    cd "$PROJECT_ROOT/backend"
    CGO_ENABLED=0 GOOS=linux GOARCH="$TARGET_ARCH" go build -ldflags="-w -s" -o server_linux ./cmd/server
  )
  if [ ! -f "$PROJECT_ROOT/backend/server_linux" ]; then
    echo -e "${RED}❌ کامپایل بک‌اند لینوکس با شکست مواجه شد!${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ باینری لینوکس بک‌اند با موفقیت کامپایل شد ($(du -sh "$PROJECT_ROOT/backend/server_linux" | awk '{print $1}')).${NC}"
else
  echo -e "\n${YELLOW}⏩ [۲/۵] عبور از مرحله بیلد لوکال (--skip-build)${NC}"
  if [ ! -f "$PROJECT_ROOT/dist/index.html" ] || [ ! -f "$PROJECT_ROOT/backend/server_linux" ]; then
    echo -e "${RED}❌ فایل‌های بیلد قبلی کامل نیستند! لطفاً اسکریپت را بدون --skip-build اجرا کنید.${NC}"
    exit 1
  fi
fi

# اگر فقط dry-run بود، اینجا کار تمام است
if [ "$DRY_RUN" = true ]; then
  echo -e "\n${GREEN}================================================================${NC}"
  echo -e "${GREEN}🎉 حالت Dry-Run به پایان رسید. تمام فایل‌ها با موفقیت بیلد شدند:${NC}"
  echo -e "   - فرانت‌اند: $PROJECT_ROOT/dist"
  echo -e "   - باینری لینوکس: $PROJECT_ROOT/backend/server_linux"
  echo -e "${CYAN}برای ارسال به سرور، دستور را بدون --dry-run اجرا نمایید.${NC}"
  echo -e "${GREEN}================================================================${NC}"
  exit 0
fi

# ==============================================================================
# مرحله ۳: آماده‌سازی و بکاپ‌گیری امن در سرور
# ==============================================================================
echo -e "\n${YELLOW}🛡️ [۳/۵] آماده‌سازی دایرکتوری‌ها و پشتیبان‌گیری از دیتابیس در سرور...${NC}"

$SSH_CMD "$SERVER_USER@$SERVER_IP" bash -s << REMOTE_PREPARE
set -e
mkdir -p "$REMOTE_DIR/backend/data"
mkdir -p "$REMOTE_DIR/backend/uploads/receipts"
mkdir -p "$REMOTE_DIR/backend/uploads/general"
mkdir -p "$REMOTE_DIR/nginx"

# بکاپ‌گیری خودکار از دیتابیس فعلی در صورت وجود
if [ -f "$REMOTE_DIR/backend/data/uisace.db" ]; then
  BACKUP_FILE="$REMOTE_DIR/backend/data/uisace.db.bak_\$(date +%Y%m%d_%H%M%S)"
  cp "$REMOTE_DIR/backend/data/uisace.db" "\$BACKUP_FILE"
  echo "✅ بکاپ دیتابیس تهیه شد: \$BACKUP_FILE"
fi

# ایجاد شبکه uisace-net در صورت عدم وجود
docker network create uisace-net 2>/dev/null || true
REMOTE_PREPARE

# ==============================================================================
# مرحله ۴: انتقال فایل‌های بیلد شده به سرور
# ==============================================================================
echo -e "\n${YELLOW}📦 [۴/۵] در حال انتقال فایل‌ها به سرور مقصد...${NC}"

# بررسی وجود rsync در سیستم لوکال
if command -v rsync &>/dev/null; then
  echo -e "${BLUE}در حال ارسال با rsync (فشرده و بهینه)...${NC}"
  RSYNC_SSH="ssh -p $SERVER_PORT $SSH_KEY_ARG -o StrictHostKeyChecking=accept-new"

  # ۱. انتقال پوشه dist فرانت‌اند
  rsync -avz --delete -e "$RSYNC_SSH" "$PROJECT_ROOT/dist/" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/dist/"

  # ۲. انتقال باینری سرور لینوکس به عنوان server در مقصد
  rsync -avz -e "$RSYNC_SSH" "$PROJECT_ROOT/backend/server_linux" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/backend/server"

  # ۳. انتقال کانفیگ Nginx
  rsync -avz -e "$RSYNC_SSH" "$PROJECT_ROOT/nginx/default.conf" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/nginx/default.conf"

  # ۴. انتقال فایل docker-compose.prod.yml
  rsync -avz -e "$RSYNC_SSH" "$PROJECT_ROOT/docker-compose.prod.yml" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/docker-compose.prod.yml"

  # ۵. انتقال نمونه env در صورت نیاز
  rsync -avz -e "$RSYNC_SSH" "$PROJECT_ROOT/.env.production.example" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env.production.example"
else
  echo -e "${YELLOW}rsync یافت نشد، در حال استفاده از scp...${NC}"
  $SCP_CMD -r "$PROJECT_ROOT/dist" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/"
  $SCP_CMD "$PROJECT_ROOT/backend/server_linux" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/backend/server"
  $SCP_CMD "$PROJECT_ROOT/nginx/default.conf" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/nginx/default.conf"
  $SCP_CMD "$PROJECT_ROOT/docker-compose.prod.yml" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/docker-compose.prod.yml"
  $SCP_CMD "$PROJECT_ROOT/.env.production.example" "$SERVER_USER@$SERVER_IP:$REMOTE_DIR/.env.production.example"
fi

echo -e "${GREEN}✅ انتقال تمام فایل‌ها با موفقیت انجام شد.${NC}"

# ==============================================================================
# مرحله ۵: اعمال دسترسی‌ها و راه‌اندازی سرویس‌ها در سرور
# ==============================================================================
echo -e "\n${YELLOW}🚀 [۵/۵] در حال راه‌اندازی و اجرای سرویس‌ها در سرور...${NC}"

$SSH_CMD "$SERVER_USER@$SERVER_IP" bash -s << REMOTE_RUN
set -e
cd "$REMOTE_DIR"

# تنظیم دسترسی اجرایی باینری
chmod +x "$REMOTE_DIR/backend/server"

# بررسی و ساخت فایل .env در صورت عدم وجود
if [ ! -f "$REMOTE_DIR/.env" ]; then
  echo "ایجاد فایل .env از روی .env.production.example..."
  cp "$REMOTE_DIR/.env.production.example" "$REMOTE_DIR/.env"
  RANDOM_SECRET=\$(openssl rand -hex 24 2>/dev/null || date +%s%N)
  sed -i "s/super_secret_jwt_random_string_replace_in_production_2026/\$RANDOM_SECRET/g" "$REMOTE_DIR/.env" 2>/dev/null || true
fi

# راه‌اندازی کانتینرها با Docker Compose
echo "اجرای مجدد کانتینرها..."
docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --remove-orphans

sleep 4

echo "وضعیت کانتینرها:"
docker compose -f docker-compose.prod.yml ps
REMOTE_RUN

# ==============================================================================
# بررسی سلامت و پایان موفقیت‌آمیز
# ==============================================================================
echo -e "\n${CYAN}================================================================${NC}"
echo -e "${GREEN}${BOLD}🎉 استقرار پروژه با موفقیت کامل انجام شد و سرویس‌ها فعال شدند!${NC}"
echo -e "${CYAN}================================================================${NC}"
echo -e "${GREEN}🌐 وب‌سایت اصلی:      ${NC}https://sace.ui.ac.ir"
echo -e "${GREEN}🔗 بررسی سلامت API:   ${NC}https://sace.ui.ac.ir/api/health"
echo -e "\n${YELLOW}📌 دستورات کاربردی برای بررسی سرور:${NC}"
echo -e "   مشاهده لاگ‌های زنده:    ${CYAN}ssh $SERVER_USER@$SERVER_IP \"cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml logs -f\"${NC}"
echo -e "   مشاهده وضعیت کانتینرها: ${CYAN}ssh $SERVER_USER@$SERVER_IP \"cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml ps\"${NC}"
echo -e "   ری‌استارت سرویس‌ها:      ${CYAN}ssh $SERVER_USER@$SERVER_IP \"cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml restart\"${NC}"
echo -e "${CYAN}================================================================${NC}\n"
