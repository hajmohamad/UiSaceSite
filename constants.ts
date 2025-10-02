import type { Member, Program , Course} from './types';


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
        "position": "مشاور انجمن"
      },
      {
        "year": 1404,
        "position": "مشاور انجمن"
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
      },
      {
        "year": 1404,
        "position": "عضو افتخاري"
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
      },
      {
        "year": 1404,
        "position": "عضو افتخاري"
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
      1,
      2,
      3,
      4,
      5,
      6,
      9,
      10,
      13
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
      "images": [
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOUaNjy--4nJhyilARf9aENF5ULYEEAAt3PMRslI8lSPXurSYERxj4BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOVaNjy-5iIqTQDnqJbYLwziZ3WynwAAt7PMRslI8lSTB74tuHB6r8BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOWaNjy-w8mXgO0mTA4V1zdf20umDEAAt_PMRslI8lSnHvI0S_m6hkBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOXaNjy-0BpbiBfBkIMCbOxTUITuQoAAuDPMRslI8lSHPqTZFua-nMBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOYaNjy-59a9WrYMCBwU1WTa09-x4sAAuHPMRslI8lS5bAO-ondgLwBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOZaNjy-yYJ3oxt3wvPg5LrNxFOjr8AAuLPMRslI8lSa7KX2xd7kWIBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOaaNjy-88G0V633wuteUXkf9nXP9IAAuPPMRslI8lS7DTL2Fmq-dwBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgIAAxkBAAObaNjzE9VZBnXdR2upZ5sP5FCz7gUAAhfzMRtOTMhKKoKkL5887B8BAAMCAAN5AAM2BA.jpg"
      ],
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
    "status": "upcoming",
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
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.41.09.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOkaNjzyXPerL8yJrS0e1S68aMGbc8AAubPMRslI8lSKosMQfgJpwIBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOlaNjzyWuLVN0Y-tC3xYKEj2jp45gAAufPMRslI8lSHcnDN4R3Bd8BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOmaNjzyYCcCGBKGLgSteAhOqdFp5sAAujPMRslI8lSfAw6bm62b30BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOqaNjzyW2jZ0Nv1kbwae1B_VtSu1YAAuzPMRslI8lSwAU06mnqL2ABAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOqaNjzyW2jZ0Nv1kbwae1B_VtSu1YAAuzPMRslI8lSwAU06mnqL2ABAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOraNjzyS_ZJL_Ec-oCy6__LYXhdxkAAu3PMRslI8lS0jigWc0SR7ABAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOsaNjzyZV-4xX-bHpUFl85Cfqm0QsAAu7PMRslI8lS_2hWttrznC0BAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOtaNjzyYmmezCwfPk02LDbVCBrJ8IAAu_PMRslI8lS80XlLKQz2nIBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOuaNjzyZkjpxWHBxuxJH34OJRAvjsAAvDPMRslI8lStxdD2EhHQTYBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOvaNjzyRYNHhyY2yax6Bb7nz5I3-gAAvHPMRslI8lSHK2B-LQV_rQBAAMCAAN5AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOwaNjzyVxguGTQ4tth8beW8Iu9jCUAAvLPMRslI8lS2jjwCLJ866IBAAMCAAN4AAM2BA.jpg",
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOjaNjzyTySKtdHzf0avPznVO2BwekAAuXPMRslI8lS3F_WrKIqs44BAAMCAAN5AAM2BA.jpg"
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
      "images": [
        "https://storage.c2.liara.space/charset99/photos/AgACAgQAAxkBAAOxaNj0LEoO3i3VIePxOMkGKZ2qDcwAAonEMRv1P7FS7j0CqawQuVQBAAMCAAN5AAM2BA.jpg"
      ],
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
]




