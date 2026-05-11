const FooterLink = require('../../models/FooterLink');

// Admin: Add a new footer link
const addFooterLink = async (req, res) => {
  try {
    const { title, url, section, order } = req.body;
    const newLink = new FooterLink({ title, url, section, order });
    await newLink.save();
    res.status(201).json({ success: true, message: 'Link added successfully', data: newLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update a footer link
const updateFooterLink = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLink = await FooterLink.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Link updated successfully', data: updatedLink });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Delete a footer link
const deleteFooterLink = async (req, res) => {
  try {
    const { id } = req.params;
    await FooterLink.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get all active footer links
const getFooterLinks = async (req, res) => {
  try {
    const links = await FooterLink.find({ isActive: true }).sort({ order: 1 });
    res.status(200).json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addFooterLink,
  updateFooterLink,
  deleteFooterLink,
  getFooterLinks
};
