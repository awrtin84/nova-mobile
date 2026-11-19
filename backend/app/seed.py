import random
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Brand, Category, Product, utcnow

CATEGORIES = [
    ("mobile", "گوشی موبایل", "phone"),
    ("tablet", "تبلت", "tablet"),
    ("smartwatch", "ساعت و مچ‌بند هوشمند", "watch"),
    ("audio", "هدفون و هندزفری", "earbuds"),
    ("charger", "شارژر و کابل", "charger"),
    ("powerbank", "پاوربانک", "powerbank"),
    ("case", "قاب و کیف", "case"),
    ("protector", "محافظ صفحه", "protector"),
    ("speaker", "اسپیکر", "speaker"),
]

BRANDS = [
    ("samsung", "سامسونگ", "Samsung"),
    ("apple", "اپل", "Apple"),
    ("xiaomi", "شیائومی", "Xiaomi"),
    ("poco", "پوکو", "POCO"),
    ("honor", "آنر", "Honor"),
    ("realme", "ریلمی", "Realme"),
    ("anker", "انکر", "Anker"),
    ("baseus", "بیسوس", "Baseus"),
    ("ugreen", "یوگرین", "UGREEN"),
    ("jbl", "جی‌بی‌ال", "JBL"),
]

COLORS = {
    "black": ("مشکی", "#1f2937"),
    "white": ("سفید", "#f1f5f9"),
    "blue": ("آبی", "#3b82f6"),
    "titanium": ("تیتانیوم", "#9ca3af"),
    "green": ("سبز", "#10b981"),
    "purple": ("بنفش", "#8b5cf6"),
    "pink": ("صورتی", "#f472b6"),
    "gold": ("طلایی", "#d4a94f"),
    "red": ("قرمز", "#ef4444"),
    "gray": ("خاکستری", "#6b7280"),
    "navy": ("سرمه‌ای", "#1e3a8a"),
    "clear": ("شفاف", "#e2e8f0"),
}


def item(slug, name, name_en, brand, category, kind, price, discount, stock, rating, hue, colors, description, specs):
    return {
        "slug": slug,
        "name": name,
        "name_en": name_en,
        "brand": brand,
        "category": category,
        "kind": kind,
        "price": price,
        "discount": discount,
        "stock": stock,
        "rating": rating,
        "hue": hue,
        "colors": colors,
        "description": description,
        "specs": specs,
    }


def phone(slug, name, name_en, brand, price, discount, stock, rating, hue, colors, storage, ram, screen, chip, camera, battery, os_name, description):
    return item(
        slug, name, name_en, brand, "mobile", "phone", price, discount, stock, rating, hue, colors, description,
        {
            "حافظه داخلی": storage,
            "حافظه رم": ram,
            "اندازه صفحه نمایش": screen,
            "پردازنده": chip,
            "دوربین اصلی": camera,
            "ظرفیت باتری": battery,
            "سیستم عامل": os_name,
        },
    )


