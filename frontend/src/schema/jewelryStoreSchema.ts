/**
 * Jewelry Store Schema - Primary schema for SEO
 * Defines the business as a JewelryStore with all relevant information
 */

export const jewelryStoreSchema = {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: 'Celebration Diamonds Studio',
    url: 'https://celebrationdiamonds.com',
    logo: 'https://celebrationdiamonds.com/logo.png',
    description: 'Premium handcrafted diamond jewelry, custom engagement rings, and luxury bridal collections',
    image: 'https://celebrationdiamonds.com/store-front.jpg',
    sameAs: [
        'https://www.facebook.com/celebrationdiamonds',
        'https://www.instagram.com/celebrationdiamonds',
        'https://twitter.com/celebrationdiamonds',
        'https://www.pinterest.com/celebrationdiamonds/',
    ],
    telephone: '+1-234-567-8900',
    email: 'info@celebrationdiamonds.com', 
    address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Diamond Street', 
        addressLocality: 'New York',
        addressRegion: 'NY',
        postalCode: '10001',
        addressCountry: 'US'
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 40.7128, // UPDATE: Replace with actual coordinates
        longitude: -74.0060
    },
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '10:00',
            closes: '18:00'
        },
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: 'Saturday',
            opens: '10:00',
            closes: '16:00'
        }
    ],
    priceRange: '$$$',
    contactPoint: [
        {
            '@type': 'ContactPoint',
            telephone: '+1-234-567-8900',
            contactType: 'customer service',
            areaServed: ['US', 'CA'], // Add more countries if shipping internationally
            availableLanguage: ['English', 'Spanish'] // Add languages as needed
        }
    ],
    makesOffer: {
        '@type': 'Offer',
        areaServed: 'Worldwide' // If shipping internationally
    }
};
