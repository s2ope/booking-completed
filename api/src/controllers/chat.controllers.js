const { Anthropic } = require('@anthropic-ai/sdk');
const Booking = require('../models/Booking');
const Conversation = require('../models/Conversation');

const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });
  
  exports.getConversation = async (req, res) => {
    try {
      const { bookingId } = req.params;
      
      let conversation = await Conversation.findOne({ bookingId });
      
      if (!conversation) {
        conversation = await Conversation.create({
          bookingId,
          messages: []
        });
      }
      
      res.status(200).json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
exports.sendMessage = async (req, res) => {
    try {
      const { bookingId, content, userType, messageType = 'regular' } = req.body;
      
      // Find booking
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Find or create conversation
      let conversation = await Conversation.findOne({ bookingId });
      if (!conversation) {
        conversation = await Conversation.create({
          bookingId,
          messages: []
        });
      }
      
      // Add user message
      const userMessage = {
        sender: userType,
        content,
        timestamp: new Date()
      };
      
      conversation.messages.push(userMessage);
      
      // Only generate AI response if messageType is 'ai-assist'
      if (messageType === 'ai-assist') {
        // Prepare conversation history for Claude
        const messageHistory = conversation.messages.map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.content
        }));
        
        // Create system prompt with booking context
        const systemPrompt = `
          You are a helpful assistant for Mamabooking hotel reservation system.
          You're currently speaking with a ${userType} about a booking.
          
          BOOKING DETAILS:
          - Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
          - Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
          - Room type: ${booking.roomType}
          - Status: ${booking.status}
          - Guest name: ${booking.guestName}
          
          As an assistant, you should:
          - Help understand booking status
          - Assist with simple modification requests
          - Be polite and professional at all times
          - Keep responses concise and helpful
        `;
        
        // Call Claude API
        const aiResponse = await anthropic.messages.create({
          model: "claude-3-7-sonnet-20250219",
          system: systemPrompt,
          messages: messageHistory.slice(-10), // Keep last 10 messages for context
          max_tokens: 1000
        });
        
        // Add AI response to conversation
        const aiMessage = {
          sender: 'ai',
          content: aiResponse.content[0].text,
          timestamp: new Date()
        };
        
        conversation.messages.push(aiMessage);
        conversation.lastUpdated = new Date();
        await conversation.save();
        
        res.status(200).json({ 
          userMessage,
          aiMessage
        });
      } else {
        // Human-to-human message, don't generate AI response
        conversation.lastUpdated = new Date();
        await conversation.save();
        
        res.status(200).json({ 
          userMessage
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };