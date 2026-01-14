import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Function to generate a unique product code
async function generateProductCode(category: string): Promise<string> {
  const categoryInitial = category.charAt(0).toUpperCase();
  const prefix = `CD-${categoryInitial}-`;
  const count = await prisma.product.count({
    where: {
      productCode: {
        startsWith: prefix
      }
    }
  });

  // Pad with zeros to make it 3 digits
  const paddedNumber = (count + 1).toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
}

// Function to capitalize first letter of each word
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// Function to extract category from folder name
function extractCategory(folderName: string): string {
  // Convert folder name to TitleCase and remove all spaces/special characters
  // e.g., "ladies rings" or "ladies-ring" -> "LadiesRing"
  const cleanName = folderName
    .replace(/[-_]/g, ' ')
    .trim();

  const titleCased = toTitleCase(cleanName);
  return titleCased.replace(/\s+/g, '');
}

// Function to extract subcategory from folder name
function extractSubcategory(folderName: string): string {
  return toTitleCase(folderName.replace(/[-_]/g, ' '));
}

async function autoGenerateProducts() {
  try {
    console.log('Starting automatic product generation...');

    const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');

    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.error('Uploads directory does not exist:', uploadsDir);
      return;
    }

    // Read all category folders
    const categoryFolders = fs.readdirSync(uploadsDir).filter(file =>
      fs.statSync(path.join(uploadsDir, file)).isDirectory()
    );

    console.log(`Found ${categoryFolders.length} category folders`);

    let totalProductsCreated = 0;

    // Process each category folder
    for (const folder of categoryFolders) {
      const folderPath = path.join(uploadsDir, folder);
      const imageFiles = fs.readdirSync(folderPath).filter(file =>
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      );

      console.log(`Processing ${folder} with ${imageFiles.length} images`);

      if (imageFiles.length === 0) {
        console.log(`No images found in ${folder}, skipping...`);
        continue;
      }

      const category = extractCategory(folder);
      const subcategory = extractSubcategory(folder);

      // Process images in batches to avoid memory issues
      const batchSize = 50;
      for (let i = 0; i < imageFiles.length; i += batchSize) {
        const batch = imageFiles.slice(i, i + batchSize);

        for (const imageFile of batch) {
          try {
            // Extract product name from filename
            const fileNameWithoutExt = path.parse(imageFile).name;
            const productName = toTitleCase(fileNameWithoutExt.replace(/[-_]/g, ' '));

            // Generate product code
            const productCode = await generateProductCode(category);

            // Check if product already exists
            const existingProduct = await prisma.product.findUnique({
              where: { productCode }
            });

            if (existingProduct) {
              console.log(`Product ${productCode} already exists, skipping...`);
              continue;
            }

            // Create product
            const product = await prisma.product.create({
              data: {
                productCode,
                name: `${productName} ${category}`,
                description: `Beautiful ${category.toLowerCase()} featuring exquisite craftsmanship and premium materials.`,
                fullDescription: `<p>This stunning ${category.toLowerCase()} showcases exceptional design and quality. Crafted with attention to detail, it's perfect for any occasion.</p>`,
                category,
                subCategory: subcategory,
                price: Math.floor(Math.random() * 5000) + 1000, // Random price between 1000-6000
                stock: Math.floor(Math.random() * 50) + 1, // Random stock between 1-50
                isActive: true,
                status: 'draft',
                digitalBrowser: true,
                website: true,
                distributor: false,
                // Add some common jewelry fields
                goldWeight: `${(Math.random() * 10 + 1).toFixed(1)} gms`,
                goldPurity: ['14k', '18k', '22k'][Math.floor(Math.random() * 3)],
                goldType: ['Yellow', 'White', 'Rose'][Math.floor(Math.random() * 3)],
                // Add image
                images: {
                  create: [{
                    url: `/uploads/products/${encodeURIComponent(folder)}/${encodeURIComponent(imageFile)}`,
                    altText: `${productName} ${category}`,
                    order: 0,
                    isActive: true
                  }]
                }
              }
            });

            console.log(`✓ Created product: ${product.productCode} - ${product.name}`);
            totalProductsCreated++;

          } catch (error) {
            console.error(`Error processing image ${imageFile} in ${folder}:`, error);
          }
        }

        // Add small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`\n✓ Successfully created ${totalProductsCreated} products!`);

  } catch (error) {
    console.error('Error in auto-generating products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

autoGenerateProducts();