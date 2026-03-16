import { Express } from 'express';
import categoryRoutes from './categoryRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import productRoutes from './productRoutes';
import analyticsRoutes from './analyticsRoutes';
import dashboardRoutes from './dashboardRoutes';
import seoRoutes from './seoRoutes';
import reviewRoutes from './reviewRoutes';
import roleRoutes from './roleRoutes';
import appointmentRoutes from './appointmentRoutes';
import retailerRoutes from './retailerRoutes';
import attributeOptionRoutes from './attributeOptionRoutes';
import settingsRoutes from './settingsRoutes';
import heroSectionRoutes from './heroSectionRoutes';
import newsletterRoutes from './newsletterRoutes';
import testimonialRoutes from './testimonialRoutes';
import catalogRoutes from './catalogRoutes';
import serviceRoutes from './serviceRoutes';
import videoRoutes from './videoRoutes';
import bannerRoutes from './bannerRoutes';
import lowerBannerRoutes from './lowerBannerRoutes';
import aboutRoutes from './aboutRoutes';
import distributorRoutes from './distributorRoutes';
import inquiryRoutes from './inquiryRoutes';
import jewelryShowcaseRoutes from './jewelryShowcaseRoutes';
import privacyPolicyRoutes from './privacyPolicyRoutes';
import termsOfUseRoutes from './termsOfUseRoutes';
import chatRoutes from './chatRoutes';

/**
 * Register all API routes
 * @param app Express application instance
 */
export const registerRoutes = (app: Express): void => {
    app.use('/api/auth', authRoutes);
    app.use('/api/admins', adminRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/seo', seoRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/roles', roleRoutes);
    app.use('/api/appointments', appointmentRoutes);
    app.use('/api/retailers', retailerRoutes);
    app.use('/api/distributors', distributorRoutes);
    app.use('/api/attribute-options', attributeOptionRoutes);
    app.use('/api/settings', settingsRoutes);
    app.use('/api/hero-section', heroSectionRoutes);
    app.use('/api/newsletter', newsletterRoutes);
    app.use('/api/testimonials', testimonialRoutes);
    app.use('/api/catalog', catalogRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/videos', videoRoutes);
    app.use('/api/banners', bannerRoutes);
    app.use('/api/lower-banners', lowerBannerRoutes);
    app.use('/api/about', aboutRoutes);
    app.use('/api/inquiries', inquiryRoutes);
    app.use('/api/jewelry-showcase', jewelryShowcaseRoutes);
    app.use('/api/privacy-policy', privacyPolicyRoutes);
    app.use('/api/terms-of-use', termsOfUseRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/categories', categoryRoutes);

    // Root endpoint
    app.get('/', (_req, res) => {
        res.json({
            message: 'Celebration Diamond API',
            version: '1.0.0',
            status: 'running',
            endpoints: {
                banners: '/api/banners',
                auth: '/api/auth',
                products: '/api/products',
                'attribute-options': '/api/attribute-options',
                health: '/health'
            }
        });
    });
};
