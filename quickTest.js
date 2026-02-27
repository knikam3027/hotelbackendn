const https = require('https');

// Quick test to verify API is working
const testAPI = async () => {
    console.log('\n🧪 QUICK API TEST\n');
    
    try {
        // Test 1: Home endpoint
        console.log('1️⃣  Testing home endpoint...');
        const homeRes = await fetch('http://localhost:4040/');
        const homeData = await homeRes.json();
        console.log('✅ Server running:', homeData.message);
        
        // Test 2: Get rooms
        console.log('\n2️⃣  Testing get rooms endpoint...');
        const roomsRes = await fetch('http://localhost:4040/rooms/all-available-rooms');
        const roomsData = await roomsRes.json();
        console.log(`✅ Retrieved ${roomsData.roomList?.length || 0} rooms`);
        
        if (roomsData.roomList && roomsData.roomList.length > 0) {
            const room = roomsData.roomList[0];
            console.log(`   - Sample: ${room.roomType} (₹${room.roomPrice})`);
            console.log(`   - Image: ${room.roomPhotoUrl?.substring(0, 50)}...`);
        }
        
        // Test 3: Login
        console.log('\n3️⃣  Testing admin login...');
        const loginRes = await fetch('http://localhost:4040/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@siddhi.com',
                password: 'admin@123'
            })
        });
        const loginData = await loginRes.json();
        if (loginData.token) {
            console.log(`✅ Admin logged in successfully`);
            console.log(`   Token: ${loginData.token.substring(0, 30)}...`);
            console.log(`   Role: ${loginData.role}`);
        } else {
            console.log('❌ Login failed:', loginData.message);
        }
        
        // Test 4: Register user
        console.log('\n4️⃣  Testing user registration...');
        const regRes = await fetch('http://localhost:4040/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Guest',
                email: `guest${Date.now()}@test.com`,
                phoneNumber: '9876543210',
                password: 'guest@123'
            })
        });
        const regData = await regRes.json();
        if (regData.token) {
            console.log(`✅ User registered successfully`);
            console.log(`   Name: ${regData.user?.name}`);
            console.log(`   Role: ${regData.user?.role}`);
        } else {
            console.log('❌ Registration failed:', regData.message);
        }
        
        console.log('\n✨ API TESTS COMPLETE!\n');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
    
    process.exit(0);
};

testAPI();
