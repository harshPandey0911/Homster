const Category = require('../../models/Category');
const Brand = require('../../models/Brand');
const Service = require('../../models/UserService');
const HomeContent = require('../../models/HomeContent');

/**
 * Public Catalog Controllers
 * These endpoints are accessible without authentication for user app
 */

/**
 * Get all active categories for user app
 * GET /api/public/categories
 */
const getPublicCategories = async (req, res) => {
  try {
    const { cityId } = req.query;
    const City = require('../../models/City');
    const Vendor = require('../../models/Vendor');
    const { findNearbyVendors } = require('../../services/locationService');

    const cityDoc = cityId ? await City.findById(cityId).select('name').lean() : null;
    const cityName = cityDoc ? cityDoc.name : '';

    // Build query
    const query = { status: 'active' };
    if (cityId) {
      query.$or = [
        { vendorId: null, cityIds: cityId },
        { vendorId: { $ne: null } } 
      ];
    }

    const allCategories = await Category.find(query)
      .select('title slug homeIconUrl homeBadge hasSaleBadge homeOrder showOnHome vendorId cityIds description')
      .sort({ homeOrder: 1, createdAt: -1 })
      .lean();

    // Filter categories based on online vendor availability
    const filteredCategories = await Promise.all(allCategories.map(async (cat) => {
      // 1. If it's a platform category (no vendorId)
      if (!cat.vendorId) {
        // Check if any online vendor is available in city for this category
        const vendors = await findNearbyVendors(null, 10, { 
          service: cat.title, 
          city: cityName 
        });
        return vendors.length > 0 ? cat : null;
      }

      // 2. If it's a vendor-specific category
      if (cat.vendorId) {
        const ownerVendor = await Vendor.findOne({ _id: cat.vendorId, isOnline: true }).select('address');
        if (!ownerVendor) return null;

        if (cityName && ownerVendor.address?.city) {
          const isMatch = new RegExp(cityName, 'i').test(ownerVendor.address.city);
          return isMatch ? cat : null;
        }
        return cat;
      }

      return null;
    }));

    const categories = filteredCategories.filter(Boolean);

    // Group categories by title to avoid duplicates for the user
    const groupedMap = new Map();
    categories.forEach(cat => {
      const normalizedTitle = cat.title.trim().toLowerCase();
      if (!groupedMap.has(normalizedTitle)) {
        groupedMap.set(normalizedTitle, {
          id: cat._id.toString(),
          title: cat.title,
          slug: cat.slug,
          icon: cat.homeIconUrl || '',
          badge: cat.homeBadge || '',
          hasSaleBadge: cat.hasSaleBadge || false,
          showOnHome: cat.showOnHome || false
        });
      }
    });

    const initialCategories = Array.from(groupedMap.values());

    res.status(200).json({
      success: true,
      categories: initialCategories
    });
  } catch (error) {
    console.error('Get public categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories. Please try again.'
    });
  }
};

/**
 * Get all active brands for user app (Formerly Services)
 * GET /api/public/brands
 */
