export const userInputs = [
    {
      id: 1,
      label: "Username",
      type: "text",
      placeholder: "john_doe",
      name: "username"
    },
    {
      id: 2,
      label: "First Name",
      type: "text",
      placeholder: "John",
      name: "firstName"
    },
    {
      id: 3,
      label: "Last Name",
      type: "text",
      placeholder: "Doe",
      name: "lastName"
    },
    {
      id: 4,
      label: "Email",
      type: "email",
      placeholder: "john_doe@gmail.com",
      name: "email"
    },
    {
      id: 5,
      label: "Phone",
      type: "text",
      placeholder: "+1 234 567 89",
      name: "phone"
    },
    {
      id: 6,
      label: "Password",
      type: "password",
      name: "password"
    },
    {
      id: 7,
      label: "Age",
      type: "number",
      placeholder: "25",
      name: "age"
    },
    {
      id: 8,
      label: "Address",
      type: "text",
      placeholder: "Elton St. 216 NewYork",
      name: "address"
    },
    {
      id: 9,
      label: "City",
      type: "text",
      placeholder: "New York",
      name: "city"
    },
    {
      id: 10,
      label: "State",
      type: "text",
      placeholder: "NY",
      name: "state"
    },
    {
      id: 11,
      label: "Country",
      type: "text",
      placeholder: "USA",
      name: "country"
    },
    {
      id: 12,
      label: "Status",
      type: "select",
      options: ["active", "inactive", "banned"],
      name: "status"
    }
  ];

// Bus Form Inputs
export const busInputs = [
    {
      id: 1,
      label: "Bus Number",
      type: "text",
      placeholder: "MH12AB1234",
      name: "busNumber"
    },
    {
      id: 2,
      label: "Operator Name",
      type: "text",
      placeholder: "RedBus Travels",
      name: "operator.name"
    },
    {
      id: 3,
      label: "Operator Code",
      type: "text",
      placeholder: "RBT",
      name: "operator.code"
    },
    {
      id: 4,
      label: "Origin",
      type: "text",
      placeholder: "Delhi",
      name: "route.origin",
      required: true
    },
    {
      id: 5,
      label: "Destination",
      type: "text",
      placeholder: "Mumbai",
      name: "route.destination",
      required: true
    },
    {
      id: 6,
      label: "Bus Type",
      type: "select",
      options: ["ac_sleeper", "non_ac_sleeper", "ac_seater", "non_ac_seater", "volvo", "luxury"],
      name: "busType",
      defaultValue: "ac_seater"
    },
    {
      id: 7,
      label: "Total Seats",
      type: "number",
      placeholder: "40",
      name: "seating.totalSeats"
    },
    {
      id: 8,
      label: "Departure Time",
      type: "time",
      name: "schedule.departureTime"
    },
    {
      id: 9,
      label: "Arrival Time",
      type: "time",
      name: "schedule.arrivalTime"
    },
    {
      id: 10,
      label: "Duration",
      type: "text",
      placeholder: "08:30",
      name: "schedule.duration"
    },
    {
      id: 11,
      label: "Base Price",
      type: "number",
      placeholder: "500",
      name: "basePrice"
    },
    {
      id: 12,
      label: "Valid From",
      type: "date",
      name: "schedule.validFrom"
    },
    {
      id: 13,
      label: "Valid To",
      type: "date",
      name: "schedule.validTo"
    },
    {
      id: 14,
      label: "Status",
      type: "select",
      options: ["active", "inactive", "cancelled"],
      name: "status"
    }
  ];
  
