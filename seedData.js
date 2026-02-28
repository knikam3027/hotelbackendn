const mongoose = require('mongoose');
require('dotenv').config();
const Room = require('./models/Room');
const User = require('./models/User');

// Unsplash image URLs for hotels (free images) - Updated with verified working URLs
const hotelImages = [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop', // Modern hotel room
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop', // Luxury bedroom
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop', // Hotel room with view
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop', // Elegant hotel room
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop', // Cozy bedroom
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=600&fit=crop', // Modern hotel bedroom
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop', // Hotel suite
    'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800&h=600&fit=crop', // Minimalist room
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop', // Budget hotel room
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop', // Family room
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800&h=600&fit=crop', // Deluxe bedroom
    'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&h=600&fit=crop', // Premium suite
    'https://images.unsplash.com/photo-1594560913095-8cf34bda576e?w=800&h=600&fit=crop', // Standard room
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&h=600&fit=crop', // Hotel bedroom
    'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800&h=600&fit=crop', // Modern suite
    'https://images.unsplash.com/photo-1631049035848-68c0a6446e93?w=800&h=600&fit=crop', // Luxury room
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop', // Elegant bedroom
    'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800&h=600&fit=crop', // Hotel room interior
    'https://images.unsplash.com/photo-1631049421450-348ccd7f8949?w=800&h=600&fit=crop', // Contemporary room
    'https://images.unsplash.com/photo-1631049421857-465fa6c8de29?w=800&h=600&fit=crop', // Premium bedroom
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop', // Suite room
    'https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?w=800&h=600&fit=crop', // Deluxe room
];