const getPublicBrands = async (req, res) => {
  try {
    const { categoryId, categorySlug, search, cityId } = req.query;
    
    // Grouping support: If categoryId or categorySlug is provided, find all related categories by title
    let categoryIds = [];
    if (categoryId) {
      const targetCat = await Category.findById(categoryId).select('title');
      if (targetCat) {
        const relatedCats = await Category.find({ title: { $regex: new RegExp(`^${targetCat.title}$`, 'i') } }).select('_id');
        categoryIds = relatedCats.map(c => c._id);
      } else {
        categoryIds = [categoryId];
      }
    } else if (categorySlug) {
      const targetCat = await Category.findOne({ slug: categorySlug }).select('title');
      if (targetCat) {
        const relatedCats = await Category.find({ title: { $regex: new RegExp(`^${targetCat.title}$`, 'i') } }).select('_id');
        categoryIds = relatedCats.map(c => c._id);
      }
    }

    // Build query
    const query = { status: 'active' };
    if (categoryIds.length > 0) query.categoryIds = { $in: categoryIds };
    if (cityId) query.cityIds = cityId;

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedSearch, $options: 'i' };
    }

    let brands = await Brand.find(query)
      .select('title slug iconUrl logo imageUrl badge categoryIds basePrice discountPrice sections')
      .sort({ homeOrder: 1, createdAt: -1 })
      .lean();

    // 2. ALSO check for vendor-specific services/products in these categories
    if (categoryIds.length > 0) {
      const vendorServices = await Service.find({ 
        categoryId: { $in: categoryIds }, 
        status: 'active' 
      })
      .populate({
        path: 'vendorId',
        select: 'name businessName profilePhoto isOnline',
        match: { isOnline: true }
      })
      .lean();
      
      const onlineVendorServices = vendorServices.filter(svc => svc.vendorId);

      if (onlineVendorServices.length > 0) {
        // Create virtual brands for each unique vendor
        const vendorMap = new Map();
        onlineVendorServices.forEach(svc => {
          const vId = svc.vendorId._id.toString();
          if (!vendorMap.has(vId)) {
            // Check if this vendor is already represented as a Brand (unlikely but safe)
            const alreadyExists = brands.some(b => b.vendorId?.toString() === vId);
            if (!alreadyExists) {
              vendorMap.set(vId, {
                id: vId,
                title: svc.vendorId.businessName || svc.vendorId.name,
                slug: `vendor-${vId}`,
                icon: svc.vendorId.profilePhoto || '',
                logo: svc.vendorId.profilePhoto || '',
                imageUrl: svc.vendorId.profilePhoto || '',
                badge: 'Vendor',
                categoryId: categoryId || (categoryIds.length > 0 ? categoryIds[0] : null),
                vendorId: svc.vendorId._id,
                isVendor: true
              });
            }
          }
        });
        
        // Combine static brands with dynamic vendor brands
        const dynamicBrands = Array.from(vendorMap.values());
        brands = [...brands, ...dynamicBrands];
      }
    }

    res.status(200).json({
      success: true,
      brands: brands.map(brand => ({
        id: brand.id || brand._id.toString(),
        title: brand.title,
        slug: brand.slug,
        icon: brand.iconUrl || brand.icon || '',
        logo: brand.logo || brand.iconUrl || brand.icon || '',
        imageUrl: brand.imageUrl || brand.iconUrl || brand.icon || '',
        badge: brand.badge || '',
        price: brand.basePrice || 0, // Legacy support
        originalPrice: brand.discountPrice ? (brand.basePrice + brand.discountPrice) : (brand.basePrice || 0),
        categoryId: brand.categoryId || (brand.categoryIds && brand.categoryIds.length > 0 ? brand.categoryIds[0].toString() : null),
        categoryIds: brand.categoryIds ? brand.categoryIds.map(id => id.toString()) : [brand.categoryId?.toString()],
        sections: brand.sections || [],
        vendorId: brand.vendorId || null,
        isVendor: brand.isVendor || false
      }))
    });
  } catch (error) {
    console.error('Get public brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brands. Please try again.'
    });
  }
};

/**
 * Get brand by slug for user app
 * GET /api/public/brands/slug/:slug
 */
const getPublicBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const brand = await Brand.findOne({ slug, status: 'active' })
      .populate('categoryIds', 'title slug')
      .lean();

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Remove _id from nested objects
    const cleanBrand = JSON.parse(JSON.stringify(brand));
    const removeIds = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(item => {
          if (item && typeof item === 'object') {
            const { _id, ...rest } = item;
            return removeIds(rest);
          }
          return item;
        });
      } else if (obj && typeof obj === 'object') {
        const { _id, ...rest } = obj;
        return Object.keys(rest).reduce((acc, key) => {
          acc[key] = removeIds(rest[key]);
          return acc;
        }, {});
      }
      return obj;
    };

    // Fetch services associated with this brand
    const brandServices = await Service.find({ brandId: brand._id, status: 'active' }).lean();

    // Map services to a default section structure for the frontend
    const servicesSection = {
      title: brand.title,
      subtitle: 'Available Services',
      cards: brandServices.map(svc => ({
        id: svc._id.toString(),
        title: svc.title,
        subtitle: svc.description || '',
        price: svc.basePrice,
        rating: "4.8", // Default rating
        reviews: "1k+", // Default reviews
        imageUrl: svc.iconUrl || brand.iconUrl || '',
        features: svc.description ? [svc.description] : [],
        duration: "60 min" // Default duration
      }))
    };

    const formattedBrand = {
      id: brand._id.toString(),
      title: brand.title,
      slug: brand.slug,
      icon: brand.iconUrl || '',
      logo: brand.logo || '',
      badge: brand.badge || '',
      basePrice: brand.basePrice, // Legacy
      category: brand.categoryIds && brand.categoryIds[0] ? {
        id: brand.categoryIds[0]._id.toString(),
        title: brand.categoryIds[0].title,
        slug: brand.categoryIds[0].slug
      } : null,
      categories: (brand.categoryIds || []).map(cat => ({
        id: cat._id.toString(),
        title: cat.title,
        slug: cat.slug
      })),
      page: brand.page ? removeIds(brand.page) : {
        banners: brand.iconUrl ? [{ imageUrl: brand.iconUrl, text: brand.title }] : [],
        paymentOffers: [],
        paymentOffersEnabled: false
      },
      sections: brandServices.length > 0 ? [servicesSection] : []
    };

    res.status(200).json({
      success: true,
      brand: formattedBrand
    });
  } catch (error) {
    console.error('Get public brand by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch brand. Please try again.'
    });
  }
};

