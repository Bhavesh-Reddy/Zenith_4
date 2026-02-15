const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

// Get all non-archived pages
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/pages - Fetching all pages');
    const pages = await Page.find({ archived: false })
      .sort({ updatedAt: -1 });
    console.log(`✅ Found ${pages.length} pages`);
    res.json(pages);
  } catch (error) {
    console.error('❌ Error fetching pages:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get favorites
router.get('/favorites', async (req, res) => {
  try {
    const pages = await Page.find({ favorite: true, archived: false })
      .sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get archived pages
router.get('/archived', async (req, res) => {
  try {
    const pages = await Page.find({ archived: true })
      .sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single page
router.get('/:id', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create page
router.post('/', async (req, res) => {
  try {
    console.log('📝 POST /api/pages - Creating new page');
    const page = new Page(req.body);
    const savedPage = await page.save();
    console.log('✅ Page created:', savedPage._id);
    res.status(201).json(savedPage);
  } catch (error) {
    console.error('❌ Error creating page:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update page
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 PUT /api/pages/:id - Updating page');
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    console.log('✅ Page updated:', page._id);
    res.json(page);
  } catch (error) {
    console.error('❌ Error updating page:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete page permanently
router.delete('/:id', async (req, res) => {
  try {
    console.log('🗑️  DELETE /api/pages/:id - Deleting page');
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    console.log('✅ Page deleted:', req.params.id);
    res.json({ message: 'Page deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('❌ Error deleting page:', error);
    res.status(500).json({ message: error.message });
  }
});

// Duplicate page
router.post('/:id/duplicate', async (req, res) => {
  try {
    console.log('📋 POST /api/pages/:id/duplicate - Duplicating page');
    const original = await Page.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    const duplicate = new Page({
      title: `${original.title} (Copy)`,
      icon: original.icon,
      coverUrl: original.coverUrl,
      content: original.content,
      favorite: false,
      archived: false,
      order: 0
    });
    
    const saved = await duplicate.save();
    console.log('✅ Page duplicated:', saved._id);
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Error duplicating page:', error);
    res.status(400).json({ message: error.message });
  }
});

// Toggle favorite
router.patch('/:id/favorite', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    page.favorite = !page.favorite;
    await page.save();
    console.log(`⭐ Page ${page.favorite ? 'favorited' : 'unfavorited'}:`, page._id);
    res.json(page);
  } catch (error) {
    console.error('❌ Error toggling favorite:', error);
    res.status(400).json({ message: error.message });
  }
});

// Toggle archive
router.patch('/:id/archive', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    page.archived = !page.archived;
    await page.save();
    console.log(`🗄️  Page ${page.archived ? 'archived' : 'restored'}:`, page._id);
    res.json(page);
  } catch (error) {
    console.error('❌ Error toggling archive:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;