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

interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
}

const getStoredCart = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('cart');
        if (stored) {
            try {
                const items = JSON.parse(stored);
                const totalItems = items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
                const totalAmount = items.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
                return { items, totalItems, totalAmount };
            } catch (e) {
                console.error('Failed to parse stored cart:', e);
            }
        }
    }
    return { items: [], totalItems: 0, totalAmount: 0 };
};

const initialState: CartState = getStoredCart();

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Product & { quantity?: number }>) => {
            const { quantity = 1, ...product } = action.payload;
            const existingItem = state.items.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.items.push({ ...product, quantity });
            }
            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.items));
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.items));
            }
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item && action.payload.quantity > 0) {
                item.quantity = action.payload.quantity;
            }
            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.items));
            }
        },
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalAmount = 0;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cart');
            }
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
            state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
            if (typeof window !== 'undefined') {
                localStorage.setItem('cart', JSON.stringify(state.items));
            }
        }
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
