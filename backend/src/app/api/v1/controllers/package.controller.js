import packageService from '../../../services/package.service.js';
import dynamicPricingService from '../../../services/dynamicPricing.service.js';
import PackageBooking from '../../../models/PackageBooking.js';
import Package from '../../../models/Package.js';

export class PackageController {
    async searchPackages(req, res, next) {
        try {
            const {
                from,
                destination,
                startDate,
                endDate,
                travelers,
                transport,
                budget
            } = req.query;

            // Validate required fields
            if (!from || !destination || !startDate || !endDate) {
                return res.status(400).json({
                    message: 'Missing required fields: from, destination, startDate, endDate'
                });
            }

            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();

            if (start < today) {
                return res.status(400).json({
                    message: 'Start date cannot be in the past'
                });
            }

            if (end <= start) {
                return res.status(400).json({
                    message: 'End date must be after start date'
                });
            }

            const searchParams = {
                from,
                destination,
                startDate,
                endDate,
                travelers: parseInt(travelers) || 1,
                transport: transport || 'any',
                budget: budget || 'medium'
            };

            const result = await packageService.searchPackages(searchParams);
            res.status(200).json(result);

        } catch (error) {
            next(error);
        }
    }

    async getPackageDetails(req, res, next) {
        try {
            const { packageId } = req.params;
            
            // For now, return a mock detailed package
            // In a real implementation, you'd store and retrieve package details
            const packageDetails = {
                id: packageId,
                status: 'available',
                inclusions: [
                    'Round-trip transportation',
                    'Hotel accommodation',
                    'Breakfast included',
                    '24/7 customer support',
                    'Travel insurance'
                ],
                exclusions: [
                    'Lunch and dinner',
                    'Local transportation',
                    'Entry fees to attractions',
                    'Personal expenses'
                ],
                cancellationPolicy: {
                    freeCancellation: '24 hours before travel',
                    partialRefund: '50% refund up to 48 hours before',
                    noRefund: 'Less than 24 hours before travel'
                },
                terms: [
                    'Valid government ID required',
                    'Subject to availability',
                    'Prices may vary based on season',
                    'Additional taxes may apply'
                ]
            };

            res.status(200).json(packageDetails);

        } catch (error) {
            next(error);
        }
    }

