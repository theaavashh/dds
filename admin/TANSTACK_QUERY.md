# TanStack Query Implementation for Admin Panel

This admin panel has been updated to use TanStack Query for data fetching and state management.

## What's Been Set Up

### 1. Query Provider
- `AuthAndQueryProvider.tsx` - Wraps the app with QueryClientProvider
- Configured with sensible defaults (retry logic, stale time, etc.)
- Includes React Query DevTools in development

### 2. API Functions
- `lib/apiQueries.ts` - Centralized API functions for auth, categories, and products
- Handles error responses consistently
- Returns parsed JSON data

### 3. Custom Hooks
- `hooks/useAuth.ts` - Auth mutations (login, logout, sendOtp, verifyOtp)
- `hooks/useCategories.ts` - Category CRUD operations
- `hooks/useProducts.ts` - Product CRUD operations

### 4. Updated Components
- `contexts/AuthContext.tsx` - Uses TanStack Query for user state
- `components/AdvancedProductFilter.tsx` - Fetches categories via hook
- `app/dashboard/categories/page.tsx` - Uses mutations for CRUD operations

## Benefits

✅ **Automatic caching** - Data is cached and refetched when needed
✅ **Background updates** - Stale data updates in background
✅ **Optimistic updates** - UI updates immediately, rolls back on error
✅ **Loading states** - Built-in loading and error states
✅ **Retry logic** - Automatic retry with configurable options
✅ **DevTools** - Debug queries in development

## Usage Examples

### Using Queries
```tsx
// Fetch data
const { data, isLoading, error } = useCategories();

// Conditional fetching
const { data: product } = useProduct(id); // only fetches if id exists
```

### Using Mutations
```tsx
const createCategory = useCreateCategory();

const handleSubmit = async (formData) => {
  try {
    await createCategory.mutateAsync(formData);
    toast.success('Category created!');
  } catch (error) {
    toast.error('Failed to create category');
  }
};
```

### Manual Updates
```tsx
const queryClient = useQueryClient();

// Invalidate and refetch
queryClient.invalidateQueries({ queryKey: ['categories'] });

// Set specific data
queryClient.setQueryData(['currentUser'], userData);
```

## Migration Notes

All existing API calls have been converted to use TanStack Query hooks. The old service calls are no longer needed and have been removed.

Error handling is now centralized in the API functions and mutations provide consistent error handling patterns.