const axios = require('axios');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

// Provide hardcoded response for common queries
const getHardcodedResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hotel') || lowerMessage.includes('room') || lowerMessage.includes('list')) {
        let response = '🏨 **SIDDHI HOTEL - AVAILABLE ROOMS**\n\n';
        response += 'Here are all our available room types:\n\n';
        hotelRooms.forEach(room => {
            response += `💎 **${room.type}** - ₹${room.price}/night\n`;
            response += `   ${room.description}\n\n`;
        });
        response += '📞 Contact us to book or get more information!';
        return response;
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('fare')) {
        let response = '💰 **SIDDHI HOTEL - PRICING**\n\n';
        hotelRooms.forEach(room => {
            response += `${room.type}: ₹${room.price}/night\n`;
        });
        return response;
    }
    
    if (lowerMessage.includes('attraction') || lowerMessage.includes('place') || lowerMessage.includes('visit')) {
        let response = '🎭 **NEARBY ATTRACTIONS IN PUNE**\n\n';
        response += 'Tourist Attractions:\n';
        nearbyPlaces.attractions.slice(0, 4).forEach(place => {
            response += `• ${place}\n`;
        });
        response += '\nDining:\n';
        nearbyPlaces.dining.slice(0, 3).forEach(place => {
            response += `• ${place}\n`;
        });
        response += '\nShopping:\n';
        nearbyPlaces.shopping.slice(0, 2).forEach(place => {
            response += `• ${place}\n`;
        });
        return response;
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('booking') || lowerMessage.includes('reserve')) {
        return '📅 **BOOKING INFORMATION**\n\nTo book a room:\n1. Browse available rooms on our website\n2. Select your desired room type\n3. Enter check-in and check-out dates\n4. Complete the booking with your details\n5. Choose payment method (Cash or Wallet)\n\nNeed help? Contact our team at support@siddhihotel.com';
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('wallet') || lowerMessage.includes('pay')) {
        return '💳 **PAYMENT OPTIONS**\n\n✅ Cash on Check-in\n✅ Wallet Payment (prepay into your account)\n✅ Card Payment (coming soon)\n\nNew users get ₹500 wallet bonus on first login!';
    }
    
    return null; // Will fall back to OpenAI if available
};

const chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user?._id;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                statusCode: 400,
                message: 'Message cannot be empty'
            });
        }

        // Try hardcoded responses first (no API call needed)
        const hardcodedResponse = getHardcodedResponse(message);
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
            return res.status(500).json({
                statusCode: 500,
                message: 'OpenAI API key not configured'
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
6. Wallet and account management
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

Be friendly, professional, and concise. Provide relevant recommendations based on user's pending bookings and location preferences.
Always mention nearby attractions and dining options when relevant.
If user asks about their bookings, reference their pending reservations above.
If user asks about wallet, mention their current balance above.`;

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