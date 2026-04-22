import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: {
        translation: {
          branding: 'Science Award',
          home: 'Bosh sahifa',
          articles: 'Maqolalar',
          theses: 'Tezislar',
          poems: 'She’rlar',
          about: 'Biz haqimizda',
          contact: 'Bog‘lanish',
          search: 'Qidiruv',
          login: 'Kirish',
          admin_panel: 'Admin panel',
          latest_articles: 'Eng so‘nggi maqolalar',
          latest_theses: 'Eng so‘nggi tezislar',
          latest_poems: 'Eng so‘nggi she’rlar',
          popular_materials: 'Ommabop materiallar',
          categories: 'Kategoriyalar',
          read_more: 'Batafsil',
          verify_certificate: 'Sertifikatni tekshirish',
          views: 'Ko‘rishlar',
          downloads: 'Yuklanmalar',
          published: 'Chop etilgan',
          certificate: 'Sertifikat',
          logout: 'Chiqish',
          dashboard: 'Boshqaruv paneli',
          unauthorized: 'Ruxsat etilmagan',
        }
      },
      ru: {
        translation: {
          branding: 'Science Award',
          home: 'Главная',
          articles: 'Статьи',
          theses: 'Тезисы',
          poems: 'Стихи',
          about: 'О нас',
          contact: 'Контакты',
          search: 'Поиск',
          login: 'Войти',
          admin_panel: 'Админ панель',
          latest_articles: 'Последние статьи',
          latest_theses: 'Последние тезисы',
          latest_poems: 'Последние стихи',
          popular_materials: 'Популярные материалы',
          categories: 'Категории',
          read_more: 'Подробнее',
          verify_certificate: 'Проверить сертификат',
          views: 'Просмотры',
          downloads: 'Скачивания',
          published: 'Опубликовано',
          certificate: 'Сертификат',
          logout: 'Выйти',
          dashboard: 'Панель управления',
          unauthorized: 'Неавторизован',
        }
      },
      en: {
        translation: {
          branding: 'Science Award',
          home: 'Home',
          articles: 'Articles',
          theses: 'Theses',
          poems: 'Poems',
          about: 'About',
          contact: 'Contact',
          search: 'Search',
          login: 'Login',
          admin_panel: 'Admin Panel',
          latest_articles: 'Latest Articles',
          latest_theses: 'Latest Theses',
          latest_poems: 'Latest Poems',
          popular_materials: 'Popular Materials',
          categories: 'Categories',
          read_more: 'Read More',
          verify_certificate: 'Verify Certificate',
          views: 'Views',
          downloads: 'Downloads',
          published: 'Published',
          certificate: 'Certificate',
          logout: 'Logout',
          dashboard: 'Dashboard',
          unauthorized: 'Unauthorized',
        }
      }
    },
    fallbackLng: 'uz',
    lng: 'uz',
    interpolation: {
      escapeValue: false,
    }
  });

export default i18n;