// Pune hotel data
const hotelRoomsData = [
    {
        roomType: 'Standard Room',
        roomPrice: 2500,
        roomDescription: 'Comfortable single bed room with attached bathroom, AC, TV, and free WiFi. Perfect for solo travelers.',
        location: 'Pune - Koregaon Park'
    },
    {
        roomType: 'Deluxe Room',
        roomPrice: 3500,
        roomDescription: 'Spacious room with queen bed, sitting area, mini fridge, AC, and premium amenities.',
        location: 'Pune - Baner'
    },
    {
        roomType: 'Suite',
        roomPrice: 5000,
        roomDescription: 'Luxury suite with king bed, separate living area, work desk, and modern furnishings.',
        location: 'Pune - Kalyani Nagar'
    },
    {
        roomType: 'Budget Room',
        roomPrice: 1500,
        roomDescription: 'Economy room with basic amenities, perfect for budget-conscious travelers.',
        location: 'Pune - Viman Nagar'
    },
    {
        roomType: 'Family Room',
        roomPrice: 6000,
        roomDescription: '2 bedroom family room with kitchen facilities, ideal for group travels or families.',
        location: 'Pune - Aundh'
    },
    {
        roomType: 'Premium Deluxe',
        roomPrice: 4500,
        roomDescription: 'Premium room with city view, king bed, jacuzzi, and complimentary breakfast.',
        location: 'Pune - Kothrud'
    },
    {
        roomType: 'Standard Room',
        roomPrice: 2800,
        roomDescription: 'Clean and comfortable room with all modern amenities and 24/7 room service.',
        location: 'Pune - Hadapsar'
    },
    {
        roomType: 'Deluxe Room',
        roomPrice: 4000,
        roomDescription: 'Spacious deluxe room with city view and premium furniture.',
        location: 'Pune - Wakad'
    },
    {
        roomType: 'Suite',
        roomPrice: 5500,
        roomDescription: 'Grand suite with state-of-the-art facilities and premium service.',
        location: 'Pune - Deccan'
    },
    {
        roomType: 'Budget Room',
        roomPrice: 1800,
        roomDescription: 'Affordable room with essential amenities and friendly staff service.',
        location: 'Pune - Warje'
    },
    {
        roomType: 'Standard Room',
        roomPrice: 2600,
        roomDescription: 'Welcoming standard room with AC, TV, and ensuite bathroom.',
        location: 'Pune - Katraj'
    },
    {
        roomType: 'Premium Deluxe',
        roomPrice: 4200,
        roomDescription: 'Luxurious room with premium bedding, mini bar, and city view.',
        location: 'Pune - Pune Station Area'
    },
    {
        roomType: 'Family Room',
        roomPrice: 6500,
        roomDescription: 'Spacious family accommodation with multiple beds and shared bathroom.',
        location: 'Pune - Shivaji Nagar'
    },
    {
        roomType: 'Deluxe Room',
        roomPrice: 3800,
        roomDescription: 'Modern deluxe room with contemporary design and comfort.',
        location: 'Pune - Nibm'
    },
    {
        roomType: 'Suite',
        roomPrice: 5200,
        roomDescription: 'Executive suite with separate bedroom and living room.',
        location: 'Pune - Vetal Hill'
    },
    {
        roomType: 'Standard Room',
        roomPrice: 2400,
        roomDescription: 'Simple yet elegant standard room with all basic facilities.',
        location: 'Pune - Ravivar Peth'
    },
    {
        roomType: 'Premium Deluxe',
        roomPrice: 4800,
        roomDescription: 'Finest room with luxury amenities and personalized service.',
        location: 'Pune - Camp'
    },
    {
        roomType: 'Budget Room',
        roomPrice: 1600,
        roomDescription: 'Clean budget option with no compromise on hygiene and safety.',
        location: 'Pune - Jumeirah'
    },
    {
        roomType: 'Family Room',
        roomPrice: 7000,
        roomDescription: 'Large family suite perfect for vacation with kids.',
        location: 'Pune - Bandra'
    },
    {
        roomType: 'Deluxe Room',
        roomPrice: 3900,
        roomDescription: 'Elegant deluxe room with premium finishings and amenities.',
        location: 'Pune - Magarpatta'
    },
    {
        roomType: 'Suite',
        roomPrice: 5800,
        roomDescription: 'Lavish suite with premium service and world-class facilities.',
        location: 'Pune - Market Yard'
    },
    {
        roomType: 'Standard Room',
        roomPrice: 2700,
        roomDescription: 'Comfortable room for short and long stays with excellent service.',
        location: 'Pune - Kondhwa'
    },
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/siddhihotel');
        console.log('✅ Connected to MongoDB');

        // Check if rooms already exist
        const existingRooms = await Room.countDocuments();
        if (existingRooms > 0) {
            console.log(`⚠️  Database already has ${existingRooms} rooms. Clearing old data...`);
            await Room.deleteMany({});
            console.log('🗑️  Cleared old room data');
        }

        // Insert hotel data with random images
        const roomsToInsert = hotelRoomsData.map((room, index) => ({
            ...room,
            roomPhotoUrl: hotelImages[index % hotelImages.length]
        }));

        const insertedRooms = await Room.insertMany(roomsToInsert);
        console.log(`✅ Added ${insertedRooms.length} hotel rooms to database`);

        // Display inserted rooms
        console.log('\n📋 Inserted Rooms:');
        insertedRooms.forEach((room, index) => {
            console.log(`${index + 1}. ${room.roomType} - ₹${room.roomPrice} - ${room.location}`);
        });

        // Create a test admin user
        const existingAdmin = await User.findOne({ email: 'admin@siddhi.com' });
        if (!existingAdmin) {
            const adminUser = new User({
                name: 'Admin User',
                email: 'admin@siddhi.com',
                phoneNumber: '9876543210',
                password: 'admin@123', // This will be hashed by the pre-save hook
                role: 'ADMIN'
            });
            await adminUser.save();
            console.log('\n✅ Created admin user: admin@siddhi.com / admin@123');
        }

        // Create a test regular user
        const existingUser = await User.findOne({ email: 'user@test.com' });
        if (!existingUser) {
            const regularUser = new User({
                name: 'Test User',
                email: 'user@test.com',
                phoneNumber: '9123456789',
                password: 'user@123', // This will be hashed by the pre-save hook
                role: 'USER'
            });
            await regularUser.save();
            console.log('✅ Created test user: user@test.com / user@123');
        }

        console.log('\n🎉 Database seeding completed successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('─────────────────────────────');
        console.log('ADMIN:');
        console.log('  Email: admin@siddhi.com');
        console.log('  Password: admin@123');
        console.log('\nUSER:');
        console.log('  Email: user@test.com');
        console.log('  Password: user@123');
        console.log('─────────────────────────────\n');

        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        process.exit(1);
    }
};

// Run the seed script
seedDatabase();
