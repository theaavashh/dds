/**
 * Get the API base URL from environment variables
 */
export const getApiBaseUrl = (): string => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
  const cleaned = base.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return `${cleaned}/api`;
};

/**
 * Get the API URL (without /api suffix) from environment variables
 */
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/$/, '');
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (base) {
    return base.replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

/**
 * Construct full image URL from relative path
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Normalize absolute filesystem paths returned by the API
  const uploadsIndex = imagePath.indexOf('/uploads/');
  let normalizedPath = uploadsIndex !== -1 ? imagePath.slice(uploadsIndex) : imagePath;

  normalizedPath = normalizedPath.replace(/\\/g, '/');
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Otherwise, prepend API URL
  const apiUrl = getApiUrl();
  return `${apiUrl}${normalizedPath}`;
};




