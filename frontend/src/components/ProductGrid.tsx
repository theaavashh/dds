import Image from 'next/image';

const products = [
  {
    id: 1,
    name: 'Diamond Solitaire Ring',
    price: '$1,299',
    category: 'Rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 2,
    name: 'Gold Pearl Necklace',
    price: '$899',
    category: 'Necklaces',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Crystal Drop Earrings',
    price: '$459',
    category: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Luxury Gold Bracelet',
    price: '$2,450',
    category: 'Bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop',
  },
];

export default function ProductGrid() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Featured Collections</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Discover our exclusive selection of fine jewelry, designed to elegance and crafted to perfection.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-6 py-2 text-sm font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg whitespace-nowrap">
                  Add to Cart
                </button>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.category}</p>
                <h3 className="text-base font-medium text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">{product.name}</h3>
                <p className="text-amber-600 font-semibold">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="inline-block border-b-2 border-gray-900 text-gray-900 pb-1 font-medium hover:text-amber-600 hover:border-amber-600 transition-colors">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
