// Test script to verify booking API endpoints
const testUserId = "675b8b8b8b8b8b8b8b8b8b8b"; // Replace with actual user ID

async function testBookingAPIs() {
    const baseURL = "http://localhost:8800/api/v1";
    
    console.log("Testing booking API endpoints...\n");
    
    // Test unified bookings endpoint
    try {
        console.log("1. Testing unified bookings endpoint:");
        const response = await fetch(`${baseURL}/bookings/user/${testUserId}`);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Response:`, data);
            console.log(`Number of bookings: ${data.data?.length || 0}`);
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    
    console.log("\n" + "=".repeat(50) + "\n");
    
    // Test hotel bookings endpoint
    try {
        console.log("2. Testing hotel bookings endpoint:");
        const response = await fetch(`${baseURL}/hotel-bookings/user/${testUserId}`);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Response:`, data);
            console.log(`Number of bookings: ${data?.length || 0}`);
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    
    console.log("\n" + "=".repeat(50) + "\n");
    
    // Test travel bookings endpoint
    try {
        console.log("3. Testing travel bookings endpoint:");
        const response = await fetch(`${baseURL}/travel-bookings/user/${testUserId}`);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Response:`, data);
            console.log(`Number of bookings: ${data?.length || 0}`);
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
    
    console.log("\n" + "=".repeat(50) + "\n");
    
    // Test package bookings endpoint
    try {
        console.log("4. Testing package bookings endpoint:");
        const response = await fetch(`${baseURL}/packages/bookings/all?userId=${testUserId}`);
        console.log(`Status: ${response.status}`);
        if (response.ok) {
            const data = await response.json();
            console.log(`Response:`, data);
            console.log(`Number of bookings: ${data.data?.bookings?.length || 0}`);
        } else {
            console.log(`Error: ${response.statusText}`);
        }
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
}

// Run the test if this is a Node.js environment
if (typeof window === 'undefined') {
    testBookingAPIs();
}
