// Test script for the unified category API
const API_BASE_URL = 'http://localhost:5000';

async function testUnifiedAPI() {
  try {
    console.log('Testing Unified Category API...\n');
    
    // 1. Get all categories
    console.log('1. Getting all categories...');
    const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log('Categories:', categoriesData);
    
    // 2. Get categories with subcategories
    console.log('\n2. Getting categories with subcategories...');
    const categoriesWithSubResponse = await fetch(`${API_BASE_URL}/api/categories?includeSubcategories=true`);
    const categoriesWithSubData = await categoriesWithSubResponse.json();
    console.log('Categories with subcategories:', categoriesWithSubData);
    
    // 3. Create a new category (this would require authentication in practice)
    /*console.log('\n3. Creating a new category...');
    const newCategoryResponse = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authentication headers would be needed here
      },
      body: JSON.stringify({
        title: 'Test Category',
        link: '/test-category',
        isActive: true,
        sortOrder: 0
      })
    });
    const newCategoryData = await newCategoryResponse.json();
    console.log('New category:', newCategoryData);*/
    
    console.log('\nAPI test completed successfully!');
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the test
testUnifiedAPI();