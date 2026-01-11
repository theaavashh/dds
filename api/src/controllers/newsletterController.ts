import { Request, Response } from 'express';
import prisma from '../config/database';
import { body, validationResult } from 'express-validator';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const newsletterValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

export const subscribe = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if already subscribed
    // @ts-ignore
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      if (!existingSubscription.isActive) {
        // Reactivate if previously inactive
        // @ts-ignore
        const updated = await prisma.newsletterSubscription.update({
          where: { id: existingSubscription.id },
          data: { isActive: true },
        });
        return res.status(200).json({ message: 'Subscription reactivated successfully', subscription: updated });
      }
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    // @ts-ignore
    const subscription = await prisma.newsletterSubscription.create({
      data: { email },
    });

    res.status(201).json({ message: 'Subscribed successfully', subscription });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listSubscriptions = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const where = search
      ? { 
          email: { 
            contains: search, 
            mode: 'insensitive' as const
          } 
        }
      : {};

    // @ts-ignore
    const [items, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscription.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + items.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const exportSubscriptions = async (req: Request, res: Response) => {
  try {
    const format = ((req.query.format as string) || 'csv').toLowerCase();
    // @ts-ignore
    const items = await prisma.newsletterSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      const header = 'Email,Active,Created At\n';
      const rows = items
        .map(i => `${i.email},${i.isActive ? 'Yes' : 'No'},${i.createdAt.toISOString()}`)
        .join('\n');
      const csv = header + rows + '\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscriptions.csv"');
      return res.status(200).send(csv);
    }

    if (format === 'xlsx' || format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Subscriptions');
      sheet.columns = [
        { header: 'Email', key: 'email', width: 40 },
        { header: 'Active', key: 'active', width: 10 },
        { header: 'Created At', key: 'createdAt', width: 24 },
      ];
      items.forEach(i => {
        sheet.addRow({ email: i.email, active: i.isActive ? 'Yes' : 'No', createdAt: i.createdAt.toISOString() });
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscriptions.xlsx"');
      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="newsletter-subscriptions.pdf"');
      doc.pipe(res);
      doc.fontSize(18).text('Newsletter Subscriptions', { align: 'center' });
      doc.moveDown();
      items.forEach(i => {
        doc.fontSize(12).text(`${i.email}  |  ${i.isActive ? 'Active' : 'Inactive'}  |  ${i.createdAt.toISOString()}`);
      });
      doc.end();
      return;
    }

    return res.status(400).json({ success: false, message: 'Unsupported format' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteSubscription = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Subscription id is required' });
    }
    // @ts-ignore
    const existing = await prisma.newsletterSubscription.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    // @ts-ignore
    await prisma.newsletterSubscription.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Subscription deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
