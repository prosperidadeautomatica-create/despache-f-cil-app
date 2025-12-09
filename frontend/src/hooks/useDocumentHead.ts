import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to update document title and meta tags based on current language
 */
export function useDocumentHead() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const updateMetaTags = () => {
      const appName = t('common.appName');
      const description = t('home.metaDescription') || t('home.description');

      // Update document title
      document.title = appName;

      // Update meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);

      // Update og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement('meta');
        ogTitle.setAttribute('property', 'og:title');
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute('content', appName);

      // Update og:description
      let ogDescription = document.querySelector('meta[property="og:description"]');
      if (!ogDescription) {
        ogDescription = document.createElement('meta');
        ogDescription.setAttribute('property', 'og:description');
        document.head.appendChild(ogDescription);
      }
      ogDescription.setAttribute('content', description);

      // Update html lang attribute
      document.documentElement.lang = i18n.language;
    };

    // Update immediately
    updateMetaTags();

    // Update when language changes
    i18n.on('languageChanged', updateMetaTags);

    return () => {
      i18n.off('languageChanged', updateMetaTags);
    };
  }, [t, i18n]);
}

