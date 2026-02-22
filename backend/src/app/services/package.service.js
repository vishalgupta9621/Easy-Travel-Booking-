import busService from './bus.service.js';
import flightService from './flight.service.js';
import trainService from './train.service.js';
import hotelService from './hotel.service.js';

export class PackageService {
    async searchPackages(searchParams) {
        const {
            from,
            destination,
            startDate,
            endDate,
            travelers = 1,
            transport = 'any',
            budget = 'medium'
        } = searchParams;

        try {
            // Define budget ranges
            const budgetRanges = {
                budget: { min: 5000, max: 15000 },
                medium: { min: 15000, max: 30000 },
                luxury: { min: 30000, max: 100000 }
            };

            const selectedBudget = budgetRanges[budget];

            // Search for hotels in destination
            const hotels = await this.searchHotels(destination, startDate, endDate, travelers, selectedBudget);

            // Search for transport options
            let transportOptions = [];
            
            if (transport === 'any' || transport === 'flight') {
                const flights = await this.searchFlights(from, destination, startDate, endDate, selectedBudget);
                transportOptions.push(...flights);
            }
            
            if (transport === 'any' || transport === 'train') {
                const trains = await this.searchTrains(from, destination, startDate, selectedBudget);
                transportOptions.push(...trains);
            }
            
            if (transport === 'any' || transport === 'bus') {
                const buses = await this.searchBuses(from, destination, startDate, selectedBudget);
                transportOptions.push(...buses);
            }

            // Create package combinations
            const packages = this.createPackageCombinations(
                hotels, 
                transportOptions, 
                startDate, 
                endDate, 
                travelers, 
                selectedBudget
            );

            // Sort packages by price and rating
            packages.sort((a, b) => {
                if (a.totalPrice === b.totalPrice) {
                    return b.overallRating - a.overallRating;
                }
                return a.totalPrice - b.totalPrice;
            });

            return {
                packages: packages.slice(0, 20), // Return top 20 packages
                searchParams,
                totalFound: packages.length
            };

        } catch (error) {
            throw new Error(`Package search failed: ${error.message}`);
        }
    }

    async searchHotels(destination, checkIn, checkOut, guests, budget) {
        try {
            // Calculate nights
            const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
            const maxPricePerNight = budget.max * 0.6 / nights; // 60% of budget for hotel

            const hotels = await hotelService.searchHotels({
                city: destination,
                checkIn,
                checkOut,
                maxPrice: maxPricePerNight
            });

            return hotels.map(hotel => ({
                ...hotel,
                totalPrice: hotel.cheapestPrice * nights,
                nights,
                type: 'hotel'
            }));
        } catch (error) {
            console.error('Hotel search error:', error);
            return [];
        }
    }

    async searchFlights(from, to, departureDate, returnDate, budget) {
        try {
            const maxFlightPrice = budget.max * 0.4; // 40% of budget for flights

            const outboundFlights = await flightService.searchFlights(from, to, departureDate);
            let returnFlights = [];
            
            if (returnDate) {
                returnFlights = await flightService.searchFlights(to, from, returnDate);
            }

            const flightOptions = [];

            for (const outbound of outboundFlights) {
                if (returnDate && returnFlights.length > 0) {
                    // Round trip
                    for (const returnFlight of returnFlights) {
                        const totalPrice = outbound.pricing.economy.basePrice + returnFlight.pricing.economy.basePrice;
                        if (totalPrice <= maxFlightPrice) {
                            flightOptions.push({
                                type: 'flight',
                                outbound,
                                return: returnFlight,
                                totalPrice,
                                duration: outbound.schedule.duration + returnFlight.schedule.duration,
                                airline: outbound.airline.name
                            });
                        }
                    }
                } else {
                    // One way
                    if (outbound.pricing.economy.basePrice <= maxFlightPrice) {
                        flightOptions.push({
                            type: 'flight',
                            outbound,
                            totalPrice: outbound.pricing.economy.basePrice,
                            duration: outbound.schedule.duration,
                            airline: outbound.airline.name
                        });
                    }
                }
            }

            return flightOptions;
        } catch (error) {
            console.error('Flight search error:', error);
            return [];
        }
    }

    async searchTrains(from, to, departureDate, budget) {
        try {
            const maxTrainPrice = budget.max * 0.3; // 30% of budget for trains

            const trains = await trainService.searchTrains(from, to, departureDate);

            return trains
                .filter(train => {
                    const cheapestClass = train.classes.reduce((min, cls) => 
                        cls.basePrice < min.basePrice ? cls : min
                    );
                    return cheapestClass.basePrice <= maxTrainPrice;
                })
                .map(train => {
                    const cheapestClass = train.classes.reduce((min, cls) => 
                        cls.basePrice < min.basePrice ? cls : min
                    );
                    return {
                        type: 'train',
                        train,
                        selectedClass: cheapestClass,
                        totalPrice: cheapestClass.basePrice,
                        duration: train.schedule.duration,
                        trainName: train.trainName
                    };
                });
        } catch (error) {
            console.error('Train search error:', error);
            return [];
        }
    }