// Flight Form Inputs
export const flightInputs = [
    {
      id: 1,
      label: "Flight Number",
      type: "text",
      placeholder: "AI101",
      name: "flightNumber"
    },
    {
      id: 100,
      label: "Origin",
      type: "text",
      placeholder: "Delhi",
      name: "route.origin",
      required: true
    },
    {
      id: 101,
      label: "Destination",
      type: "text",
      placeholder: "Mumbai",
      name: "route.destination",
      required: true
    },
    {
      id: 2,
      label: "Airline Name",
      type: "text",
      placeholder: "Air India",
      name: "airline.name"
    },
    {
      id: 3,
      label: "Airline Code",
      type: "text",
      placeholder: "AI",
      name: "airline.code"
    },
    {
      id: 4,
      label: "Aircraft Model",
      type: "text",
      placeholder: "Boeing 737",
      name: "aircraft.model"
    },
    {
      id: 5,
      label: "Aircraft Capacity",
      type: "number",
      placeholder: "180",
      name: "aircraft.capacity"
    },
    {
      id: 6,
      label: "Departure Time",
      type: "time",
      name: "schedule.departureTime"
    },
    {
      id: 7,
      label: "Arrival Time",
      type: "time",
      name: "schedule.arrivalTime"
    },
    {
      id: 8,
      label: "Duration (minutes)",
      type: "number",
      placeholder: "120",
      name: "schedule.duration"
    },
    {
      id: 9,
      label: "Economy Base Price",
      type: "number",
      placeholder: "5000",
      name: "pricing.economy.basePrice"
    },
    {
      id: 10,
      label: "Economy Total Seats",
      type: "number",
      placeholder: "150",
      name: "pricing.economy.totalSeats"
    },
    {
      id: 11,
      label: "Business Base Price",
      type: "number",
      placeholder: "15000",
      name: "pricing.business.basePrice"
    },
    {
      id: 12,
      label: "Business Total Seats",
      type: "number",
      placeholder: "30",
      name: "pricing.business.totalSeats"
    },
    {
      id: 13,
      label: "Valid From",
      type: "date",
      name: "schedule.validFrom"
    },
    {
      id: 14,
      label: "Valid To",
      type: "date",
      name: "schedule.validTo"
    },
    {
      id: 15,
      label: "Status",
      type: "select",
      options: ["active", "inactive", "cancelled"],
      name: "status"
    }
  ];

// Train Form Inputs
export const trainInputs = [
    {
      id: 1,
      label: "Train Number",
      type: "text",
      placeholder: "12345",
      name: "trainNumber"
    },
    {
      id: 2,
      label: "Train Name",
      type: "text",
      placeholder: "Rajdhani Express",
      name: "trainName"
    },
    {
      id: 3,
      label: "Train Type",
      type: "select",
      options: ["express", "superfast", "passenger", "local", "rajdhani", "shatabdi", "duronto"],
      name: "trainType",
      defaultValue: "express"
    },
    {
      id: 4,
      label: "Origin",
      type: "text",
      placeholder: "Delhi",
      name: "route.origin",
      required: true
    },
    {
      id: 5,
      label: "Destination",
      type: "text",
      placeholder: "Mumbai",
      name: "route.destination",
      required: true
    },
    {
      id: 6,
      label: "Departure Time",
      type: "time",
      name: "schedule.departureTime"
    },
    {
      id: 7,
      label: "Arrival Time",
      type: "time",
      name: "schedule.arrivalTime"
    },
    {
      id: 8,
      label: "Duration",
      type: "text",
      placeholder: "12:30",
      name: "schedule.duration"
    },
    {
      id: 9,
      label: "Valid From",
      type: "date",
      name: "schedule.validFrom"
    },
    {
      id: 10,
      label: "Valid To",
      type: "date",
      name: "schedule.validTo"
    },
    {
      id: 11,
      label: "Pantry Available",
      type: "checkbox",
      name: "pantryAvailable"
    },
    {
      id: 12,
      label: "WiFi Available",
      type: "checkbox",
      name: "wifiAvailable"
    },
    {
      id: 13,
      label: "Status",
      type: "select",
      options: ["active", "inactive", "cancelled"],
      name: "status"
    }
  ];

// Hotel Form Inputs
export const hotelInputs = [
    {
      id: 1,
      label: "Hotel Name",
      type: "text",
      placeholder: "Grand Hotel",
      name: "name"
    },
    {
      id: 2,
      label: "Hotel Type",
      type: "text",
      placeholder: "Luxury",
      name: "type"
    },
    {
      id: 3,
      label: "City",
      type: "text",
      placeholder: "Mumbai",
      name: "city"
    },
    {
      id: 4,
      label: "Address",
      type: "text",
      placeholder: "123 Main Street",
      name: "address"
    },
    {
      id: 5,
      label: "Distance from Center",
      type: "text",
      placeholder: "2 km from city center",
      name: "distance"
    },
    {
      id: 6,
      label: "Title",
      type: "text",
      placeholder: "Luxury Hotel in Heart of City",
      name: "title"
    },
    {
      id: 7,
      label: "Description",
      type: "textarea",
      placeholder: "Hotel description...",
      name: "desc"
    },
    {
      id: 8,
      label: "Rating",
      type: "number",
      placeholder: "4.5",
      min: "0",
      max: "5",
      step: "0.1",
      name: "rating"
    },
    {
      id: 9,
      label: "Cheapest Price",
      type: "number",
      placeholder: "2000",
      name: "cheapestPrice"
    },
    {
      id: 10,
      label: "Featured",
      type: "checkbox",
      name: "featured"
    }
  ];

