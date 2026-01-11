# Authentication Migration Guide

This guide outlines the changes made to implement secure cookie-based authentication and the steps needed to migrate the rest of the application.

## What Has Been Done

### 1. Enhanced Cookie Security (API)
- Updated cookie settings in `/api/src/routes/authRoutes.ts`:
  - Set `sameSite: 'strict'` in production for better CSRF protection
  - Added `domain` configuration option for production environments
  - Ensured `httpOnly: true` to prevent XSS attacks
  - Maintained `secure: true` in production for HTTPS-only transmission

### 2. Fixed TypeScript Issues
- Fixed type definitions in auth routes
- Removed references to non-existent Retailer model
- Created proper interface for login response data

### 3. Updated AuthContext (Admin)
- Verified proper cookie handling with `credentials: 'include'`
- Ensured authentication state is managed correctly
- No localStorage usage in AuthContext

### 4. Created Secure API Client
- Created `/admin/src/lib/apiClient.ts` with utility functions:
  - `apiGet`, `apiPost`, `apiPut`, `apiDelete` for authenticated requests
  - All functions use `credentials: 'include'` for cookie handling
  - Added `handleAuthError` function for consistent authentication error handling

### 5. Updated Sample Page
- Updated `/admin/src/app/dashboard/help-center/page.tsx` to use the new API client
- Removed all localStorage references for authentication
- Added proper authentication error handling

### 6. Extended Type Definitions
- Added `HelpCenter` interface to `/admin/src/types/index.ts`

## What Still Needs to Be Done

### 1. Migrate Remaining Pages
There are still multiple pages using localStorage for authentication tokens. These need to be updated to use the new API client:

Files that need migration (localStorage usage found):
- `/admin/src/app/dashboard/celebration-processes/page.tsx`
- `/admin/src/app/dashboard/cultures/[id]/page.tsx`
- `/admin/src/app/dashboard/cultures/page.tsx`
- `/admin/src/app/dashboard/diamond-certifications/page.tsx`
- `/admin/src/app/dashboard/page.tsx`
- `/admin/src/app/dashboard/popup-management/page.tsx`
- `/admin/src/app/dashboard/privacy-policy/page.tsx`
- And potentially others not listed in the search results

### 2. Update Import Paths
Some components may have incorrect import paths that need to be fixed.

### 3. Comprehensive Testing
- Test login flow with valid credentials
- Test login flow with invalid credentials
- Test session expiration handling
- Test logout functionality
- Test all dashboard pages that require authentication

## How to Migrate Pages

### 1. Replace fetch calls with API client functions

**Before (insecure):**
```typescript
const token = localStorage.getItem('token');
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**After (secure):**
```typescript
import { apiGet, apiPost, apiPut, apiDelete, handleAuthError } from '@/lib/apiClient';

const result = await apiGet<DataType>(url);
if (!result.success) {
  if (handleAuthError(result.message)) {
    return; // Redirect handled by handleAuthError
  }
  // Handle other errors
  toast.error(result.message);
}
// Use result.data
```

### 2. Remove localStorage token handling

Remove all code that:
- Gets tokens from localStorage
- Sets Authorization headers manually
- Removes tokens from localStorage on auth errors

### 3. Use the handleAuthError utility

For consistent authentication error handling:
```typescript
if (!result.success) {
  if (handleAuthError(result.message)) {
    return; // Redirect handled by handleAuthError
  }
  toast.error(result.message);
}
```

## Security Benefits

1. **HttpOnly Cookies**: Tokens are stored in HttpOnly cookies, preventing XSS attacks
2. **SameSite Protection**: CSRF protection with SameSite=strict in production
3. **Secure Transmission**: HTTPS-only cookies in production
4. **No Client-Side Token Access**: Tokens cannot be accessed by JavaScript
5. **Centralized Error Handling**: Consistent authentication error handling

## Environment Variables

For production deployment, set the following environment variables:
- `COOKIE_DOMAIN` - Domain for cookies (optional but recommended)
- `NODE_ENV=production` - Enables secure cookie settings

## Testing Checklist

- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows proper error
- [ ] Session automatically expires after 7 days
- [ ] Logout clears session properly
- [ ] All dashboard pages load correctly when authenticated
- [ ] Unauthenticated users are redirected to login
- [ ] Authentication errors are handled gracefully
- [ ] No localStorage usage for tokens in any component