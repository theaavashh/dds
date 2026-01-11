import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
    id: string;
    productCode: string;
    name: string;
    description: string;
    category: string;
    subCategory?: string;
    price: number;
    stock: number;
    isActive: boolean;
    status: string;
    imageUrl: string | null;
    images: {
        id: string;
        url: string;
        altText?: string;
    }[];
    goldWeight?: string;
    goldPurity?: string;
    diamondCaratWeight?: string;
    diamondQuantity?: number;
}

interface WishlistState {
    items: Product[];
}

const getStoredWishlist = (): Product[] => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('wishlist');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored wishlist:', e);
            }
        }
    }
    return [];
};

const initialState: WishlistState = {
    items: getStoredWishlist(),
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        addToWishlist: (state, action: PayloadAction<Product>) => {
            const exists = state.items.find(item => item.id === action.payload.id);
            if (!exists) {
                state.items.push(action.payload);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('wishlist', JSON.stringify(state.items));
                }
            }
        },
        removeFromWishlist: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            if (typeof window !== 'undefined') {
                localStorage.setItem('wishlist', JSON.stringify(state.items));
            }
        },
        clearWishlist: (state) => {
            state.items = [];
            if (typeof window !== 'undefined') {
                localStorage.removeItem('wishlist');
            }
        },
        setWishlist: (state, action: PayloadAction<Product[]>) => {
            state.items = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem('wishlist', JSON.stringify(state.items));
            }
        }
    },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
