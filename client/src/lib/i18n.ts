import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "shop": "Shop",
        "nursery": "Nursery",
        "about": "About Us",
        "contact": "Contact Us"
      },
      "hero": {
        "badge": "New Planting Season",
        "title": "Plant Your Future with",
        "brand": "Al-Qadri Nurseries",
        "subtitle": "At Al-Qadri Nurseries, we provide the best seeds, fertilizers, and agricultural equipment to ensure a bountiful and high-quality harvest.",
        "shop_now": "Shop Now",
        "learn_more": "Learn More"
      },
      "features": {
        "quality": "Guaranteed Quality",
        "quality_desc": "100% original products from the best global brands",
        "delivery": "Fast Delivery",
        "delivery_desc": "Fast and reliable delivery service to all regions of the Kingdom",
        "price": "Competitive Prices",
        "price_desc": "Best prices in the market with continuous seasonal offers"
      },
      "sections": {
        "categories": "Main Categories",
        "featured": "Featured Products",
        "view_all": "View All",
        "browse_featured": "Browse Featured"
      },
      "footer": {
        "desc": "Your first destination for high-quality agricultural products from Al-Qadri Nurseries. We provide seeds, fertilizers, and equipment to help your farm flourish.",
        "quick_links": "Quick Links",
        "privacy": "Privacy Policy",
        "contact_us": "Contact Us",
        "subscribe": "Subscribe to Newsletter",
        "email_placeholder": "Your Email",
        "subscribe_btn": "Subscribe",
        "rights": "All rights reserved."
      },
      "common": {
        "login": "Login",
        "signup": "Sign Up",
        "logout": "Logout",
        "dashboard": "Dashboard",
        "welcome": "Welcome",
        "switch_theme": "Switch Theme",
        "loading": "Loading..."
      },
      "auth": {
        "title": "Welcome to Murooj",
        "description": "Access your account to manage your plants and orders",
        "email": "Email Address",
        "password": "Password",
        "first_name": "First Name",
        "last_name": "Last Name",
        "login_success": "Login Successful",
        "welcome_back": "Welcome back!",
        "login_failed": "Login Failed",
        "register_success": "Registration Successful",
        "account_created": "Your account has been created successfully.",
        "register_failed": "Registration Failed"
      }
    }
  },
  ar: {
    translation: {
      "nav": {
        "home": "الرئيسية",
        "shop": "المتجر",
        "nursery": "المشتل",
        "about": "من نحن",
        "contact": "اتصل بنا"
      },
      "hero": {
        "badge": "موسم الزراعة الجديد",
        "title": "ازرع مستقبلك مع",
        "brand": "مشاتل القادري",
        "subtitle": "نوفر لك في مشاتل القادري أفضل البذور والأسمدة والمعدات الزراعية لتضمن محصولاً وفيراً وجودة عالية.",
        "shop_now": "تسوق الآن",
        "learn_more": "تعرف علينا"
      },
      "features": {
        "quality": "جودة مضمونة",
        "quality_desc": "منتجات أصلية 100% من أفضل العلامات التجارية العالمية",
        "delivery": "توصيل سريع",
        "delivery_desc": "خدمة توصيل سريعة وموثوقة لجميع مناطق المملكة",
        "price": "أسعار تنافسية",
        "price_desc": "أفضل الأسعار في السوق مع عروض موسمية مستمرة"
      },
      "sections": {
        "categories": "الأقسام الرئيسية",
        "featured": "منتجات مميزة",
        "view_all": "عرض الكل",
        "browse_featured": "تصفح المميز"
      },
      "footer": {
        "desc": "وجهتك الأولى للمنتجات الزراعية عالية الجودة من مشاتل القادري. نوفر البذور، الأسمدة، والمعدات لمساعدة مزرعتك على الازدهار.",
        "quick_links": "روابط سريعة",
        "privacy": "سياسة الخصوصية",
        "contact_us": "تواصل معنا",
        "subscribe": "اشترك في النشرة",
        "email_placeholder": "بريدك الإلكتروني",
        "subscribe_btn": "اشتراك",
        "rights": "جميع الحقوق محفوظة."
      },
      "common": {
        "login": "تسجيل الدخول",
        "signup": "إنشاء حساب",
        "logout": "تسجيل الخروج",
        "dashboard": "لوحة التحكم",
        "welcome": "مرحباً",
        "switch_theme": "تبديل المظهر",
        "loading": "جاري التحميل..."
      },
      "auth": {
        "title": "مرحباً بك في مروج",
        "description": "سجل دخولك لإدارة نباتاتك وطلباتك",
        "email": "البريد الإلكتروني",
        "password": "كلمة المرور",
        "first_name": "الاسم الأول",
        "last_name": "الاسم الأخير",
        "login_success": "تم تسجيل الدخول بنجاح",
        "welcome_back": "مرحباً بعودتك!",
        "login_failed": "فشل تسجيل الدخول",
        "register_success": "تم إنشاء الحساب بنجاح",
        "account_created": "تم إنشاء حسابك بنجاح.",
        "register_failed": "فشل إنشاء الحساب"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "ar",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
