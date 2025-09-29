import type { Member, Program } from './types';


export const MEMBERS: Member[] = [
  {
    "id": 1,
    "name": "محمد رهی",
    "memberships": [
      {
        "year": 1401,
        "position": "عضو افتخاری"
      },
      {
        "year": 1402,
        "position": "دبیر انجمن"
      },
      {
        "year": 1403,
        "position": "دبیر"
      },
      {
        "year": 1404,
        "position": "دبير"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/photo_2025-09-27 04.15.21.jpeg",
    "bio": "یک ادم علاقمند به کار تیمی \nدوس داره همجا باشه و تاجایی که میتونه به همه کمک کنه"
  },
  {
    "id": 2,
    "name": "امیر علی گلی",
    "memberships": [
      {
        "year": 1401,
        "position": "دبیر انجمن"
      },
      {
        "year": 1402,
        "position": "مشاور انجمن"
      },
      {
        "year": 1403,
        "position": "مشاور"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/24-10-18_10-53-30-603.jpg",
    "bio": "همراه همیشه پایدار انجمن"
  },
  {
    "id": 3,
    "name": "محمد احمدی",
    "memberships": [
      {
        "year": 1402,
        "position": "نایب دبیر انجمن"
      },
      {
        "year": 1403,
        "position": "عضو افتخاری"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/2025-09-27 04.19.08.jpg",
    "bio": "اچار فرانسه انجمن"
  },
  {
    "id": 4,
    "name": "زهرا مهدوی",
    "memberships": [
      {
        "year": 1403,
        "position": "عضو انجمن"
      },
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/2025-09-27 04.20.32.jpg",
    "bio": ""
  },
  {
    "id": 5,
    "name": "محدثه روح الهی",
    "memberships": [
      {
        "year": 1403,
        "position": "عضو انجمن"
      },
      {
        "year": 1404,
        "position": "نايب دبير"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/photo_2025-09-27 03.11.38.jpeg",
    "bio": ""
  },
  {
    "id": 6,
    "name": "آنیتا قاسمی",
    "memberships": [
      {
        "year": 1402,
        "position": "عضو افتخاری"
      },
      {
        "year": 1403,
        "position": "عضو افتخاری"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/2025-09-27 04.22.15.jpg",
    "bio": ""
  },
  {
    "id": 7,
    "name": "ايليا ماهوش",
    "memberships": [
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMzaNhBqJm6LKpQgKOm3hScNpC6_a0AAm7JMRtBV8FSVW95KPHywiIBAAMCAAN4AAM2BA.jpg",
    "bio": "با اينکه تازه کاره اما سعي مي کنه هرجايي که مي تونه کاري بکنه حضور داشته باشه"
  },
  {
    "id": 8,
    "name": "دينا مشهدي",
    "memberships": [
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMwaNhBdQYo65TXmyiBAeQ9-BodDpUAA8gxG9PswFL_F8NXVAV1fAEAAwIAA3kAAzYE.jpg",
    "bio": ""
  },
  {
    "id": 9,
    "name": "مهدي سمسارزاده",
    "memberships": [
      {
        "year": 1403,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOSaNhV8suLn53K70v9RTwgxIic2NgAAg7MMRtDDsBSx5jUPpO7v-EBAAMCAAN5AAM2BA.jpg",
    "bio": ""
  },
  {
    "id": 10,
    "name": "عرفان حاج حيدري",
    "memberships": [
      {
        "year": 1403,
        "position": "عضو انجمن"
      },
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMdaNg6suJH4ekXyL8oBfOiwOuvJJEAAkDMMRuiVMBSl4__8uywwLoBAAMCAAN4AAM2BA.jpg",
    "bio": ""
  },
  {
    "id": 11,
    "name": "آتوسا مسعودي",
    "memberships": [
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMbaNg4gnDK1UTFVv40A8wq6LHTqYYAAi7HMRuB-ohR_lWK-EWjLSYBAAMCAAN5AAM2BA.jpg",
    "bio": ""
  },
  {
    "id": 12,
    "name": "نگار فريدوني",
    "memberships": [
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMxaNhBdaPrs6sVNgRnZoi9vJuma1cAAufIMRsG48BS49-bRvTagcwBAAMCAAN4AAM2BA.jpg",
    "bio": ""
  },
  {
    "id": 13,
    "name": "اميررضا رادفر",
    "memberships": [
      {
        "year": 1404,
        "position": "عضو انجمن"
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMyaNhBdbonvboZ_AFfPTs7hzIuRj0AAobMMRufBdFQ3kv0ky1keAsBAAMCAAN5AAM2BA.jpg",
    "bio": ""
  }
];
export const PROGRAMS: Program[] =[
  {
    "id": 1,
    "title": "رویداد xpcon",
    "date": "۱۴۰۳-۰۱-۲۳",
    "dateISO": "2025-04-05",
    "shortDescription": "همایش بزرگ و متنوع انتقال تجربه کامپیوتری",
    "fullDescription": "شنبـه ۲۳ فروردین، ساعت ۱۶ تا ۱۹ \n       پذیرش از ساعت ۱۵\n🏛  دانشگاه اصفهان، ساختمان مرکزی، تالار پیامبر اعظم\n\n☄️  همایشی متفاوت در راستای انتقال تجربه از صاحب‎نظران درباره مسیر شغلی و پژوهشی رشته‎های علوم و مهندسی کامپیوتر!\n\n☄️  هر گوشه‎ای از تجربه تمنای سخن دارد و هر نگاه، داستان موفقیتی را روایت می‌کند و این تنها بخشی از داستان بزرگ ماست...\n\n📍  شــامــل:\n   •  تاک انتقال تجربه\n   •  ارتباط با صنعت\n   •  پرسش و پاسخ\n   •  مسابقه‌های هیجان‌انگیز\n   •  جوایز ارزنده\n   •  موسیقی سنتی!\n\n👥  سخنرانان:\n   •  لیدا تیموری\n   •  صدرا حکیم\n   •  سمانه حیدری\n   •  امین شاه‌نظری\n   •  امیر مشایخی\n   •  آرمان ابراهیمی",
    "imageUrl": "https://storage.c2.liara.space/charset99/programs/2025-09-27 04.28.56.jpg",
    "collaborators": [
      2
    ],
    "sponsors": [
      {
        "id": 1,
        "name": "داتین",
        "logoUrl": "https://storage.c2.liara.space/charset99/mohamad/sponsors/2025-09-27 04.27.14.jpg"
      }
    ],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": [
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.28.24.mp4"
      ]
    }
  },
  {
    "id": 2,
    "title": "کارگاه آموزشي ساخت رزومه حرفه ای در sheeters",
    "date": "1403-04-20",
    "dateISO": "2024-07-10",
    "shortDescription": "آموزش طراحي رزومه با گوگل شيت",
    "fullDescription": "توی این وبینار یاد میگیریم که چطور یک رزومه حرفه ای گرافیکی با گوگل شیت طراحی کنیم که شرکت ها نتونن ردش کنن.\n\nمدرس : مهدی باختری | موسس و مدیر عامل شرکت Tank\nمهمان افتخاری : دکتر مرتضی جوشقانی | مشاور ارشد منابع انسانی",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAM7aNhKyNQtwcX7c39jwwMIcO83YTkAAoPJMRtBV8FSggjJBabXZzsBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 3,
    "title": "کارگاه آموزشي اهمیت گوگل شیت در کسب و کار های نو پا",
    "date": "1403-05-03",
    "dateISO": "2024-07-24",
    "shortDescription": "آشنايي با گوگل شيت و کاربرد ها",
    "fullDescription": "توی این وبینار با نقش حیاتی این ابزار قدرتمند در مدیریت و رشد کسب و کار ها آشنا میشیم. یاد میگیریم که چطور میتونیم از گوگل شیت برای مدیریت پروژه ها و مشتریان، تحلیل داده ها، همکاری تیمی و افزایش درآمد و بهره وری استفاده کرد. این ها تنها جزئی از برنامه های خفن ترین رویداد آشنایی با گوگل شیت در ایران خواهد بود.\n\n\nمدرس : مهدی باختری | موسس و مدیر عامل شرکت Tank",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAM8aNhLZSJPpPB61wQ6sqQiuNxys0IAAoXJMRtBV8FSLLsJa52pE1oBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 4,
    "title": "دوره مقدماتی آموزش جنگو",
    "date": "",
    "dateISO": "2024-08-22",
    "shortDescription": "آشنايي اوليه با جنگو",
    "fullDescription": "زمان دوره شهریورماه ۱۴۰۳ ، به مدت ۱۰ جلسه به‌صورت مجازی\nمدرس مهندس طاها داوری\nسرفصل هاي اين دوره:\n- مروري بر پايتون\n- Model, View\n- Template\n- ORM\n- Form\n- Admin\n- Django Rest Framework\n- Deploy\nهزینه دوره ۹۸۰ هزارتومان",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAM9aNhLhmTUOsp7PClzH4HiJOVbgL0AAobJMRtBV8FS6E7vQE45WwYBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 5,
    "title": "دوره آموزش فوتوشاپ",
    "date": "",
    "dateISO": "2024-08-23",
    "shortDescription": "آموزش مقدماتي فوتوشاپ",
    "fullDescription": "زمان دوره شهریورماه ۱۴۰۳ ، به مدت ۸ جلسه به‌صورت مجازی\nمدرس علیرضا یوسفوند\nآموزش نصب و راه اندازي نرم افزار\nمعرفي و آشنايي با فضاي کار\nآشنايي با ابزار فوتوشاپ\nآشنايي با روند ساخت پوستر\nآشنايي با روند ساخت کارت ويزيت\nهزینه دوره ۹۸۰ هزارتومان",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAM-aNhLlYZO393Z4G2Fb9VRblTY67wAAofJMRtBV8FSrhs-0X3cdCQBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 6,
    "title": "دوره مقدماتی آموزش دات‌نت",
    "date": "",
    "dateISO": "2024-08-24",
    "shortDescription": "آموزش مقدماتي .NET",
    "fullDescription": "زمان دوره شهریورماه ۱۴۰۳ ، به مدت ۱۰ جلسه به‌صورت مجازی\n مدرس مهندس امیرعلی گلی\nسرفصل هاي دوره:\n- C#\n- .net\n- Network & Protocol concepts\n- rest api\n- orm & database\n- solid\n- test\nهزینه دوره ۹۸۰ هزارتومان",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAM_aNhLmWKweI_hnDT3bwWUTRnoVWwAAojJMRtBV8FSHJn8EeVnGesBAAMCAAN5AAM2BA.jpg",
    "collaborators": [
      2
    ],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 7,
    "title": "سمينار آموزشي فصل دوم تحصیلی را چگونه بگذارنیم؟!",
    "date": "1403-08-01",
    "dateISO": "2024-10-22",
    "shortDescription": "راهنمايي گذراندن سال دوم تحصيلي  همراه با توضیحات ساخت رزومه و لینکدین",
    "fullDescription": "زمان: سه‌شنبه ۱ آبان ساعت ۱۰ صبح\nارائه‌دهنده: مهندس امیرعلی گلی\nویژه‌ی دانشجویان ورودی ۴۰۲\nمکان: ساختمان انصاری - تالار دکتر براآنی",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANBaNhLuAOi6jJIX6RhAqAPkMfnRK4AAorJMRtBV8FSwXtUx09iUEoBAAMCAAN5AAM2BA.jpg",
    "collaborators": [
      2
    ],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 8,
    "title": "کارگاه آموزشي آشنایی با مفاهیم تست نرم افزار",
    "date": "1403-08-09",
    "dateISO": "2024-10-30",
    "shortDescription": "پیاده سازی سناریو های تست با نرم افزار PlayWright",
    "fullDescription": "ویژه علاقه مندان به توسعه نرم افزار (Back-end, Front-end)، تست و ارزیابی\nپیشنیاز: آشنایی با زبانهای برنامه نویسی\nزمان: چهارشنبه ۹ آبان ساعت ۱۰ تا ۱۲\nمدرس: مهندس پدرام کاظمی(کارشناس ارشد IT و برنامه نویس ارشد شرکت ایده پژوهان اسپادانا)\nمکان: دانشکده انصاری",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANCaNhLuh3ZbpWR4GAOkp1d68Fb76YAAovJMRtBV8FSVAHbfUqZ-SgBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 9,
    "title": "دوره آموزش PYTHON",
    "date": "",
    "dateISO": "2024-11-21",
    "shortDescription": "آموزش مقدماتي پايتون با مقدماتي بر شي گرايي",
    "fullDescription": "زمان: آذرماه ۱۴۰۳ (۸ جلسه) به صورت مجازی\nسرفصل های دوره:\n- Basic syntax \n- Variables and Data Types\n- Conditions and Loop\n- Exceptions\n- Function and Builtin Functions \n- Moduls, Lambda, Decorator, Iterators\n- Introduction to object oriented programming\nمدرس: مهندس طاها داوری\nهزینه دوره: ۴۹۰ هزار تومان",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANDaNhLvIHqtYTgGZ72nV1NloMJS88AAozJMRtBV8FSEfEVK7R3McgBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 10,
    "title": "دوره آموزش GO",
    "date": "",
    "dateISO": "2024-11-22",
    "shortDescription": "آشنايي و آموزش مقدماتي زبان برنامه نويسي GO",
    "fullDescription": "زمان: آذرماه ۱۴۰۳ (۸ جلسه) به صورت مجازی\nسرفصل های دوره:\n- Basics \n-️Packages and modules \n-️Types\n-️OOP vs Functional \n-️Error/Panic/Recover\n-️Bytes and buffers \n-️Building file compressor cli app\nمدرس: مهدی مظاهری\nهزینه دوره: ۴۹۰ هزار تومان",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANEaNhLxOeE1zkj7SN3Apehd1bMbTwAAo3JMRtBV8FS_YGE5Uv0WJ8BAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 11,
    "title": "وبینار انتخاب لپ‌تاپ",
    "date": "1403-08-22",
    "dateISO": "2024-11-12",
    "shortDescription": "وبینار انتخاب لپ‌تاپ ويژه ورودي 1403",
    "fullDescription": "تسهيلگران:\n- محدثه آخوندي (ورودي 1400)\n- مسيح روغني (ورودي 1402)\n- سعيد رنجبر (ورودي 1400)\nبستر برگزاری: گوگل میت",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANFaNhLyhuDZiI7lloy3BZQyfDPkyMAAo7JMRtBV8FSruJcgakEMDsBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 12,
    "title": "کارگاه آموزشی فیگما",
    "date": "1403-12-19",
    "dateISO": "2025-03-09",
    "shortDescription": "معرفي و آشنايي اوليه با فيگما",
    "fullDescription": "سرفصل ها:\n- رنگ‌شناسی و کاربرپسندی (User-Friendly Design) \n- معرفی فیگما و محیط کاربري\n- وایرفریم (Wireframe)\n- اصول طراحی رابط کاربری (UI Design) \n- پروتوتایپ (Prototype)\nمدرس: مهندس محمد حسین ملکی\nمکان: ساختمان انصاری ،سالن دانشجو",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANGaNhL1NhnpwogqAF3KhBgGZAMZLUAAo_JMRtBV8FSwAVMX3tEuMUBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 13,
    "title": "وبینار معرفی بسته های کارشناسی",
    "date": "1404-02-20",
    "dateISO": "2025-05-09",
    "shortDescription": "آشنايي با بسته هاي مختلف کارشناسي ويژه ورودي 402",
    "fullDescription": "با حضور:\nآقای کیانوش ودائی: بسته هوش مصنوعی-شبکه\nآقای متین اعظمی: بسته هوش مصنوعی-نرم‌افزار\nآقای سعید رنجبر: بسته نرم‌افزار-شبکه\nبه میزبانی آقای مهدی سمسارزاده\nبستر برگزاری: گوگل میت",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANHaNhL3PQ3ducebNpsSJsFsmPp7TQAApDJMRtBV8FSg0uxmcBagt0BAAMCAAN5AAM2BA.jpg",
    "collaborators": [
      9
    ],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 14,
    "title": "وبینار انتقال تجربه برای کــارآمـوزی",
    "date": "1404-03-05",
    "dateISO": "2025-05-25",
    "shortDescription": "آشنايي با فضاي کارآموزي و  پیش پرداختی بر رویداد روزکارآموز",
    "fullDescription": "داخل این وبینار قراره دانشجو هایی که در شرکت های مختلف تجربه کارآموزی داشتند تجربه های خودشون رو با افرادی که تازه میخواند این دوره تجربه کنند به اشتراک بگذارند.\nبا حضور نماینده هایی از شرکت های مختلف :\n- شرکت مهیمن\n- شرکت پیام‌پرداز\n- شرکت سی‌کار\nمکان: بستر گوگل میت",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANIaNhL6CCg5GvcyBQIV55c91FuxecAApHJMRtBV8FSHzTl4LFcpR8BAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 15,
    "title": "رویداد کارآموز",
    "date": "۱۴۰۳-۰۳-۰۵",
    "dateISO": "2025-05-21",
    "shortDescription": "دهمین نمایشکاه کاریابی کار آموز",
    "fullDescription": "دهمین گرد همایی کارآموز",
    "imageUrl": "https://storage.c2.liara.space/charset99/programs/2025-09-27 04.40.56.jpg",
    "collaborators": [
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      10,
      11,
      12,
      13
    ],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.40.15.jpg",
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.40.32.jpg",
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.40.37.jpg",
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.40.40.jpg",
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.40.45.jpg",
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.41.15.jpg",
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.41.09.jpg"
      ],
      "videos": []
    }
  },
  {
    "id": 16,
    "title": "طرح عيد براي همه، شادي براي دل ها",
    "date": "",
    "dateISO": "2025-03-19",
    "shortDescription": "جمع آوري کمک هاي مردمي در جهت تامين بسته هاي غذايي براي نيازمندان",
    "fullDescription": "مجموع خرید برنامه تهیه مواد غذایی\n11532300\n\nبودجه\n10000000\n\nاضافه هزینه توسط اعضای خیر انجمن در هنگام خرید پرداخت شد.\n\nمجموعا ۱۰ بسته غذایی\n هرکدام شامل :\nیک گونی برنج ۱۰کیلویی، ۱ عدد روغن خوراکی، ۱ عدد مرغ، ۱ عدد رب، ۱ بسته عدس، ۱ بسته شکر، ۱ بسته سویا، ۲ بسته ماکارانی\n\nپ‌ن: باتوجه به جمع نشدن مبلغ قابل توجه در ابتدای سال، برنامه خرید تا این زمان طول کشید.",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANJaNhMEP4o1ae-3kM1_MMNj4PhW-0AApLJMRtBV8FSSu0cFF4drFoBAAMCAAN5AAM2BA.jpg",
    "collaborators": [
      1,
      2,
      4,
      7,
      12,
      13
    ],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANxaNhN55P9HLnTS7iD2DKdaxqfnowAAuPJMRuz_clTFGWWQw0U7CcBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANyaNhN55JGxkK7W4PHdaMGqXB38DkAAuTJMRuz_clTZOwkOu3FIp8BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANzaNhN5-Dry7ALcd12MzmGK00BIoUAAuXJMRuz_clTMNFqHsZS3VkBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN0aNhN57ZUxwaGhpBPSCMVU54nZkoAAubJMRuz_clTDhQoEFfqJzoBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN2aNhN59mBvgUWgeVg1UmTxUb2kFAAAuvJMRuz_clTLeEWvf-TGLUBAAMCAAN5AAM2BA.jpg"
      ],
      "videos": []
    }
  },
  {
    "id": 17,
    "title": "طرح تهیه لوازم التحریر برای کودکان نیازمند",
    "date": "",
    "dateISO": "2024-09-12",
    "shortDescription": "جمع آوري کمک هاي مردمي در راستاي تهيه لوازم التحرير براي نيازمندان",
    "fullDescription": "برنامه تهیه لوازم التحریر برای کودکان نیازمند : \n\nتاریخ : شهریور ماه ۱۴۰۳\nمبلغ جمع آوری شده : ۵ میلیون تومان\nهدف : کودکان بهزیستی\nموارد تهیه شده : لوازم التحریر\n\nمجموع خرید برنامه تهیه لوازم التحریر:\n5118000\n\nبودجه\n5100000\n\nاضافه هزینه + خرید ۳ بگ اضافه توسط اعضای خیر انجمن در هنگاه خرید پرداخت شد.\n\nمجموعا ۱۴ بسته :\n\n۱۱ بسته ویژه دانش‌آموزان دبیرستانی\nشامل : \nکلاسور، خودکار آبی و خودکار رنگی۶تایی، غلط‌گیر، جامدادی، اتود، مغزی، قمقمه‌آب، پاک‌کن، ماژیک\n\n۳ بسته ویژه دانش‌آموزان دبستانی شامل:\n۲عدد دفتر، مدادرنگی۱۲تایی، تراش، برچسب جامدادی، اتود، مغزی، قمقمه‌آب، پاک کن، ماژیک",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANKaNhMI90GXguJwKsymV1CwwVCjr4AApPJMRtBV8FSXAjwgdbAv54BAAMCAAN4AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN6aNhN9Zlptli6qL3lKFsmTEbahecAAk7CMRtD9hhTFkCSkHFL2poBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN7aNhN9cMJvIzszZorsk0FtAY5br0AAk_CMRtD9hhT_xzWmzauxtwBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN8aNhN9Q4SVQpJY6bI_BPKkxFyjnQAAlHCMRtD9hhTq4Aerj_9R7EBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN9aNhN9UWphjfLIp_f2Gic60Cp3vIAAlPCMRtD9hhTR1jyBVntE9IBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN-aNhN9d2LMZdi0Osi5eQyMylwuc0AAlTCMRtD9hhT1OZ3Sw013FwBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAN_aNhN9X_1rZTLew2YEYVj70vJ6twAAlXCMRtD9hhTrNyQnFBVZjgBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOAaNhN9YsenRscbW2eUfEqDSt7ZKAAAlbCMRtD9hhTXduhs1FBw88BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOBaNhN9aHYfAVuqihA3qLjgBr6AAExAAPEMRs4c-hSlrgxRSvXJ_YBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOCaNhN9ZBARopZhNUO6zwwBMOQr20AAlfCMRtD9hhTRU7HWwAB-_H6AQADAgADeQADNgQ.jpg"
      ],
      "videos": []
    }
  },
  {
    "id": 18,
    "title": "دورهمی دانشجویان نوورود مهندسی کامپیوتر",
    "date": "1403-09-17",
    "dateISO": "2024-12-07",
    "shortDescription": "خوشامدگويي به دانشجويان نوورود دانشکده مهندسي کامپيوتر",
    "fullDescription": "شامل:\n- گپ‌وگفت دانشگاهی و دانشجویی\n- چطور این ۴ سال را بگذرانیم؟\n- نوشیدنی داغ ☕️\n- موسیقی 🎵\n- عصرانه 🍪\n- جایزه 🎁\n- بازی 🎯\n- انتقال تجربه از ترم‌بالایی‌هاتون درباره درس‌هاتون (چطور نمره بیاریم، در دانشگاه فعالیت داشته باشیم یا درس‌هامون رو برداریم و…)\nمکان: تالار آوینی",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANLaNhMQm8zato1S-oKNrc1oUtzRbUAApTJMRtBV8FSOL-zh5AzlLMBAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [],
      "videos": []
    }
  },
  {
    "id": 19,
    "title": "گپی صمیمی با پرهام کاظمی، دانش‌آموخته دانشگاه اصفهان و محقق حال حاضر در کانادا",
    "date": "1404-01-19",
    "dateISO": "2025-04-07",
    "shortDescription": "گفت و گو با مهندس پرهام کاظمي درباره ي تحصيل، مهاجرت و ...",
    "fullDescription": "زمان: سه‌شنبه ۱۹ فروردین ماه ساعت ۱۶ الی ۱۸\nمکان: ساختمان انصاری، سالن دکتر براآنی",
    "imageUrl": "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANNaNhMVqc08wN9ZNguKyb8OnaxzxgAApbJMRtBV8FSQptmoN5d0-4BAAMCAAN5AAM2BA.jpg",
    "collaborators": [],
    "sponsors": [],
    "status": "past",
    "gallery": {
      "images": [
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAANjaNhNvJag8OIQekjGlJUC7iafE44AAmLJMRuaz7hS8BMlFJOo0GkBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMJaNeSYdhEFEbboov0lhj1dUh1u_kAAsfGMRsEfOlTuXEgFwAB9Nw2AQADAgADeQADNgQ.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMLaNeSbhEjCqKpLRCO6BmPe69dC-sAAsjGMRsEfOlT3iX_U2QTZc4BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMMaNeSbklPxoaVx5ogoYJl4kjVRLoAAsnGMRsEfOlT_6Wiuytk4wcBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMOaNeSbgWmm6CQpGVtkdUsoEZ8kb4AAsvGMRsEfOlTutIjbpHeyqUBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAMPaNeSbljDvY5JxjKiaNZQCcslfSsAAszGMRsEfOlT7XAbqSEAAc9cAQADAgADeQADNgQ.jpg"
      ],
      "videos": []
    }
  }
];