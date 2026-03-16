/**
 * Website Schema - Secondary schema for search functionality
 * Enables site search in Google search results
 */

export const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://celebrationdiamonds.com',
    name: 'Celebration Diamonds Studio',
    description: 'Luxury diamond jewelry and custom engagement rings',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://celebrationdiamonds.com/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
    }
};
