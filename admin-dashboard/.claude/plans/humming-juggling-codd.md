# Admin Dashboard Enhancement Plan

## Context
The SmartGuide admin dashboard has a solid foundation with route structure, basic pages, and component patterns. However, it's missing critical features required for comprehensive platform administration:

**User Requirements:**
- Complete wallet management system for guides (add/deduct balance, freeze/unfreeze, transaction history)
- Create Admin functionality
- Enhanced guide management with document review
- Revenue/analytics dedicated page
- Global state management for real-time updates
- Financial data precision (monetary values validation)

**Current State:**
- Framework: React 19 + Vite + Tailwind CSS v4
- State: Only ThemeContext; component-level state everywhere
- API: adminService.js with most endpoints but missing **wallet endpoints**
- Pages: 8 pages partially implemented, mostly following same pattern
- UI: Uses custom CSS variables + Tailwind; reusable components exist

**Key Finding:** The codebase lacks wallet-related API service functions and has no global data context.

---

## Implementation Strategy

### Phase 1: Core Infrastructure (Foundation)
**Objective:** Enable real-time state updates across pages without hard reloads

#### 1.1 Add Wallet API Endpoints to adminService.js
Add missing wallet endpoints to `/src/services/adminService.js`:
```javascript
// Wallet endpoints to add:
export const fetchGuideWallet = (guideId)
export const fetchGuideWalletTransactions = (guideId)
export const addGuideBalance = (guideId, amount, reason)
export const deductGuideBalance = (guideId, amount, reason)
export const freezeGuideWallet = (guideId, reason)
export const unfreezeGuideWallet = (guideId, reason)
export const createAdmin = (adminData)  // POST /api/admin/create-admin
```

**Files Modified:**
- `src/services/adminService.js` — Add ~7 new endpoint wrappers

#### 1.2 Create Global Data Context (Context API)
Create `/src/context/AdminDataContext.jsx`:
- **Purpose:** Share fetched data across pages, enable optimistic updates
- **State:** users, guides, tours, bookings, statistics, wallets (keyed by guideId)
- **Methods:** 
  - `fetchAllData()` — Initial load
  - `updateUser(userId, updates)` — Local state + optional API
  - `updateGuide(guideId, updates)` 
  - `updateGuideWallet(guideId, updates)`
  - Invalidation methods to refetch specific resources
- **Pattern:** Follow existing ThemeContext pattern (provider + hook)
- **Usage:** Wrap app in `<AdminDataProvider>` in main.jsx
- **Choice:** Context API selected (simpler, consistent with codebase, sufficient for admin dashboard)

**Files Created:**
- `src/context/AdminDataContext.jsx` (~250 lines)

**Files Modified:**
- `src/main.jsx` — Add AdminDataProvider

**Rationale:** Replaces repetitive local state + refetch patterns; enables real-time sync without Redux overhead

---

### Phase 2: Wallet Management (Critical Financial Feature)
**Objective:** Implement complete wallet system per user requirements

#### 2.1 Create Wallet Modal Component
Create `/src/components/WalletModal.jsx`:
- **Props:** `open`, `guide`, `onClose`, `onBalanceChange`
- **Features:**
  - Tabs: Balance Overview | Transaction History
  - **Balance Tab:**
    - Display: Current balance, frozen status, account status (badge)
    - Action buttons: Add Balance, Deduct Balance, Freeze, Unfreeze (conditional)
  - **Transaction Tab:**
    - Table: Date, Type, Amount (Green for +, Red for -), Reason
    - Empty state if no transactions
  - **Add/Deduct Sub-modals:**
    - Reason Modal pattern already exists; reuse ReasonModal with:
      - Amount input field (number, non-negative, max 2 decimals)
      - Reason textarea
      - Submit button that calls API + updates parent guide state

**Files Created:**
- `src/components/WalletModal.jsx` (~250 lines)

**Validation Rules (to implement in component):**
```javascript
// Amount validation
const validateAmount = (amount) => {
  if (!amount || isNaN(amount)) return "Amount is required";
  if (amount < 0) return "Amount cannot be negative";
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return "Max 2 decimal places";
  return null;
};
```

**Reuse Pattern:** Follow GuideActionButtons pattern: state management + modal triggers + API calls

---

#### 2.2 Integrate Wallet Modal into Guide Details
Modify `/src/components/GuideActionButtons.jsx`:
- Add "Wallet" button that opens WalletModal
- Pass onBalanceChange callback to sync parent guide state
- After successful wallet operation, refetch or update guide data

**Files Modified:**
- `src/components/GuideActionButtons.jsx` — Add wallet button + modal integration

---

### Phase 3: Enhanced Guide Management
**Objective:** Complete guide features: document review, wallet access, status management

