import prisma from '../config/database';
import { Request, Response } from 'express';
import axios from 'axios';

// Create a customer inquiry (public)
export const createCustomerInquiry = async (req: Request, res: Response) => {
    try {
        const { items, notes, customerInfo } = req.body;

        // Validate required fields
        if (!items || !customerInfo) {
            return res.status(400).json({
                success: false,
                message: 'Items and customer information are required'
            });
        }

        // Validate customer info
        const { name, email, phone } = customerInfo;
        if (!name || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and phone are required'
            });
        }

        // Format the inquiry message for WhatsApp
        const inquiryMessage = `New Inquiry from Celebration Diamonds:

Customer: ${name}
Email: ${email}
Phone: ${phone}

Items: ${items.length} items in inquiry

Message: ${customerInfo.message || 'No additional message'}

${notes}`;

        // Send WhatsApp message to +9779843803568
        try {
            // Check if WhatsApp business API credentials are available
            const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
            const whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
            
            if (whatsappAccessToken && whatsappPhoneNumberId) {
                // Send via WhatsApp Business API
                const whatsappResponse = await axios.post(
                    `https://graph.facebook.com/v18.0/${whatsappPhoneNumberId}/messages`,
                    {
                        messaging_product: 'whatsapp',
                        to: phone.replace('+', ''), // Remove + prefix for API
                        type: 'text',
                        text: {
                            body: inquiryMessage,
                        },
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${whatsappAccessToken}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                
                console.log('WhatsApp message sent successfully:', whatsappResponse.data);
            } else {
                // Log the inquiry for manual processing if WhatsApp API is not configured
                console.log('WhatsApp API not configured. Inquiry details:', { items, customerInfo, notes });
                console.log('Formatted message:', inquiryMessage);
            }
        } catch (whatsappError) {
            console.error('Error sending WhatsApp message:', whatsappError);
            // Continue processing even if WhatsApp fails
        }

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully and notification sent',
            data: null // Don't return sensitive customer data
        });
    } catch (error) {
        console.error('Error creating customer inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting inquiry'
        });
    }
};

// Create a new inquiry
export const createInquiry = async (req: any, res: Response) => {
    try {
        const distributorId = req.distributor.id;
        const { items, notes } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Inquiry must contain at least one item'
            });
        }

        // Generate inquiry number (e.g., INQ-1703456789)
        const inquiryNumber = `INQ-${Date.now().toString().slice(-10)}`;

        const totalItems = items.reduce((total: number, item: any) => total + (item.quantity || 1), 0);

        // Create inquiry and items in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const inquiry = await tx.inquiry.create({
                data: {
                    inquiryNumber,
                    distributorId,
                    totalItems,
                    notes,
                    status: 'pending',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.id,
                            productCode: item.productCode,
                            name: item.name,
                            category: item.category,
                            quantity: item.quantity || 1,
                            goldWeight: item.goldWeight,
                            goldPurity: item.goldPurity,
                            price: item.price
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            return inquiry;
        });

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully',
            data: result
        });
    } catch (error) {
        console.error('Error creating inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting inquiry'
        });
    }
};

// Get all inquiries (Admin view)
export const getAllInquiries = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status as string;

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const totalCount = await prisma.inquiry.count({ where });

        const inquiries = await prisma.inquiry.findMany({
            where,
            include: {
                distributor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        email: true
                    }
                },
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: inquiries,
            count: totalCount,
            page,
            limit,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiries'
        });
    }
};

// Get inquiry by ID
export const getInquiryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const inquiry = await prisma.inquiry.findUnique({
            where: { id },
            include: {
                distributor: {
                    select: {
                        firstName: true,
                        lastName: true,
                        companyName: true,
                        email: true,
                        phone: true
                    }
                },
                items: true
            }
        });

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        res.json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error('Error fetching inquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inquiry'
        });
    }
};

// Update inquiry status
export const updateInquiryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'contacted', 'closed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: { status },
            include: {
                items: true
            }
        });

        res.json({
            success: true,
            message: `Inquiry status updated to ${status}`,
            data: inquiry
        });
    } catch (error) {
        console.error('Error updating inquiry status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating inquiry status'
        });
    }
};

// Get customer inquiries
export const getCustomerInquiries = async (req: any, res: Response) => {
    try {
        const distributorId = req.distributor.id;

        const inquiries = await prisma.inquiry.findMany({
            where: { distributorId },
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error('Error fetching customer inquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching customer inquiries'
        });
    }
};