    async searchBuses(from, to, departureDate, budget) {
        try {
            const maxBusPrice = budget.max * 0.2; // 20% of budget for buses

            const buses = await busService.searchBuses(from, to, departureDate);

            return buses
                .filter(bus => bus.basePrice <= maxBusPrice)
                .map(bus => ({
                    type: 'bus',
                    bus,
                    totalPrice: bus.basePrice,
                    duration: bus.schedule.duration,
                    operator: bus.operator.name
                }));
        } catch (error) {
            console.error('Bus search error:', error);
            return [];
        }
    }

    createPackageCombinations(hotels, transportOptions, startDate, endDate, travelers, budget) {
        const packages = [];

        for (const hotel of hotels) {
            for (const transport of transportOptions) {
                const totalPrice = hotel.totalPrice + transport.totalPrice;
                
                // Check if within budget
                if (totalPrice >= budget.min && totalPrice <= budget.max) {
                    const savings = this.calculateSavings(hotel, transport);
                    const overallRating = this.calculateOverallRating(hotel, transport);

                    packages.push({
                        _id: `${hotel._id}_${transport.type}_${Date.now()}`,
                        id: `${hotel._id}_${transport.type}_${Date.now()}`,
                        name: `${hotel.name} Package`,
                        description: `Complete travel package including ${hotel.nights} nights at ${hotel.name} with ${transport.type} transportation`,
                        destinations: [hotel.city],
                        type: this.getPackageType(totalPrice, budget),
                        basePrice: totalPrice,
                        price: totalPrice,
                        images: hotel.photos || [],
                        hotel: {
                            id: hotel._id,
                            name: hotel.name,
                            rating: hotel.rating,
                            price: hotel.totalPrice,
                            nights: hotel.nights,
                            city: hotel.city,
                            photos: hotel.photos
                        },
                        transport: {
                            type: transport.type,
                            price: transport.totalPrice,
                            duration: transport.duration,
                            details: this.getTransportDetails(transport)
                        },
                        totalPrice,
                        savings,
                        overallRating,
                        travelers,
                        duration: hotel.nights,
                        startDate,
                        endDate,
                        packageType: this.getPackageType(totalPrice, budget),
                        highlights: this.generateHighlights(hotel, transport)
                    });
                }
            }
        }

        return packages;
    }

    calculateSavings(hotel, transport) {
        // Simulate savings calculation (typically 10-20% savings on packages)
        const individualTotal = hotel.totalPrice + transport.totalPrice;
        const savingsPercentage = Math.random() * 0.1 + 0.05; // 5-15% savings
        return Math.floor(individualTotal * savingsPercentage);
    }

    calculateOverallRating(hotel, transport) {
        const hotelRating = hotel.rating || 3.5;
        const transportRating = this.getTransportRating(transport);
        return ((hotelRating + transportRating) / 2).toFixed(1);
    }

    getTransportRating(transport) {
        // Simulate transport ratings
        const ratings = {
            flight: 4.2,
            train: 3.8,
            bus: 3.5
        };
        return ratings[transport.type] || 3.5;
    }

    getTransportDetails(transport) {
        switch (transport.type) {
            case 'flight':
                return {
                    airline: transport.airline,
                    flightNumber: transport.outbound.flightNumber,
                    duration: `${Math.floor(transport.duration / 60)}h ${transport.duration % 60}m`
                };
            case 'train':
                return {
                    trainName: transport.trainName,
                    trainNumber: transport.train.trainNumber,
                    class: transport.selectedClass.name,
                    duration: transport.duration
                };
            case 'bus':
                return {
                    operator: transport.operator,
                    busType: transport.bus.busType,
                    duration: transport.duration
                };
            default:
                return {};
        }
    }

    getPackageType(price, budget) {
        if (price <= budget.min + (budget.max - budget.min) * 0.3) {
            return 'Value';
        } else if (price <= budget.min + (budget.max - budget.min) * 0.7) {
            return 'Standard';
        } else {
            return 'Premium';
        }
    }

    generateHighlights(hotel, transport) {
        const highlights = [];
        
        if (hotel.rating >= 4.5) highlights.push('Highly Rated Hotel');
        if (hotel.featured) highlights.push('Featured Property');
        if (transport.type === 'flight') highlights.push('Quick Travel');
        if (transport.type === 'train') highlights.push('Scenic Journey');
        if (transport.type === 'bus') highlights.push('Budget Friendly');
        
        return highlights;
    }
}

export default new PackageService();