export const courses: Course[] = 
[
  {
    "id": "1",
    "title": "آموزش معماری",
    "instructor": "دکتر رضایی",
    "shortDescription": "آموزش کامل معماری کامپیوتر دکتر رضایی",
    "longDescription": "این دوره «آموزش معماری کامپیوتر» با تدریس دکتر رضایی، مباحث کلیدی مثل معماری مجموعه دستورالعمل‌ها، طراحی پردازنده، پایپ‌لاین، کارایی، سلسله‌مراتب حافظه، محاسبات حسابی و حتی آشنایی مقدماتی با VHDL را پوشش می‌دهد. در کنار ویدیوهای آموزشی، جزوات و اسلایدهای تکمیلی هم قرار داده شده تا یادگیری کامل‌تر و عملی‌تر باشد.",
    "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/0/08/Computer_architecture_block_diagram.png",
    "isPaid": false,
    "sections": [
      {
        "id": 1,
        "title": "بخش ۱: مقدمه دوره",
        "videos": [],
        "files": [
          { "id": 1, "name": "جلسه ۱: معرفی دوره.pdf", "url": "Introduction", "type": "PDF" }
        ]
      },
      {
        "id": 2,
        "title": "بخش ۲: معماری مجموعه دستورالعمل‌ها (فصل ۲)",
        "videos": [
          { "id": 1, "title": "جلسه ۱ - چرخه اجرای دستور", "type": "aparat", "url": "WPVu6" },
          { "id": 2, "title": "جلسه ۲ - قالب دستور، مراحل F - D - X - M - W", "type": "aparat", "url": "53Qma" },
          { "id": 3, "title": "جلسه ۳ - دستورهای حسابی", "type": "aparat", "url": "IvkQS" },
          { "id": 4, "title": "جلسه ۴ - نام‌گذاری ثبات‌ها، Load/Store", "type": "aparat", "url": "0V7Hi" },
          { "id": 5, "title": "جلسه ۱ - شیفت، addi و lui", "type": "aparat", "url": "0akU3" },
          { "id": 6, "title": "جلسه ۲ - تعامل انسان/کامپیوتر، bne و beq", "type": "aparat", "url": "nb7NJ" },
          { "id": 7, "title": "جلسه ۳ - آدرس‌دهی نسبی PC، slt و jr", "type": "aparat", "url": "n6PTu" },
          { "id": 8, "title": "جلسه ۱ - دستورهای jal و jr و کاربردشان", "type": "aparat", "url": "HsfVj" },
          { "id": 9, "title": "جلسه ۲ - دموی SPIM", "type": "aparat", "url": "vizaY" },
          { "id": 10, "title": "جلسه ۳ - فراخوانی بازگشتی", "type": "aparat", "url": "slu0F" }
        ],
        "files": [
          { "id": 2, "name": "فصل ۲ - معماری مجموعه دستورالعمل‌ها.pdf", "url": "Instruction", "type": "PDF" }
        ]
      },
      {
        "id": 3,
        "title": "بخش ۳: پردازنده (فصل ۴)",
        "videos": [
          { "id": 11, "title": "جلسه ۱ - طراحی مسیر داده، Fetch", "type": "aparat", "url": "M0RNJ" },
          { "id": 12, "title": "جلسه ۲ - مسیر داده: ADD، ORI و Load", "type": "aparat", "url": "0xTcf" },
          { "id": 13, "title": "جلسه ۳ - مسیر داده: Store و BEQ", "type": "aparat", "url": "vaM7z" },
          { "id": 14, "title": "جلسه ۴ - پیاده‌سازی واحد کنترل (مفاهیم)", "type": "aparat", "url": "LDElz" },
          { "id": 15, "title": "جلسه ۵ - پیاده‌سازی واحد کنترل اصلی", "type": "aparat", "url": "nX2Z6" },
          { "id": 16, "title": "جلسه ۶ - پیاده‌سازی واحد کنترل ALU", "type": "aparat", "url": "uLdoG" },
          { "id": 17, "title": "جلسه ۱ - مقدمه: مرور و مفاهیم پایپ‌لاین", "type": "aparat", "url": "jKT9e" },
          { "id": 18, "title": "جلسه ۲ - جزئیات پایپ‌لاین", "type": "aparat", "url": "nB1Yv" },
          { "id": 19, "title": "جلسه ۳ - مقدمه‌ای بر خطرات داده", "type": "aparat", "url": "lGU2d" },
          { "id": 20, "title": "جلسه ۴ - خطرات داده، طراحی دقیق‌تر", "type": "aparat", "url": "fHvZW" },
          { "id": 21, "title": "جلسه ۵ - خطرات کنترلی", "type": "aparat", "url": "xWSsO" }
        ],
        "files": [
          { "id": 3, "name": "پیش‌نیاز طراحی CPU.pdf", "url": "PreCPU", "type": "PDF" },
          { "id": 4, "name": "Lecture 5 - پردازنده تک‌چرخه‌ای.pdf", "url": "Lecture5", "type": "PDF" },
          { "id": 5, "name": "Lecture 6 - پردازنده پایپ‌لاین.pdf", "url": "Lecture7", "type": "PDF" }
        ]
      },
      {
        "id": 4,
        "title": "بخش ۴: کارایی (فصل ۱)",
        "videos": [
          { "id": 22, "title": "جلسه ۱ - مقدمه", "type": "aparat", "url": "xMfbi" },
          { "id": 23, "title": "جلسه ۲ - زمان اجرا، MIPS، قانون آمدال", "type": "aparat", "url": "pAJQd" },
          { "id": 24, "title": "جلسه ۳ - محدودیت توان و برنامه‌نویسی کارا", "type": "aparat", "url": "dOXno" }
        ],
        "files": [
          { "id": 6, "name": "Lecture 7 - کارایی و توان.pdf", "url": "Lecture8", "type": "PDF" }
        ]
      },
      {
        "id": 5,
        "title": "بخش ۵: سلسله‌مراتب حافظه (فصل ۵)",
        "videos": [
          { "id": 25, "title": "جلسه ۱ - مقدمه", "type": "aparat", "url": "TF4eo" },
          { "id": 26, "title": "جلسه ۲ - مسائل کارایی", "type": "aparat", "url": "LYQna" },
          { "id": 27, "title": "جلسه ۳ - بررسی بیشتر و جزئیات", "type": "aparat", "url": "ofy3w" },
          { "id": 28, "title": "جلسه ۴ - هم‌پوشانی در طراحی کش", "type": "aparat", "url": "E6fZt" },
          { "id": 29, "title": "جلسه ۵ - مقدمه‌ای بر حافظه مجازی", "type": "aparat", "url": "pHUvB" },
          { "id": 30, "title": "جلسه ۶ - جزئیات و پیاده‌سازی حافظه مجازی", "type": "aparat", "url": "ADWnL" }
        ],
        "files": [
          { "id": 7, "name": "Lecture 9 - کش.pdf", "url": "Lecture9-cache", "type": "PDF" },
          { "id": 8, "name": "Lecture 9 - حافظه مجازی.pdf", "url": "Lecture9-VirtualMem", "type": "PDF" }
        ]
      },
      {
        "id": 6,
        "title": "بخش ۶: محاسبات حسابی (فصل ۳)",
        "videos": [
          { "id": 31, "title": "جلسه ۱ - جمع‌کننده‌ها", "type": "aparat", "url": "mH7Na" },
          { "id": 32, "title": "جلسه ۲ - ضرب‌کننده‌ها", "type": "aparat", "url": "Vedyz" },
          { "id": 33, "title": "جلسه ۳ - ضرب علامت‌دار و الگوریتم بوث", "type": "aparat", "url": "zpSX7" }
        ],
        "files": [
          { "id": 9, "name": "Lecture 9 - محاسبات حسابی.pdf", "url": "Lecture10-arithmetics", "type": "PDF" }
        ]
      },
      {
        "id": 7,
        "title": "بخش ۷: ضمیمه - VHDL به اختصار",
        "videos": [
          { "id": 34, "title": "جلسه ۱ - مقدمه و مرور کلی", "type": "aparat", "url": "qLHje" },
          { "id": 35, "title": "جلسه ۲ - موجودیت و معماری", "type": "aparat", "url": "Gy3zK" },
          { "id": 36, "title": "جلسه ۳ - مثال‌ها و توضیحات بیشتر", "type": "aparat", "url": "sCerx" },
          { "id": 37, "title": "جلسه ۴ - انواع داده", "type": "aparat", "url": "2LmKJ" },
          { "id": 38, "title": "جلسه ۵ - شناسه‌ها و ثابت‌ها", "type": "aparat", "url": "yHCcz" },
          { "id": 39, "title": "جلسه ۶ - انتساب ساده سیگنال", "type": "aparat", "url": "ku02T" },
          { "id": 40, "title": "جلسه ۷ - انتساب شرطی سیگنال", "type": "aparat", "url": "gbEp3" },
          { "id": 41, "title": "جلسه ۸ - جمع‌کننده کامل", "type": "aparat", "url": "JCX7c" }
        ],
        "files": [
          { "id": 10, "name": "ضمیمه: VHDL به اختصار.pdf", "url": "Lecture6", "type": "PDF" }
        ]
      }
    ]
  },
  {
    "id": "2",
    "title": "آموزش مبانی برنامه نویسی",
    "instructor": "دکتر رمضانی",
    "shortDescription": "آموزش کامل مبانی برنامه نویسی کامپیوتر دکتر رمضانی",
    "longDescription": "این دوره «آموزش مبانی برنامه نویسی کامپیوتر» با تدریس دکتر رمضانی، مباحث کلیدی مثل متغیرها و انواع داده، ساختارهای کنترلی، توابع، آرایه‌ها و رشته‌ها، ساختارهای داده، ورودی/خروجی فایل و حتی مفاهیم شی‌گرایی را پوشش می‌دهد. در کنار ویدیوهای آموزشی، جزوات و اسلایدهای تکمیلی هم قرار داده شده تا یادگیری کامل‌تر و عملی‌تر باشد.",
    "isPaid": false,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg',
    "sections": [
  {
    "id": 1,
    "title": "بخش اول: مفاهیم پایه",
    "files": [
      {
        "id": 1,
        "name": "فصل اول: آشنایی با کامپیوتر (مفاهیم - معماری).ZIP",
        "url": "https://drive.google.com/file/d/1gor-alnxfl_YuoUePvrF7PpbbLgnzlz-/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 2,
        "name": "فصل دوم: مبنای اعداد (صحیح - اعشاری - کاراکتری).ZIP",
        "url": "https://drive.google.com/file/d/1jIk2S7ho1GJTZNGFtazcCnT_EeTxwLNe/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 3,
        "name": "فصل سوم: الگوریتم و فلوچارت.ZIP",
        "url": "https://drive.google.com/file/d/1MTgVg2DJcpr8dAFWKbCu7HnMc8psHjxD/view?usp=drive_link",
        "type": "ZIP"
      }
    ],
    "videos": []
  },
  {
    "id": 2,
    "title": "بخش دوم: برنامه‌نویسی",
    "files": [
      {
        "id": 4,
        "name": "فصل اول: مقدمه‌ای بر زبان C.ZIP",
        "url": "https://drive.google.com/file/d/1zR1GIVoxe4UxFe-EyqSbZJ9B4vm5YMDk/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 5,
        "name": "فصل دوم: نوع داده‌ها و عملگرهای محاسباتی.ZIP",
        "url": "https://drive.google.com/file/d/1ILw8WsMjvgW-K9jHNزwdz3ktZIdJSPqM/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 6,
        "name": "فصل سوم: دستورات شرطی و عملگرهای منطقی.ZIP",
        "url": "https://drive.google.com/file/d/1aDLtlbRrLAzxf4iv82iM8V4chVsoiMlG/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 7,
        "name": "فصل چهارم: حلقه‌های تکرار.ZIP",
        "url": "https://drive.google.com/file/d/1UrEwWsl98d8f41YkiWyzbvqEgzW6_OwL/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 8,
        "name": "فصل پنجم: آرایه‌ها.ZIP",
        "url": "https://drive.google.com/file/d/1gs-4EGnQZfPy7f_UorFC309G_67IgQSP/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 9,
        "name": "فصل ششم: توابع.ZIP",
        "url": "https://drive.google.com/file/d/1qKmTQ4GVM3WrAXlCug0WxyG0HSg3Pn_m/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 10,
        "name": "فصل هفتم: اشاره‌گرها.ZIP",
        "url": "https://drive.google.com/file/d/1jQb-g7sxsTUY9znEfNBeT-mLQuiiesB_/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 11,
        "name": "فصل هشتم: ساختارها و نوع داده شمارشی.ZIP",
        "url": "https://drive.google.com/file/d/1BVE80rNUfQZaXXxCJxiM5f0gDTPF7lZw/view?usp=drive_link",
        "type": "ZIP"
      },
      {
        "id": 12,
        "name": "فصل نهم: فایل‌ها.ZIP",
        "url": "https://drive.google.com/file/d/1wQiJmIj0aekR6zcUKB0Qo6R6D9hqx31_/view?usp=drive_link",
        "type": "ZIP"
      }
    ],
    "videos": []
  }
]

  },
  {
  "id": "3",
  "title": "برنامه‌نویسی پیشرفته (زبان جاوا)",
  "instructor": "نام استاد",
  "shortDescription": "آموزش کامل برنامه‌نویسی پیشرفته جاوا (مقطع کارشناسی)",
  "longDescription": "این دوره شامل مباحث پایه و پیشرفته‌ی زبان جاوا از مفاهیم اولیه تا موضوعات حرفه‌ای مثل واسط‌های گرافیکی، برنامه‌نویسی سوکت، چندنخی و پایگاه داده‌ها است. در این دوره مثال‌ها و سورس‌کدها همراه فایل‌های ZIP قرار داده شده‌اند تا دانشجویان با رویکردی عملی مباحث را یاد بگیرند.",
  "isPaid": false,
  "imageUrl": "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg",
  "sections": [
    {
      "id": 1,
      "title": "فصل اول: مباحث مقدماتی",
      "files": [
        {
          "id": 1,
          "name": "فصل اول: مباحث مقدماتی.ZIP",
          "url": "https://drive.google.com/file/d/1n0og3graZ39Wd706eRnaZOuhqu_5-T00/view?usp=drive_link",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 2,
      "title": "فصل دوم: آغاز کار با جاوا",
      "files": [
        {
          "id": 2,
          "name": "فصل دوم: آغاز کار با جاوا.ZIP",
          "url": "https://drive.google.com/file/d/1ENLxTZjV3UKq9BUNhLcZbvtUHiz3y2wA/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 3,
      "title": "فصل سوم: کلاس، شیء، تابع",
      "files": [
        {
          "id": 3,
          "name": "فصل سوم: کلاس، شیء، تابع.ZIP",
          "url": "https://drive.google.com/file/d/1QCcBOBGeGo8EkoSgLucnSlgUKC04UyQM/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 4,
      "title": "فصل چهارم: آرایه‌ها",
      "files": [
        {
          "id": 4,
          "name": "فصل چهارم: آرایه‌ها.ZIP",
          "url": "https://drive.google.com/file/d/12IjNc1dn65CAdofPsS5XJ5cKxLeOZp-6/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 5,
      "title": "فصل پنجم: وراثت",
      "files": [
        {
          "id": 5,
          "name": "فصل پنجم: وراثت.ZIP",
          "url": "https://drive.google.com/file/d/1FZLxl0LbiA5zvI0ITP9m5iugqGkFoA0o/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 6,
      "title": "فصل ششم: چندریختی",
      "files": [
        {
          "id": 6,
          "name": "فصل ششم: چندریختی.ZIP",
          "url": "https://drive.google.com/file/d/1X_2rLkvdKuvWJg4ZxIpyvF7B6kt5RXcK/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 7,
      "title": "فصل هفتم: کلاس‌های انتزاعی و واسط‌ها",
      "files": [
        {
          "id": 7,
          "name": "فصل هفتم: کلاس‌های انتزاعی و واسط‌ها.ZIP",
          "url": "https://drive.google.com/file/d/1E9gx-1P4kt0U1P6aJ4rK-fnvbB24RCBp/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 8,
      "title": "فصل هشتم: بسته‌ها و مدیریت استثناها",
      "files": [
        {
          "id": 8,
          "name": "فصل هشتم: بسته‌ها و مدیریت استثناها.ZIP",
          "url": "https://drive.google.com/file/d/1m9Ce0fjQ1yUpD-NPfiJYk2fV7TYkK5dD/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 9,
      "title": "فصل نهم: کلاس‌های Wrapper و کلاس String",
      "files": [
        {
          "id": 9,
          "name": "فصل نهم: کلاس‌های Wrapper و کلاس String.ZIP",
          "url": "https://drive.google.com/file/d/1LZz6pPR6tL7lZBGKjA05VfxDItZpS3Jf/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 10,
      "title": "فصل دهم: مجموعه‌ها (Collections)",
      "files": [
        {
          "id": 10,
          "name": "فصل دهم: مجموعه‌ها (Collections).ZIP",
          "url": "https://drive.google.com/file/d/1HkEcjV-dXZmJpXbXvYjMDbC3VvY-3vno/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 11,
      "title": "فصل یازدهم: واسط‌های گرافیکی کاربر (GUI)",
      "files": [
        {
          "id": 11,
          "name": "فصل یازدهم: واسط‌های گرافیکی کاربر (GUI).ZIP",
          "url": "https://drive.google.com/file/d/1nEcb6exP36cRBHYr0cW2soD3BSsPbMy1/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 12,
      "title": "فصل دوازدهم: برنامه‌نویسی سوکت",
      "files": [
        {
          "id": 12,
          "name": "فصل دوازدهم: برنامه‌نویسی سوکت.ZIP",
          "url": "https://drive.google.com/file/d/1q6thjWlHt2zH3NhFZtgw2hu4mI8QElb0/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 13,
      "title": "فصل سیزدهم: برنامه‌نویسی چندنخی",
      "files": [
        {
          "id": 13,
          "name": "فصل سیزدهم: برنامه‌نویسی چندنخی.ZIP",
          "url": "https://drive.google.com/file/d/1XqgQdOReeyRtfQfW5El0hSxAKl1ZgkSN/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 14,
      "title": "فصل چهاردهم: پایگاه داده‌ها",
      "files": [
        {
          "id": 14,
          "name": "فصل چهاردهم: پایگاه داده‌ها.ZIP",
          "url": "https://drive.google.com/file/d/1hKpYqk6hyQ-8lOVzGVmEo4bFkLhOaYkU/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 15,
      "title": "فصل پانزدهم: فایل‌ها",
      "files": [
        {
          "id": 15,
          "name": "فصل پانزدهم: فایل‌ها.ZIP",
          "url": "https://drive.google.com/file/d/1X4jV_Rt3f9o6s0t5Z2bZ6ugE6bxC0h3u/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    },
    {
      "id": 16,
      "title": "فصل شانزدهم: پروژه نهایی",
      "files": [
        {
          "id": 16,
          "name": "فصل شانزدهم: پروژه نهایی.ZIP",
          "url": "https://drive.google.com/file/d/1L0O-7sk7Kj4BBu9fN_8fYTVe-9j3Pv3J/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    }
  ]
},
{
  "id": "4",
  "title": "ساختمان داده‌ها (مقطع کارشناسی)",
  "instructor": "نامشخص",
  "shortDescription": "آموزش کامل ساختمان داده‌ها به همراه مثال‌ها و پیاده‌سازی‌ها",
  "longDescription": "این دوره شامل مفاهیم اصلی ساختمان داده‌ها از آرایه‌ها، لیست‌های پیوندی، بازگشت، پشته و صف گرفته تا درخت‌ها، گراف‌ها، جدول درهم‌سازی و ساختارهای پیشرفته است. هر فصل شامل فایل‌های آموزشی و اسلایدهای کمکی می‌باشد.",
  "isPaid": false,
  "imageUrl": "https://upload.wikimedia.org/wikipedia/commons/7/7d/Hash_table_3_1_1_0_1_0_0_SP.svg",
  "sections": [
    {
      "id": 1,
      "title": "بخش اول: مباحث ساختمان داده",
      "files": [
        {
          "id": 1,
          "name": "فصل اول: آرایه.ZIP",
          "url": "https://drive.google.com/file/d/1PyAx5HKD1QbKWN4UvfKpt3TNbmKN8eBD/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 2,
          "name": "فصل دوم: لیست پیوندی.ZIP",
          "url": "https://drive.google.com/file/d/1diNI4in9tuIw7jTAH6vBibo-beU66rJC/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 3,
          "name": "فصل سوم: تحلیل الگوریتم.ZIP",
          "url": "https://drive.google.com/file/d/11_DUjC20-C5LyYLgNeW2KRcNxkv3ijyr/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 4,
          "name": "فصل چهارم: بازگشتی.ZIP",
          "url": "https://drive.google.com/file/d/1pTVqKWpTUrkLcIcxNrgMoPxLXp9Aeoif/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 5,
          "name": "فصل پنجم: پشته، صف، صف دوطرفه، لیست.ZIP",
          "url": "https://drive.google.com/file/d/1Uscx1S0-JxdDYWHOxQaD0Qcgc6jythUH/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 6,
          "name": "فصل ششم: درخت.ZIP",
          "url": "https://drive.google.com/file/d/11FqpiyWkHw4y5Sp3pbuP77J_H4CuECno/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 7,
          "name": "فصل هفتم: صف اولویت.ZIP",
          "url": "https://drive.google.com/file/d/17Za83mGlt8Kx-Zd90OQuAci2RLWm6ton/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 8,
          "name": "فصل هشتم: نگاشت، جدول درهم‌سازی، لیست‌های پرشی.ZIP",
          "url": "https://drive.google.com/file/d/1mus-_bQrS7HmrC7QY_ZgYnnslJLq1REk/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 9,
          "name": "فصل نهم: درخت جستجو.ZIP",
          "url": "https://drive.google.com/file/d/1Snx2vJGaFPtPIQ5iicLOFn-5f6ojwspn/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 10,
          "name": "فصل دهم: گراف.ZIP",
          "url": "https://drive.google.com/file/d/19OmfHKFLR3f5cX9rjF5q8Sq1-g6AgjoY/view?usp=drive_link",
          "type": "ZIP"
        },
        {
          "id": 11,
          "name": "دانلود اسلایدهای درس.ZIP",
          "url": "https://drive.google.com/file/d/1ZkJAhebDbKWmc8v8DxSRm6dyyX5Z9sW7/view?usp=sharing",
          "type": "ZIP"
        }
      ],
      "videos": []
    }
  ]
}


  ];
  
