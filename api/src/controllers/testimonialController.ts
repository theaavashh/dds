import { Request, Response } from 'express';
import prisma from '../config/database';

export const listTestimonials = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;
    const search = (req.query.search as string) || '';

    const where = search
      ? { OR: [{ clientName: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] }
      : {};
    const items = await (prisma as any).testimonial.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit });
    const total = await (prisma as any).testimonial.count({ where });

    res.status(200).json({
      success: true,
      data: items.map((t: any) => ({
        id: t.id,
        customerName: t.clientName,
        description: t.content,
        imageUrl: t.imageUrl,
        isActive: t.isActive,
        createdAt: t.createdAt,
      })),
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

export const listTestimonialsPublic = async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query.limit as string) || '12');
    const items = await (prisma as any).testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: limit,
      select: {
        id: true,
        clientName: true,
        clientTitle: true,
        company: true,
        content: true,
        rating: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
      }
    });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const createTestimonial = async (req: Request, res: Response) => {
  try {
    const { description, customerName, clientTitle, company, rating } = req.body as { description?: string; customerName?: string; clientTitle?: string; company?: string; rating?: string | number };
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = `/uploads/testimonials/${req.file.filename}`;
    }
    const created = await (prisma as any).testimonial.create({
      data: {
        clientName: customerName,
        clientTitle: clientTitle ?? null,
        company: company ?? null,
        content: description,
        rating: typeof rating !== 'undefined' ? Number(rating) : null,
        imageUrl,
        isActive: true,
        sortOrder: 0,
      },
    });
    const item = {
      id: created.id,
      customerName: created.clientName,
      description: created.content,
      imageUrl: created.imageUrl,
      isActive: created.isActive,
      createdAt: created.createdAt,
    };
    res.status(201).json({ success: true, data: item, message: 'Testimonial created' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const existing = await (prisma as any).testimonial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });
    await (prisma as any).testimonial.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateTestimonial = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { description, customerName, clientTitle, company, rating } = req.body as { description?: string; customerName?: string; clientTitle?: string; company?: string; rating?: number };
    const existing = await (prisma as any).testimonial.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Not found' });

    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = `/uploads/testimonials/${req.file.filename}`;
    }

    const data: any = {};
    if (typeof customerName !== 'undefined') data.clientName = customerName;
    if (typeof description !== 'undefined') data.content = description;
    if (typeof clientTitle !== 'undefined') data.clientTitle = clientTitle;
    if (typeof company !== 'undefined') data.company = company;
    if (typeof rating !== 'undefined') {
      const ratingStr = String(rating);
      if (ratingStr === '') {
        data.rating = null;
      } else {
        data.rating = parseInt(ratingStr);
      }
    }
    if (typeof imageUrl !== 'undefined') data.imageUrl = imageUrl;

    const updated = await (prisma as any).testimonial.update({ where: { id }, data });
    const item = {
      id: updated.id,
      customerName: updated.clientName,
      description: updated.content,
      imageUrl: updated.imageUrl,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    };
    res.status(200).json({ success: true, data: item, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
