"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './LanguageToggle.module.css';

export const LanguageToggle = () => {
  const { t, language, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  if (!isMounted) {
    return (
      <div className={styles.languageToggle}>
        <button className={styles.toggleButton} disabled>
          <span className={styles.currentLanguage}>中</span>
          <svg className={styles.chevron} width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        </button>
      </div>
    );
  }

  const handleLanguageChange = (newLanguage: 'en' | 'zh') => {
    changeLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className={styles.languageToggle} ref={dropdownRef}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t.language}
      >
        <span className={styles.currentLanguage}>
          {language === 'zh' ? '中' : 'EN'}
        </span>
        <svg 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className={styles.dropdown}>
          <button
            className={`${styles.option} ${language === 'en' ? styles.active : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            {t.english}
          </button>
          <button
            className={`${styles.option} ${language === 'zh' ? styles.active : ''}`}
            onClick={() => handleLanguageChange('zh')}
          >
            {t.chinese}
          </button>
        </div>
      )}
    </div>
  );
};