    async createPackageBooking(req, res, next) {
        try {
            const {
                packageId,
                userId,
                customerInfo,
                travelDetails,
                selectedPreferences,
                paymentInfo,
                specialRequests,
                emergencyContact
            } = req.body;

            // Validate required fields
            if (!packageId || !customerInfo || !travelDetails || !selectedPreferences) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required booking information'
                });
            }

            // Determine user ID - prioritize authenticated user, then request body, then try to find by email
            let finalUserId = req.user?._id || userId || null;

            // If no userId available, try to find user by email for guest bookings
            if (!finalUserId && customerInfo.email) {
                try {
                    const User = (await import('../../../models/users.model.js')).default;
                    const existingUser = await User.findOne({ email: customerInfo.email });
                    if (existingUser) {
                        finalUserId = existingUser._id;
                    }
                } catch (error) {
                    console.log('Could not find user by email:', error.message);
                }
            }

            // Calculate dynamic pricing
            const pricingBreakdown = await dynamicPricingService.calculatePackagePrice(
                packageId,
                selectedPreferences,
                travelDetails
            );

            // Create package booking
            const bookingData = {
                packageId,
                userId: finalUserId, // Use the determined user ID
                customerInfo,
                travelDetails,
                selectedPreferences,
                pricingBreakdown,
                paymentInfo: {
                    ...paymentInfo,
                    amount: pricingBreakdown.totalAmount
                },
                specialRequests,
                emergencyContact,
                bookingStatus: 'pending'
            };

            const booking = new PackageBooking(bookingData);
            await booking.save();

            res.status(201).json({
                success: true,
                message: 'Package booking created successfully',
                data: {
                    bookingNumber: booking.bookingNumber,
                    totalAmount: booking.pricingBreakdown.totalAmount,
                    pricingBreakdown: booking.pricingBreakdown,
                    bookingStatus: booking.bookingStatus
                }
            });

        } catch (error) {
            console.error('Package booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create package booking',
                error: error.message
            });
        }
    }

    async getPopularPackages(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            // Get popular packages from database
            const packages = await Package.find({ isActive: true })
                .sort({ rating: -1, createdAt: -1 })
                .limit(parseInt(limit))
                .select('name description duration destinations type basePrice price rating images inclusions');

            const popularPackages = packages.map(pkg => ({
                id: pkg._id,
                name: pkg.name,
                destination: pkg.destinations?.join(', '),
                title: pkg.name,
                duration: `${pkg.duration} Days`,
                startingPrice: pkg.basePrice || pkg.price,
                rating: pkg.rating,
                image: pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
                highlights: pkg.inclusions?.slice(0, 3) || ['Package Tour', 'Professional Guide', 'Transportation'],
                type: pkg.type,
                description: pkg.description
            }));
            res.status(200).json({
                success: true,
                packages: popularPackages,
                total: popularPackages.length
            });

        } catch (error) {
            console.error('Get popular packages error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get popular packages',
                error: error.message
            });
        }
    }

    async getPackagesByDestination(req, res, next) {
        try {
            const { destination } = req.params;
            const { budget, duration, transport } = req.query;

            // Mock filtered packages by destination
            const packages = [
                {
                    id: `dest_${destination}_1`,
                    destination,
                    title: `${destination} Explorer`,
                    duration: '3 Days 2 Nights',
                    price: 15999,
                    rating: 4.3,
                    transport: 'flight',
                    highlights: ['City Tour', 'Local Cuisine', 'Shopping']
                },
                {
                    id: `dest_${destination}_2`,
                    destination,
                    title: `${destination} Luxury`,
                    duration: '4 Days 3 Nights',
                    price: 25999,
                    rating: 4.7,
                    transport: 'flight',
                    highlights: ['Luxury Hotel', 'Spa Treatment', 'Fine Dining']
                }
            ];

            // Apply filters
            let filteredPackages = packages;

            if (budget) {
                const budgetRanges = {
                    budget: { max: 15000 },
                    medium: { min: 15000, max: 30000 },
                    luxury: { min: 30000 }
                };
                const range = budgetRanges[budget];
                if (range) {
                    filteredPackages = filteredPackages.filter(pkg => {
                        return (!range.min || pkg.price >= range.min) && 
                               (!range.max || pkg.price <= range.max);
                    });
                }
            }

            if (transport) {
                filteredPackages = filteredPackages.filter(pkg => pkg.transport === transport);
            }

            res.status(200).json({
                destination,
                packages: filteredPackages,
                filters: { budget, duration, transport }
            });

        } catch (error) {
            next(error);
        }
    }

    async getPackageOptions(req, res, next) {
        try {
            const { packageId } = req.params;

            const options = await dynamicPricingService.getPackageOptions(packageId);

            res.status(200).json({
                success: true,
                data: options
            });

        } catch (error) {
            console.error('Get package options error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get package options',
                error: error.message
            });
        }
    }

    async calculateDynamicPrice(req, res, next) {
        try {
            const { packageId } = req.params;
            const { preferences, travelDetails } = req.body;

            if (!preferences || !travelDetails) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing preferences or travel details'
                });
            }

            const pricingBreakdown = await dynamicPricingService.calculatePackagePrice(
                packageId,
                preferences,
                travelDetails
            );

            res.status(200).json({
                success: true,
                data: pricingBreakdown
            });

        } catch (error) {
            console.error('Dynamic price calculation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to calculate dynamic price',
                error: error.message
            });
        }
    }

    async getPackageBookings(req, res, next) {
        try {
            const { page, limit, status, packageId, userId } = req.query;

            const filter = {};
            if (status) filter.bookingStatus = status;
            if (packageId) filter.packageId = packageId;
            if (userId) filter.userId = userId;

            // If pagination parameters are provided, use them; otherwise return all bookings
            let bookings;
            let total;

            if (page && limit) {
                // Paginated response
                bookings = await PackageBooking.find(filter)
                    .populate('packageId', 'name destinations duration')
                    .sort({ createdAt: -1 })
                    .limit(limit * 1)
                    .skip((page - 1) * limit);

                total = await PackageBooking.countDocuments(filter);

                res.status(200).json({
                    success: true,
                    data: {
                        bookings,
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total,
                            pages: Math.ceil(total / limit)
                        }
                    }
                });
            } else {
                // Return all bookings without pagination
                bookings = await PackageBooking.find(filter)
                    .populate('packageId', 'name destinations duration')
                    .sort({ createdAt: -1 });

                res.status(200).json({
                    success: true,
                    data: {
                        bookings,
                        total: bookings.length
                    }
                });
            }

        } catch (error) {
            console.error('Get package bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get package bookings',
                error: error.message
            });
        }
    }

    async createPackage(req, res, next) {
        try {
            const packageData = req.body;

            // Process destinations if it's a string
            if (typeof packageData.destinations === 'string') {
                packageData.destinations = packageData.destinations.split(',').map(d => d.trim());
            }

            // Process inclusions if it's a string
            if (typeof packageData.inclusions === 'string') {
                packageData.inclusions = packageData.inclusions.split(',').map(i => i.trim());
            }

            // Process exclusions if it's a string
            if (typeof packageData.exclusions === 'string') {
                packageData.exclusions = packageData.exclusions.split(',').map(e => e.trim());
            }

            // Ensure price field is set for backward compatibility
            if (!packageData.price && packageData.basePrice) {
                packageData.price = packageData.basePrice;
            }

            // Set up pricing structure
            const pricing = {
                basePackagePrice: packageData.pricing?.basePackagePrice || packageData.basePrice || packageData.price,
                hotelOptions: [
                    {
                        category: 'budget',
                        pricePerNight: packageData.pricing?.hotelOptions?.budget?.pricePerNight || 1500,
                        description: 'Clean and comfortable accommodation with basic amenities'
                    },
                    {
                        category: 'standard',
                        pricePerNight: packageData.pricing?.hotelOptions?.standard?.pricePerNight || 3000,
                        description: 'Well-appointed rooms with modern facilities'
                    },
                    {
                        category: 'luxury',
                        pricePerNight: packageData.pricing?.hotelOptions?.luxury?.pricePerNight || 6000,
                        description: 'Premium hotels with world-class amenities and service'
                    }
                ],
                transportOptions: [
                    {
                        type: 'flight',
                        class: 'economy',
                        basePrice: packageData.pricing?.transportOptions?.flight?.basePrice || 8000,
                        description: 'Quick and convenient air travel'
                    },
                    {
                        type: 'train',
                        class: '3A',
                        basePrice: packageData.pricing?.transportOptions?.train?.basePrice || 2500,
                        description: 'Comfortable AC train journey'
                    },
                    {
                        type: 'bus',
                        class: 'ac',
                        basePrice: packageData.pricing?.transportOptions?.bus?.basePrice || 1500,
                        description: 'AC bus with comfortable seating'
                    }
                ]
            };
            packageData.pricing = pricing;

            const newPackage = new Package(packageData);
            await newPackage.save();

            res.status(201).json({
                success: true,
                message: 'Package created successfully',
                data: newPackage
            });

        } catch (error) {
            console.error('Create package error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create package',
                error: error.message
            });
        }
    }

    async updatePackage(req, res, next) {
        try {
            const { packageId } = req.params;
            const updateData = req.body;

            // Process destinations if it's a string
            if (typeof updateData.destinations === 'string') {
                updateData.destinations = updateData.destinations.split(',').map(d => d.trim());
            }

            // Process inclusions if it's a string
            if (typeof updateData.inclusions === 'string') {
                updateData.inclusions = updateData.inclusions.split(',').map(i => i.trim());
            }

            // Process exclusions if it's a string
            if (typeof updateData.exclusions === 'string') {
                updateData.exclusions = updateData.exclusions.split(',').map(e => e.trim());
            }

            const updatedPackage = await Package.findByIdAndUpdate(
                packageId,
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedPackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Package updated successfully',
                data: updatedPackage
            });

        } catch (error) {
            console.error('Update package error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update package',
                error: error.message
            });
        }
    }

    async deletePackage(req, res, next) {
        try {
            const { packageId } = req.params;

            const deletedPackage = await Package.findByIdAndDelete(packageId);

            if (!deletedPackage) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Package deleted successfully'
            });

        } catch (error) {
            console.error('Delete package error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete package',
                error: error.message
            });
        }
    }
}

export default new PackageController();
