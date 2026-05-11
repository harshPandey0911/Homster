const express = require('express');
const router = express.Router();
const { addFooterLink, updateFooterLink, deleteFooterLink, getFooterLinks } = require('../../controllers/adminControllers/footerLinkController');
const { authenticate } = require('../../middleware/authMiddleware');
const { isAdmin } = require('../../middleware/roleMiddleware');

router.get('/', getFooterLinks); // Public access
router.post('/', authenticate, isAdmin, addFooterLink);
router.put('/:id', authenticate, isAdmin, updateFooterLink);
router.delete('/:id', authenticate, isAdmin, deleteFooterLink);

module.exports = router;
