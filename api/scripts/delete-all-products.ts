import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAllProducts() {
    try {
        console.log('Starting deletion of all products...');

        // Delete related records first if not cascaded, or rely on cascade where defined
        // ProductImage and Review have onDelete: Cascade in the actual schema

        // SavedProduct does NOT have cascade, so we should delete those first
        const savedProductsCount = await prisma.savedProduct.deleteMany({});
        console.log(`✓ Deleted ${savedProductsCount.count} saved product references`);

        // Inquiries might refer to product codes or IDs, but InquiryItem doesn't have a hard relation in schema
        // However, if it did, we'd handle it here.

        const productsCount = await prisma.product.deleteMany({});
        console.log(`✓ Successfully deleted ${productsCount.count} products!`);

        console.log('\nDatabase is now cleared of all product data.');

    } catch (error) {
        console.error('Error deleting products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllProducts();
