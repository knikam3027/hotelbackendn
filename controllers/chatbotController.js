const axios = require('axios');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const Room = require('../models/Room');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Helper function to create instant booking
const createInstantBooking = async (userId, roomType = 'Standard Room', days = 1) => {
    try {
        // If no userId provided, use first available user (demo mode)
        let bookingUserId = userId;
        if (!bookingUserId) {
            const User = require('../models/User');
            const demoUser = await User.findOne();
            if (!demoUser) {
                return { success: false, message: 'No users found in system. Please create an account first.' };
            }
            bookingUserId = demoUser._id;
        }

        // Find the room by type
        let room = await Room.findOne({ roomType: roomType });
        if (!room) {
            // Fallback to any available room
            room = await Room.findOne();
            if (!room) {
                return { success: false, message: 'No rooms available in the system' };
            }
        }

        // Set dates - today check-in, tomorrow/future check-out
        const checkInDate = new Date();
        checkInDate.setHours(14, 0, 0, 0); // 2 PM check-in
        
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkOutDate.getDate() + days);
        checkOutDate.setHours(11, 0, 0, 0); // 11 AM check-out

        // Create booking
        const booking = new Booking({
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            numOfAdults: 1,
            numOfChildren: 0,
            room: room._id,
            user: bookingUserId
        });

        await booking.save();
        await booking.populate('room');
        await booking.populate('user', 'name email');

        const totalAmount = room.roomPrice * days;

        return {
            success: true,
            booking: booking,
            bookingId: booking.bookingConfirmationCode,
            roomType: room.roomType,
            checkIn: checkInDate.toLocaleDateString('en-IN'),
            checkOut: checkOutDate.toLocaleDateString('en-IN'),
            totalAmount: totalAmount,
            days: days,
            isDemo: !userId
        };
    } catch (error) {
        console.error('Instant booking error:', error);
        return { success: false, message: error.message };
    }
};

// Helper function to cancel booking by confirmation code
const cancelBookingByCode = async (userId, bookingCode) => {
    try {
        const booking = await Booking.findOne({ 
            bookingConfirmationCode: bookingCode,
            user: userId 
        }).populate('room');

        if (!booking) {
            return { success: false, message: 'Booking not found or does not belong to you' };
        }

        const roomType = booking.room.roomType;
        const confirmationCode = booking.bookingConfirmationCode;

        await Booking.findByIdAndDelete(booking._id);

        return {
            success: true,
            message: 'Booking cancelled successfully',
            bookingId: confirmationCode,
            roomType: roomType
        };
    } catch (error) {
        console.error('Cancel booking error:', error);
        return { success: false, message: error.message };
    }
};

// Nearby places in Pune
const nearbyPlaces = {
    attractions: [
        'Shaniwar Wada Fort - 10 min',
        'Raja Dinkar Kelkar Museum - 15 min',
        'Aga Khan Palace - 20 min',
        'Lal Mahal - 8 min',
        'Osho Ashram - 25 min',
        'Saras Baug - 5 min',
        'Garuda Statue - 2 min',
        'Temple of Khandoba - 3 min'
    ],
    dining: [
        'Vohuman Cafe (Parsi) - 5 min',
        'Kayani Bakery - 4 min',
        'Highway Gomantak - 10 min',
        'Hari Om - 7 min',
        'Vaishali (South Indian) - 8 min'
    ],
    shopping: [
        'ABC Farms Market - 2 km',
        'Koregaon Park Market - 1 km',
        'Lavelle Road Shopping Complex - 1.5 km',
        'Phule Market - 3 km'
    ]
};