// Package Form Inputs
export const packageInputs = [
  {
    id: 1,
    label: "Package Name",
    type: "text",
    placeholder: "Golden Triangle Tour",
    name: "name",
    required: true
  },
  {
    id: 2,
    label: "Description",
    type: "textarea",
    placeholder: "Explore Delhi, Agra, and Jaipur...",
    name: "description",
    required: true
  },
  {
    id: 3,
    label: "Duration (Days)",
    type: "number",
    placeholder: "6",
    name: "duration",
    required: true
  },
  {
    id: 4,
    label: "Destinations (comma separated)",
    type: "text",
    placeholder: "Delhi, Agra, Jaipur",
    name: "destinations"
  },
  {
    id: 5,
    label: "Package Type",
    type: "select",
    options: ["adventure", "leisure", "business", "family", "honeymoon", "pilgrimage"],
    name: "type",
    defaultValue: "leisure"
  },
  {
    id: 6,
    label: "Base Price",
    type: "number",
    placeholder: "15000",
    name: "basePrice",
    required: true
  },
  {
    id: 7,
    label: "Base Package Price",
    type: "number",
    placeholder: "8000",
    name: "pricing.basePackagePrice"
  },
  {
    id: 8,
    label: "Budget Hotel Price/Night",
    type: "number",
    placeholder: "1500",
    name: "pricing.hotelOptions.budget.pricePerNight"
  },
  {
    id: 9,
    label: "Standard Hotel Price/Night",
    type: "number",
    placeholder: "3000",
    name: "pricing.hotelOptions.standard.pricePerNight"
  },
  {
    id: 10,
    label: "Luxury Hotel Price/Night",
    type: "number",
    placeholder: "6000",
    name: "pricing.hotelOptions.luxury.pricePerNight"
  },
  {
    id: 11,
    label: "Flight Price",
    type: "number",
    placeholder: "8000",
    name: "pricing.transportOptions.flight.basePrice"
  },
  {
    id: 12,
    label: "Train Price",
    type: "number",
    placeholder: "2500",
    name: "pricing.transportOptions.train.basePrice"
  },
  {
    id: 13,
    label: "Bus Price",
    type: "number",
    placeholder: "1500",
    name: "pricing.transportOptions.bus.basePrice"
  },
  {
    id: 14,
    label: "Inclusions (comma separated)",
    type: "textarea",
    placeholder: "Accommodation, Transportation, Breakfast",
    name: "inclusions"
  },
  {
    id: 15,
    label: "Exclusions (comma separated)",
    type: "textarea",
    placeholder: "Lunch and dinner, Personal expenses",
    name: "exclusions"
  },
  {
    id: 16,
    label: "Rating",
    type: "number",
    placeholder: "4.5",
    min: "0",
    max: "5",
    step: "0.1",
    name: "rating"
  },
  {
    id: 17,
    label: "Max Group Size",
    type: "number",
    placeholder: "15",
    name: "maxGroupSize"
  },
  {
    id: 18,
    label: "Minimum Age",
    type: "number",
    placeholder: "5",
    name: "minAge"
  },
  {
    id: 19,
    label: "Difficulty",
    type: "select",
    options: ["easy", "moderate", "difficult"],
    name: "difficulty",
    defaultValue: "easy"
  },
  {
    id: 20,
    label: "Available Slots",
    type: "number",
    placeholder: "20",
    name: "availableSlots"
  },
  {
    id: 21,
    label: "Active",
    type: "checkbox",
    name: "isActive"
  }
];

// Keep original product inputs for reference
export const productInputs = [
    {
      id: 1,
      label: "Title",
      type: "text",
      placeholder: "Apple Macbook Pro",
      name: "title"
    },
    {
      id: 2,
      label: "Description",
      type: "text",
      placeholder: "Description",
      name: "description"
    },
    {
      id: 3,
      label: "Category",
      type: "text",
      placeholder: "Computers",
      name: "category"
    },
    {
      id: 4,
      label: "Price",
      type: "text",
      placeholder: "100",
      name: "price"
    },
    {
      id: 5,
      label: "Stock",
      type: "text",
      placeholder: "in stock",
      name: "stock"
    }
  ];
  