#### 3.1 Create Guide Details Modal/Page (Optional Enhancement)
Could create `/src/components/GuideDetailsModal.jsx` or enhance existing flow:
- Shows all guide info in a modal
- Integrates WalletModal (click "Manage Wallet" button)
- Shows documents preview
- All action buttons (approve, reject, suspend, ban, force logout, wallet)

**Files Modified:**
- `src/components/GuideActionButtons.jsx` — Add "Details" button if needed
- OR keep existing flow (documents modal already exists)

**Decision:** For MVP, integrate wallet button directly into GuideActionButtons without new modal

---

### Phase 4: Create Admin Feature (Full Page)
**Objective:** Add dedicated page to create new admin users

#### 4.1 Create Admin Page
Create `/src/pages/CreateAdminPage.jsx`:
- **Layout:** PageHeader + centered form card
- **Form Fields:**
  - First Name (required, text, validation)
  - Last Name (required, text, validation)
  - Email (required, email validation)
  - Password (required, min 8 chars, strength indicator recommended)
  - Confirm Password (required, match validation)
  - Role (dropdown or radio: select role options from backend schema)
- **Form Features:**
  - Client-side validation on blur
  - Submit button disabled while submitting
  - Success: Redirect to /users page with success toast
  - Error: Display error message inline
  - "Back to Users" link for navigation
- **Pattern:** Follow component pattern of LoginPage (form-focused page)

**Files Created:**
- `src/pages/CreateAdminPage.jsx` (~250 lines)

#### 4.2 Update Routes & Navigation
Modify `/src/App.jsx`:
- Add route: `<Route path="create-admin" element={<CreateAdminPage />} />`

Modify `/src/pages/UsersPage.jsx`:
- Add "Create Admin" button in PageHeader actions
- Button links to `/create-admin` page (or can be "Create Admin" button)

Modify `/src/layout/AdminLayout.jsx` (optional):
- Add "Create Admin" nav link if frequently needed, OR just link from Users page

**Files Modified:**
- `src/App.jsx` — Add create-admin route
- `src/pages/UsersPage.jsx` — Add link button
- `src/services/adminService.js` — Add `createAdmin()` function (if not already there)

---

### Phase 5: Revenue & Analytics Page (Dedicated)
**Objective:** Create dedicated Revenue page with comprehensive financial breakdown

#### 5.1 Create Revenue Page
Create `/src/pages/RevenuePage.jsx`:
- **Layout:** Full-featured analytics dashboard
- **Components:**
  - **Header:** "Revenue & Analytics" title + date range filter (or calendar date picker)
  - **KPI Cards Grid:** 4-column responsive grid with StatCard components:
    - Total Revenue (all time or selected period)
    - Platform Earnings/Fees (if available in API)
    - Guide Payouts (if available)
    - Average Revenue per Booking
  - **Charts Section:**
    - Revenue trend line chart (last 30 days)
    - Revenue by booking status (pie: Confirmed, Pending, Cancelled)
    - Top guides by revenue (bar chart or table)
  - **Detailed Table:** Financial transactions
    - Columns: Date, Guide Name, Booking ID, Amount, Status, Platform Fee
    - Sortable by date/amount
    - Pagination if large dataset
    - Export to CSV button (optional)
- **Data Sources:** `/api/admin/revenue`, `/api/admin/statistics`, `/api/admin/bookings`
- **Charts:** Reuse DashboardCharts components; create new variants if needed

**Files Created:**
- `src/pages/RevenuePage.jsx` (~350 lines)

#### 5.2 Update Routes & Navigation
Modify `/src/App.jsx`:
- Add route: `<Route path="revenue" element={<RevenuePage />} />`

Modify `/src/layout/AdminLayout.jsx`:
- Add "Revenue" nav link to the nav array with Banknote icon
- Insert between Audit and Bookings for logical grouping

**Files Modified:**
- `src/App.jsx` — Add revenue route
- `src/layout/AdminLayout.jsx` — Add nav link + import Banknote icon from lucide-react

---

### Phase 6: UI/UX Polish
**Objective:** Improve completeness and consistency

#### 6.1 Enhance Tours Page
Modify `/src/pages/ToursPage.jsx`:
- Add search/filter by name
- Add pagination if data is large
- Improve table layout (add description, location, price columns if available)
- Add "View Details" modal

#### 6.2 Enhance Bookings Page
Modify `/src/pages/BookingsPage.jsx`:
- Add filtering: by status, by date range, by guide
- Add booking details modal with guide/user info, tour details, payment status
- Improve table columns

#### 6.3 Consistent Loading/Empty States
- Ensure all pages use consistent loading skeleton or spinner
- Consistent empty state UI

---

## Implementation Order

### Sprint 1 (Core - Required)
1. **Add wallet endpoints to adminService.js** (adminService.js)
2. **Create AdminDataContext.jsx** (new context, Context API)
3. **Create WalletModal.jsx** (new component)
4. **Integrate wallet into GuideActionButtons.jsx** (modify existing)

