# Frontend Authentication System - SearchNorthCyprus

## Overview

The frontend authentication system has been enhanced to support both **email-based authentication** and **Telegram authentication**, providing users with flexible login options while maintaining security and user experience.

## Features

### 🔐 Dual Authentication Methods
- **Email Authentication**: Traditional email/password login and registration
- **Telegram Authentication**: Quick login using Telegram OAuth
- **Seamless Integration**: Both methods work together seamlessly

### 🛡️ Security Features
- **JWT Token Management**: Secure token-based authentication
- **Password Validation**: Strong password requirements
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: Protection against brute force attacks

### 🎨 User Experience
- **Responsive Design**: Works on all devices
- **Loading States**: Clear feedback during authentication
- **Error Messages**: Contextual error messages
- **Password Visibility**: Toggle password visibility
- **Auto-redirect**: Automatic redirection after successful authentication

## File Structure

```
├── app/auth/
│   ├── login/page.tsx              # Login page with tabs
│   ├── register/page.tsx           # Registration page with tabs
│   ├── forgot-password/page.tsx    # Forgot password page
│   └── reset-password/page.tsx     # Reset password page
├── components/auth/
│   ├── email-login-form.tsx        # Email login form
│   ├── email-register-form.tsx     # Email registration form
│   ├── forgot-password-form.tsx    # Forgot password form
│   └── reset-password-form.tsx     # Reset password form
├── contexts/
│   └── auth-context.tsx            # Authentication context
├── lib/
│   └── api.ts                      # API utilities and functions
└── .env.local.example              # Environment variables template
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=SearchNorthCyprus
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Telegram Bot Configuration
NEXT_PUBLIC_TELEGRAM_BOT_NAME=bot7906063270
```

### 2. Install Dependencies

The following dependencies are required (should already be installed):

```bash
npm install lucide-react
```

### 3. Wrap Your App with AuthProvider

Update your main layout or app component to include the AuthProvider:

```tsx
import { AuthProvider } from "@/contexts/auth-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Usage

### Authentication Context

Use the `useAuth` hook to access authentication state and methods:

```tsx
import { useAuth } from "@/contexts/auth-context"

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>Please log in</div>
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### API Functions

Direct API calls can be made using the API utilities:

```tsx
import { authApi } from "@/lib/api"

// Login
const response = await authApi.login({
  email: "user@example.com",
  password: "password123"
})

// Register
const response = await authApi.register({
  email: "user@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe"
})
```

## Components

### Login Page (`/auth/login`)
- Tabbed interface for Email and Telegram login
- Email form with validation
- Telegram OAuth integration
- "Forgot Password" link
- "Create Account" link

### Registration Page (`/auth/register`)
- Tabbed interface for Email and Telegram registration
- Email form with validation
- Password strength requirements
- "Sign In" link

### Forgot Password Page (`/auth/forgot-password`)
- Email input for password reset
- Success/error feedback
- Automatic email sending

### Reset Password Page (`/auth/reset-password`)
- Token-based password reset
- Password confirmation
- Success feedback with auto-redirect

## Form Validation

### Email Login Form
- Email format validation
- Password minimum length (6 characters)
- Real-time error clearing

### Email Registration Form
- First/Last name validation (minimum 2 characters)
- Email format validation
- Password strength requirements:
  - Minimum 6 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Password confirmation matching

### Password Reset Form
- Same password requirements as registration
- Token validation
- Password confirmation

## Error Handling

The system provides comprehensive error handling:

### API Errors
- **401 Unauthorized**: Invalid credentials
- **409 Conflict**: Email already exists
- **429 Too Many Requests**: Rate limiting
- **400 Bad Request**: Invalid data
- **Network Errors**: Connection issues

### User-Friendly Messages
- Clear, actionable error messages
- Field-specific validation errors
- Success confirmations
- Loading states

## Security Considerations

### Token Management
- JWT tokens stored in localStorage
- Automatic token verification
- Token cleanup on logout

### Password Security
- Strong password requirements
- Password visibility toggle
- No password storage in state after submission

### API Security
- CORS configuration
- Rate limiting
- Input validation
- Error message sanitization

## Integration with Backend

The frontend integrates with the backend API endpoints:

### Authentication Endpoints
- `POST /api/auth/login` - Email login
- `POST /api/auth/register` - Email registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Expected Response Format
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  },
  "message": "Success message"
}
```

## Testing

### Manual Testing
1. Test email registration with various inputs
2. Test email login with valid/invalid credentials
3. Test forgot password flow
4. Test reset password with valid/invalid tokens
5. Test form validation
6. Test error handling
7. Test Telegram authentication

### Integration Testing
1. Ensure backend API is running
2. Test API connectivity
3. Verify token management
4. Test authentication state persistence

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure backend server is running
   - Verify CORS configuration

2. **Authentication Not Persisting**
   - Check localStorage for tokens
   - Verify token expiration
   - Check AuthProvider wrapping

3. **Form Validation Not Working**
   - Check form field names
   - Verify validation functions
   - Check error state management

4. **Telegram Login Issues**
   - Verify bot token configuration
   - Check Telegram OAuth setup
   - Verify callback URLs

## Next Steps

### Potential Enhancements
1. **Two-Factor Authentication**: Add 2FA support
2. **Social Login**: Add Google, Facebook, etc.
3. **Remember Me**: Persistent login option
4. **Account Verification**: Email verification flow
5. **Profile Management**: User profile editing
6. **Session Management**: Multiple device handling

### Performance Optimizations
1. **Code Splitting**: Lazy load auth components
2. **Caching**: Cache user data
3. **Compression**: Optimize bundle size
4. **PWA**: Add offline support

## Support

For issues or questions regarding the authentication system:

1. Check the backend API documentation
2. Review error logs in browser console
3. Verify environment configuration
4. Test API endpoints directly

The authentication system is designed to be robust, secure, and user-friendly while providing flexibility for both traditional email-based authentication and modern Telegram OAuth integration. 