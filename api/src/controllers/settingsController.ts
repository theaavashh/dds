import { Request, Response } from 'express';
import prisma from '../config/database';
import { ApiResponse } from '../types';

type SettingsData = any;

const allowedKeys = [
  'siteName','siteDescription','siteUrl','siteLogo','siteFavicon',
  'email','phone','address','city','country',
  'currency','timezone','language',
  'facebookUrl','instagramUrl','tiktokUrl',
  'emailNotifications','smsNotifications','pushNotifications',
  'twoFactorAuth','sessionTimeout','passwordPolicy',
  'lowStockThreshold','autoReorder','trackInventory',
  'seoTitle','seoDescription','seoKeywords',
  'ogTitle','ogDescription','ogImage','ogType',
  'twitterCard','twitterSite','twitterCreator',
  'canonicalUrl','robotsIndex','robotsFollow','sitemapUrl',
  'googleAnalyticsId','googleTagManagerId','facebookPixelId',
  'structuredData'
] as const;

function sanitizeSettings(input: any): SettingsData {
  const out: any = {};
  if (!input || typeof input !== 'object') return out;
  for (const key of allowedKeys) {
    if (key in input) {
      let val = (input as any)[key];
      if (typeof val === 'string') {
        val = val.trim();
      }
      out[key] = val;
    }
  }
  return out;
}

export const getSiteSettings = async (_req: Request, res: Response<ApiResponse<SettingsData>>) => {
  try {
    const existing = await prisma.siteSetting.findFirst();
    if (!existing) {
      return res.json({ success: true, data: {}, message: 'No settings found' });
    }
    const filtered = sanitizeSettings(existing.data);
    return res.json({ success: true, data: filtered, message: 'Settings retrieved' });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

export const upsertSiteSettings = async (req: Request<{}, ApiResponse<SettingsData>, SettingsData>, res: Response<ApiResponse<SettingsData>>) => {
  try {
    const payload = sanitizeSettings(req.body || {});
    const existing = await prisma.siteSetting.findFirst();
    const updated = existing
      ? await prisma.siteSetting.update({ where: { id: existing.id }, data: { data: payload } })
      : await prisma.siteSetting.create({ data: { data: payload } });
    const filtered = sanitizeSettings(updated.data);
    return res.json({ success: true, data: filtered, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving site settings:', error);
    return res.status(500).json({ success: false, message: 'Failed to save settings' });
  }
};