// Hotel rooms database
const hotelRooms = [
    {
        type: 'Budget Room',
        price: 1500,
        description: 'Economy room with basic amenities, perfect for budget-conscious travelers.'
    },
    {
        type: 'Standard Room',
        price: 2500,
        description: 'Comfortable single bed room with attached bathroom, AC, TV, and free WiFi. Perfect for solo travelers.'
    },
    {
        type: 'Deluxe Room',
        price: 3500,
        description: 'Spacious room with queen bed, sitting area, mini fridge, AC, and premium amenities.'
    },
    {
        type: 'Family Room',
        price: 4500,
        description: 'Spacious room for families with multiple beds and enhanced facilities.'
    },
    {
        type: 'Suite',
        price: 5000,
        description: 'Luxury suite with king bed, separate living area, work desk, and modern furnishings.'
    },
    {
        type: 'Premium Deluxe',
        price: 7000,
        description: 'Ultimate luxury with premium amenities, spa access, and concierge services.'
    }
];

// Provide hardcoded response for common queries (async for wallet balance)
const getHardcodedResponse = async (message, userId = null) => {
    const lowerMessage = message.toLowerCase().trim();
    
    // INSTANT BOOKING - Book room directly
    if ((lowerMessage.includes('book') && (lowerMessage.includes('room') || lowerMessage.includes('hotel') || lowerMessage.includes('today') || lowerMessage.includes('now'))) ||
        lowerMessage.includes('book me') || 
        lowerMessage.includes('make a booking') ||
        lowerMessage.includes('reserve a room') ||
        (lowerMessage.includes('i want to book') || lowerMessage.includes('i want a room'))) {
        
        try {
            // Detect room type preference
            let roomType = 'Standard Room';
            let days = 1;
            
            if (lowerMessage.includes('deluxe')) roomType = 'Deluxe Room';
            else if (lowerMessage.includes('suite')) roomType = 'Suite';
            else if (lowerMessage.includes('premium')) roomType = 'Premium Deluxe';
            else if (lowerMessage.includes('family')) roomType = 'Family Room';
            else if (lowerMessage.includes('budget')) roomType = 'Budget Room';
            
            // Detect duration
            if (lowerMessage.includes('2 day') || lowerMessage.includes('two day')) days = 2;
            else if (lowerMessage.includes('3 day') || lowerMessage.includes('three day')) days = 3;
            else if (lowerMessage.includes('week')) days = 7;

            const result = await createInstantBooking(userId, roomType, days);
            
            if (result.success) {
                const currentTime = new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true 
                });
                
                let responseText = `✅ **BOOKING CONFIRMED!**\n\n${currentTime}\n\n🎉 Your room has been booked successfully!\n\n📋 **Booking Details:**\n━━━━━━━━━━━━━━━━━━━━━━━\n🆔 Booking ID: **${result.bookingId}**\n🏨 Room: ${result.roomType}\n📅 Check-in: ${result.checkIn}\n📅 Check-out: ${result.checkOut}\n👥 Guests: 1 Adult\n📆 Duration: ${result.days} day${result.days > 1 ? 's' : ''}\n💰 Total: ₹${result.totalAmount.toLocaleString('en-IN')}\n💳 Payment: Cash (Pay at hotel)\n\n✨ Your confirmation code has been sent to your email!`;
                
                if (result.isDemo) {
                    responseText += `\n\n⚠️ *Demo Mode: Login recommended for full features*`;
                }
                
                responseText += `\n\n💡 Need to cancel? Just say "cancel booking ${result.bookingId}"`;
                
                return responseText;
            } else {
                return `❌ **Booking Failed**\n\nSorry, I couldn\'t complete your booking: ${result.message}\n\nPlease try again or contact support.`;
            }
        } catch (error) {
            console.error('Booking error:', error);
            return '❌ **Error**\n\nSorry, something went wrong while booking. Please try again or use the Rooms page to book manually.';
        }
    }

    // CANCEL BOOKING - Cancel directly
    if (lowerMessage.includes('cancel') && (lowerMessage.includes('booking') || lowerMessage.includes('reservation'))) {
        try {
            // Try to extract booking code from message
            const codeMatch = lowerMessage.match(/[A-Z0-9]{10}/i);
            
            if (codeMatch) {
                const bookingCode = codeMatch[0].toUpperCase();
                
                // If no userId, try to find booking by code only (demo mode)
                if (!userId) {
                    const booking = await Booking.findOne({ 
                        bookingConfirmationCode: bookingCode 
                    }).populate('room');
                    
                    if (!booking) {
                        return `❌ **Booking Not Found**\n\nNo booking found with ID: ${bookingCode}\n\n💡 Please check the booking ID and try again.`;
                    }
                    
                    const roomType = booking.room.roomType;
                    await Booking.findByIdAndDelete(booking._id);
                    
                    const currentTime = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    });
                    
                    return `✅ **BOOKING CANCELLED**\n\n${currentTime}\n\n🗑️ Your booking has been cancelled successfully!\n\n📋 **Cancelled Booking:**\n━━━━━━━━━━━━━━━━━━━━━━━\n🆔 Booking ID: ${bookingCode}\n🏨 Room: ${roomType}\n\n💰 Any payments will be refunded to your wallet within 3-5 business days.\n\n💡 Want to book again? Just say "book me a room"!`;
                }
                
                // User is logged in - verify ownership
                const result = await cancelBookingByCode(userId, bookingCode);
                
                if (result.success) {
                    const currentTime = new Date().toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    });
                    
                    return `✅ **BOOKING CANCELLED**\n\n${currentTime}\n\n🗑️ Your booking has been cancelled successfully!\n\n📋 **Cancelled Booking:**\n━━━━━━━━━━━━━━━━━━━━━━━\n🆔 Booking ID: ${result.bookingId}\n🏨 Room: ${result.roomType}\n\n💰 Any payments will be refunded to your wallet within 3-5 business days.\n\n💡 Want to book again? Just say "book me a room"!`;
                } else {
                    return `❌ **Cancellation Failed**\n\n${result.message}\n\n💡 Make sure you have the correct booking ID.`;
                }
            } else {
                // No booking code found
                if (!userId) {
                    return '📋 **Booking ID Required**\n\nTo cancel a booking, please provide the booking ID.\n\n💡 Example: "cancel booking ABC123XYZ0"';
                }
                
                // Show user's recent bookings
                const recentBookings = await Booking.find({ user: userId })
                    .populate('room')
                    .sort({ createdAt: -1 })
                    .limit(3);
                
                if (recentBookings.length === 0) {
                    return '📋 **No Bookings Found**\n\nYou don\'t have any bookings to cancel.\n\n💡 Want to make a new booking? Just say "book me a room"!';
                }
                
                let response = '📋 **Your Recent Bookings**\n\nWhich booking would you like to cancel?\n\n';
                recentBookings.forEach((booking, index) => {
                    response += `${index + 1}. **${booking.bookingConfirmationCode}**\n`;
                    response += `   🏨 ${booking.room.roomType}\n`;
                    response += `   📅 Check-in: ${new Date(booking.checkInDate).toLocaleDateString('en-IN')}\n\n`;
                });
                response += '💡 To cancel, say: "cancel booking [ID]"\nExample: "cancel booking ABC123XYZ"';
                
                return response;
            }
        } catch (error) {
            console.error('Cancellation error:', error);
            return '❌ **Error**\n\nSorry, something went wrong. Please try again or contact support.';
        }
    }
    
    // Wallet Balance Check
    if (lowerMessage.includes('balance') || lowerMessage.includes('my wallet') || (lowerMessage.includes('check') && lowerMessage.includes('wallet')) || lowerMessage.includes('how much money')) {
        if (!userId) {
            return '💰 **Wallet Balance**\n\nPlease log in to check your wallet balance. Once logged in, I can show you:\n• Current balance\n• Transaction history\n• Add money options\n\n🔐 Login to access your wallet!';
        }
        
        try {
            const wallet = await Wallet.findOne({ user: userId });
            const balance = wallet ? wallet.balance : 0;
            const currentTime = new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            
            return `💰 **Wallet Balance**\n\n${currentTime}\n\nYour current wallet balance is ₹${balance.toLocaleString('en-IN')}. How can I assist you further today?\n\n💡 You can:\n• Add money to your wallet\n• Use it for bookings\n• Check transaction history\n\nNeed help with anything else?`;
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
            return '💰 **Wallet Balance**\n\nSorry, I couldn\'t fetch your wallet balance at the moment. Please try again or visit your Profile > Wallet section.';
        }
    }
    
    // Greetings
    if (/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|howdy|greetings|yo|sup)\b/.test(lowerMessage)) {
        return '👋 **Hello! Welcome to Siddhi Hotel!**\n\nI\'m your hotel assistant with instant booking powers! 🚀\n\n🎯 **What I Can Do:**\n\n🏨 **Instant Booking** - Just say "book me a room"\n💰 Check Wallet Balance\n📅 Cancel Bookings Instantly\n🎭 Pune Attractions & Travel Tips\n✨ Hotel Information & Amenities\n📋 Policies & Support\n\n💡 **Try Now:**\n• "Book me a room today"\n• "Check my balance"\n• "Show me rooms"\n\nWhat would you like to do?';
    }

    // Thank you
    if (/^(thank|thanks|thx|ty|appreciate)/.test(lowerMessage)) {
        return '😊 You\'re welcome! Is there anything else I can help you with? Feel free to ask about rooms, bookings, attractions, or anything else!';
    }

    // Goodbye
    if (/^(bye|goodbye|see you|take care|good night)/.test(lowerMessage)) {
        return '👋 Thank you for chatting with us! Have a wonderful day. We look forward to hosting you at Siddhi Hotel! 🏨';
    }

    // Hotel and Room Information
    if (lowerMessage.includes('hotel') || lowerMessage.includes('room') || lowerMessage.includes('list') || lowerMessage.includes('available')) {
        let response = '🏨 **SIDDHI HOTEL - AVAILABLE ROOMS**\n\n';
        response += 'Here are all our available room types:\n\n';
        hotelRooms.forEach(room => {
            response += `💎 **${room.type}** - ₹${room.price}/night\n`;
            response += `   ${room.description}\n\n`;
        });
        response += '📞 Contact us to book or visit our Rooms page!';
        return response;
    }
    
    // Booking Process
    if (lowerMessage.includes('book') || lowerMessage.includes('booking') || lowerMessage.includes('reserve') || lowerMessage.includes('how to book')) {
        return '📅 **BOOKING OPTIONS**\n\n🚀 **INSTANT BOOKING** (New!):\nJust say "book me a room" and I\'ll instantly book for you!\n✨ Get booking ID immediately\n✨ No forms to fill\n✨ Cash payment at hotel\n\nExamples:\n• "Book me a room today"\n• "Book a deluxe room for 2 days"\n• "I want to book a suite"\n• "Reserve a room now"\n\n📝 **Manual Booking**:\n1️⃣ Visit our Rooms section\n2️⃣ Select your dates\n3️⃣ Choose room type\n4️⃣ Enter details\n5️⃣ Confirm booking\n\n🗑️ **Cancel Anytime**:\nSay "cancel booking [ID]" to cancel instantly!\n\n💡 Try: "book me a room" right now!';
    }
    
    // Payment and Wallet
    if (lowerMessage.includes('payment') || lowerMessage.includes('wallet') || lowerMessage.includes('pay') || lowerMessage.includes('money')) {
        return '💳 **PAYMENT OPTIONS & WALLET**\n\n✅ **Cash Payment**: Pay at check-in\n✅ **Wallet Payment**: Prepay to your account wallet\n✅ **Card Payment**: Coming Soon!\n\n🎁 **Wallet Features**:\n• Add money anytime\n• Track spending\n• Get refunds instantly\n• No expiry date\n• Use for future bookings\n• Check balance anytime\n\n💰 **Special Offer**: New users get ₹500 bonus on first login!\n\n📝 **How to Use Wallet**:\n1. Go to your Wallet in Profile\n2. Click "Add Money"\n3. Enter amount\n4. Choose payment method\n5. Done! Use it for bookings\n\n💡 **Quick Tip**: Ask me "check my balance" to see your current wallet balance!';
    }
    
    // City Information and Attractions
    if (lowerMessage.includes('attraction') || lowerMessage.includes('place') || lowerMessage.includes('visit') || lowerMessage.includes('pune') || lowerMessage.includes('thing to do') || lowerMessage.includes('travels') || lowerMessage.includes('tourist')) {
        let response = '🎭 **PUNE - CITY GUIDE & ATTRACTIONS**\n\n';
        response += '📍 **TOP TOURIST ATTRACTIONS**:\n';
        nearbyPlaces.attractions.forEach(place => {
            response += `• ${place}\n`;
        });
        response += '\n🍽️ **DINING RECOMMENDATIONS**:\n';
        nearbyPlaces.dining.forEach(place => {
            response += `• ${place}\n`;
        });
        response += '\n🛍️ **SHOPPING DESTINATIONS**:\n';
        nearbyPlaces.shopping.forEach(place => {
            response += `• ${place}\n`;
        });
        response += '\n💡 **Pro Tips**:\n• Best time to visit: Oct-Feb\n• Local transport: Autos and cabs available 24/7\n• Must try: Vada Pav, Churumuri\n• Language: Marathi & English widely spoken\n\n👤 Need personalized recommendations? Just ask!';
        return response;
    }
    
    // Price Information
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fare') || lowerMessage.includes('how much') || lowerMessage.includes('₹')) {
        let response = '💰 **SIDDHI HOTEL - PRICING**\n\n';
        hotelRooms.forEach(room => {
            response += `${room.type}: ₹${room.price}/night\n`;
        });
        response += '\n✨ **Additional Details**:\n• No hidden charges\n• Taxes included in displayed price\n• Free WiFi in all rooms\n• Complimentary breakfast (Deluxe & above)\n• Group discounts available\n\n📞 Contact for special rates & packages!';
        return response;
    }
    
    // Amenities and Facilities
    if (lowerMessage.includes('ameniti') || lowerMessage.includes('facilit') || lowerMessage.includes('what do you have') || lowerMessage.includes('feature')) {
        return '✨ **SIDDHI HOTEL - AMENITIES & FACILITIES**\n\n🌟 **IN ROOM**:\n✓ Air Conditioning\n✓ Free WiFi\n✓ HD Television\n✓ Attached Bathroom\n✓ Hot Water (24/7)\n✓ Work Desk\n\n🏨 **HOTEL FACILITIES**:\n✓ 24-Hour Front Desk\n✓ Room Service\n✓ Housekeeping\n✓ Luggage Storage\n✓ Daily Cleaning\n✓ Parking Available\n\n💎 **PREMIUM FEATURES** (Deluxe & Above):\n✓ Mini Fridge\n✓ Room Heater\n✓ Premium Toiletries\n✓ Complimentary Breakfast\n✓ Concierge Service\n✓ Spa Access\n\n🎯 Choose the room that fits you best!';
    }
    
    // Cancellation and Policies
    if (lowerMessage.includes('cancel') || lowerMessage.includes('refund') || lowerMessage.includes('policy') || lowerMessage.includes('terms')) {
        return '📋 **BOOKING POLICIES**\n\n📅 **CANCELLATION**:\n• Free cancellation up to 24 hours before check-in\n• 50% refund if cancelled 24 hours before check-in\n• Full charge if cancelled within 24 hours\n\n🧾 **MODIFICATION**:\n• Change dates for free (subject to availability)\n• Upgrade/Downgrade room type\n\n📝 **CHECK-IN/OUT**:\n• Check-in: 2:00 PM\n• Check-out: 11:00 AM\n• Early check-in/Late check-out: Available (charges apply)\n\n💳 **REFUNDS**:\n• Processed to original payment method\n• Takes 3-5 business days\n• Wallet refunds instant\n\n📞 Questions? Contact support@siddhihotel.com';
    }
    
    // Facilities and Help
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('need assist') || lowerMessage.includes('question')) {
        return '🆘 **NEED HELP?**\n\nI can assist you with:\n\n✅ Instant Room Booking (New!)\n✅ Cancel Bookings Instantly\n✅ Check Wallet Balance\n✅ Room Information & Availability\n✅ Pune Tourist Information\n✅ Hotel Amenities & Facilities\n✅ Policies & Support\n\n🚀 **Instant Commands**:\n• "Book me a room" - Instant booking!\n• "Book a deluxe room for 2 days"\n• "Check my balance" - See wallet\n• "Cancel booking [ID]" - Cancel instantly\n\n📝 **Information Queries**:\n• "Show me available rooms"\n• "What\'s the price?"\n• "Tell me about Pune attractions"\n• "Payment options?"\n• "Cancellation policy?"\n\n📞 **Direct Contact**:\n• Email: support@siddhihotel.com\n• Phone: +91-XXXX-XXXX\n• Available: 24/7\n\n💬 Try instant booking: "book me a room today"';
    }
    
    // Special Offers and Promotions
    if (lowerMessage.includes('offer') || lowerMessage.includes('discount') || lowerMessage.includes('promo') || lowerMessage.includes('deal')) {
        return '🎉 **SPECIAL OFFERS & PROMOTIONS**\n\n🎁 **NEW USER BONUS**:\n₹500 Wallet Credit on first login!\n\n📅 **SEASONAL OFFERS**:\n• December-January: 20% off\n• Summer Special: Free breakfast upgrade\n• Monsoon Retreat: Spend ₹10K, get 15% cashback\n\n👥 **GROUP BOOKINGS**:\n• 5+ rooms: 10% discount\n• 10+ rooms: 15% discount\n• Contact us for custom packages\n\n💑 **COUPLES SPECIAL**:\n• Romance packages available\n• Complimentary dinner coupon\n\n🏢 **CORPORATE RATES**:\n• Monthly bookings\n• Per Diem available\n• Flexible check-in/out\n\n✨ Check back regularly for new offers!\n📞 Contact: support@siddhihotel.com';
    }
    
    // Default response for unmatched queries
    return null; // Will fall back to OpenAI if available, or generic fallback
};

