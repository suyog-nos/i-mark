import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to News Portal",
      "navigation": {
        "home": "Home",
        "articles": "Articles",
        "categories": "Categories",
        "publishers": "Publishers",
        "login": "Login",
        "register": "Register",
        "profile": "Profile",
        "dashboard": "Dashboard",
        "logout": "Logout"
      },
      "auth": {
        "login": "Login",
        "register": "Register",
        "email": "Email",
        "password": "Password",
        "confirmPassword": "Confirm Password",
        "name": "Full Name",
        "forgotPassword": "Forgot Password?",
        "loginSuccess": "Login successful",
        "registerSuccess": "Registration successful",
        "invalidCredentials": "Invalid credentials",
        "userExists": "User already exists",
        "passwordMismatch": "Passwords do not match"
      },
      "articles": {
        "title": "Title",
        "content": "Content",
        "category": "Category",
        "tags": "Tags",
        "author": "Author",
        "publishedAt": "Published",
        "readMore": "Read More",
        "share": "Share",
        "like": "Like",
        "comment": "Comment",
        "views": "Views",
        "likes": "Likes",
        "shares": "Shares",
        "comments": "Comments",
        "createArticle": "Create Article",
        "editArticle": "Edit Article",
        "deleteArticle": "Delete Article",
        "publishArticle": "Publish Article",
        "draftArticle": "Save as Draft",
        "pendingApproval": "Pending Approval",
        "approved": "Approved",
        "rejected": "Rejected",
        "featuredImage": "Featured Image",
        "additionalMedia": "Additional Media"
      },
      "common": {
        "save": "Save",
        "cancel": "Cancel",
        "delete": "Delete",
        "edit": "Edit",
        "view": "View",
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "language": "Language",
        "english": "English",
        "nepali": "Nepali"
      }
    }
  },
  np: {
    translation: {
      "welcome": "समाचार पोर्टलमा स्वागत छ",
      "navigation": {
        "home": "गृहपृष्ठ",
        "articles": "लेखहरू",
        "categories": "श्रेणीहरू",
        "publishers": "प्रकाशकहरू",
        "login": "लगइन",
        "register": "दर्ता",
        "profile": "प्रोफाइल",
        "dashboard": "ड्यासबोर्ड",
        "logout": "लगआउट"
      },
      "auth": {
        "login": "लगइन",
        "register": "दर्ता",
        "email": "इमेल",
        "password": "पासवर्ड",
        "confirmPassword": "पासवर्ड पुष्टि गर्नुहोस्",
        "name": "पूरा नाम",
        "forgotPassword": "पासवर्ड बिर्सनुभयो?",
        "loginSuccess": "सफलतापूर्वक लगइन भयो",
        "registerSuccess": "सफलतापूर्वक दर्ता भयो",
        "invalidCredentials": "गलत प्रमाणहरू",
        "userExists": "प्रयोगकर्ता पहिले नै अवस्थित छ",
        "passwordMismatch": "पासवर्डहरू मेल खाँदैनन्"
      },
      "articles": {
        "title": "शीर्षक",
        "content": "सामग्री",
        "category": "श्रेणी",
        "tags": "ट्यागहरू",
        "author": "लेखक",
        "publishedAt": "प्रकाशित",
        "readMore": "थप पढ्नुहोस्",
        "share": "साझा गर्नुहोस्",
        "like": "मनपर्यो",
        "comment": "टिप्पणी",
        "views": "हेराइ",
        "likes": "मनपर्यो",
        "shares": "साझा",
        "comments": "टिप्पणीहरू",
        "createArticle": "लेख सिर्जना गर्नुहोस्",
        "editArticle": "लेख सम्पादन गर्नुहोस्",
        "deleteArticle": "लेख मेटाउनुहोस्",
        "publishArticle": "लेख प्रकाशित गर्नुहोस्",
        "draftArticle": "मस्यौदाको रूपमा सुरक्षित गर्नुहोस्",
        "pendingApproval": "स्वीकृतिको पर्खाइमा",
        "approved": "स्वीकृत",
        "rejected": "अस्वीकृत",
        "featuredImage": "मुख्य तस्बिर",
        "additionalMedia": "अतिरिक्त मिडिया"
      },
      "common": {
        "save": "सुरक्षित गर्नुहोस्",
        "cancel": "रद्द गर्नुहोस्",
        "delete": "मेटाउनुहोस्",
        "edit": "सम्पादन गर्नुहोस्",
        "view": "हेर्नुहोस्",
        "loading": "लोड हुँदैछ...",
        "error": "त्रुटि",
        "success": "सफलता",
        "language": "भाषा",
        "english": "अंग्रेजी",
        "nepali": "नेपाली"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
