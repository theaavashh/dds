import prisma from '../config/database';
import { Request, Response } from 'express';

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
