import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_RECRUITMENT_TEMPLATE } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'rolodex-settings-persistent';

// Global state for settings
let globalSettings: AppSettings = DEFAULT_RECRUITMENT_TEMPLATE;
let isInitialized = false;

const saveToStorage = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    console.log('💾 Saved settings to storage');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

const loadFromStorage = (): AppSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_RECRUITMENT_TEMPLATE;
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_RECRUITMENT_TEMPLATE);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize settings on first mount
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚀 Initializing settings...');
      const savedSettings = loadFromStorage();
      globalSettings = savedSettings;
      isInitialized = true;
      console.log('✅ Loaded settings:', savedSettings);
    }

    setSettings({...globalSettings});
    setIsLoading(false);
  }, []);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    console.log('⚙️ Updating settings:', newSettings);
    globalSettings = newSettings;
    setSettings({...newSettings});
    saveToStorage(newSettings);
  }, []);

  const resetToDefault = useCallback(() => {
    console.log('🔄 Resetting to default template');
    updateSettings(DEFAULT_RECRUITMENT_TEMPLATE);
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    resetToDefault,
    isLoading
  };
}
