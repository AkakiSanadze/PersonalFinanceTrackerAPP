# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure setup (`index.html`, `style.css`, `data.js`, `ui.js`, `script.js`).
- Basic HTML layout with sections for Dashboard, Add Expense, Expenses List, Analytics, Budget, and Settings.
- Basic CSS styling for layout and elements.
- `DataController` module (`data.js`) for handling localStorage interactions (Expenses, Categories). Includes basic CRUD operations for expenses and categories, default categories, and data export/import structure.
- `UIController` module (`ui.js`) for handling DOM manipulation. Includes functions for showing sections, populating dropdowns, displaying expenses/categories, handling forms (add/edit), and basic messaging/download triggers.
- `AppController` module (`script.js`) to connect Data and UI modules. Includes event listeners setup, navigation handling, and control functions for adding, editing, deleting expenses and categories, and data export/import.
- Basic SPA navigation logic within `index.html` and refined in `script.js`.
- Default date set to today in the 'Add Expense' form.
- Initial dashboard data loading (total spent, top category placeholder, recent expenses).
- Edit Expense functionality with a modal form.
- Category management (add/delete) in the Settings section.
- Data export (JSON) and import (JSON) functionality.
- This `CHANGELOG.md` file.
- Functionality in `script.js` (`ctrlBulkAddExpenses`) to parse and add a predefined list of expenses (provided in user feedback) to the "Other" category on initial load if no expenses exist. Includes Georgian month name parsing and basic error handling for the bulk data.
- Dark/Light Theme Toggle: Implemented theme switching functionality.
    - Added dark mode styles to `style.css`.
    - Added JavaScript logic in `script.js` to toggle a `dark-mode` class on the body.
    - Theme preference is now saved to `localStorage` and loaded on application startup.
- Bulk Expense Deletion: Added checkboxes to the Expenses List page, a "Select All" checkbox, and a "Delete Selected" button to allow deleting multiple expenses at once. Implemented corresponding UI and logic updates.
- **Analytics Enhancements**:
    - Added Start/End Date filters to the Analytics page.
    - Implemented logic to filter expense data based on the selected date range (defaulting to the most recent month with data).
    - Added a horizontal Bar Chart showing spending per category (Amount + Percentage in tooltip).
    - Added a Pie Chart showing spending per description (Top 10 + Other, Amount + Percentage in tooltip).
    - Renamed original category pie chart canvas ID.
    - Updated HTML, CSS, and JS (`ui.js`, `script.js`) accordingly.
- **Mobile Navigation:** Implemented the bottom navigation bar for mobile views.
    - Added HTML structure for the bottom bar in `index.html`.
    - Added JavaScript logic in `script.js` to handle clicks on the bottom navigation and update the `.active` state indicator.

### Changed
- **UI Overhaul**: Refactored CSS (`style.css`) for a modern, minimalist, mobile-first design inspired by iOS aesthetics.
    - Implemented mobile-first principles with base styles for small screens and media queries for larger ones.
    - Introduced a cleaner color palette (whites, light grays, blue accent).
    - Utilized system fonts for an iOS feel.
    - Styled sections as rounded cards.
    - Simplified form element appearance.
    - Updated HTML (`index.html`) navigation structure (removed mobile top nav list, added desktop links) and button classes.
    - Updated JavaScript (`ui.js`, `script.js`) to handle section visibility using `.active` CSS class instead of inline styles.
    - Adjusted modal display logic in JS to work with new CSS.
- **Dashboard/Analytics Data Scope**: Changed Dashboard stats and default Analytics view to show data for the **most recent month containing expense data** instead of the current calendar month. UI updated to reflect the target month/period.
- **Quick Add Feature**: Replaced category buttons with a form including Description (required), Amount, and Category dropdown for more flexibility. Updated HTML, CSS, and JS accordingly.
- **Category Management**: Default categories can now be edited (name, color, icon) and deleted (if not used by expenses). Updated `data.js` logic and `ui.js` settings display.
- **Default Data**: Removed the automatic bulk addition of sample expense data on initial load. The application now starts empty.
- Made the description field in the main "Add Expense" form optional.

### Fixed
- Removed residual inline JavaScript event listener from `index.html` that was causing a `showSection is not defined` error after UI refactoring. Button event handling is now correctly managed in `script.js`.
- Removed inline `style="display: none;"` from `<section>` elements and the edit modal in `index.html` to rely solely on CSS classes (`.active`) for visibility control, fixing an issue where sections remained hidden after the UI refactor.
- **Dashboard Data Bug:** Corrected the date filtering logic in `script.js` (using Date objects for comparison, adding checks for invalid dates) to ensure accurate statistics (Total Spent, Expense Count, Top Category) are displayed for the most recent month with data. Fixed `formatCurrency` call in quick add message.
- **DOM Readiness:** Wrapped `AppController.init()` in a `DOMContentLoaded` event listener in `script.js` to prevent errors from scripts running before the HTML is fully parsed (fixing bottom nav and potentially other element lookup issues).
- **Recent Expenses HTML:** Added the missing `<ul>` element and corrected structure for the recent expenses list within the dashboard section in `index.html`, resolving a console warning.
- **Expense List Alignment:** Adjusted CSS flexbox properties for `#expense-items li` to improve alignment of checkbox, content, and action buttons.
- **Analytics Chart Tooltips:** Updated Chart.js tooltip configuration in `ui.js` for pie charts to clearly display amount and percentage.
- **Analytics Filters Layout:** Centered the date filter inputs and button using CSS flexbox.
- **Desktop Navigation:** Changed desktop top navigation links to display vertically instead of horizontally via CSS.
- **Settings Page Layout:** Improved layout and styling of Settings page sections (Add Category, Data Management, Theme). Implemented a custom-styled file input button for data import.
- **Data Export Filename:** Corrected the suggested filename during data export to include the `.json` extension.

### Added
- **Budget Planning (Phase 1):**
    - Implemented UI for setting monthly budget amounts per category on the Budget page.
    - Added data handling in `data.js` to save/retrieve budgets from localStorage.
    - Implemented logic in `script.js` to load budget data, save user inputs, and calculate/display budget status (spent vs. budget) for the current month.
    - Added progress bars to visualize budget consumption.
- **PWA Configuration:** Added a `manifest.json` file and linked it in `index.html` to enable basic Progressive Web App features, aiming to improve the "Add to Home Screen" behavior (persistent storage, icon display).
- **Favicon & iOS Home Screen:** Added `favicon.png` as the browser favicon and the icon for iOS "Add to Home Screen" functionality via `<link>` tags in `index.html`. Added related meta tags for iOS web app appearance.