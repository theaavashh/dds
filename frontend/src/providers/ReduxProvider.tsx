'use client';

import { Provider } from 'react-redux';
import { store } from '../store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/userSlice';
import { setWishlist } from '../store/wishlistSlice';
import { setCart } from '../store/cartSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { checkAuthStatus } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (initialized.current) return;
      initialized.current = true;

      // 1. Rehydrate from localStorage on mount (client-only)
      const stored = localStorage.getItem('distributor');
      if (stored) {
        try {
          const user = JSON.parse(stored);
          dispatch(setUser(user));
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          localStorage.removeItem('distributor');
        }
      }

      const storedWishlist = localStorage.getItem('wishlist');
      if (storedWishlist) {
        try {
          const items = JSON.parse(storedWishlist);
          dispatch(setWishlist(items));
        } catch (e) {
          console.error('Failed to parse stored wishlist:', e);
          localStorage.removeItem('wishlist');
        }
      }

      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          const items = JSON.parse(storedCart);
          dispatch(setCart(items));
        } catch (e) {
          console.error('Failed to parse stored cart:', e);
          localStorage.removeItem('cart');
        }
      }

      // 2. Perform one-time server-side session verification
      await checkAuthStatus();
    };

    init();
  }, [dispatch, checkAuthStatus]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <ToastContainer position="top-right" autoClose={3000} />
        {children}
      </AuthInitializer>
    </Provider>
  );
}