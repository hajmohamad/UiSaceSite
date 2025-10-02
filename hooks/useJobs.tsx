
import { useState, useEffect } from 'react';
import type { Job } from '../types';

const getExpiryDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const mockJobs: Job[] =[
  {
    "id": "tFcU",
    "title": "برنامه‌نویس هوش مصنوعی (AI-اصفهان)",
    "company": "ایرانیکارت | IraniCard",
    "logo": "https://thumb2.jobinjacdn.com/1Vi06egsTH4xze_O94cMRaEgD2k=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/381c74b3-ddbf-4bc4-a58a-81c196f3933b/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "ما در تیم‌مون به دنبال یک هم‌تیمی باهوش و علاقه‌مند به حوزه هوش مصنوعی هستیم که تجربه عملی در کار با مدل‌های زبانی بزرگ (LLM) و RAG Pipelines داشته باشه.\nاگر عاشق چالش‌های جدید در دنیای NLP هستید و دوست دارید روی پروژه‌های واقعی و تاثیرگذار کار کنید، جای شما پیش ما خالیه!\nوظایف و مسئولیت‌ها:\nتوسعه و بهبود سیستم‌های مبتنی بر LLM و RAG\nطراحی و پیاده‌سازی Pipelines پردازش زبان طبیعی\nاستقرار و نگهداری مدل‌ها در محیط عملیاتی\nتحقیق، آزمایش و مستندسازی راهکارهای نوآورانه\nمهارت‌های مورد نیاز:\nتسلط به مفاهیم LLM\nتجربه عملی در RAG Pipelines (Vector DB، Embedding Models، Retrieval Strategies)\nتسلط به Python و کتابخانه‌های مرتبط (LangChain، LlamaIndex، HuggingFace Transformers)\nآشنایی با مفاهیم Deep Learning و کتابخانه PyTorch\nتجربه در MLOps و استقرار مدل‌ها (Docker, Kubernetes, CI/CD)\nتجربه در ارزیابی مدل‌ها و متریک‌های NLP\nتسلط به توسعه API وکتابخانه FastAPI یا Flask\nتوانایی تحقیق، مستندسازی و ارائه راهکارهای نوآورانه\nمزایا و شرایط همکاری:\nساعت کاری منعطف\nمحیط کاری پویا و دوستانه\nامکان کار بر روی پروژه‌های واقعی و چالش‌برانگیز\nامکان یادگیری و رشد حرفه‌ای در کنار تیمی متخصص",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tqCV",
    "title": "Back-End Developer (Golang-اصفهان)",
    "company": "مهداد | Mahdaad",
    "logo": "https://thumb2.jobinjacdn.com/WapebEcESwnbxMoGFb7Z5sIYgb8=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/8b6ff380-f1aa-4c94-a626-9b376fbfbe19/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tzim",
    "title": "برنامه نویس جاوا (اصفهان-حضوری)",
    "company": "ساراکو | SARAco",
    "logo": "https://thumb2.jobinjacdn.com/sA3AhzZnDpzDFmFd0IdbuB8m-Ho=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/955d1fe8-c452-4f52-bfc2-596e354e9471/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tzhI",
    "title": "برنامه‌نویس Full-Stack (اصفهان-NET.)",
    "company": "شهر و فناوری | Shahro Fanavari",
    "logo": "https://thumb2.jobinjacdn.com/lsUklw2ruGB6XifxupTK90pFNd4=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/618d7cff-2f8c-441a-a94d-36181a45c0e2/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "نیاز به برنامه نویس مسلط به زبانهای\n#C\nNET.\nMVC\nNetCore.\nAngular\nReact\nSQL Server\nمحل کار در فضای اشتراکی آبی و سفید واقع در مجموعه روبروی هتل عباسي اصفهان میباشد.",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tzhy",
    "title": "Senior Front-End Developer (اصفهان)",
    "company": "مستر بلیط | Mrbilit",
    "logo": "https://thumb2.jobinjacdn.com/F8j4E7pdLyLMYzM98_szouWjbpg=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/92da8922-0879-46c9-9291-61bb33445f1d/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "t6QF",
    "title": "برنامه‌نویس Django (اصفهان)",
    "company": "دانش بنیان مهندسی ارتباطی پیام پرداز | Payam Pardaz",
    "logo": "https://thumb2.jobinjacdn.com/mpySuxKHPS3v_oY0-l5LTKiM7hM=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/5fb9191d-0814-41e4-996b-c33bef7ae690/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "ما در تیم خود به دنبال یک\nتوسعه‌دهنده پایتون باانگیزه، متعهد و با تجربه حرفه‌ای\nهستیم تا در کنار ما در مسیر توسعه محصولات نرم‌افزاری با کیفیت قرار بگیرد.\nاگر به\nحل مسائل فنی پیچیده\nعلاقه‌مند هستید و سابقه‌ی کار مؤثر در\nپروژه‌های بزرگ و چالش‌برانگیز\nرا دارید، خوشحال می‌شویم در کنار شما آینده‌ی بهتری بسازیم.",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "AXWg",
    "title": "Senior Angular Developer (اصفهان)",
    "company": "دانش بنیان مهندسی ارتباطی پیام پرداز | Payam Pardaz",
    "logo": "https://thumb2.jobinjacdn.com/mpySuxKHPS3v_oY0-l5LTKiM7hM=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/5fb9191d-0814-41e4-996b-c33bef7ae690/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "مهارت های تخصصی و دانش مورد نیاز :",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "AQSI",
    "title": "Senior Full-Stack Developer (اصفهان)",
    "company": "دانش بنیان مهندسی ارتباطی پیام پرداز | Payam Pardaz",
    "logo": "https://thumb2.jobinjacdn.com/mpySuxKHPS3v_oY0-l5LTKiM7hM=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/5fb9191d-0814-41e4-996b-c33bef7ae690/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "دانش تخصصی و مهارت های مورد نیاز :",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tzMx",
    "title": "برنامه‌نویس Full-Stack(اصفهان)",
    "company": "ایرانی سافت | Irani Soft",
    "logo": "https://thumb2.jobinjacdn.com/gbuYzhEPOwLSfqoPVr6H0Ianl58=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/8f65460e-caa6-4e91-8549-ab12c6c34dba/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tzjg",
    "title": "برنامه‌نویس ASP.NET (اصفهان)",
    "company": "ساینا سیسستم اسپادان | Sayna System Espadan",
    "logo": "https://thumb2.jobinjacdn.com/31Sqqi8NEFQpPXd50rfvns7653k=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/30b64230-5284-447e-b786-adf5405b17fb/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "شرایط احراز",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "A9EI",
    "title": "Mid-level Back-end Developer (اصفهان)",
    "company": "اسنپ کارفیکس | Snapp Carfix",
    "logo": "https://thumb2.jobinjacdn.com/fieHet7-lgwWD0HVYZDZozTZ1UQ=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/8a84c742-2bd5-4fa8-bd27-cee69f975df9/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tzab",
    "title": "برنامه‌نویس بک‌اند (Laravel-اصفهان)",
    "company": "شیدال | sheydal",
    "logo": "https://jobinja.ir/assets/img/logo-placeholder.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              پاره‌وقت",
    "salary": null,
    "description": "نوع همکاری: تمام‌وقت یا پاره‌وقت (۳ روز در هفته)\nاصفهان – حضوری کامل (On-site)\nحقوق: توافقی بر اساس مهارت و تجربه + پاداش عملکرد\nشروع: ASAP\nمسئولیت‌ها\nتوسعه و نگهداری سرویس‌های بک‌اند با PHP 8.2 , 8.3 و Laravel 10+\nطراحی و بهبود RESTful API‌ها (احراز هویت، مجوزدهی، مدیریت خطا)\nتست‌نویسی ساختاریافته با PHPUnit , Pest (Unit , Feature , Integration)، افزایش شاخص پوشش تست\nمستندسازی فنی: نگهداری OpenAPI , Swagger برای API، README، Runbook و ثبت تصمیمات معماری (ADR)\nبهینه‌سازی دیتابیس MySQL (طراحی Schema، ایندکس‌گذاری، پروفایلینگ کوئری‌ها)\nپیاده‌سازی Queue , Job با Redis (Horizon)، زمان‌بندی‌ها (Scheduler) و الگوهای مقاوم‌سازی (Retry , Outbox)\nکدنویسی تمیز، ریووی کد، و استفاده از ابزارهای کیفیت کد\nهمکاری نزدیک با تیم فرانت‌اند/موبایل و مشارکت در PRها\nالزامات (Must-have)\nتسلط به PHP و Laravel 10+\nتجربهٔ عملی با MySQL، مهاجرت‌ها، تراکنش‌ها و Eloquent\nآشنایی با Redis، Queues، Caching\nتسلط به Git و گردش‌کار تیمی (Branching , PR , Code Review)\nامنیت در عمل: آشنایی با OWASP Top 10، اعتبارسنجی ورودی، Rate Limiting، CSRF , XSS , SQLi، لاگ و Audit Trail، مدیریت Secretها و کانفیگ\nامتیاز محسوب می‌شود (Nice-to-have)\nLaravel Octane، Sanctum , Passport، Horizon\nDocker و CI , CD (Jenkins , GitHub Actions)\nRabbitMQ، Elasticsearch، Sentry , Monitoring (Prometheus , Grafana)\nمعماری Microservices , Event-Driven\nتجربه در Log Structuring، ردیابی درخواست (Correlation ID) و Observability\nمزایا\nتیم چابک و محیط یادگیری‌محور\nبودجهٔ آموزش و دسترسی به منابع یادگیری\nفرصت اثرگذاری مستقیم روی محصول و معماری\nفرآیند استخدام\nمصاحبهٔ اولیه\nمصاحبهٔ فنی (Technical)\nانجام تسک کوتاه\n۱ ماه دورهٔ آزمایشی (با حقوق؛ جهت آشنایی و ارزیابی دوطرفه)",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "A5fo",
    "title": "برنامه‌نویس ارشد فرانت اند (Angular-اصفهان)",
    "company": "ستیران | Setiran",
    "logo": "https://thumb2.jobinjacdn.com/TBRKH0EXsjQz047fZbamJ8jifyM=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/3a203b42-0413-11e7-bcdc-06a874001fea_b1f047e4-20f6-455b-9205-c14eee402902/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "ما در حال حاضر بدنبال جذب برنامه‌نویس ارشد فرانت اند  با استعداد و با انگیزه هستیم تا به تیم ما بپیوندد. در صورتی که شرایط زیر را دارید و علاقه‌مند به کار تیمی و مواجه با چالش های جدید هستید رزومه ی خود را برای ما ارسال کنید.\nمهارتهای فنی:\n- تسلط به JavaScript\n- تسلط به JQuery و\nAngularJS\n-   تسلط به Angular (TypeScript)\n- تسلط  به HTML5 و CSS3\n- تسلط به Bootstrap v5.0\n- دارای تجربه پیاده سازی انگولار در پروژه های تجاری\n- توانایی  سفارشی سازی و استفاده از قالب‌های HTML-SCSS\n- تسلط به طراحی و پیاده سازی صفحات Responsive\n- تسلط کافی به کار با Microsoft TFS\nشرح وظایف:\n- پیاده سازی ماژول های جدید\n- پیاده سازی دیزاین ها از روی Figma\n- تغییر و توسعه کامپوننت های جاری\n- تولید و یا استفاده از کتابخانه های مورد نیاز\n- رفع باگ های گزارش شده\n- انجام ارزیابی از کدهای نوشته شده برای حصول اطمینان از سازگاری با استانداردهای سازمان و سازگاری با مرورگرها و دستگاه‌های مختلف کاربران\n- برقراری ارتباطات مناسب با سایر اعضا و ارائه‌ی نتایج کار و بازخورد به سرپرست\nمهارتهای عمومی:\n- روحیه همکاری تیمی\n- در دسترس بودن و پاسخ دهی به موقع\n- مشتاق و توانا در حل مسائل و مشکلات و چالشهای پیچیده\n- علاقمند به یادگیری سریع و استفاده از متدها و تکنولوژیهای جدید\n- دارای روحیه آموزش دهی و اشتراک گذاری دانش\n- وقت ‌شناس، متعهد و مسئولیت پذیر\n- تسلط به زبان انگلیسی در سطح مطالعه و درک متون انگلیسی\nآشنایی با موارد زیر مزیت محسوب می شود:\n- تجربه پیاده‌سازی داشبرد های مدیریتی\n- انواع Design Pattern و Best Practiceها\n- تست نویسی و ابزارهای مرتبط\nشرایط همکاری و مزایا:\n- حداقل 3 سال سابقه کاری\n- پرداخت حقوق منظم\n- امکان همکاری بلند مدت به همراه ایجاد امنیت شغلی\n- مکان دروازه شیراز - ابتدای چهارباغ بالا",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "ttnX",
    "title": "برنامه‌نویس ارشد Back-End (NodeJS-اصفهان)",
    "company": "ایرانیکارت | IraniCard",
    "logo": "https://thumb2.jobinjacdn.com/1Vi06egsTH4xze_O94cMRaEgD2k=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/381c74b3-ddbf-4bc4-a58a-81c196f3933b/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "مجموعه\nایرانیکارت\nدر راستای\nتوسعه محصولات\nو\nگسترش تیم فنی\nخود، به دنبال چند\nتوسعه‌دهنده‌ی بک‌اند باتجربه و با مهارت بالا\nدر محیط\nNode.js\nاست.",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "t2kk",
    "title": "برنامه‌نویس ارشد Laravel (اصفهان)",
    "company": "ایرانیکارت | IraniCard",
    "logo": "https://thumb2.jobinjacdn.com/1Vi06egsTH4xze_O94cMRaEgD2k=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/381c74b3-ddbf-4bc4-a58a-81c196f3933b/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "مجموعه\nایرانیکارت\nهمواره به دنبال همکاری با بهترین‌هاست و در این مسیر، پذیرای برنامه‌نویسان حرفه‌ای و توانمند در\nفریم‌ورک لاراول\nهستیم. اگر شما نیز دارای مهارت‌ها و توانایی‌های لازم در زمینه برنامه‌نویسی هستید و علاقه‌مند به پیوستن به تیمی پویا و حرفه‌ای می‌باشید، رزومه خود را برای ما ارسال کنید.\nما در ایرانیکارت محیطی مناسب برای رشد و پیشرفت شما فراهم می‌کنیم تا در کنار یکدیگر به بهترین‌ها دست پیدا کنیم.\nشرایط احراز:",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tS0u",
    "title": "معاون مدیر تکنولوژی (اصفهان)",
    "company": "ایرانیکارت | IraniCard",
    "logo": "https://thumb2.jobinjacdn.com/1Vi06egsTH4xze_O94cMRaEgD2k=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/381c74b3-ddbf-4bc4-a58a-81c196f3933b/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "ما در\nایرانیکارت\nدر جستجوی فردی توانمند، مسئولیت‌پذیر و باانگیزه برای نقش\nمعاون مدیر تکنولوژی\nهستیم؛ کسی که با تکیه بر دانش فنی عمیق و مهارت‌های رهبری تیم، بتواند\nدر کنار مدیر تکنولوژی (CTO)\nمسیر توسعه‌ی فنی سازمان را هدایت کند.\nاگر تجربه و مهارت هایی که دارید با این موقعیت شغلی هم راستا است، منتظر دریافت رزومه شما هستیم.\nشرایط عمومی:",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tJa0",
    "title": "برنامه‌نویس ارشد بک‌اند (Senior Backend Developer-اصفهان)",
    "company": "داده پژوه آریا | Dade Pajoohe Aria",
    "logo": "https://thumb2.jobinjacdn.com/SwcG9TplVuwFe4LNjet97gFkwYk=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/129ae7fa-9756-11ea-b9e0-26a4da5b8340_665da057-0a95-4201-ab2a-3c508ef79599/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "تجارب مورد نیاز",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tJZp",
    "title": "کارشناس نصب نرم افزار های کامپیوتری (اصفهان)",
    "company": "پارتوفیکس | Partofix",
    "logo": "https://thumb2.jobinjacdn.com/YW8o2c-HwvrOh3QDb9stds4CEA8=/fit-in/128x128/filters:strip_exif():fill(white):format(jpeg)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/efed88eb-aaed-4501-a632-442ceb867ded/main.jpg",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "جهت تکمیل تیم واحد خدمات به دنبال هم‌تیمی توانمند، باانگیزه و با روابط عمومی بالا جهت تصدی جایگاه کارشناس نصب انواع نرم افزار کامپیوتری در قلب بازار کامپیوتر اصفهان هستیم. پس اگر توانایی و علاقه به فعالیت در موقعیت شغلی کارشناس نرم افزار را دارید، رزومه خودتون رو برای ما ارسال کنید.",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "tz2Y",
    "title": "مشاور توسعه‌دهنده ارشدLaravel Backend (Flutter/Jitsi-دورکاری)",
    "company": "تک اند بیاند ای تی | Tech and Beyond it",
    "logo": "https://thumb2.jobinjacdn.com/0KpyKtsWXCfRYjZcxVGdVytcGoQ=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/d4d28baf-aeb1-493d-8dc4-33330e34d29f/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              دورکاری",
    "salary": null,
    "description": "عنوان شغل: Senior Developer (Backend + Flutter + Jitsi) – نقش مشاوره‌ای/منتورینگ\nنوع همکاری: پاره‌وقت، دورکار، ~۱۲ ساعت در هفته\nترجیح زمانی: پنجشنبه و جمعه؛ در صورت عدم تکمیل، تکمیل ساعات طی هفته ممکن است.\nمأموریت نقش\nMVP پلتفرم تکمیل شده و نسخه نمایشی آماده است. اکنون هدف، آماده‌سازی نسخه Production سبک و پایدار برای اجرای پایلوت در یک مرکز است. تمرکز اصلی بر منتورینگ فنی، بازبینی معماری/کد، هدایت تیم داخلی و تکمیل نیازهای نسخه عملیاتی است.\nمسئولیت‌ها\n• بازبینی معماری فعلی (اپ‌ها، بک‌اند، دیتابیس، احراز هویت، پرداخت) و ارائه نقشه بهبود\n• راهنمایی تیم برای پیاده‌سازی مراحل پایلوت (مدیریت مراکز/خدمات، مدیریت ارائه‌دهندگان، اصلاح اپ بیمار، بهبود اپ ارائه‌دهنده، سیستم پرداخت، آماده‌سازی پایلوت)\n• طراحی و پیاده‌سازی مهاجرت از Agora به Jitsi (Backend + Flutter)\n• طراحی و بهینه‌سازی اسکیما دیتابیس برای مسیرهای مالی و گزارش‌ها\n• توصیه‌های امنیتی (Role/Scope، محافظت از API، لاگ‌گذاری، مانیتورینگ، ریت‌لیمیت، ضدتقلب)\n• ارائه نمونه‌کد و راهکارهای عملی در نقاط حساس (Auth، Webhooks پرداخت، صف/Queue برای نوتیفیکیشن، تماس صوتی/تصویری Jitsi)\nمهارت‌ها و تجربه\n• Backend:\n• Laravel/PHP (ترجیح) یا Nodejs/TypeScript\n• طراحی RDBMS (MySQL/Postgres)، مدل‌سازی مالی، تراکنش، Consistency، گزارشات تحلیلی\n• تجربه پرداخت/Wallet و تسویه به حساب «مرکز»\n• طراحی API تمیز، نسخه‌بندی، RBAC، لاگینگ و مانیتورینگ\n• Flutter:\n• معماری State Management (Provider/Bloc/Riverpod)، ساخت نسخه سبک، بهینه‌سازی Performance\n• تجربه Chat (Firebase/Socket) و نوتیفیکیشن\n• پشتیبانی آفلاین محدود، Handling شبکه ضعیف، Asset/Media Optimization\n• Jitsi:\n• تجربه کامل در راه‌اندازی، کانفیگ و ادغام Jitsi با بک‌اند و اپ فلاتر\n• آشنایی با JWT Authentication، Load Balancing و Self-Hosting\n• تجربه عملی در مهاجرت از Agora به Jitsi\n• DevOps/Security (مزیت):\n• CI/CD ساده، محیط Stage/Prod، Observability (Logs/Metrics/Tracing)\n• امنیت API، مدیریت کلیدها/توکن‌ها، ریت‌لیمیت، ضد‌اسپم/ضد‌تقلب\nخروجی‌های کلیدی\n• نقشه راه آماده‌سازی Production\n• چک‌لیست امنیت و کارایی + توصیه‌های عملی\n• نمونه‌کد برای ماژول‌های حساس (Jitsi Voice/Video، پرداخت به مرکز، Webhook، صف)\n• طراحی/بازنویسی اسکیما گزارش‌گیری (مرکز/خدمت/ارائه‌دهنده)\n• معیارهای پذیرش پایلوت (KPIs): نرخ موفقیت نوبت، تاخیر Media، Crash-Free، موفقیت پرداخت، زمان بارگذاری در دستگاه‌های ضعیف\nشرایط همکاری\n• پاره‌وقت، دورکار، ~۱۲ ساعت/هفته\n• ترجیح: پنجشنبه و جمعه، انعطاف برای تکمیل ساعات در طول هفته",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  },
  {
    "id": "AXqN",
    "title": "Senior .Net Developer (اصفهان)",
    "company": "الکترومیزان اندیشه  | Electromizan Andishe co",
    "logo": "https://thumb2.jobinjacdn.com/v3nk-GpLmUj0W4XVdM4Cu_pbVsw=/fit-in/128x128/filters:strip_exif():fill(transparent):format(png)/https://mstorage2.jobinjacdn.com/other/files/uploads/images/304c989c-4a64-4539-9430-2695dd505f76/main.png",
    "location": "اصفهان، اصفهان",
    "type": "قرارداد\n              تمام‌وقت",
    "salary": null,
    "description": "یک شرکت فعال در حوزه فناوری اطلاعات برای تکمیل کادر تولید خود اقدام به جذب تعدادی برنامه نویس با مشخصات زیر می نماید:\n1- تسلط به NET CORE.\n2- آشنایی به طراحی صفحات وب با html و css  به صورت responsive\n3- آشنایی با سورس کنترل git\n4- حداقل سه سال سابقه کار\n5-  روحیه کار تیمی\n6- خلاق وایده پرداز\n7- آشنایی با طراحی UI و UX مزیت میباشد",
    "responsibilities": [],
    "qualifications": [],
    "expiryDate": getExpiryDate(-1)
  }
]

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setJobs(mockJobs);
  }, []);

  return { jobs };
};