PRODUCTS = [
    phone("samsung-galaxy-s25-256gb", "گوشی موبایل سامسونگ مدل Galaxy S25 ظرفیت ۲۵۶ گیگابایت رم ۱۲ گیگابایت", "Samsung Galaxy S25 256GB 12GB RAM", "samsung", 62900000, 6, 14, 4.7, 232, ["black", "blue", "green"], "۲۵۶ گیگابایت", "۱۲ گیگابایت", "۶٫۲ اینچ Dynamic AMOLED 2X", "Snapdragon 8 Elite", "۵۰ مگاپیکسل", "۴۰۰۰ میلی‌آمپرساعت", "Android 15", "پرچمدار جمع‌وجور سامسونگ با نمایشگر ۱۲۰ هرتز، دوربین سه‌گانه و قابلیت‌های هوش مصنوعی Galaxy AI."),
    phone("samsung-galaxy-a56-256gb", "گوشی موبایل سامسونگ مدل Galaxy A56 5G ظرفیت ۲۵۶ گیگابایت رم ۸ گیگابایت", "Samsung Galaxy A56 5G 256GB 8GB RAM", "samsung", 24500000, 8, 31, 4.4, 205, ["black", "gray", "pink"], "۲۵۶ گیگابایت", "۸ گیگابایت", "۶٫۷ اینچ Super AMOLED", "Exynos 1580", "۵۰ مگاپیکسل", "۵۰۰۰ میلی‌آمپرساعت", "Android 15", "میان‌رده‌ای با باتری قدرتمند، نمایشگر روشن و پشتیبانی طولانی‌مدت از به‌روزرسانی نرم‌افزار."),
    phone("samsung-galaxy-a36-128gb", "گوشی موبایل سامسونگ مدل Galaxy A36 5G ظرفیت ۱۲۸ گیگابایت رم ۸ گیگابایت", "Samsung Galaxy A36 5G 128GB 8GB RAM", "samsung", 19800000, 0, 22, 4.3, 160, ["black", "purple"], "۱۲۸ گیگابایت", "۸ گیگابایت", "۶٫۷ اینچ Super AMOLED", "Snapdragon 6 Gen 3", "۵۰ مگاپیکسل", "۵۰۰۰ میلی‌آمپرساعت", "Android 15", "انتخاب منطقی برای کسانی که نمایشگر خوب و عملکرد روان در بودجه متوسط می‌خواهند."),
    phone("apple-iphone-16-128gb", "گوشی موبایل اپل مدل iPhone 16 ظرفیت ۱۲۸ گیگابایت رم ۸ گیگابایت", "Apple iPhone 16 128GB 8GB RAM", "apple", 71500000, 3, 9, 4.8, 215, ["black", "white", "pink", "blue"], "۱۲۸ گیگابایت", "۸ گیگابایت", "۶٫۱ اینچ Super Retina XDR OLED", "Apple A18", "۴۸ مگاپیکسل", "۳۵۶۱ میلی‌آمپرساعت", "iOS 18", "آیفون ۱۶ با دکمه Camera Control، تراشه A18 و دوربین ۴۸ مگاپیکسلی."),
    phone("apple-iphone-16-pro-256gb", "گوشی موبایل اپل مدل iPhone 16 Pro ظرفیت ۲۵۶ گیگابایت رم ۸ گیگابایت", "Apple iPhone 16 Pro 256GB 8GB RAM", "apple", 98000000, 0, 5, 4.9, 280, ["titanium", "black", "gold"], "۲۵۶ گیگابایت", "۸ گیگابایت", "۶٫۳ اینچ Super Retina XDR ProMotion", "Apple A18 Pro", "۴۸ مگاپیکسل + تله ۵ برابر", "۳۵۸۲ میلی‌آمپرساعت", "iOS 18", "بدنه تیتانیومی، نمایشگر ۱۲۰ هرتز ProMotion و قدرتمندترین تراشه اپل برای کاربران حرفه‌ای."),
    phone("apple-iphone-15-128gb", "گوشی موبایل اپل مدل iPhone 15 ظرفیت ۱۲۸ گیگابایت رم ۶ گیگابایت", "Apple iPhone 15 128GB 6GB RAM", "apple", 55900000, 10, 18, 4.6, 190, ["black", "blue", "pink", "green"], "۱۲۸ گیگابایت", "۶ گیگابایت", "۶٫۱ اینچ Super Retina XDR OLED", "Apple A16 Bionic", "۴۸ مگاپیکسل", "۳۳۴۹ میلی‌آمپرساعت", "iOS 17", "آیفون ۱۵ با پورت USB-C، Dynamic Island و دوربین ۴۸ مگاپیکسلی."),
    phone("xiaomi-15-256gb", "گوشی موبایل شیائومی مدل Xiaomi 15 ظرفیت ۲۵۶ گیگابایت رم ۱۲ گیگابایت", "Xiaomi 15 256GB 12GB RAM", "xiaomi", 49900000, 5, 12, 4.6, 150, ["black", "white", "green"], "۲۵۶ گیگابایت", "۱۲ گیگابایت", "۶٫۳ اینچ LTPO AMOLED", "Snapdragon 8 Elite", "۵۰ مگاپیکسل Leica", "۵۴۰۰ میلی‌آمپرساعت", "Android 15 / HyperOS 2", "پرچمدار شیائومی با لنزهای Leica، شارژ سریع ۹۰ وات و باتری سیلیکون-کربن."),
    phone("xiaomi-redmi-note-14-pro-256gb", "گوشی موبایل شیائومی مدل Redmi Note 14 Pro ظرفیت ۲۵۶ گیگابایت رم ۸ گیگابایت", "Xiaomi Redmi Note 14 Pro 256GB 8GB RAM", "xiaomi", 17900000, 12, 40, 4.5, 20, ["black", "blue", "purple"], "۲۵۶ گیگابایت", "۸ گیگابایت", "۶٫۶ اینچ AMOLED ۱۲۰ هرتز", "Helio G100 Ultra", "۲۰۰ مگاپیکسل", "۵۱۱۰ میلی‌آمپرساعت", "Android 14 / HyperOS", "دوربین ۲۰۰ مگاپیکسلی، نمایشگر AMOLED و شارژ ۶۷ وات با قیمتی اقتصادی."),
    phone("xiaomi-redmi-13c-128gb", "گوشی موبایل شیائومی مدل Redmi 13C ظرفیت ۱۲۸ گیگابایت رم ۴ گیگابایت", "Xiaomi Redmi 13C 128GB 4GB RAM", "xiaomi", 8200000, 15, 55, 4.1, 30, ["black", "green", "blue"], "۱۲۸ گیگابایت", "۴ گیگابایت", "۶٫۷۴ اینچ IPS LCD ۹۰ هرتز", "Helio G85", "۵۰ مگاپیکسل", "۵۰۰۰ میلی‌آمپرساعت", "Android 13 / MIUI 14", "گوشی ورودی با باتری بزرگ و نمایشگر روان برای استفاده روزمره."),
    phone("poco-x7-pro-512gb", "گوشی موبایل پوکو مدل X7 Pro ظرفیت ۵۱۲ گیگابایت رم ۱۲ گیگابایت", "POCO X7 Pro 512GB 12GB RAM", "poco", 22400000, 7, 26, 4.5, 40, ["black", "gold", "gray"], "۵۱۲ گیگابایت", "۱۲ گیگابایت", "۶٫۶۷ اینچ AMOLED ۱۲۰ هرتز", "Dimensity 8400 Ultra", "۵۰ مگاپیکسل", "۶۵۵۰ میلی‌آمپرساعت", "Android 15 / HyperOS 2", "گوشی گیمینگ با پردازنده Dimensity 8400 و باتری ۶۵۵۰ میلی‌آمپرساعتی."),
    phone("honor-400-256gb", "گوشی موبایل آنر مدل Honor 400 ظرفیت ۲۵۶ گیگابایت رم ۸ گیگابایت", "Honor 400 256GB 8GB RAM", "honor", 27800000, 4, 17, 4.4, 160, ["gray", "gold", "green"], "۲۵۶ گیگابایت", "۸ گیگابایت", "۶٫۵۵ اینچ AMOLED ۱۲۰ هرتز", "Snapdragon 7 Gen 3", "۲۰۰ مگاپیکسل", "۵۳۰۰ میلی‌آمپرساعت", "Android 15 / MagicOS 9", "طراحی باریک، دوربین ۲۰۰ مگاپیکسلی و باتری سیلیکون-کربن."),
    phone("realme-14-pro-256gb", "گوشی موبایل ریلمی مدل 14 Pro ظرفیت ۲۵۶ گیگابایت رم ۸ گیگابایت", "Realme 14 Pro 256GB 8GB RAM", "realme", 21300000, 9, 20, 4.3, 275, ["white", "purple", "navy"], "۲۵۶ گیگابایت", "۸ گیگابایت", "۶٫۷ اینچ AMOLED ۱۲۰ هرتز", "Snapdragon 7s Gen 3", "۵۰ مگاپیکسل", "۶۰۰۰ میلی‌آمپرساعت", "Android 15 / Realme UI 6", "بدنه تغییررنگ‌دهنده در سرما، دوربین پرتره عالی و باتری ۶۰۰۰ میلی‌آمپرساعتی."),
    item("samsung-galaxy-tab-s10-fe", "تبلت سامسونگ مدل Galaxy Tab S10 FE ظرفیت ۱۲۸ گیگابایت رم ۶ گیگابایت", "Samsung Galaxy Tab S10 FE 128GB 6GB RAM", "samsung", "tablet", "tablet", 28900000, 5, 11, 4.5, 215, ["gray", "blue"], "تبلت امکانات‌محور با قلم S Pen، مقاومت IP68 و نمایشگر ۱۰٫۹ اینچی ۹۰ هرتز.", {"حافظه داخلی": "۱۲۸ گیگابایت", "حافظه رم": "۶ گیگابایت", "اندازه صفحه نمایش": "۱۰٫۹ اینچ", "پردازنده": "Exynos 1580", "باتری": "۸۰۰۰ میلی‌آمپرساعت"}),
    item("xiaomi-pad-7-256gb", "تبلت شیائومی مدل Pad 7 ظرفیت ۲۵۶ گیگابایت رم ۸ گیگابایت", "Xiaomi Pad 7 256GB 8GB RAM", "xiaomi", "tablet", "tablet", 21700000, 8, 16, 4.4, 195, ["gray", "blue"], "نمایشگر ۱۱٫۲ اینچی 3.2K با نرخ نوسازی ۱۴۴ هرتز و پردازنده Snapdragon 7+ Gen 3.", {"حافظه داخلی": "۲۵۶ گیگابایت", "حافظه رم": "۸ گیگابایت", "اندازه صفحه نمایش": "۱۱٫۲ اینچ", "پردازنده": "Snapdragon 7+ Gen 3", "باتری": "۸۸۵۰ میلی‌آمپرساعت"}),
    item("apple-watch-se-2-40mm", "ساعت هوشمند اپل مدل Watch SE 2 سایز ۴۰ میلی‌متر", "Apple Watch SE 2 40mm", "apple", "smartwatch", "watch", 17900000, 0, 13, 4.7, 10, ["black", "white", "navy"], "ساعت هوشمند اقتصادی اپل با ردیابی سلامت، تشخیص سقوط و قابلیت شنا.", {"سایز بدنه": "۴۰ میلی‌متر", "نمایشگر": "OLED Retina", "مقاومت در برابر آب": "تا عمق ۵۰ متر", "سیستم عامل": "watchOS 11"}),
    item("samsung-galaxy-watch-7-44mm", "ساعت هوشمند سامسونگ مدل Galaxy Watch7 سایز ۴۴ میلی‌متر", "Samsung Galaxy Watch7 44mm", "samsung", "smartwatch", "watch", 14600000, 11, 19, 4.4, 160, ["gray", "green"], "ساعت هوشمند با سنسور سلامت BioActive، ردیابی خواب و تحلیل ترکیب بدن.", {"سایز بدنه": "۴۴ میلی‌متر", "نمایشگر": "Super AMOLED", "حافظه": "۲ گیگابایت رم / ۳۲ گیگابایت", "باتری": "۴۲۵ میلی‌آمپرساعت"}),
    item("xiaomi-smart-band-9", "مچ‌بند هوشمند شیائومی مدل Smart Band 9", "Xiaomi Smart Band 9", "xiaomi", "smartwatch", "watch", 2650000, 14, 80, 4.3, 25, ["black", "pink", "blue"], "مچ‌بند سبک با نمایشگر AMOLED، بیش از ۱۵۰ حالت ورزشی و ۲۱ روز شارژدهی.", {"نمایشگر": "۱٫۶۲ اینچ AMOLED", "باتری": "تا ۲۱ روز", "مقاومت در برابر آب": "۵ ATM"}),
    item("apple-airpods-4", "هدفون بی‌سیم اپل مدل AirPods 4", "Apple AirPods 4", "apple", "audio", "earbuds", 11900000, 4, 30, 4.7, 340, ["white"], "ایرپادز ۴ با طراحی جدید، کیفیت صدای بهتر و پشتیبانی از Siri و صدای فضایی.", {"نوع اتصال": "بلوتوث ۵٫۳", "حذف نویز": "ندارد", "شارژ کیس": "USB-C", "شارژدهی": "تا ۵ ساعت"}),
    item("samsung-galaxy-buds-3", "هندزفری بلوتوثی سامسونگ مدل Galaxy Buds3", "Samsung Galaxy Buds3", "samsung", "audio", "earbuds", 8700000, 12, 24, 4.4, 290, ["white", "gray"], "هندزفری با حذف نویز فعال هوشمند، طراحی جدید و کیفیت صدای Hi-Fi.", {"نوع اتصال": "بلوتوث ۵٫۴", "حذف نویز": "ANC فعال", "شارژدهی": "تا ۶ ساعت"}),
    item("xiaomi-redmi-buds-6-pro", "هندزفری بلوتوثی شیائومی مدل Redmi Buds 6 Pro", "Xiaomi Redmi Buds 6 Pro", "xiaomi", "audio", "earbuds", 3150000, 15, 60, 4.2, 150, ["black", "white"], "حذف نویز تا ۵۴ دسیبل و درایور سه‌گانه با قیمت مناسب.", {"نوع اتصال": "بلوتوث ۵٫۳", "حذف نویز": "ANC فعال", "شارژدهی": "تا ۹ ساعت"}),
    item("jbl-tune-230nc-tws", "هندزفری بلوتوثی جی‌بی‌ال مدل Tune 230NC TWS", "JBL Tune 230NC TWS", "jbl", "audio", "earbuds", 4950000, 0, 35, 4.3, 165, ["black", "white", "blue"], "صدای قدرتمند JBL Pure Bass با حذف نویز فعال و ۴۰ ساعت شارژدهی با کیس.", {"نوع اتصال": "بلوتوث ۵٫۲", "حذف نویز": "ANC فعال", "شارژدهی": "تا ۴۰ ساعت با کیس"}),
    item("anker-soundcore-p40i", "هندزفری بلوتوثی انکر مدل Soundcore P40i", "Anker Soundcore P40i", "anker", "audio", "earbuds", 3400000, 10, 42, 4.4, 200, ["black", "white"], "حذف نویز هوشمند با ۶۰ ساعت شارژدهی کلی و اتصال همزمان به دو دستگاه.", {"نوع اتصال": "بلوتوث ۵٫۳", "حذف نویز": "ANC تطبیقی", "شارژدهی": "تا ۶۰ ساعت با کیس"}),
    item("anker-nano-30w-charger", "شارژر دیواری ۳۰ وات انکر مدل Nano A2147", "Anker Nano 30W Wall Charger", "anker", "charger", "charger", 1450000, 8, 90, 4.6, 15, ["black", "white"], "شارژر کوچک ۳۰ واتی با پورت USB-C و فناوری GaN برای شارژ سریع گوشی و تبلت.", {"توان خروجی": "۳۰ وات", "پورت": "۱ × USB-C", "فناوری": "GaN"}),
    item("baseus-gan5-pro-65w-charger", "شارژر دیواری ۶۵ وات بیسوس مدل GaN5 Pro", "Baseus GaN5 Pro 65W Charger", "baseus", "charger", "charger", 2850000, 12, 70, 4.5, 205, ["black", "white"], "شارژر ۳ پورت با قابلیت شارژ همزمان لپ‌تاپ و موبایل.", {"توان خروجی": "۶۵ وات", "پورت": "۲ × USB-C + ۱ × USB-A", "فناوری": "GaN"}),
    item("samsung-45w-super-fast-charger", "شارژر دیواری ۴۵ وات سامسونگ مدل EP-T4510", "Samsung 45W Super Fast Charger", "samsung", "charger", "charger", 2100000, 0, 48, 4.5, 215, ["black", "white"], "شارژر اصلی سامسونگ با پشتیبانی از Super Fast Charging 2.0.", {"توان خروجی": "۴۵ وات", "پورت": "۱ × USB-C", "پروتکل": "PD 3.0 / PPS"}),
    item("apple-20w-usb-c-power-adapter", "شارژر دیواری ۲۰ وات اپل مدل USB-C Power Adapter", "Apple 20W USB-C Power Adapter", "apple", "charger", "charger", 2400000, 0, 33, 4.6, 190, ["white"], "آداپتور رسمی اپل برای شارژ سریع آیفون و آیپد.", {"توان خروجی": "۲۰ وات", "پورت": "۱ × USB-C"}),
    item("ugreen-usb-c-to-c-100w-cable", "کابل USB-C به USB-C یوگرین مدل US300 طول ۲ متر", "UGREEN USB-C to USB-C 100W Cable 2m", "ugreen", "charger", "cable", 590000, 5, 150, 4.5, 20, ["black", "white"], "کابل بافته‌شده با پشتیبانی از شارژ ۱۰۰ وات و انتقال داده با سرعت ۴۸۰ مگابیت بر ثانیه.", {"طول": "۲ متر", "توان": "تا ۱۰۰ وات", "نوع کانکتور": "USB-C به USB-C"}),
    item("baseus-lightning-cable-1m", "کابل USB-C به لایتنینگ بیسوس مدل Cafule طول ۱ متر", "Baseus USB-C to Lightning Cable 1m", "baseus", "charger", "cable", 450000, 0, 120, 4.3, 25, ["black", "gray"], "کابل مقاوم برای شارژ سریع آیفون‌های قدیمی‌تر با روکش بافته‌شده.", {"طول": "۱ متر", "توان": "۲۰ وات", "نوع کانکتور": "USB-C به Lightning"}),
    item("anker-powercore-20000", "پاوربانک انکر مدل PowerCore 20000 ظرفیت ۲۰۰۰۰ میلی‌آمپرساعت", "Anker PowerCore 20000mAh", "anker", "powerbank", "powerbank", 3300000, 10, 38, 4.6, 10, ["black"], "پاوربانک پرظرفیت با دو پورت خروجی و شارژ سریع PowerIQ.", {"ظرفیت": "۲۰۰۰۰ میلی‌آمپرساعت", "حداکثر توان": "۲۲٫۵ وات", "پورت": "USB-C + ۲ × USB-A"}),
    item("baseus-adaman-20000-65w", "پاوربانک بیسوس مدل Adaman2 ظرفیت ۲۰۰۰۰ میلی‌آمپرساعت ۶۵ وات", "Baseus Adaman2 20000mAh 65W", "baseus", "powerbank", "powerbank", 4950000, 7, 21, 4.5, 280, ["black", "gray"], "پاوربانک ۶۵ واتی با نمایشگر دیجیتال که لپ‌تاپ را هم شارژ می‌کند.", {"ظرفیت": "۲۰۰۰۰ میلی‌آمپرساعت", "حداکثر توان": "۶۵ وات", "نمایشگر": "دیجیتال"}),
    item("xiaomi-power-bank-10000", "پاوربانک شیائومی مدل PB1022 ظرفیت ۱۰۰۰۰ میلی‌آمپرساعت", "Xiaomi Power Bank 10000mAh 22.5W", "xiaomi", "powerbank", "powerbank", 1850000, 0, 64, 4.3, 275, ["black", "white"], "پاوربانک سبک و جیبی با خروجی ۲۲٫۵ وات.", {"ظرفیت": "۱۰۰۰۰ میلی‌آمپرساعت", "حداکثر توان": "۲۲٫۵ وات"}),
    item("apple-iphone-16-silicone-case", "کاور سیلیکونی اپل مدل Silicone Case MagSafe مناسب iPhone 16", "Apple Silicone Case MagSafe for iPhone 16", "apple", "case", "case", 3250000, 0, 20, 4.6, 190, ["black", "blue", "pink", "green"], "کاور سیلیکونی اصلی با پشتیبانی از MagSafe و داخل نرم میکروفایبر.", {"سازگار با": "iPhone 16", "جنس": "سیلیکون", "قابلیت": "MagSafe"}),
    item("samsung-s25-clear-case", "کاور شفاف سامسونگ مدل Clear Case مناسب Galaxy S25", "Samsung Clear Case for Galaxy S25", "samsung", "case", "case", 1250000, 15, 36, 4.2, 205, ["clear"], "کاور شفاف مقاوم در برابر زردشدگی که طراحی گوشی را حفظ می‌کند.", {"سازگار با": "Galaxy S25", "جنس": "پلی‌کربنات و TPU"}),
    item("baseus-magnetic-case-iphone-16-pro", "قاب مغناطیسی بیسوس مدل Crystal Magnetic مناسب iPhone 16 Pro", "Baseus Crystal Magnetic Case for iPhone 16 Pro", "baseus", "case", "case", 1100000, 10, 44, 4.4, 265, ["clear", "black"], "قاب ضدضربه شفاف با آهن‌ربای داخلی سازگار با شارژرهای مگ‌سیف.", {"سازگار با": "iPhone 16 Pro", "جنس": "ژل و PC", "قابلیت": "مگنتی"}),
    item("ugreen-tempered-glass-iphone-16", "محافظ صفحه نمایش شیشه‌ای یوگرین مناسب iPhone 16 بسته ۲ عددی", "UGREEN Tempered Glass for iPhone 16 (2 pack)", "ugreen", "protector", "protector", 420000, 0, 200, 4.4, 70, ["clear"], "گلس سخت ۹H همراه با فریم نصب آسان و لایه ضدلک انگشت.", {"سازگار با": "iPhone 16", "تعداد": "۲ عدد", "سختی": "9H"}),
    item("baseus-glass-galaxy-s25", "محافظ صفحه نمایش شیشه‌ای بیسوس مناسب Galaxy S25", "Baseus Tempered Glass for Galaxy S25", "baseus", "protector", "protector", 380000, 5, 160, 4.3, 25, ["clear"], "محافظ شیشه‌ای مقاوم در برابر خط‌وخش با پشتیبانی از اسکنر اثر انگشت.", {"سازگار با": "Galaxy S25", "سختی": "9H"}),
    item("baseus-privacy-glass-iphone-16-pro", "محافظ صفحه نمایش حریم‌شخصی بیسوس مناسب iPhone 16 Pro", "Baseus Privacy Glass for iPhone 16 Pro", "baseus", "protector", "protector", 510000, 0, 75, 4.1, 190, ["clear"], "گلس ضدجاسوسی که فقط از زاویه روبه‌رو دیده می‌شود.", {"سازگار با": "iPhone 16 Pro", "ویژگی": "حریم شخصی"}),
    item("jbl-go-4", "اسپیکر بلوتوثی قابل حمل جی‌بی‌ال مدل Go 4", "JBL Go 4", "jbl", "speaker", "speaker", 3550000, 5, 52, 4.6, 205, ["black", "blue", "pink", "red"], "اسپیکر جیبی ضدآب و ضدگردوغبار با ۷ ساعت پخش پیوسته.", {"مقاومت": "IP67", "پخش پیوسته": "۷ ساعت", "اتصال": "بلوتوث ۵٫۴"}),
    item("jbl-flip-6", "اسپیکر بلوتوثی قابل حمل جی‌بی‌ال مدل Flip 6", "JBL Flip 6", "jbl", "speaker", "speaker", 8900000, 9, 17, 4.7, 205, ["black", "blue", "red", "gray"], "صدای قدرتمند با بیس عمیق، ضدآب IP67 و ۱۲ ساعت پخش پیوسته.", {"مقاومت": "IP67", "پخش پیوسته": "۱۲ ساعت", "اتصال": "بلوتوث ۵٫۱"}),
]


