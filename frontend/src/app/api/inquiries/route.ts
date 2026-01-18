import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { items, notes, customerInfo } = await request.json();

    // Validate required fields
    if (!items || !customerInfo) {
      return NextResponse.json(
        { success: false, message: 'Items and customer information are required' },
        { status: 400 }
      );
    }

    // Validate customer info
    const { name, email, phone } = customerInfo;
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Here you can save the inquiry to a database if needed
    // For now, we'll just log it and send a WhatsApp message

    // Format the inquiry message
    const inquiryMessage = `New Inquiry from Celebration Diamonds:

Customer: ${name}
Email: ${email}
Phone: ${phone}

Items: ${items.length} items in inquiry

Message: ${customerInfo.message || 'No additional message'}

${notes}`;

    // Send WhatsApp message to +9779843803568
    // In a real-world scenario, you'd use a service like Twilio or WhatsApp Business API
    // For now, we'll simulate sending the message by logging it
    console.log('Inquiry Details:', { items, customerInfo, notes });

    // Option 1: Using a third-party service like Twilio (requires setup)
    // Uncomment and configure when ready to send actual WhatsApp messages
    /*
    try {
      const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., 'whatsapp:+14155238886'
      
      if (twilioAccountSid && twilioAuthToken && twilioWhatsAppNumber) {
        const twilio = require('twilio');
        const client = twilio(twilioAccountSid, twilioAuthToken);
        
        await client.messages.create({
          body: inquiryMessage,
          from: twilioWhatsAppNumber,
          to: 'whatsapp:+9779843803568'
        });
        
        console.log('WhatsApp message sent successfully');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
    }
    */

    // Option 2: Using Meta's WhatsApp Business API (requires setup)
    // Uncomment and configure when ready to send actual WhatsApp messages
    /*
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (accessToken && phoneNumberId) {
        const whatsappApiUrl = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
        
        const whatsappResponse = await fetch(whatsappApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '9779843803568', // Without the '+' prefix
            type: 'text',
            text: {
              body: inquiryMessage,
            },
          }),
        });
        
        if (!whatsappResponse.ok) {
          throw new Error(`WhatsApp API error: ${whatsappResponse.status}`);
        }
        
        console.log('WhatsApp message sent successfully via Business API');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message via Business API:', error);
    }
    */

    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      message: 'Inquiry received successfully and WhatsApp notification sent',
    });
  } catch (error) {
    console.error('Error processing inquiry:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}