/**
 * Get services based on brand
 * GET /api/public/services
 */
const getPublicServices = async (req, res) => {
  try {
    const { brandId, brandSlug, categoryId } = req.query;

    const query = { status: 'active' };

    if (brandId) {
      query.brandId = brandId;
    } else if (brandSlug) {
      const brand = await Brand.findOne({ slug: brandSlug });
      if (brand) {
        query.brandId = brand._id;
      } else {
        return res.status(200).json({ success: true, services: [] });
      }
    }

    if (categoryId) {
      const targetCat = await Category.findById(categoryId).select('title');
      if (targetCat) {
        const relatedCats = await Category.find({ title: { $regex: new RegExp(`^${targetCat.title}$`, 'i') } }).select('_id');
        query.categoryId = { $in: relatedCats.map(c => c._id) };
      } else {
        query.categoryId = categoryId;
      }
      
      // If fetching by category and brandId is a vendor ID
      if (brandId && brandId.toString().length > 10) { 
        query.vendorId = brandId;
        delete query.brandId;
      }
    }

    if (req.query.search) {
      const escapedSearch = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.title = { $regex: escapedSearch, $options: 'i' };
    }

    const services = await Service.find(query)
      .populate({
        path: 'vendorId',
        select: 'name businessName profilePhoto isOnline'
      })
      .populate('brandId', 'title iconUrl')
      .sort({ createdAt: 1 })
      .lean();

    // Filter out vendor-specific services if the vendor is offline
    const filteredServices = services.filter(svc => {
      // If it's a platform service (no vendorId), show it
      if (!svc.vendorId) return true;
      // If it's a vendor service, only show if the vendor is online
      return svc.vendorId.isOnline === true;
    });

    res.status(200).json({
      success: true,
      services: filteredServices.map(svc => ({
        id: svc._id.toString(),
        title: svc.title,
        slug: svc.slug,
        icon: svc.iconUrl,
        basePrice: svc.basePrice,
        gstPercentage: svc.gstPercentage,
        description: svc.description,
        brandId: svc.brandId?._id,
        brandName: svc.brandId?.title,
        brandIcon: svc.brandId?.iconUrl,
        vendorId: svc.vendorId?._id,
        vendorName: svc.vendorId?.businessName || svc.vendorId?.name,
        vendorPhoto: svc.vendorId?.profilePhoto
      }))
    });
  } catch (error) {
    console.error('Get public services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

/**
 * Get home content
 */
const getPublicHomeContent = async (req, res) => {
  try {
    const { cityId } = req.query;
    const homeContent = await HomeContent.getHomeContent(cityId);

    if (!homeContent) {
      return res.status(200).json({
        success: true,
        homeContent: {
          banners: [],
          promos: [],
          curated: [],
          noteworthy: [],
          booked: [],
          categorySections: []
        }
      });
    }

    // Used for backwards compatibility, we might need to update this to refer to Brands?
    // For now keeping as is, but assuming targetServiceId will point to Brand ID essentially.

    const contentObj = homeContent.toObject();

    const formattedContent = {
      banners: (contentObj.banners || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      promos: (contentObj.promos || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      curated: (contentObj.curated || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      noteworthy: (contentObj.noteworthy || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      booked: (contentObj.booked || []).map(item => ({
        ...item,
        id: item._id ? item._id.toString() : item.id,
        targetCategoryId: item.targetCategoryId?.toString() || null,
        targetServiceId: item.targetServiceId?.toString() || null,
      })),
      categorySections: (contentObj.categorySections || []).map(section => ({
        ...section,
        id: section._id ? section._id.toString() : section.id,
        seeAllTargetCategoryId: section.seeAllTargetCategoryId?.toString() || null,
        seeAllTargetServiceId: section.seeAllTargetServiceId?.toString() || null,
        cards: (section.cards || []).map(card => ({
          ...card,
          id: card._id ? card._id.toString() : card.id,
          targetCategoryId: card.targetCategoryId?.toString() || null,
          targetServiceId: card.targetServiceId?.toString() || null,
        }))
      })),
      isBannersVisible: contentObj.isBannersVisible ?? true,
      isPromosVisible: contentObj.isPromosVisible ?? true,
      isCuratedVisible: contentObj.isCuratedVisible ?? true,
      isNoteworthyVisible: contentObj.isNoteworthyVisible ?? true,
      isBookedVisible: contentObj.isBookedVisible ?? true,
      isCategorySectionsVisible: contentObj.isCategorySectionsVisible ?? true,
      isCategoriesVisible: contentObj.isCategoriesVisible ?? true,
      isAboutUsVisible: contentObj.isAboutUsVisible ?? true,
      isOffersVisible: contentObj.isOffersVisible ?? true,
      isContactUsVisible: contentObj.isContactUsVisible ?? true,
      aboutUs: contentObj.aboutUs || null,
      offers: contentObj.offers || null,
      contactUs: contentObj.contactUs || null
    };

    res.status(200).json({
      success: true,
      homeContent: formattedContent
    });

  } catch (error) {
    console.error('Get public home content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home content. Please try again.'
    });
  }
};

/**
 * Get consolidated home data (Categories + Content)
 */
const getPublicHomeData = async (req, res) => {
  try {
    const { cityId, lat, lng } = req.query;
    const userLocation = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

    const City = require('../../models/City');
    
    // Fetch categories, home content and city details in parallel
    const [allCategories, homeContent, cityDoc] = await Promise.all([
      Category.find({ status: 'active', showOnHome: true })
        .select('title slug homeIconUrl homeBadge hasSaleBadge showOnHome vendorId cityIds description')
        .sort({ homeOrder: 1, createdAt: -1 })
        .lean(),
      HomeContent.getHomeContent(cityId),
      cityId ? City.findById(cityId).select('name').lean() : null
    ]);

    const cityName = cityDoc ? cityDoc.name : '';

    const { findNearbyVendors } = require('../../services/locationService');
    const Vendor = require('../../models/Vendor');

    // Filter categories based on nearby vendor availability
    const nearbyCategories = await Promise.all(allCategories.map(async (cat) => {
      // 1. If it's a platform category (no vendorId)
      if (!cat.vendorId) {
        // If it doesn't belong to the current city, skip it early
        if (cityId && cat.cityIds && !cat.cityIds.some(id => id.toString() === cityId)) {
          return null;
        }

        // Check if any online vendor is available (nearby or in city) for this category
        // findNearbyVendors handles both: distance search if userLocation is present, 
        // or city-wide online check if userLocation is null but cityName/cityId is provided.
        const vendors = await findNearbyVendors(userLocation, 10, { 
          service: cat.title, 
          city: cityName 
        });

        return vendors.length > 0 ? cat : null;
      }

      // 2. If it's a vendor-specific category
      if (cat.vendorId) {
        const ownerVendor = await Vendor.findOne({ _id: cat.vendorId, isOnline: true }).select('geoLocation address');
        if (!ownerVendor) return null;

        if (userLocation) {
          const { calculateDistance } = require('../../services/locationService');
          const vLoc = ownerVendor.geoLocation?.coordinates 
            ? { lat: ownerVendor.geoLocation.coordinates[1], lng: ownerVendor.geoLocation.coordinates[0] }
            : { lat: ownerVendor.address?.lat, lng: ownerVendor.address?.lng };
          
          if (vLoc.lat && vLoc.lng) {
            const distance = calculateDistance(userLocation, vLoc);
            return distance <= 10 ? cat : null;
          }
        }
        
        // Fallback: If no user location provided, show if vendor is online and in the city (if city filter applied)
        if (cityName && ownerVendor.address?.city) {
          const isMatch = new RegExp(cityName, 'i').test(ownerVendor.address.city);
          return isMatch ? cat : null;
        }

        return cat;
      }

      return null;
    }));

    const categoriesRes = nearbyCategories.filter(Boolean);

    // Group categories by title to avoid duplicates
    const groupedMapRes = new Map();
    categoriesRes.forEach(cat => {
      const normalizedTitle = cat.title.trim().toLowerCase();
      if (!groupedMapRes.has(normalizedTitle)) {
        groupedMapRes.set(normalizedTitle, {
          id: cat._id.toString(),
          title: cat.title,
          slug: cat.slug,
          icon: cat.homeIconUrl || '',
          badge: cat.homeBadge || '',
          hasSaleBadge: cat.hasSaleBadge || false,
          showOnHome: cat.showOnHome || false,
          description: cat.description || ''
        });
      }
    });

    const formattedCategories = Array.from(groupedMapRes.values());

    let formattedContent = null;
    if (homeContent) {
      const contentObj = homeContent.toObject();
      formattedContent = {
        banners: (contentObj.banners || []).map(item => ({
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          slug: item.slug,
          order: item.order
        })),
        promos: (contentObj.promos || []).map(item => ({
          title: item.title,
          subtitle: item.subtitle,
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          order: item.order
        })),
        curated: (contentObj.curated || []).map(item => ({
          title: item.title,
          gifUrl: item.gifUrl,
          order: item.order
        })),
        noteworthy: (contentObj.noteworthy || []).map(item => ({
          title: item.title,
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          order: item.order
        })),
        booked: (contentObj.booked || []).map(item => ({
          title: item.title,
          rating: item.rating,
          price: item.price,
          imageUrl: item.imageUrl,
          targetCategoryId: item.targetCategoryId?.toString() || null,
          order: item.order
        })),
        categorySections: (contentObj.categorySections || []).map(section => ({
          title: section.title,
          seeAllTargetCategoryId: section.seeAllTargetCategoryId?.toString() || null,
          cards: (section.cards || []).map(card => ({
            title: card.title,
            imageUrl: card.imageUrl,
            price: card.price,
            rating: card.rating,
            targetCategoryId: card.targetCategoryId?.toString() || null
          })),
          order: section.order
        })),
        isBannersVisible: contentObj.isBannersVisible ?? true,
        isPromosVisible: contentObj.isPromosVisible ?? true,
        isCuratedVisible: contentObj.isCuratedVisible ?? true,
        isNoteworthyVisible: contentObj.isNoteworthyVisible ?? true,
        isBookedVisible: contentObj.isBookedVisible ?? true,
        isCategorySectionsVisible: contentObj.isCategorySectionsVisible ?? true,
        isCategoriesVisible: contentObj.isCategoriesVisible ?? true,
        isStatsVisible: contentObj.isStatsVisible ?? true,
        isAppDownloadVisible: contentObj.isAppDownloadVisible ?? true,
        isOrderTrackingVisible: contentObj.isOrderTrackingVisible ?? true,
        isHowItWorksVisible: contentObj.isHowItWorksVisible ?? true,
        heroSection: contentObj.heroSection || null,
        stats: contentObj.stats || [],
        appDownload: contentObj.appDownload || null,
        navLinks: contentObj.navLinks || [],
        siteIdentity: contentObj.siteIdentity || null,
        howItWorks: contentObj.howItWorks || null,
        isAboutUsVisible: contentObj.isAboutUsVisible ?? true,
        isOffersVisible: contentObj.isOffersVisible ?? true,
        isContactUsVisible: contentObj.isContactUsVisible ?? true,
        aboutUs: contentObj.aboutUs || null,
        offers: contentObj.offers || null,
        contactUs: contentObj.contactUs || null
      };
    }

    res.status(200).json({
      success: true,
      categories: formattedCategories,
      homeContent: formattedContent
    });
  } catch (error) {
    console.error('Get public home data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch home data'
    });
  }
};

module.exports = {
  getPublicCategories,
  getPublicBrands,
  getPublicBrandBySlug,
  getPublicServices,
  getPublicHomeContent,
  getPublicHomeData
};
