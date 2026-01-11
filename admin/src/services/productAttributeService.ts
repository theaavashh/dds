// Define the attribute types we want to track
export type AttributeType = 
  | 'diamondType'
  | 'diamondShapeCut'
  | 'diamondColorGrade'
  | 'diamondClarityGrade'
  | 'diamondCutGrade'
  | 'diamondMetalDetails'
  | 'diamondCertification'
  | 'diamondOrigin'
  | 'diamondCaratWeight'
  | 'goldPurity'
  | 'goldType'
  | 'goldWeight'
  | 'goldCraftsmanship'
  | 'goldDesignDescription'
  | 'goldFinishedType'
  | 'goldStones'
  | 'goldStoneQuality'
  | 'platinumType'
  | 'platinumWeight'
  | 'silverType'
  | 'silverWeight'
  | 'diamondShape'
  | 'diamondReportLab'
  | 'diamondStatus';

export interface AttributeOption {
  id: string;
  value: string;
}

// Service for managing product attribute values
export class ProductAttributeService {
  private static instance: ProductAttributeService;
  private cache: Map<AttributeType, AttributeOption[]> = new Map();
  private cacheExpiry: Map<AttributeType, number> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): ProductAttributeService {
    if (!ProductAttributeService.instance) {
      ProductAttributeService.instance = new ProductAttributeService();
    }
    return ProductAttributeService.instance;
  }

  // Get unique values for an attribute from the attribute options API
  async getAttributeOptions(attribute: AttributeType): Promise<AttributeOption[]> {
    // Check cache first
    const now = Date.now();
    if (this.cache.has(attribute) && this.cacheExpiry.has(attribute)) {
      const expiry = this.cacheExpiry.get(attribute)!;
      if (now < expiry) {
        return this.cache.get(attribute)!;
      }
    }

    try {
      // Fetch attribute options from the dedicated API endpoint using fetch with credentials
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/attribute-options/admin/all?attribute=${attribute}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const options = result.data.map((option: { id: string; value: string }) => ({
          id: option.id,
          value: option.value
        })).sort((a: AttributeOption, b: AttributeOption) => a.value.localeCompare(b.value));
        
        // Cache the results
        this.cache.set(attribute, options);
        this.cacheExpiry.set(attribute, now + this.CACHE_DURATION);
        
        return options;
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching ${attribute} options:`, error);
      return [];
    }
  }

  // Get unique values for an attribute (backward compatibility)
  async getAttributeValues(attribute: AttributeType): Promise<string[]> {
    const options = await this.getAttributeOptions(attribute);
    return options.map(option => option.value);
  }

  // Clear cache for an attribute (use when a new value is added)
  clearCache(attribute: AttributeType): void {
    this.cache.delete(attribute);
    this.cacheExpiry.delete(attribute);
  }

  // Clear all caches
  clearAllCaches(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  // Add a new value to the cache (for immediate availability)
  addToCache(attribute: AttributeType, value: string): void {
    if (!value || value.trim() === '') return;
    
    const currentOptions = this.cache.get(attribute) || [];
    if (!currentOptions.some(option => option.value === value)) {
      const newOptions = [...currentOptions, { id: '', value }].sort((a, b) => a.value.localeCompare(b.value));
      this.cache.set(attribute, newOptions);
      this.cacheExpiry.set(attribute, Date.now() + this.CACHE_DURATION);
    }
  }
  
  // Method to notify that a new value was added for an attribute
  notifyValueChanged(attribute: AttributeType): void {
    // Clear the cache for this attribute to force a fresh fetch
    this.clearCache(attribute);
  }
}

// Export singleton instance
export const productAttributeService = ProductAttributeService.getInstance();

// Custom hook for using attribute values in components
export const useAttributeValues = (attribute: AttributeType) => {
  // In a real implementation, this would be a React hook
  // For now, we'll just return the service methods
  return {
    getAttributeValues: () => productAttributeService.getAttributeValues(attribute),
    getAttributeOptions: () => productAttributeService.getAttributeOptions(attribute),
    clearCache: () => productAttributeService.clearCache(attribute),
    clearAllCaches: () => productAttributeService.clearAllCaches(),
    addToCache: (value: string) => productAttributeService.addToCache(attribute, value)
  };
};
