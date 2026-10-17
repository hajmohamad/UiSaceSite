# ==========================================
# مرحله ۱: بیلد فرانت‌اند React با Node
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# کپی فایل‌های پکیج و نصب وابستگی‌ها
COPY package*.json ./
RUN npm ci

# کپی کل سورس کد و اجرای بیلد
COPY . .
RUN npm run build

# ==========================================
# مرحله ۲: وب‌سرور Nginx برای سرو فرانت و Reverse Proxy
# ==========================================
FROM nginx:alpine

# کپی فایل‌های استاتیک بیلد شده به دایرکتوری Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# کپی تنظیمات اختصاصی Nginx برای دامنه sace.ui.ac.ir
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# پورت‌های مورد نیاز وب (HTTP و HTTPS)
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
