const express = require('express');
const router = express.Router();
const Page = require('../models/Page');

router.get('/', async (req, res) => {
  try {
    const pages = await Page.find({ archived: false }).sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/favorites', async (req, res) => {
  try {
    const pages = await Page.find({ favorite: true, archived: false }).sort({ updatedAt: -1 });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const page = new Page(req.body);
    const savedPage = await page.save();
    res.status(201).json(savedPage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json({ message: 'Page deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/duplicate', async (req, res) => {
  try {
    const original = await Page.findById(req.params.id);
    if (!original) return res.status(404).json({ message: 'Page not found' });
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
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/favorite', async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found' });
    page.favorite = !page.favorite;
    await page.save();
    res.json(page);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;