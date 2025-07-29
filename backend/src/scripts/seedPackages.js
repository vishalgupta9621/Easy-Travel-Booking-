import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Package from '../app/models/Package.js';

// Load environment variables
dotenv.config();

const samplePackages = [
  {
    name: "Golden Triangle Tour",
    description: "Explore Delhi, Agra, and Jaipur in this classic India tour covering the most iconic destinations.",
    duration: 6,
    destinations: ["Delhi", "Agra", "Jaipur"],
    type: "leisure",
    basePrice: 15000,
    pricing: {
      basePackagePrice: 8000,
      hotelOptions: [
        {
          category: "budget",
          pricePerNight: 1500,
          description: "Clean and comfortable accommodation with basic amenities"
        },
        {
          category: "standard",
          pricePerNight: 3000,
          description: "Well-appointed rooms with modern facilities"
        },
        {
          category: "luxury",
          pricePerNight: 6000,
          description: "Premium hotels with world-class amenities and service"
        }
      ],
      transportOptions: [
        {
          type: "flight",
          class: "economy",
          basePrice: 8000,
          description: "Quick and convenient air travel"
        },
        {
          type: "train",
          class: "3A",
          basePrice: 2500,
          description: "Comfortable AC train journey"
        },
        {
          type: "bus",
          class: "ac",
          basePrice: 1500,
          description: "AC bus with comfortable seating"
        }
      ]
    },
    preferences: {
      recommendedTransport: ["flight", "train"],
      recommendedHotelCategory: "standard",
      includedMeals: ["breakfast"],
      includedActivities: ["City tours", "Monument visits", "Local guide"],
      optionalAddOns: [
        {
          name: "Photography Package",
          price: 2000,
          description: "Professional photographer for the entire trip"
        },
        {
          name: "Cultural Show",
          price: 1500,
          description: "Traditional dance and music performances"
        }
      ]
    },
    price: 15000,
    inclusions: [
      "Accommodation",
      "Transportation",
      "Breakfast",
      "Sightseeing",
      "Local guide"
    ],
    exclusions: [
      "Lunch and dinner",
      "Personal expenses",
      "Monument entry fees",
      "Travel insurance"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival in Delhi",
        description: "Arrive in Delhi, check-in to hotel, evening city tour",
        activities: ["Airport pickup", "Hotel check-in", "India Gate visit", "Connaught Place"]
      },
      {
        day: 2,
        title: "Delhi Sightseeing",
        description: "Full day Delhi tour covering Old and New Delhi",
        activities: ["Red Fort", "Jama Masjid", "Raj Ghat", "Lotus Temple", "Qutub Minar"]
      },
      {
        day: 3,
        title: "Delhi to Agra",
        description: "Travel to Agra, visit Taj Mahal",
        activities: ["Travel to Agra", "Taj Mahal visit", "Agra Fort", "Local market"]
      },
      {
        day: 4,
        title: "Agra to Jaipur",
        description: "Travel to Jaipur via Fatehpur Sikri",
        activities: ["Fatehpur Sikri", "Travel to Jaipur", "City Palace", "Local bazaar"]
      },
      {
        day: 5,
        title: "Jaipur Sightseeing",
        description: "Full day Jaipur tour",
        activities: ["Amber Fort", "Hawa Mahal", "Jantar Mantar", "Albert Hall Museum"]
      },
      {
        day: 6,
        title: "Departure",
        description: "Check-out and departure",
        activities: ["Hotel check-out", "Airport/railway station drop"]
      }
    ],
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523",
      "https://images.unsplash.com/photo-1587474260584-136574528ed5",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da"
    ],
    rating: 4.5,
    isActive: true,
    maxGroupSize: 15,
    minAge: 5,
    difficulty: "easy",
    availableSlots: 20
  },
  {
    name: "Kerala Backwaters Experience",
    description: "Discover the serene backwaters of Kerala with houseboat stays and Ayurvedic treatments.",
    duration: 5,
    destinations: ["Kochi", "Alleppey", "Kumarakom"],
    type: "leisure",
    basePrice: 12000,
    pricing: {
      basePackagePrice: 6000,
      hotelOptions: [
        {
          category: "budget",
          pricePerNight: 2000,
          description: "Traditional Kerala homestays with local hospitality"
        },
        {
          category: "standard",
          pricePerNight: 4000,
          description: "Resort accommodation with backwater views"
        },
        {
          category: "luxury",
          pricePerNight: 8000,
          description: "Premium houseboats and luxury resorts"
        }
      ],
      transportOptions: [
        {
          type: "flight",
          class: "economy",
          basePrice: 6000,
          description: "Flight to Kochi airport"
        },
        {
          type: "train",
          class: "2A",
          basePrice: 3000,
          description: "AC train to Ernakulam"
        },
        {
          type: "bus",
          class: "sleeper",
          basePrice: 2000,
          description: "Overnight sleeper bus"
        }
      ]
    },
    preferences: {
      recommendedTransport: ["flight"],
      recommendedHotelCategory: "standard",
      includedMeals: ["breakfast", "dinner"],
      includedActivities: ["Houseboat cruise", "Backwater tour", "Spice plantation visit"],
      optionalAddOns: [
        {
          name: "Ayurvedic Massage",
          price: 3000,
          description: "Traditional Kerala Ayurvedic treatments"
        },
        {
          name: "Cooking Class",
          price: 1500,
          description: "Learn to cook authentic Kerala cuisine"
        }
      ]
    },
    price: 12000,
    inclusions: [
      "Accommodation",
      "Houseboat stay",
      "Breakfast and dinner",
      "Backwater cruise",
      "Airport transfers"
    ],
    exclusions: [
      "Lunch",
      "Personal expenses",
      "Ayurvedic treatments",
      "Shopping"
    ],
    images: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96"
    ],
    rating: 4.7,
    isActive: true,
    maxGroupSize: 12,
    minAge: 0,
    difficulty: "easy",
    availableSlots: 15
  },
  {
    name: "Himalayan Adventure Trek",
    description: "Experience the majestic Himalayas with trekking, camping, and breathtaking mountain views.",
    duration: 8,
    destinations: ["Manali", "Kasol", "Tosh", "Kheerganga"],
    type: "adventure",
    basePrice: 18000,
    pricing: {
      basePackagePrice: 10000,
      hotelOptions: [
        {
          category: "budget",
          pricePerNight: 1000,
          description: "Basic mountain lodges and camping"
        },
        {
          category: "standard",
          pricePerNight: 2500,
          description: "Comfortable mountain resorts"
        },
        {
          category: "luxury",
          pricePerNight: 5000,
          description: "Premium mountain resorts with spa facilities"
        }
      ],
      transportOptions: [
        {
          type: "bus",
          class: "ac",
          basePrice: 2500,
          description: "AC bus from Delhi to Manali"
        },
        {
          type: "flight",
          class: "economy",
          basePrice: 8000,
          description: "Flight to Kullu-Manali airport"
        }
      ]
    },
    preferences: {
      recommendedTransport: ["bus"],
      recommendedHotelCategory: "standard",
      includedMeals: ["breakfast", "dinner"],
      includedActivities: ["Trekking", "Camping", "Bonfire", "Local guide"],
      optionalAddOns: [
        {
          name: "Adventure Sports",
          price: 4000,
          description: "River rafting, paragliding, and rock climbing"
        },
        {
          name: "Photography Equipment",
          price: 2500,
          description: "Professional camera gear rental"
        }
      ]
    },
    price: 18000,
    inclusions: [
      "Accommodation",
      "Trekking guide",
      "Camping equipment",
      "Meals during trek",
      "Transportation"
    ],
    exclusions: [
      "Personal trekking gear",
      "Travel insurance",
      "Emergency evacuation",
      "Personal expenses"
    ],
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890"
    ],
    rating: 4.3,
    isActive: true,
    maxGroupSize: 8,
    minAge: 16,
    difficulty: "difficult",
    availableSlots: 10
  }
];

async function seedPackages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO || 'mongodb://localhost:27017/travel_booking');
    
    console.log('Connected to MongoDB');
    
    // Clear existing packages
    await Package.deleteMany({});
    console.log('Cleared existing packages');
    
    // Insert sample packages
    const insertedPackages = await Package.insertMany(samplePackages);
    console.log(`Inserted ${insertedPackages.length} sample packages`);
    
    // Display inserted packages
    insertedPackages.forEach(pkg => {
      console.log(`- ${pkg.name} (${pkg._id})`);
    });
    
    console.log('Package seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding packages:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedPackages();
