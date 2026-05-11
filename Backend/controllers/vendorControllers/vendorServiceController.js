const Vendor = require('../../models/Vendor');
const Category = require('../../models/Category');
const Booking = require('../../models/Booking');
const Service = require('../../models/UserService');
const { validationResult } = require('express-validator');

/**
 * Get all services/categories assigned to the vendor with performance stats
 */
const getMyServices = async (req, res) => {
  try {
    const vendorId = req.user.id;
    console.log('[getMyServices] vendorId:', vendorId);

    // 1. Fetch vendor to get assigned categories
    const vendor = await Vendor.findById(vendorId).select('service categories');
    if (!vendor) {
      console.log('[getMyServices] Vendor not found');
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Combine 'service' and 'categories' arrays (handle legacy data)
    const assignedCategoryNames = Array.from(new Set([...(vendor.service || []), ...(vendor.categories || [])]));
    console.log('[getMyServices] assignedCategoryNames:', assignedCategoryNames);

    if (assignedCategoryNames.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // 2. Fetch Category details:
    // - Categories assigned by name in the vendor profile
    // - Categories created specifically by this vendor (using vendorId)
    const categories = await Category.find({
      $or: [
        { title: { $in: assignedCategoryNames.map(name => new RegExp(`^${name}$`, 'i')) } },
        { vendorId: vendorId }
      ],
      status: 'active'
    }).select('title imageUrl homeIconUrl description slug vendorId');
    
    console.log(`[getMyServices] Found ${categories.length} total categories (assigned + custom) for vendor ${vendorId}`);

    // 3. For each category, calculate performance stats
    const servicesWithStats = await Promise.all(categories.map(async (cat) => {
      // Get booking stats for this specific category and vendor
      const stats = await Booking.aggregate([
        {
          $match: {
            vendorId: vendor._id,
            serviceName: { $regex: new RegExp(cat.title, 'i') } // Rough match by name
          }
        },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            completedJobs: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            totalRating: { $sum: '$rating' },
            ratingCount: {
              $sum: { $cond: [{ $gt: ['$rating', 0] }, 1, 0] }
            }
          }
        }
      ]);

      const catStats = stats[0] || { totalJobs: 0, completedJobs: 0, totalRating: 0, ratingCount: 0 };
      
      return {
        id: cat._id,
        title: cat.title,
        slug: cat.slug,
        imageUrl: cat.imageUrl,
        iconUrl: cat.homeIconUrl,
        description: cat.description,
        status: 'Active', // Authorized by admin
        stats: {
          totalJobs: catStats.totalJobs,
          completedJobs: catStats.completedJobs,
          rating: catStats.ratingCount > 0 
            ? parseFloat((catStats.totalRating / catStats.ratingCount).toFixed(1)) 
            : 0.0
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: servicesWithStats
    });

  } catch (error) {
    console.error('Get My Services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your service portfolio'
    });
  }
};

/**
 * Get vendor's services (Old/Generic implementation)
 */
const getVendorServices = async (req, res) => {
    // Keep for backward compatibility or other uses
    res.status(200).json({ success: true, data: [] });
};

/**
 * Update service availability (enable/disable)
 */
const updateServiceAvailability = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { isAvailable } = req.body;
    res.status(200).json({ success: true, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Set service pricing
 */
const setServicePricing = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Pricing updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a custom category by vendor
 */
const addVendorCategory = async (req, res) => {
  try {
    const { title, description, imageUrl, homeIconUrl } = req.body;
    const vendorId = req.user.id;
    const vendor = await Vendor.findById(vendorId).select('cityId');
    const cityIds = vendor?.cityId ? [vendor.cityId] : [];

    if (!title) {
      return res.status(400).json({ success: false, message: 'Category title is required' });
    }

    const category = await Category.create({
      title,
      description,
      imageUrl,
      homeIconUrl: homeIconUrl || imageUrl, // Use imageUrl as fallback for home icon
      vendorId,
      cityIds,
      status: 'active',
      showOnHome: true // Show on home page so user can see it
    });

    res.status(201).json({
      success: true,
      message: 'Category added successfully',
      data: category
    });
  } catch (error) {
    console.error('Add Vendor Category error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add a custom service/product by vendor
 */
const addVendorService = async (req, res) => {
  try {
    const { title, description, basePrice, categoryId, iconUrl } = req.body;
    const vendorId = req.user.id;

    if (!title || !basePrice || !categoryId) {
      return res.status(400).json({ success: false, message: 'Title, price, and category are required' });
    }

    const service = await Service.create({
      title,
      description,
      basePrice,
      categoryId,
      vendorId,
      iconUrl,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Service added successfully',
      data: service
    });
  } catch (error) {
    console.error('Add Vendor Service error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all custom categories and services created by the vendor
 */
const getMyCustomContent = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const categories = await Category.find({ vendorId });
    const services = await Service.find({ vendorId }).populate('categoryId', 'title');

    res.status(200).json({
      success: true,
      data: {
        categories,
        services
      }
    });
  } catch (error) {
    console.error('Get My Custom Content error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyServices,
  getVendorServices,
  updateServiceAvailability,
  setServicePricing,
  addVendorCategory,
  addVendorService,
  getMyCustomContent
};
