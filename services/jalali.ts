import { toJalaali, toGregorian, jalaaliMonthLength } from 'jalaali-js';

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEKDAYS = [
  { short: 'ش', full: 'شنبه' },
  { short: 'ی', full: 'یکشنبه' },
  { short: 'د', full: 'دوشنبه' },
  { short: 'س', full: 'سه‌شنبه' },
  { short: 'چ', full: 'چهارشنبه' },
  { short: 'پ', full: 'پنج‌شنبه' },
  { short: 'ج', full: 'جمعه' },
];

/**
 * تبدیل ارقام انگلیسی به فارسی
 */
export function toPersianDigits(n: number | string): string {
  const pDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => pDigits[+w]);
}

/**
 * تبدیل ارقام فارسی و عربی به انگلیسی
 */
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * دریافت تاریخ امروز به صورت شمسی
 */
export function getTodayJalali(): { jy: number; jm: number; jd: number } {
  const now = new Date();
  return toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * تبدیل میلادی به شمسی
 */
export function gregorianToJalali(date: Date | string): { jy: number; jm: number; jd: number } | null {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return null;
  return toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * تبدیل شمسی به تاریخ میلادی Date
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): Date {
  const g = toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

/**
 * تبدیل شمسی به رشته میلادی استاندارد YYYY-MM-DD (مناسب برای dateISO و دیتابیس)
 */
export function jalaliToGregorianISO(jy: number, jm: number, jd: number): string {
  const g = toGregorian(jy, jm, jd);
  const mm = String(g.gm).padStart(2, '0');
  const dd = String(g.gd).padStart(2, '0');
  return `${g.gy}-${mm}-${dd}`;
}

/**
 * فرمت‌بندی تاریخ شمسی
 * 'numeric': ۱۴۰۳/۰۸/۲۵
 * 'long': ۲۵ آبان ۱۴۰۳
 * 'medium': جمعه ۲۵ آبان ۱۴۰۳
 */
export function formatJalali(
  jy: number,
  jm: number,
  jd: number,
  style: 'numeric' | 'long' | 'medium' = 'numeric',
  persianDigits = true
): string {
  const mName = PERSIAN_MONTH_NAMES[jm - 1] || '';

  if (style === 'long') {
    const text = `${jd} ${mName} ${jy}`;
    return persianDigits ? toPersianDigits(text) : text;
  }

  if (style === 'medium') {
    const gDate = jalaliToGregorian(jy, jm, jd);
    const dayOfWeek = (gDate.getDay() + 1) % 7; // 0 = شنبه
    const wName = PERSIAN_WEEKDAYS[dayOfWeek]?.full || '';
    const text = `${wName} ${jd} ${mName} ${jy}`;
    return persianDigits ? toPersianDigits(text) : text;
  }

  // numeric: YYYY/MM/DD
  const mStr = String(jm).padStart(2, '0');
  const dStr = String(jd).padStart(2, '0');
  const num = `${jy}/${mStr}/${dStr}`;
  return persianDigits ? toPersianDigits(num) : num;
}

/**
 * پارس کردن هر نوع تاریخ ورودی (چه شمسی چه میلادی) و بازگرداندن مقادیر کامل
 */
export function parseDateInput(
  input: string | Date | undefined | null
): {
  jy: number;
  jm: number;
  jd: number;
  gregorianISO: string;
  formattedNumeric: string;
  formattedLong: string;
} | null {
  if (!input) return null;

  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    const j = toJalaali(input.getFullYear(), input.getMonth() + 1, input.getDate());
    return {
      ...j,
      gregorianISO: input.toISOString().slice(0, 10),
      formattedNumeric: formatJalali(j.jy, j.jm, j.jd, 'numeric', false),
      formattedLong: formatJalali(j.jy, j.jm, j.jd, 'long', true),
    };
  }

  const clean = toEnglishDigits(String(input).trim());

  // Check if it's formatted as Jalali: e.g. 1403/08/25 or 1403-08-25
  const jalaliMatch = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (jalaliMatch) {
    const y = parseInt(jalaliMatch[1], 10);
    const m = parseInt(jalaliMatch[2], 10);
    const d = parseInt(jalaliMatch[3], 10);

    // If year starts with 13 or 14, it is Jalali!
    if (y >= 1300 && y <= 1500 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      const gIso = jalaliToGregorianISO(y, m, d);
      return {
        jy: y,
        jm: m,
        jd: d,
        gregorianISO: gIso,
        formattedNumeric: formatJalali(y, m, d, 'numeric', false),
        formattedLong: formatJalali(y, m, d, 'long', true),
      };
    }
  }

  // Check if it contains a Persian month name: e.g. "25 آبان 1403" or "آبان 1403"
  for (let i = 0; i < PERSIAN_MONTH_NAMES.length; i++) {
    const mName = PERSIAN_MONTH_NAMES[i];
    if (clean.includes(mName)) {
      const parts = clean.split(mName);
      const digits1 = parts[0].match(/\d+/);
      const digits2 = parts[1].match(/\d+/);
      let day = 1;
      let year = 1403;

      if (digits1 && digits2) {
        const val1 = parseInt(digits1[0], 10);
        const val2 = parseInt(digits2[0], 10);
        if (val1 > 1000) {
          year = val1;
          day = val2;
        } else {
          day = val1;
          year = val2;
        }
      } else if (digits1 || digits2) {
        const val = parseInt((digits1 || digits2)![0], 10);
        if (val > 1000) year = val;
        else day = val;
      }

      const m = i + 1;
      if (year >= 1300 && year <= 1500 && m >= 1 && m <= 12 && day >= 1 && day <= 31) {
        const gIso = jalaliToGregorianISO(year, m, day);
        return {
          jy: year,
          jm: m,
          jd: day,
          gregorianISO: gIso,
          formattedNumeric: formatJalali(year, m, day, 'numeric', false),
          formattedLong: formatJalali(year, m, day, 'long', true),
        };
      }
    }
  }

  // Try parsing as standard Gregorian
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const j = toJalaali(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
    return {
      ...j,
      gregorianISO: jalaliToGregorianISO(j.jy, j.jm, j.jd),
      formattedNumeric: formatJalali(j.jy, j.jm, j.jd, 'numeric', false),
      formattedLong: formatJalali(j.jy, j.jm, j.jd, 'long', true),
    };
  }

  return null;
}

/**
 * طول ماه شمسی (۳۱ روز برای ۶ ماه اول، ۳۰ روز برای ۵ ماه بعدی، ۲۹ یا ۳۰ روز برای اسفند)
 */
export function getJalaliMonthDays(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm);
}

/**
 * روز شروع ماه شمسی در هفته (۰ = شنبه، ۱ = یکشنبه، ...، ۶ = جمعه)
 */
export function getJalaliMonthStartWeekday(jy: number, jm: number): number {
  const gDate = jalaliToGregorian(jy, jm, 1);
  return (gDate.getDay() + 1) % 7;
}
