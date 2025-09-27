import type { Member, Program ,Job} from './types';



export const mockJobs: Job[] = [
  {
    id: 1,
    title: 'توسعه‌دهنده ارشد React',
    company: 'کافه‌بازار',
    location: 'تهران',
    type: 'تمام وقت',
    logo: 'https://picsum.photos/seed/bazar/100/100',
    description: 'ما به دنبال یک توسعه‌دهنده ارشد React با انگیزه و با تجربه هستیم تا به تیم ما بپیوندد. شما مسئول توسعه و نگهداری اپلیکیشن‌های وب ما خواهید بود. تجربه کار با Redux و TypeScript الزامی است.',
    tags: ['React', 'TypeScript', 'Redux', 'Frontend'],
    postedDate: '۲ روز پیش'
  },
  {
    id: 2,
    title: 'طراح محصول (UI/UX)',
    company: 'دیجی‌کالا',
    location: 'تهران',
    type: 'تمام وقت',
    logo: 'https://picsum.photos/seed/digikala/100/100',
    description: 'تیم طراحی دیجی‌کالا به دنبال یک طراح محصول خلاق و با استعداد است. شما در تمام مراحل فرآیند طراحی، از تحقیق تا تحویل نهایی، مشارکت خواهید داشت. آشنایی با Figma و ابزارهای پروتوتایپینگ ضروری است.',
    tags: ['UI', 'UX', 'Figma', 'Design'],
    postedDate: '۵ روز پیش'
  },
  {
    id: 3,
    title: 'مهندس نرم‌افزار (Backend)',
    company: 'اسنپ',
    location: 'کرج',
    type: 'تمام وقت',
    logo: 'https://picsum.photos/seed/snapp/100/100',
    description: 'به یک مهندس نرم‌افزار Backend برای توسعه و بهینه‌سازی سرویس‌های ما نیازمندیم. تسلط بر زبان Go یا Python و تجربه کار با میکروسرویس‌ها مزیت محسوب می‌شود.',
    tags: ['Backend', 'Go', 'Python', 'Microservices'],
    postedDate: '۱ هفته پیش',
    isExpired: true,
  },
  {
    id: 4,
    title: 'کارشناس بازاریابی دیجیتال',
    company: 'تپسی',
    location: 'مشهد',
    type: 'پاره وقت',
    logo: 'https://picsum.photos/seed/tapsi/100/100',
    description: 'اگر به دنیای بازاریابی دیجیتال علاقه‌مند هستید و با مفاهیم SEO، SEM و بازاریابی محتوا آشنایی دارید، این فرصت شغلی برای شماست. ما به دنبال فردی خلاق برای مدیریت کمپین‌های آنلاین خود هستیم.',
    tags: ['Digital Marketing', 'SEO', 'Content Marketing'],
    postedDate: 'دیروز'
  },
  {
    id: 5,
    title: 'مدیر محصول',
    company: 'علی‌بابا',
    location: 'تهران',
    type: 'تمام وقت',
    logo: 'https://picsum.photos/seed/alibaba/100/100',
    description: 'به عنوان مدیر محصول، شما مسئول تعریف چشم‌انداز محصول، جمع‌آوری نیازمندی‌ها و اولویت‌بندی آن‌ها برای تیم توسعه خواهید بود. سابقه کار مرتبط در حوزه گردشگری مزیت محسوب می‌شود.',
    tags: ['Product Management', 'Agile', 'Roadmap'],
    postedDate: '۱۰ روز پیش',
    isExpired: true,
  },
  {
    id: 6,
    title: 'توسعه‌دهنده Flutter',
    company: 'آپ',
    location: 'اصفهان',
    type: 'تمام وقت',
    logo: 'https://picsum.photos/seed/up/100/100',
    description: 'برای توسعه اپلیکیشن‌های موبایل خود به دنبال یک توسعه‌دهنده Flutter ماهر هستیم. شما با تیم‌های طراحی و بک‌اند برای ارائه یک تجربه کاربری عالی همکاری خواهید کرد.',
    tags: ['Flutter', 'Mobile', 'Dart'],
    postedDate: '۳ روز پیش'
  },
  {
    id: 7,
    title: 'مهندس DevOps',
    company: 'همراه اول',
    location: 'تهران',
    type: 'تمام وقت',
    logo: 'https://picsum.photos/seed/mci/100/100',
    description: 'ما به دنبال یک مهندس DevOps برای مدیریت و خودکارسازی زیرساخت‌های خود هستیم. تجربه کار با Docker، Kubernetes و ابزارهای CI/CD ضروری است.',
    tags: ['DevOps', 'Docker', 'Kubernetes', 'CI/CD'],
    postedDate: '۴ روز پیش'
  },
  {
    id: 8,
    title: 'تحلیلگر داده',
    company: 'ایرانسل',
    location: 'شیراز',
    type: 'پروژه‌ای',
    logo: 'https://picsum.photos/seed/irancell/100/100',
    description: 'به یک تحلیلگر داده برای استخراج بینش‌های ارزشمند از داده‌های حجیم نیازمندیم. تسلط بر SQL و Python و آشنایی با ابزارهای مصورسازی داده مانند Tableau مزیت است.',
    tags: ['Data Analysis', 'SQL', 'Python', 'Tableau'],
    postedDate: '۶ روز پیش'
  },
  {
    id: 9,
    title: 'نویسنده محتوای فنی',
    company: 'فرادرس',
    location: 'دورکاری',
    type: 'پروژه‌ای',
    logo: 'https://picsum.photos/seed/faradars/100/100',
    description: 'اگر به نوشتن علاقه‌مندید و می‌توانید مفاهیم پیچیده فنی را به زبان ساده توضیح دهید، به تیم محتوای ما بپیوندید. شما مسئول نوشتن مقالات وبلاگ، مستندات و راهنماهای فنی خواهید بود.',
    tags: ['Content Writing', 'Technical', 'Blogging'],
    postedDate: '۱ روز پیش'
  },
];

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
      }
    ],
    "imageUrl": "https://storage.c2.liara.space/charset99/members/photo_2025-09-27 04.15.21.jpeg",
    "bio": "یک ادم علاقمند به کار تیمی \nدوس داره همجا باشه و تاجایی که میتونه بهم بهمه کمک کنه"
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
        "year": 1402,
        "position": "عضو انجمن"
      },
      {
        "year": 1403,
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
        "year": 1402,
        "position": "عضو انجمن"
      },
      {
        "year": 1403,
        "position": "عضو انجمن"
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
  }
];

export const PROGRAMS: Program[] = [
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
      6
    ],
 "participants": 150,
    "hours": 3,
    "rating": 4.8,

    "sponsors": [
      {
        "id": 1,
        "name": "داتین",
        "logoUrl": "https://storage.c2.liara.space/charset99/mohamad/sponsors/2025-09-27 04.27.14.jpg"
      }
    ],
    "status": "upcoming",
    "gallery": {
      "images": [],
      "videos": [
        "https://storage.c2.liara.space/charset99/programs_gallery/2025-09-27 04.28.24.mp4"
      ]
    }
  },
  {
    "id": 2,
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
      6
    ],
    "participants": 150,
    "hours": 3,
    "rating": 4.8,
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
  }
];
