import express from 'express';
import { 
  getSeoReport,
  getSitemapEntries,
  getSitemapConfig,
  updateSitemapConfig,
  createSitemapEntry,
  updateSitemapEntry,
  deleteSitemapEntry,
  generateSitemap,
  getSitemapPreview,
  getRobotsContent,
  updateRobotsContent,
  getRobotsRules,
  createRobotsRule,
  updateRobotsRule,
  deleteRobotsRule,
  getRobotsConfig,
  updateRobotsConfig,
  generateRobotsFromRules,
  getRobotsPreview,
  getJsonLdSchemas,
  createJsonLdSchema,
  updateJsonLdSchema,
  deleteJsonLdSchema
} from '../controllers/seoController';

const router = express.Router();

// Get SEO report
router.get('/report', getSeoReport);

// Sitemap endpoints
router.get('/sitemap', getSitemapEntries);
router.get('/sitemap/config', getSitemapConfig);
router.put('/sitemap/config', updateSitemapConfig);
router.post('/sitemap/entry', createSitemapEntry);
router.put('/sitemap/entry/:id', updateSitemapEntry);
router.delete('/sitemap/entry/:id', deleteSitemapEntry);
router.post('/sitemap/generate', generateSitemap);
router.get('/sitemap/preview', getSitemapPreview);

// Robots.txt endpoints
router.get('/robots', getRobotsContent);
router.put('/robots', updateRobotsContent);
router.get('/robots/rules', getRobotsRules);
router.post('/robots/rule', createRobotsRule);
router.put('/robots/rule/:id', updateRobotsRule);
router.delete('/robots/rule/:id', deleteRobotsRule);
router.get('/robots/config', getRobotsConfig);
router.put('/robots/config', updateRobotsConfig);
router.post('/robots/generate', generateRobotsFromRules);
router.get('/robots/preview', getRobotsPreview);

// JSON-LD endpoints
router.get('/jsonld', getJsonLdSchemas);
router.post('/jsonld', createJsonLdSchema);
router.put('/jsonld/:id', updateJsonLdSchema);
router.delete('/jsonld/:id', deleteJsonLdSchema);

// Get SEO settings
router.get('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'SEO settings endpoint',
      data: {}
    });
  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SEO settings'
    });
  }
});

// Update SEO settings
router.put('/', async (_req, res) => {
  try {
    res.json({
      success: true,
      message: 'SEO settings updated',
      data: _req.body
    });
  } catch (error) {
    console.error('Error updating SEO settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating SEO settings'
    });
  }
});

export default router;