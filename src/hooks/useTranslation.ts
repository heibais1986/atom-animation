import { useAppStore } from '@/store/appStore';
import { translations, type Language } from '@/i18n';
import { getElementName } from '@/i18n/elements';
import { useEffect, useState } from 'react';

export const useTranslation = () => {
  const { language, setLanguage } = useAppStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 确保服务器端和客户端使用相同的语言状态
  const activeLanguage = isClient ? language : 'zh';
  const t = translations[activeLanguage];
  
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };
  
  const translateElementName = (elementName: string) => {
    return getElementName(elementName, activeLanguage as 'en' | 'zh');
  };
  
  return {
    t,
    language: activeLanguage,
    changeLanguage,
    translateElementName,
    isClient,
  };
};
