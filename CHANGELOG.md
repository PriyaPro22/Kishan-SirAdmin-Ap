# Changelog - Bijli Wala

## [2026-02-13] - Latest Release

### ✅ Added
- **Mandatory Login Validation**: Orders can only be created when user is properly authenticated
- **Backend User Verification**: System verifies user exists in database before allowing payment
- **Advance Payment Integration**: Dynamic payment modes based on admin configuration
- **Conditional Payment Buttons**: Three smart buttons (FULL, ADVANCE, CASH) with visibility logic
- **Direct Paygic Integration**: Removed backend proxy, frontend calls Paygic API directly

### 🔧 Fixed
- Order ID generation (removed random suffix for clean backend IDs)
- "User not found" errors by adding authentication checks
- TypeScript build errors in multiple components
- Payment mode sheet structure and button rendering

### 📦 Payment Flow
**Advance Enabled (% > 0):**
- Pay Full Online (100%)
- Book with X% Advance
- Cash hidden

**Advance Disabled (% = 0):**
- Pay Full Online (100%)
- Pay After Service (Cash)
- Advance hidden

### 🔐 Security
- Strict localStorage checks (userId + authToken)
- Backend user verification before order creation
- Clear error messages for authentication failures

### 🎨 UI Improvements
- Separate color-coded payment buttons
- Dynamic amount calculation display
- Improved payment mode selection UX

## API Integrations
- `GET /api/advanced-payment` - Fetch advance percentage
- `GET /api/auth/user/:id` - Verify user exists
- `POST /api/order/generate-order-id` - Get unique order ID
- Direct Paygic API calls (no backend proxy)
