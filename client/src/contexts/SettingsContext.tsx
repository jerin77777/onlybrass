import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface SiteSettings {
  site_name: string;
  site_logo: string;
  homepage_collage_image: string;
  homepage_story_title: string;
  homepage_story_description: string;
  homepage_story_image: string;
  homepage_mailing_title: string;
  homepage_mailing_description: string;
  contact_email: string;
  mailing_address: string;
}

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  site_name: 'ONLYBRASS',
  site_logo: '/assets/logo.png',
  homepage_collage_image: '/assets/web_collage.png',
  homepage_story_title: 'Our Story',
  homepage_story_description: 'OnlyBrass was born from a passion for timeless craftsmanship. We believe that hardware is the jewelry of the home—the final, defining touch that turns a house into a sanctuary of style.',
  homepage_story_image: '/assets/story_image.png',
  homepage_mailing_title: 'Contact Us',
  homepage_mailing_description: "Have a question or looking for a bespoke consultation? We'd love to hear from you.",
  contact_email: 'hello@onlybrass.com',
  mailing_address: '123 Brass Avenue, Design District, New Delhi, India 110001',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;

      if (data) {
        const newSettings = { ...defaultSettings };
        data.forEach(item => {
          (newSettings as any)[item.key] = item.value;
        });
        setSettings(newSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
