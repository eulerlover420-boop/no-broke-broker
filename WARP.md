# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Financial Tracker is a single-page web application with an iOS 26-inspired liquid glass interface. It tracks income/expenses and provides monthly bill reminders. Built with vanilla JavaScript, HTML5, and CSS3—no frameworks or build tools.

## Commands

### Development
```bash
npm start
```
Starts a local server on port 8080 and opens the browser. Uses `http-server` via npx.

Alternatively, open `index.html` directly in any modern browser.

### Testing
No automated tests are configured. Manual testing via browser only.

## Architecture

### Application Structure
The app uses a class-based architecture with a single `FinancialTracker` class that manages all state and interactions.

**Key architectural patterns:**
- **Data Persistence**: localStorage for transactions and bills
- **State Management**: In-memory arrays (`this.transactions`, `this.bills`) synced with localStorage
- **Rendering**: Direct DOM manipulation via template strings (no virtual DOM)
- **Global Instance**: Single `tracker` instance exposed globally for inline event handlers

### Data Flow
1. User submits form → Event handler captures data
2. Data added to in-memory array (unshift for transactions, push for bills)
3. State saved to localStorage
4. DOM re-rendered from current state
5. Balance calculations triggered on transaction changes

### Core Components

**FinancialTracker Class** (script.js)
- `addTransaction()` / `deleteTransaction()`: Income/expense management
- `addBill()` / `deleteBill()`: Bill reminder CRUD
- `updateBalance()`: Calculates totals from transaction array
- `checkBillReminders()`: Checks bills due within 3 days on init
- `renderTransactions()` / `renderBills()`: Generates HTML from state
- `showNotification()`: Creates temporary toast notifications

**UI Structure** (index.html)
- Header card: Title and app description
- Balance card: Shows total, income, expense
- Add transaction card: Form for new transactions
- Bill reminders card: Form + list of recurring bills
- Recent transactions card: Scrollable transaction list

**Glassmorphism System** (styles.css)
- `.glass-container`: Base glass effect with backdrop-filter blur(20px)
- `::before` pseudo-element: Top-left glossy highlight
- `::after` pseudo-element: Bottom-right glow accent
- CSS custom properties in `:root` for consistent theming
- Animated gradient background with `gradientShift` animation

### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Focus transaction description input

## Design System

**Glass Effect Layers:**
- Main container: `rgba(255, 255, 255, 0.15)` with `backdrop-filter: blur(20px)`
- Inputs/buttons: `rgba(255, 255, 255, 0.12)` base, increases on hover/focus
- Nested items: `rgba(255, 255, 255, 0.1)` for list items

**Color Indicators:**
- Income: Green (`rgba(134, 239, 172, 1)`)
- Expense: Red (`rgba(252, 165, 165, 1)`)
- Bills due (0-3 days): Left border changes to red with background tint

**Animation Principles:**
- Smooth cubic-bezier transitions (0.25, 0.46, 0.45, 0.94)
- Hover states: Subtle translateY(-4px) + shadow enhancement
- Notification slides: slideIn/slideOut from right edge

## Important Constraints

- **No external dependencies**: All JavaScript is vanilla ES6+
- **Browser localStorage only**: No backend/database
- **Manual HTML generation**: Template strings with inline onclick handlers
- **Single global instance**: `tracker` variable must remain accessible for DOM event handlers
- **XSS protection**: Use `escapeHtml()` for all user-generated content in templates
