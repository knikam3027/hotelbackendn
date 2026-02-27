const mongoose = require('mongoose');
require('dotenv').config();
const Room = require('./models/Room');
const User = require('./models/User');

// Unsplash image URLs for hotels (free images)
const hotelImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611892437281-460bfbe1220a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1618870712282-9b5e89a2b87b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1445991842772-097fea258e7b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564078309867-0105cda4acc5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1579197368826-187a955e5fb7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1630079833852-b71f9e12bb10?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621528273335-e47dc420bfff?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559599810-46d1c2ef092d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542314503-37143f4f6451?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1598928506270-dc92b5ff5e87?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1591825481359-8914282f37f7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596438282884-ae1d4e4a8f1b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1595359707802-91fd358bed7e?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1540541338263-c3a991335ef5?w=800&h=600&fit=crop',
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
