import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_RECRUITMENT_TEMPLATE } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'rolodex-settings-persistent';

// Global state for settings
let globalSettings: AppSettings = DEFAULT_RECRUITMENT_TEMPLATE;
let isInitialized = false;
let settingsChangeCallbacks: (() => void)[] = [];

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
      const parsed = JSON.parse(saved);
      // Ensure new fields exist in old saved settings
      return {
        ...DEFAULT_RECRUITMENT_TEMPLATE,
        ...parsed,
        // Ensure these new fields exist
        openaiApiKey: parsed.openaiApiKey || '',
        hasCompletedOnboarding: parsed.hasCompletedOnboarding || false,
      };
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return DEFAULT_RECRUITMENT_TEMPLATE;
};

const triggerGlobalUpdate = () => {
  settingsChangeCallbacks.forEach(callback => callback());
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_RECRUITMENT_TEMPLATE);
  const [isLoading, setIsLoading] = useState(true);

  // Register callback for global updates
  useEffect(() => {
    const callback = () => setSettings({...globalSettings});
    settingsChangeCallbacks.push(callback);
    
    return () => {
      settingsChangeCallbacks = settingsChangeCallbacks.filter(cb => cb !== callback);
    };
  }, []);

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
    // Trigger global update to refresh all components
    triggerGlobalUpdate();
  }, []);

  const resetToDefault = useCallback(() => {
    console.log('🔄 Resetting to default template');
    updateSettings(DEFAULT_RECRUITMENT_TEMPLATE);
  }, [updateSettings]);

  const markOnboardingComplete = useCallback(() => {
    console.log('✅ Marking onboarding as complete');
    updateSettings({
      ...globalSettings,
      hasCompletedOnboarding: true
    });
  }, [updateSettings]);

  const resetOnboarding = useCallback(() => {
    console.log('🔄 Resetting onboarding');
    updateSettings({
      ...globalSettings,
      hasCompletedOnboarding: false
    });
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    resetToDefault,
    markOnboardingComplete,
    resetOnboarding,
    isLoading
  };
}
