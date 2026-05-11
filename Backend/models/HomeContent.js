const mongoose = require('mongoose');

/**
 * HomeContent Model
 * Manages homepage content: banners, promos, curated services, etc.
 */
const homeContentSchema = new mongoose.Schema({
  // City association - if null, considered default/fallback
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    default: null,
    index: true
  },

  // Banners (main homepage banners)
  banners: [{
    imageUrl: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    slug: {
      type: String,
      default: ''
    },
    targetServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    scrollToSection: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Promo Carousel
  promos: [{
    title: {
      type: String,
      required: false,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    buttonText: {
      type: String,
      default: 'Explore'
    },
    gradientClass: {
      type: String,
      default: 'from-blue-600 to-blue-800'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    slug: {
      type: String,
      default: ''
    },
    targetServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    scrollToSection: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Curated Services
  curated: [{
    title: {
      type: String,
      required: false,
      default: ''
    },
    gifUrl: {
      type: String,
      default: ''
    },
    youtubeUrl: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // New & Noteworthy
  noteworthy: [{
    title: {
      type: String,
      required: false,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    slug: {
      type: String,
      default: ''
    },
    targetServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Most Booked Services
  booked: [{
    title: {
      type: String,
      required: false,
      default: ''
    },
    rating: {
      type: String,
      default: ''
    },
    reviews: {
      type: String,
      default: ''
    },
    price: {
      type: String,
      default: ''
    },
    originalPrice: {
      type: String,
      default: ''
    },
    discount: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    targetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    slug: {
      type: String,
      default: ''
    },
    targetServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  }],

  // Category Sections
  categorySections: [{
    title: {
      type: String,
      required: true
    },
    seeAllTargetCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
    seeAllSlug: {
      type: String,
      default: ''
    },
    seeAllTargetServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null
    },
    cards: [{
      title: String,
      imageUrl: String,
      badge: String,
      price: String,
      originalPrice: String,
      discount: String,
      rating: String,
      reviews: String,
      targetCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
      },
      slug: {
        type: String,
        default: ''
      },
      targetServiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        default: null
      }
    }],
    order: {
      type: Number,
      default: 0
    }
  }],

  // Status
  isActive: {
    type: Boolean,
    default: true
  },

  // Section Visibility
  isBannersVisible: { type: Boolean, default: true },
  isPromosVisible: { type: Boolean, default: true },
  isCuratedVisible: { type: Boolean, default: true },
  isNoteworthyVisible: { type: Boolean, default: true },
  isBookedVisible: { type: Boolean, default: true },
  isCategorySectionsVisible: { type: Boolean, default: true },
  isCategoriesVisible: { type: Boolean, default: true },
  isStatsVisible: { type: Boolean, default: true },
  isAppDownloadVisible: { type: Boolean, default: true },
  isOrderTrackingVisible: { type: Boolean, default: true },

  // Hero Section Customization
  heroSection: {
    title: { type: String, default: 'Everything You Need, Delivered to You.' },
    subtitle: { type: String, default: 'One super app for all your daily needs. Fast, reliable & secure delivery at your doorstep.' },
    primaryBtnText: { type: String, default: 'Get Started' },
    secondaryBtnText: { type: String, default: 'Explore Services' },
    imageUrl: { type: String, default: '' }
  },

  // Site Identity
  siteIdentity: {
    brandName: { type: String, default: 'NEXORA GO' },
    slogan: { type: String, default: 'Everything you need, one place' }
  },

  // Stats Bar
  stats: [{
    label: { type: String, default: '' },
    value: { type: String, default: '' },
    icon: { type: String, default: '' }
  }],

  // App Download Section
  appDownload: {
    title: { type: String, default: 'Download the Nexora GO App' },
    subtitle: { type: String, default: 'Better experience, exclusive offers & faster everything. Scan to download or use the stores.' },
    playStoreUrl: { type: String, default: '#' },
    appStoreUrl: { type: String, default: '#' },
    qrCodeUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' }
  },
  
  // Navigation Links
  navLinks: [{
    label: { type: String, required: true },
    path: { type: String, required: true },
    order: { type: Number, default: 0 }
  }],

  // How It Works Section
  isHowItWorksVisible: { type: Boolean, default: true },
  howItWorks: {
    title: { type: String, default: 'How It Works' },
    subtitle: { type: String, default: 'Simple steps to get your services done' },
    items: [{
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      icon: { type: String, default: 'FiCheckCircle' }
    }]
  },

  // About Us Section
  isAboutUsVisible: { type: Boolean, default: true },
  aboutUs: {
    title: { type: String, default: 'About Us' },
    content: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    features: [{
      title: { type: String, default: '' },
      description: { type: String, default: '' }
    }]
  },

  // Offers Section
  isOffersVisible: { type: Boolean, default: true },
  offers: {
    title: { type: String, default: 'Exclusive Offers' },
    subtitle: { type: String, default: 'Save more with our latest deals' },
    items: [{
      title: { type: String, default: '' },
      code: { type: String, default: '' },
      discount: { type: String, default: '' },
      description: { type: String, default: '' },
      imageUrl: { type: String, default: '' }
    }]
  },

  // Contact Us Section
  isContactUsVisible: { type: Boolean, default: true },
  contactUs: {
    title: { type: String, default: 'Contact Us' },
    subtitle: { type: String, default: 'We are here to help' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    workingHours: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Ensure only one home content document exists per city
homeContentSchema.statics.getHomeContent = async function (cityId = null) {
  let query = { cityId: null };

  if (cityId) {
    query = { cityId };
  }

  let homeContent = await this.findOne(query);

  // If requesting a specific city and no content exists, create it by copying default/empty
  if (!homeContent && cityId) {
    // Ideally we might copy from default here, but for now we create empty/default structure
    // Fetch default to see if we can copy basics? No, start fresh or based on migration.
    // Let's create a new entry for this city.
    homeContent = await this.create({ cityId });
  } else if (!homeContent && !cityId) {
    // Create default if it doesn't exist
    homeContent = await this.create({ cityId: null });
  }

  return homeContent;
};

module.exports = mongoose.model('HomeContent', homeContentSchema);