// Generic fallback for when no hardcoded match and no API key
const getGenericFallback = (message) => {
    return '🏨 **Siddhi Hotel Assistant**\n\nI\'d love to help you! Try these commands:\n\n🚀 **Instant Actions:**\n• "Book me a room" - Instant booking!\n• "Check my balance" - See wallet\n• "Cancel booking [ID]" - Cancel instantly\n\n📝 **Information:**\n• "Show me available rooms"\n• "What\'s the price?"\n• "Pune attractions"\n• "Payment options"\n• "Help" - See all commands\n\n💡 Most popular: "book me a room today" 😊';
};

const chatWithBot = async (req, res) => {
    const userId = req.user?._id;
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                statusCode: 400,
                message: 'Message cannot be empty'
            });
        }

        // Try hardcoded responses first (no API call needed)
        const hardcodedResponse = await getHardcodedResponse(message, userId);
        if (hardcodedResponse) {
            return res.status(200).json({
                statusCode: 200,
                message: 'Response generated successfully',
                botReply: hardcodedResponse,
                userMessage: message,
                hasUserContext: !!userId,
                source: 'hardcoded'
            });
        }

        // If no hardcoded response, try OpenAI API
        if (!OPENAI_API_KEY) {
            // No API key - return generic helpful response instead of error
            return res.status(200).json({
                statusCode: 200,
                message: 'Response generated (fallback)',
                botReply: getGenericFallback(message),
                userMessage: message,
                hasUserContext: !!userId,
                source: 'fallback'
            });
        }

        // Fetch user-specific data if logged in
        let userContext = '';
        if (userId) {
            try {
                // Get user's pending bookings
                const bookings = await Booking.find({ user: userId }).populate('room');
                const pendingBookings = bookings.filter(b => {
                    const checkInDate = new Date(b.checkInDate);
                    return checkInDate > new Date();
                });

                // Get wallet balance
                const wallet = await Wallet.findOne({ user: userId });
                const walletBalance = wallet ? wallet.balance : 0;

                userContext = `
User Account Information:
- Pending Bookings: ${pendingBookings.length}
${pendingBookings.map(b => `  * ${b.room?.roomType} - Check-in: ${new Date(b.checkInDate).toDateString()}, Confirmation: ${b.bookingConfirmationCode}`).join('\n')}
- Wallet Balance: ₹${walletBalance}
- Total Bookings: ${bookings.length}

Nearby Attractions in Pune (within walking distance):
${nearbyPlaces.attractions.join('\n')}

Dining Options:
${nearbyPlaces.dining.join('\n')}

Shopping Areas:
${nearbyPlaces.shopping.join('\n')}`;
            } catch (error) {
                console.log('Error fetching user context:', error);
            }
        }

        const systemMessage = `You are a helpful hotel booking assistant for Siddhi Hotel, a luxury hotel in Pune, India.
You help customers with:
1. Hotel recommendations based on their preferences
2. Room availability and pricing information
3. Booking guidance and process
4. Information about nearby attractions in Pune
5. Travel tips for Pune
6. Wallet and account management (including balance checks)
7. Pending bookings and reservations

Current User Data:
${userContext}

Room Types Available:
- Standard Room: ₹1,500/night
- Budget Room: ₹2,000/night
- Deluxe Room: ₹3,500/night
- Family Room: ₹4,500/night
- Suite: ₹5,500/night
- Premium Deluxe: ₹7,000/night

Payment Options:
- Cash on Check-in
- Wallet Payment (if balance available)

IMPORTANT: When user asks about their wallet balance, always respond in this format:
"Your current wallet balance is ₹[amount]. How can I assist you further today?"

Be friendly, professional, and concise. Provide relevant recommendations based on user's pending bookings and location preferences.
Always mention nearby attractions and dining options when relevant.
If user asks about their bookings, reference their pending reservations above.
If user asks about wallet or balance, mention their current balance above.`;

        const response = await axios.post(
            OPENAI_API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: message }
                ],
                temperature: 0.7,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const botReply = response.data.choices[0].message.content;

        res.status(200).json({
            statusCode: 200,
            message: 'Response generated successfully',
            botReply: botReply,
            userMessage: message,
            hasUserContext: !!userId,
            source: 'openai'
        });

    } catch (error) {
        console.error('Chatbot error:', error.response?.data || error.message);
        
        let errorMessage = 'Failed to get response from chatbot';
        if (error.response?.data?.error?.message) {
            errorMessage = error.response.data.error.message;
        }

        // Fallback: Provide generic response
        const fallbackResponse = '🏨 I apologize for the technical difficulty. However, I can tell you that Siddhi Hotel offers 6 room types ranging from ₹1,500 to ₹7,000 per night. Please try asking about specific rooms or visit our website to browse available options. Our team is here to help!';

        res.status(200).json({
            statusCode: 200,
            message: 'Response generated (fallback)',
            botReply: fallbackResponse,
            userMessage: req.body.message,
            hasUserContext: !!userId,
            source: 'fallback'
        });
    }
};

module.exports = {    chatWithBot
};