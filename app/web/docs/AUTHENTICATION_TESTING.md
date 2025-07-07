# Authentication Testing Guide

## Quick Start Testing

### 1. Start Both Servers

**Terminal 1 - Backend API Server:**

```bash
cd /Users/jc-0009xbinar/Documents/AIEnhancementCourse/todo-list-app
npm run start:dev
```

**Terminal 2 - Frontend Development Server:**

```bash
cd /Users/jc-0009xbinar/Documents/AIEnhancementCourse/todo-list-app/app/web
npm run dev
```

### 2. Access the Application

- Open browser to `http://localhost:5173`
- You should be redirected to the authentication page (`/auth`)

### 3. Test User Registration

1. Click "Create Account" or ensure you're on the registration form
2. Fill in the form:
   - **Username**: `testuser`
   - **Email**: `test@example.com`
   - **Password**: `TestPassword123!`
   - **First Name**: `Test`
   - **Last Name**: `User`
3. Click "Create Account"
4. You should be redirected to the dashboard

### 4. Test User Login

1. Logout from the dashboard (click the logout button)
2. You should be redirected to the auth page
3. Switch to login form if not already there
4. Enter credentials:
   - **Email**: `test@example.com`
   - **Password**: `TestPassword123!`
5. Click "Sign In"
6. You should be redirected to the dashboard

### 5. Test Protected Routes

1. While logged in, try accessing:
   - `/dashboard` - Should work
   - `/tasks` - Should work
   - `/lists` - Should work
   - `/profile` - Should work
2. Logout, then try accessing the same routes
3. You should be redirected to `/auth`

### 6. Test Profile Management

1. Navigate to `/profile`
2. Edit your profile information
3. Save changes
4. Verify changes are saved

## Manual Testing Checklist

### Registration Testing

- [ ] Valid registration with all fields
- [ ] Valid registration with only required fields
- [ ] Email format validation
- [ ] Password strength validation
- [ ] Username uniqueness validation
- [ ] Email uniqueness validation
- [ ] Loading state during registration
- [ ] Error handling for network failures
- [ ] Success redirect to dashboard

### Login Testing

- [ ] Valid login with correct credentials
- [ ] Invalid email format handling
- [ ] Incorrect password handling
- [ ] Non-existent user handling
- [ ] Loading state during login
- [ ] Error handling for network failures
- [ ] Success redirect to dashboard
- [ ] Remember authentication state

### Route Protection Testing

- [ ] Dashboard access when authenticated
- [ ] Tasks page access when authenticated
- [ ] Lists page access when authenticated
- [ ] Profile page access when authenticated
- [ ] Redirect to auth when not authenticated
- [ ] Proper navigation after login

### Profile Management Testing

- [ ] View current profile information
- [ ] Edit profile information
- [ ] Save profile changes
- [ ] Validation of profile fields
- [ ] Loading state during save
- [ ] Error handling for save failures

### Logout Testing

- [ ] Logout from navigation
- [ ] Logout from profile page
- [ ] Redirect to auth page after logout
- [ ] Clear authentication state
- [ ] Clear stored tokens

### Error Handling Testing

- [ ] Network connection errors
- [ ] Server errors (500)
- [ ] Validation errors (400)
- [ ] Authentication errors (401)
- [ ] Authorization errors (403)
- [ ] Form validation errors
- [ ] Loading state indicators

### Accessibility Testing

- [ ] Keyboard navigation through forms
- [ ] Screen reader compatibility
- [ ] Focus indicators
- [ ] Error announcements
- [ ] Loading state announcements
- [ ] Form labeling

## API Testing with Postman

### 1. Register New User

```http
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "username": "testuser2",
  "email": "test2@example.com",
  "password": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User"
}
```

### 2. Login User

```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test2@example.com",
  "password": "TestPassword123!"
}
```

### 3. Get Profile (with token)

```http
GET http://localhost:3001/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

### 4. Update Profile (with token)

```http
PUT http://localhost:3001/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

## Browser DevTools Testing

### 1. Check localStorage

- Open DevTools → Application → Local Storage
- Verify `auth_token` is stored after login
- Verify `auth_token` is removed after logout

### 2. Check Network Requests

- Open DevTools → Network tab
- Monitor API requests during auth operations
- Verify proper headers are sent
- Check response status codes

### 3. Check Console

- Monitor for JavaScript errors
- Check for authentication-related logs
- Verify error handling doesn't break the app

## Common Issues and Solutions

### Issue: "Cannot find module" errors

**Solution**: Ensure all dependencies are installed:

```bash
cd app/web
npm install
```

### Issue: CORS errors

**Solution**: Backend should have CORS configured for localhost:5173

### Issue: 401 Unauthorized errors

**Solution**: Check if JWT token is being sent in Authorization header

### Issue: Form validation not working

**Solution**: Check browser console for validation errors

### Issue: Redirect loops

**Solution**: Check authentication state initialization

## Performance Testing

### 1. Bundle Size Analysis

```bash
cd app/web
npm run build
npm run analyze
```

### 2. Lighthouse Audit

- Open DevTools → Lighthouse
- Run audit on authentication pages
- Check performance, accessibility, and SEO scores

### 3. Memory Usage

- Monitor memory usage during auth operations
- Check for memory leaks in auth state management

## Security Testing

### 1. Token Security

- Verify JWT tokens are properly formatted
- Check token expiration handling
- Test token refresh mechanisms

### 2. Input Validation

- Test SQL injection attempts
- Test XSS attempts
- Test CSRF protection

### 3. Rate Limiting

- Test multiple failed login attempts
- Verify rate limiting is working

## Documentation Testing

### 1. API Documentation

- Verify all auth endpoints are documented
- Check example requests/responses
- Validate schema definitions

### 2. Code Documentation

- Review component documentation
- Check hook documentation
- Verify type definitions

---

## Success Criteria

✅ All authentication flows work correctly
✅ Protected routes are properly guarded
✅ User data is properly managed
✅ Error handling is user-friendly
✅ Loading states provide feedback
✅ Security best practices are followed
✅ Accessibility requirements are met
✅ Performance is acceptable
✅ Code is well-documented

## Next Steps

After completing authentication testing:

1. Continue with Phase 6: Performance Optimization
2. Implement virtual scrolling for task lists
3. Add code splitting for better performance
4. Implement caching strategies
5. Add comprehensive test suites