### Sprint 2 (Extended Features)
5. **Create CreateAdminPage.jsx** (new page)
6. **Enhance UsersPage.jsx** (modify existing - add link to create-admin)
7. **Create RevenuePage.jsx** (new page)
8. **Update routes** (App.jsx, AdminLayout.jsx)

### Sprint 3 (Optional Polish)
9. **Enhance Tours/Bookings pages** (improve UX, add filters/details modals)
10. **Add data export features** (CSV export from revenue/audit pages)
11. **Performance optimization** (pagination, lazy loading if needed)

---

## Critical Implementation Details

### Wallet Amount Validation
- Regex: `/^\d+(\.\d{1,2})?$/` for decimal precision
- Min: 0, must be positive
- Component-level validation before API call
- Display errors inline

### State Update Pattern
```javascript
// After wallet operation success:
1. Update local guide state with new balance
2. Call onBalanceChange callback (if in modal)
3. Parent component refetches guide or updates AdminDataContext
4. UI reflects change immediately (no page reload)
```

### Error Handling
- Try/catch in all API calls
- Toast notifications for user feedback
- Log errors to console for debugging
- Don't block UI on non-critical errors

### Color Coding for Transactions
- **Credit (incoming balance):** Green (#10b981 or Tailwind green-600)
- **Debit (outgoing balance):** Red (#ef4444 or Tailwind red-500)
- Display amount sign: + for credit, - for debit

---

## Files Summary

### New Files (5)
- `src/context/AdminDataContext.jsx` — Global data state (Context API)
- `src/components/WalletModal.jsx` — Wallet management UI component
- `src/pages/CreateAdminPage.jsx` — Full admin creation page
- `src/pages/RevenuePage.jsx` — Revenue analytics & financial breakdown

### Modified Files (7)
- `src/services/adminService.js` — Add wallet endpoints + createAdmin endpoint
- `src/main.jsx` — Wrap app in AdminDataProvider
- `src/components/GuideActionButtons.jsx` — Add "Wallet" action button
- `src/pages/UsersPage.jsx` — Add "Create Admin" button linking to /create-admin
- `src/App.jsx` — Add routes for /create-admin and /revenue
- `src/layout/AdminLayout.jsx` — Add "Revenue" nav link to sidebar menu
- `src/pages/ToursPage.jsx` — Enhance (optional in Sprint 3)

### Existing Reuse
- `ReasonModal.jsx` — Reuse for wallet add/deduct actions (don't modify)
- `StatCard.jsx` — Reuse in revenue page (don't modify)
- `DashboardCharts.jsx` — Reuse chart components (don't modify)
- `DateFilter.jsx` — Reuse for date selection (don't modify)
- `PageHeader.jsx` — Reuse for page headers (don't modify)

---

## Testing Strategy

### Manual Testing Checklist

**Wallet Operations:**
- [ ] View guide wallet (balance, frozen status, transaction history)
- [ ] Add balance: valid amount → success → balance updates → history shows transaction
- [ ] Add balance: invalid amount (negative, >2 decimals) → error message
- [ ] Deduct balance: valid amount → success → balance updates → history shows transaction
- [ ] Freeze wallet: success → frozen badge appears → add/deduct buttons disabled
- [ ] Unfreeze wallet: success → frozen badge removed → buttons enabled
- [ ] Navigate away from modal → close properly → data persists on reopen

**Create Admin:**
- [ ] Open create admin modal from Users page
- [ ] Fill form → submit → success toast → modal closes
- [ ] Users list refreshes with new admin
- [ ] Try invalid inputs (email format, short password) → error message

**Data Persistence:**
- [ ] Make wallet change → navigate to different page → come back → data still updated
- [ ] Delete user → list updates immediately → no refresh needed
- [ ] Make guide status change → other pages see updated status

**UI/UX:**
- [ ] All modals responsive on mobile
- [ ] Forms have proper keyboard support (tab order, enter to submit)
- [ ] Error messages are clear and helpful
- [ ] Loading states work (spinner or disabled buttons)
- [ ] Toast notifications appear for all operations

---

## Success Criteria

✅ **Phase 1 Complete:**
- Wallet endpoints in adminService.js
- AdminDataContext created and wrapped in app
- Test: Context can be imported and used in components

✅ **Phase 2 Complete:**
- WalletModal displays guide balance, transactions
- Add/Deduct balance with validation works
- Freeze/Unfreeze toggles frozen state
- Test: All wallet operations update UI immediately

✅ **Phase 3 Complete:**
- GuideActionButtons has "Wallet" action
- Clicking opens WalletModal
- After wallet operation, guide state updates

✅ **Phase 4 Complete:**
- CreateAdminModal form functional
- Submit creates admin via API
- Users list updates after creation

✅ **Overall:**
- All monetary values validated (2 decimals, non-negative)
- Real-time updates across pages without hard reload
- All endpoints from user spec integrated
- No critical UI bugs or broken flows
- Mobile responsive on all new components