def seed(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(Product)):
        return

    categories = {}
    for slug, name, kind in CATEGORIES:
        category = Category(slug=slug, name=name, kind=kind)
        db.add(category)
        categories[slug] = category

    brands = {}
    for slug, name, name_en in BRANDS:
        brand = Brand(slug=slug, name=name, name_en=name_en)
        db.add(brand)
        brands[slug] = brand

    db.flush()

    rng = random.Random(7)
    now = utcnow()

    for index, data in enumerate(PRODUCTS):
        final_price = round(data["price"] * (100 - data["discount"]) / 100 / 1000) * 1000
        db.add(
            Product(
                slug=data["slug"],
                name=data["name"],
                name_en=data["name_en"],
                brand_id=brands[data["brand"]].id,
                category_id=categories[data["category"]].id,
                price=data["price"],
                discount_percent=data["discount"],
                final_price=final_price,
                stock=data["stock"],
                rating=data["rating"],
                reviews_count=rng.randint(12, 480),
                sold_count=rng.randint(40, 1800),
                visual_kind=data["kind"],
                hue=data["hue"],
                description=data["description"],
                specs=data["specs"],
                colors=[{"name": COLORS[key][0], "hex": COLORS[key][1]} for key in data["colors"]],
                created_at=now - timedelta(days=index * 2, hours=rng.randint(0, 20)),
            )
        )

    db.commit()
