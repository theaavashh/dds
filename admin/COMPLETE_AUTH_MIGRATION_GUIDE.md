# Complete Authentication Migration Guide

This guide provides comprehensive instructions for migrating all dashboard pages from localStorage-based authentication to secure cookie-based authentication.

## Summary of Changes Made

### 1. Core Authentication System
- Implemented HttpOnly cookies for secure token storage
- Added SameSite=strict protection in production
- Enabled HTTPS-only cookies in production
- Integrated CSRF protection with automatic token switching

### 2. API Client Library
- Created secure API client functions (`apiGet`, `apiPost`, `apiPut`, `apiDelete`)
- Added centralized authentication error handling
- Integrated CSRF token management

### 3. Updated Pages
- Fixed `/admin/src/app/dashboard/page.tsx`
- Fixed `/admin/src/app/dashboard/stores/page.tsx`
- Fixed `/admin/src/app/dashboard/products/page.tsx`
- Fixed `/admin/src/app/dashboard/privacy-policy/page.tsx`
- Fixed `/admin/src/app/dashboard/help-center/page.tsx`

## Pages That Still Need Migration

The following pages still use localStorage for authentication and need to be updated:

1. `/admin/src/app/dashboard/celebration-processes/page.tsx`
2. `/admin/src/app/dashboard/cultures/[id]/page.tsx`
3. `/admin/src/app/dashboard/cultures/page.tsx`
4. `/admin/src/app/dashboard/diamond-certifications/page.tsx`
5. `/admin/src/app/dashboard/popup-management/page.tsx`
6. `/admin/src/app/dashboard/quotes/page.tsx`
7. `/admin/src/app/dashboard/return-policy/page.tsx`
8. `/admin/src/app/dashboard/ring-customizations/page.tsx`

## Migration Steps for Each Page

### 1. Update Imports

Add the API client import to each file:

```typescript
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/apiClient';
```

### 2. Replace Fetch Calls

#### Before (Insecure):
```typescript
const token = localStorage.getItem('token');
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

if (!response.ok) {
  throw new Error('Request failed');
}

const data = await response.json();
```

#### After (Secure):
```typescript
const result = await apiGet<DataType>(url);

if (result.success) {
  // Use result.data
  const data = result.data;
} else {
  // Handle error
  throw new Error(result.message || 'Request failed');
}
```

### 3. Update POST/PUT Requests

#### Before (Insecure):
```typescript
const token = localStorage.getItem('token');
const response = await fetch(url, {
  method: 'POST', // or 'PUT'
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

#### After (Secure):
```typescript
const result = method === 'POST' 
  ? await apiPost<DataType>(url, data)
  : await apiPut<DataType>(url, data);

if (result.success) {
  // Use result.data
} else {
  // Handle error
  throw new Error(result.message || 'Request failed');
}
```

### 4. Update DELETE Requests

#### Before (Insecure):
```typescript
const token = localStorage.getItem('token');
const response = await fetch(url, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

#### After (Secure):
```typescript
const result = await apiDelete(url);

if (result.success) {
  // Success
} else {
  // Handle error
  throw new Error(result.message || 'Request failed');
}
```

### 5. Remove localStorage Operations

Remove all of the following:
- `localStorage.getItem('token')`
- `localStorage.removeItem('token')`
- `localStorage.removeItem('adminToken')`
- Manual Authorization header additions

## Example Migration

Here's a complete example of migrating a typical dashboard page:

### Before Migration:
```typescript
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function SamplePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (itemData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      const newItem = await response.json();
      setItems(prev => [newItem, ...prev]);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // ... rest of component
}
```

### After Migration:
```typescript
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { apiGet, apiPost, apiDelete } from '@/lib/apiClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function SamplePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const result = await apiGet(`${API_BASE_URL}/api/items`);

      if (result.success) {
        setItems(result.data || []);
      } else {
        throw new Error(result.message || 'Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (itemData) => {
    try {
      const result = await apiPost(`${API_BASE_URL}/api/items`, itemData);

      if (result.success) {
        setItems(prev => [result.data!, ...prev]);
      } else {
        throw new Error(result.message || 'Failed to create item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await apiDelete(`${API_BASE_URL}/api/items/${id}`);

      if (result.success) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error(result.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // ... rest of component
}
```

## Security Benefits

1. **HttpOnly Cookies**: Tokens are stored in HttpOnly cookies, preventing XSS attacks
2. **SameSite Protection**: CSRF protection with SameSite=strict in production
3. **Secure Transmission**: HTTPS-only cookies in production
4. **No Client-Side Token Access**: Tokens cannot be accessed by JavaScript
5. **Centralized Error Handling**: Consistent authentication error handling
6. **CSRF Protection**: Automatic CSRF token management

## Testing Checklist

- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows proper error
- [ ] Session automatically expires after 7 days
- [ ] Logout clears session properly
- [ ] All dashboard pages load correctly when authenticated
- [ ] Unauthenticated users are redirected to login
- [ ] Authentication errors are handled gracefully
- [ ] No localStorage usage for tokens in any component
- [ ] CSRF protection works correctly
- [ ] All API calls use credentials: 'include'

## Environment Variables

For production deployment, set the following environment variables:
- `COOKIE_DOMAIN` - Domain for cookies (optional but recommended)
- `NODE_ENV=production` - Enables secure cookie settings

## Running the Migration Script

A helper script is available at `scripts/fix-auth-migration.sh` that lists all files that need to be updated.