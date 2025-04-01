// ====================================
// App Controller (script.js)
// Main application logic, connects Data and UI modules
// ====================================

const AppController = (function(dataCtrl, uiCtrl) {

    // --- Private ---

    const DOM = uiCtrl.getDOMstrings();
    const THEME_STORAGE_KEY = 'financeTrackerTheme';
    const BOTTOM_NAV_SELECTOR = '.bottom-nav'; // Selector for the bottom nav container

    // Setup all event listeners
    const setupEventListeners = () => {
        console.log('Setting up event listeners...');

        // Navigation Links (Top Nav for Desktop & Bottom Nav for Mobile)
        document.querySelector('nav').addEventListener('click', handleNavigation); // Top nav
        const bottomNavContainer = document.querySelector(BOTTOM_NAV_SELECTOR);
        if (bottomNavContainer) {
            bottomNavContainer.addEventListener('click', handleNavigation); // Bottom nav
        } else {
             console.warn('Bottom navigation container not found for event listener setup.');
        }

        // Dashboard Buttons
        document.querySelector(DOM.goToFullFormBtn).addEventListener('click', () => {
             // Navigate to the add expense section
             uiCtrl.showSection('add-expense');
             updateBottomNavActiveState('add-expense');
        });

        // Quick Add Form (Dashboard)
        document.querySelector(DOM.quickAddForm).addEventListener('submit', ctrlQuickAddExpense);


        // Add Expense Form (Full)
        document.querySelector(DOM.expenseForm).addEventListener('submit', ctrlAddExpense);
        document.querySelector(DOM.cancelAddBtn).addEventListener('click', () => {
            uiCtrl.showSection('dashboard');
            updateBottomNavActiveState('dashboard');
        });
        document.querySelector(DOM.manageCategoriesBtn).addEventListener('click', () => {
            loadCategoriesForSettings(); // Load categories before showing settings
            uiCtrl.showSection('settings');
            updateBottomNavActiveState('settings');
        });


        // Expenses List (Event delegation for edit/delete/select)
        const expenseListContainer = document.querySelector(DOM.expensesListContainer);
        if (expenseListContainer) {
            expenseListContainer.addEventListener('click', handleExpenseListActions);
        } else {
            console.error('Expense list container not found for event listener setup.');
        }

         // Edit Expense Modal
        document.querySelector(DOM.editExpenseForm).addEventListener('submit', ctrlUpdateExpense);
        document.querySelector(DOM.cancelEditBtn).addEventListener('click', uiCtrl.hideEditForm);


        // Settings Page
        document.querySelector(DOM.addCategoryBtn).addEventListener('click', ctrlAddCategory);
        const categorySettingsList = document.querySelector(DOM.categoryListSettings);
         if (categorySettingsList) {
            categorySettingsList.addEventListener('click', handleCategorySettingsActions);
        } else {
             console.error('Category settings list not found for event listener setup.');
         }

        // Data Management Buttons
        document.querySelector(DOM.exportDataBtn).addEventListener('click', ctrlExportData);
        document.querySelector(DOM.importDataBtn).addEventListener('click', ctrlImportData);
        document.querySelector(DOM.importFile).addEventListener('change', handleFileSelect); // Handle file selection immediately

        // Theme Toggle
        document.querySelector(DOM.toggleThemeBtn).addEventListener('click', toggleTheme);

        // Bulk Actions (Expenses List)
        const selectAllCheckbox = document.querySelector(DOM.selectAllCheckbox);
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', handleSelectAllExpenses);
        }
        const deleteSelectedBtn = document.querySelector(DOM.deleteSelectedBtn);
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', ctrlDeleteSelectedExpenses);
        }

        // Analytics Date Filter Button
        const applyFilterBtn = document.querySelector(DOM.applyDateFilterBtn);
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', ctrlApplyDateFilter);
        }

        // Budget Page Save Button
        const saveBudgetsBtn = document.querySelector(DOM.saveBudgetsBtn);
        if (saveBudgetsBtn) {
            saveBudgetsBtn.addEventListener('click', ctrlSaveBudgets);
        }


         console.log('Event listeners setup complete.');
    };

    // --- Event Handlers ---

    function handleNavigation(event) {
         // Find the closest anchor tag, works for both top and bottom nav
         const link = event.target.closest('a');
         if (!link || !link.getAttribute('href')?.startsWith('#')) return; // Exit if not a valid nav link

         event.preventDefault();
         const targetId = link.getAttribute('href').substring(1);

         // Load data if needed before showing section
         if (targetId === 'expenses-list') {
             loadExpenses();
         } else if (targetId === 'settings') {
              loadCategoriesForSettings();
         } else if (targetId === 'dashboard') {
             loadDashboardData();
         } else if (targetId === 'analytics') {
              loadAnalyticsData(); // Load default analytics view (latest month)
         } else if (targetId === 'budget') {
              loadBudgetPageData(); // Load budget setup and status
         }
         uiCtrl.showSection(targetId);
         updateBottomNavActiveState(targetId); // Update active state for bottom nav
    }

    function handleExpenseListActions(event) {
         const target = event.target;
         const listItem = target.closest('li'); // Find the parent list item
         if (!listItem) return; // Clicked outside a list item

         const expenseId = listItem.dataset.id;

         // Handle Edit/Delete buttons
         if (target.classList.contains('delete-expense-btn')) {
             console.log('Delete button clicked for expense ID:', expenseId);
             ctrlDeleteExpense(expenseId);
         } else if (target.classList.contains('edit-expense-btn')) {
             console.log('Edit button clicked for expense ID:', expenseId);
             ctrlEditExpense(expenseId);
         }
         // Handle Checkbox click
         else if (target.classList.contains('expense-select-checkbox')) {
             console.log('Checkbox clicked for expense ID:', expenseId);
             updateBulkActionControlsState();
         }
    }

     function handleCategorySettingsActions(event) {
         const target = event.target;
         const listItem = target.closest('li');
         if (!listItem) return;

         const categoryId = listItem.dataset.id;

         if (target.classList.contains('delete-category-btn')) {
             console.log('Delete button clicked for category ID:', categoryId);
             ctrlDeleteCategory(categoryId);
         } else if (target.classList.contains('edit-category-btn')) {
             console.log('Edit button clicked for category ID:', categoryId);
             // Implement edit category flow (e.g., show a modal or inline form)
             alert(`Editing category ${categoryId} - implementation needed.`);
         }
     }

    let selectedFile = null;
    function handleFileSelect(event) {
        selectedFile = event.target.files[0];
        const filenameDisplay = document.querySelector(DOM.importFilenameDisplay);
        if (filenameDisplay) {
            filenameDisplay.textContent = selectedFile ? selectedFile.name : 'No file chosen';
        }
        console.log('File selected:', selectedFile ? selectedFile.name : 'None');
    }

    // Removed handleQuickAddClick

    function handleSelectAllExpenses(event) {
        const isChecked = event.target.checked;
        const checkboxes = document.querySelectorAll(`${DOM.expensesListContainer} .expense-select-checkbox`);
        checkboxes.forEach(cb => cb.checked = isChecked);
        updateBulkActionControlsState();
    }


    // --- Control Functions ---

    function ctrlAddExpense(event) {
        event.preventDefault();
        console.log('Add expense form submitted.');
        // 1. Get form input data
        const input = uiCtrl.getExpenseInput(); // Uses the main form

        if (input) {
            // 2. Add the item to the data controller
            const newExpense = dataCtrl.addExpense(input);
            console.log('Expense added via controller:', newExpense);
            // 3. Clear the form fields
            uiCtrl.clearExpenseForm();
            // 4. Update UI (e.g., show success message, maybe refresh list or dashboard)
            uiCtrl.displayMessage('Expense added successfully!', 'success');
            // 5. Optionally navigate back or refresh current view
            loadDashboardData(); // Refresh dashboard after adding
            uiCtrl.showSection('dashboard'); // Go back to dashboard
            updateBottomNavActiveState('dashboard');
            // Or loadExpenses(); uiCtrl.showSection('expenses-list');
        }
    }

    // --- UPDATED: Quick Add Expense Control (Handles Form Submission) ---
    function ctrlQuickAddExpense(event) {
        event.preventDefault(); // Prevent default form submission
        console.log(`Quick add form submitted.`);

        // 1. Get data from quick add form
        const input = uiCtrl.getQuickAddInput();
        if (input === null) return; // Validation failed in UI controller

        // 2. Get today's date in YYYY-MM-DD format
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        // 3. Prepare expense data
        const expenseData = {
            amount: input.amount,
            date: dateString,
            categoryId: input.categoryId,
            description: input.description, // Use description from input
            notes: '' // No notes for quick add
        };

        // 4. Add expense via data controller
        const newExpense = dataCtrl.addExpense(expenseData);

        // 5. Clear quick add form
        uiCtrl.clearQuickAddForm();

        // 6. Provide feedback and refresh UI
        const category = dataCtrl.getCategoryById(input.categoryId);
        const formattedAmount = uiCtrl.formatCurrency ? uiCtrl.formatCurrency(input.amount) : input.amount.toFixed(2);
        uiCtrl.displayMessage(`Quick expense added: ${formattedAmount} for "${input.description}" (${category?.name || 'Unknown'})`, 'success');
        loadDashboardData(); // Refresh dashboard stats and recent expenses
        // Optionally refresh expenses list if user navigates there later
        // loadExpenses();
    }


    function ctrlDeleteExpense(id) {
        if (!id) return;
        // Optional: Confirm deletion
        if (confirm('Are you sure you want to delete this expense?')) {
            // 1. Delete expense from data structure
            const deleted = dataCtrl.deleteExpense(id);
            if (deleted) {
                // 2. Update the UI (remove from list)
                // Easiest way is often to reload the list
                loadExpenses(); // Reload the expenses list view
                loadDashboardData(); // Also refresh dashboard if needed
                uiCtrl.displayMessage('Expense deleted.', 'info');
            } else {
                 uiCtrl.displayMessage('Could not delete expense.', 'error');
            }
        }
    }

     function ctrlEditExpense(id) {
        if (!id) return;
        // 1. Get the expense data from the data controller
        const expenseToEdit = dataCtrl.getExpenseById(id);
        const categories = dataCtrl.getCategories();

        if (expenseToEdit) {
            // 2. Populate the edit form in the UI controller
            uiCtrl.populateEditForm(expenseToEdit, categories);
        } else {
            uiCtrl.displayMessage('Expense not found.', 'error');
        }
    }

     function ctrlUpdateExpense(event) {
        event.preventDefault();
        console.log('Update expense form submitted.');
        // 1. Get the updated data from the edit form
        const input = uiCtrl.getEditExpenseInput();

        if (input && input.id) {
            // 2. Update the expense in the data controller
            const updated = dataCtrl.updateExpense(input.id, input);

            if (updated) {
                // 3. Hide the edit form
                uiCtrl.hideEditForm();
                // 4. Refresh the relevant UI sections
                loadExpenses(); // Refresh the list
                loadDashboardData(); // Refresh the dashboard
                uiCtrl.displayMessage('Expense updated successfully!', 'success');
            } else {
                 uiCtrl.displayMessage('Failed to update expense.', 'error');
            }
        }
    }


    function ctrlAddCategory() {
        console.log('Add category button clicked.');
        // 1. Get input data from UI
        const input = uiCtrl.getNewCategoryInput();

        if (input) {
            // 2. Add category using DataController
            const newCategory = dataCtrl.addCategory(input);
            if (newCategory) {
                // 3. Update UI
                uiCtrl.clearNewCategoryInput();
                loadCategoriesForSettings(); // Refresh the list in settings
                updateCategoryDropdowns(); // Update dropdowns everywhere
                uiCtrl.displayMessage(`Category "${newCategory.name}" added.`, 'success');
            } else {
                 // Error message handled in DataController or UIController
                 uiCtrl.displayMessage('Failed to add category (maybe name exists?).', 'error');
            }
        }
    }

     function ctrlDeleteCategory(id) {
        if (!id) return;
        const category = dataCtrl.getCategoryById(id);
        if (!category) return;

        // Optional: Confirm deletion
        if (confirm(`Are you sure you want to delete the category "${category.name}"? Make sure no expenses are using it.`)) {
            // 1. Delete category from data structure
            const deleted = dataCtrl.deleteCategory(id);
            if (deleted) {
                // 2. Update the UI
                loadCategoriesForSettings(); // Refresh the list in settings
                updateCategoryDropdowns(); // Update dropdowns everywhere
                uiCtrl.displayMessage('Category deleted.', 'info');
            } else {
                 // Error message likely shown by DataController console/UI alert
                 uiCtrl.displayMessage('Could not delete category (check if it\'s default or used by expenses).', 'error');
            }
        }
    }

    function ctrlExportData() {
        console.log('Export data clicked.');
        try {
            const jsonData = dataCtrl.exportData();
            uiCtrl.triggerDownload('finance_tracker_data.json', jsonData); // Corrected filename
            uiCtrl.displayMessage('Data exported successfully.', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            uiCtrl.displayMessage('Failed to export data.', 'error');
        }
    }

    function ctrlImportData() {
        console.log('Import data clicked.');
        if (!selectedFile) {
            uiCtrl.displayMessage('Please select a JSON file to import first.', 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonData = event.target.result;
                const success = dataCtrl.importData(jsonData);
                if (success) {
                    uiCtrl.displayMessage('Data imported successfully! Refreshing application state.', 'success');
                    // Reload necessary data and update UI
                    updateAllViews();
                } else {
                    uiCtrl.displayMessage('Failed to import data. Check file format and console for errors.', 'error');
                }
            } catch (error) {
                console.error('Error reading or parsing import file:', error);
                uiCtrl.displayMessage('Failed to read or parse the import file.', 'error');
            } finally {
                 // Clear the file input and selection state
                 document.querySelector(DOM.importFile).value = ''; // Clear file input
                 selectedFile = null;
                 const filenameDisplay = document.querySelector(DOM.importFilenameDisplay);
                 if (filenameDisplay) filenameDisplay.textContent = 'No file chosen'; // Reset filename display
            }
        };
        reader.onerror = function() {
             console.error('Error reading file:', reader.error);
             uiCtrl.displayMessage('Error reading the selected file.', 'error');
             document.querySelector(DOM.importFile).value = ''; // Clear file input
             selectedFile = null;
              const filenameDisplay = document.querySelector(DOM.importFilenameDisplay);
              if (filenameDisplay) filenameDisplay.textContent = 'No file chosen'; // Reset filename display
        };
        reader.readAsText(selectedFile);
    }

    // --- Bulk Delete Expenses ---
    function ctrlDeleteSelectedExpenses() {
        const selectedIds = uiCtrl.getSelectedExpenseIds();
        if (selectedIds.length === 0) {
            uiCtrl.displayMessage('No expenses selected.', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedIds.length} selected expense(s)?`)) {
            let deletedCount = 0;
            selectedIds.forEach(id => {
                if (dataCtrl.deleteExpense(id)) {
                    deletedCount++;
                }
            });

            if (deletedCount > 0) {
                uiCtrl.displayMessage(`${deletedCount} expense(s) deleted.`, 'success');
                loadExpenses(); // Refresh the list
                loadDashboardData(); // Refresh dashboard stats
            } else {
                uiCtrl.displayMessage('Could not delete selected expenses.', 'error');
            }
            // Reset bulk action controls
            uiCtrl.setSelectAllCheckboxState(false);
            updateBulkActionControlsState(); // Update button state
        }
    }

    // --- Analytics Date Filter ---
    function ctrlApplyDateFilter() {
        const range = uiCtrl.getDateFilterRange();
        if (range) {
            loadAnalyticsData(range.startDate, range.endDate);
        }
    }

    // --- Budget Control ---
    function ctrlSaveBudgets() {
        console.log('Save budgets button clicked.');
        const budgetInputs = uiCtrl.getBudgetInputs();
        if (budgetInputs === null) {
            // Validation failed in UI controller
            return;
        }

        // Get existing budgets to handle deletions
        const existingBudgets = dataCtrl.getBudgets();
        const categories = dataCtrl.getCategories();
        let changesMade = false;

        categories.forEach(category => {
            const categoryId = category.id;
            const newAmount = budgetInputs[categoryId]; // Will be number or undefined

            if (newAmount !== undefined) {
                // Add or Update budget
                if (dataCtrl.setBudgetForCategory(categoryId, newAmount)) {
                    changesMade = true;
                }
            } else if (existingBudgets.hasOwnProperty(categoryId)) {
                // Delete budget if input was empty and budget existed
                if (dataCtrl.deleteBudgetForCategory(categoryId)) {
                    changesMade = true;
                }
            }
        });


        if (changesMade) {
            uiCtrl.displayMessage('Budgets saved successfully!', 'success');
            loadBudgetPageData(); // Refresh budget status display
        } else {
            uiCtrl.displayMessage('No changes detected in budgets.', 'info');
        }
    }


    // --- Data Loading and UI Refresh Functions ---

    // Helper function to find the latest month (YYYY-MM) with expenses
    function getMostRecentMonthWithData(expenses) {
        console.log("Finding most recent month from expenses:", expenses.length);
        if (!expenses || expenses.length === 0) {
            // Default to current month if no expenses exist
            const now = new Date();
            const year = now.getFullYear();
            const month = (now.getMonth() + 1).toString().padStart(2, '0');
            console.log("No expenses, defaulting to current month:", `${year}-${month}`);
            return `${year}-${month}`;
        }

        // Find the latest date string
        let latestDateStr = '0000-00-00';
        expenses.forEach(exp => {
             // Ensure exp.date is valid before comparing
             if (exp.date && typeof exp.date === 'string' && exp.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                 if (exp.date > latestDateStr) {
                    latestDateStr = exp.date;
                 }
             } else {
                 console.warn(`Invalid or missing date found while determining latest month for expense ID ${exp.id}: ${exp.date}`);
             }
        });

         // If no valid dates were found, default to current month
         if (latestDateStr === '0000-00-00') {
             const now = new Date();
             const year = now.getFullYear();
             const month = (now.getMonth() + 1).toString().padStart(2, '0');
             console.log("No valid dates found, defaulting to current month:", `${year}-${month}`);
             return `${year}-${month}`;
         }

        // Extract YYYY-MM from the latest date
        const latestMonthYear = latestDateStr.substring(0, 7); // Extracts YYYY-MM
        console.log("Most recent month with data found:", latestMonthYear);
        return latestMonthYear;
    }

    function updateCategoryDropdowns() {
        const categories = dataCtrl.getCategories();
        uiCtrl.populateCategoryDropdown(categories, 'category'); // Add expense form
        uiCtrl.populateCategoryDropdown(categories, 'edit-category'); // Edit expense form
        uiCtrl.populateCategoryDropdown(categories, 'quick-category'); // Quick add form
        // Add other dropdowns here if needed (e.g., filters)
    }

    function loadExpenses() {
        console.log('Loading expenses for list view...');
        const expenses = dataCtrl.getExpenses();
        const categories = dataCtrl.getCategories();
        // Add sorting/filtering logic here later
        uiCtrl.displayExpenses(expenses.sort((a, b) => new Date(b.date) - new Date(a.date)), categories); // Sort by date desc
    }

     function loadCategoriesForSettings() {
        console.log('Loading categories for settings view...');
        const categories = dataCtrl.getCategories();
        uiCtrl.displayCategoriesSettings(categories);
    }

    function loadDashboardData() {
        console.log('Loading dashboard data...');
        const allExpenses = dataCtrl.getExpenses();
        const categories = dataCtrl.getCategories();
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        // Populate Quick Add Dropdown
        uiCtrl.populateCategoryDropdown(categories, 'quick-category');

        // Determine the target month (most recent with data)
        const targetMonthYear = getMostRecentMonthWithData(allExpenses); // YYYY-MM
        const [targetYear, targetMonth] = targetMonthYear.split('-');

        // Filter expenses for the target month
        const startOfMonth = `${targetYear}-${targetMonth}-01`;
        const endOfMonthDate = new Date(parseInt(targetYear), parseInt(targetMonth), 0); // Day 0 of next month gives last day of target month
        const endOfMonth = `${targetYear}-${targetMonth}-${endOfMonthDate.getDate().toString().padStart(2, '0')}`;

        // Convert start/end month strings to Date objects for reliable comparison
        const startDate = new Date(startOfMonth + 'T00:00:00'); // Add time to avoid timezone issues
        const endDate = new Date(endOfMonth + 'T23:59:59'); // Use end of day

        const expensesCurrentMonth = allExpenses.filter(exp => {
            // Ensure exp.date is valid before creating Date object
            if (!exp.date || typeof exp.date !== 'string' || !exp.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                 console.warn(`Invalid date format for expense ID ${exp.id}: ${exp.date}`);
                 return false;
            }
            const expenseDate = new Date(exp.date + 'T00:00:00');
            // Check if expenseDate is valid before comparison
            if (isNaN(expenseDate.getTime())) {
                 console.warn(`Could not parse date for expense ID ${exp.id}: ${exp.date}`);
                 return false;
            }
            return expenseDate >= startDate && expenseDate <= endDate;
        });
        console.log(`Found ${expensesCurrentMonth.length} expenses for month ${targetMonthYear}`);

        // Calculate stats for the current month
        const totalSpentMonth = expensesCurrentMonth.reduce((sum, exp) => sum + exp.amount, 0);
        const expenseCountMonth = expensesCurrentMonth.length;

        // Find top category by amount for the current month
        const spendingByCategory = expensesCurrentMonth.reduce((acc, exp) => {
            const category = categoryMap.get(exp.categoryId) || { id: 'unknown', name: 'Unknown', color: '#888', icon: '❓' };
            acc[category.id] = acc[category.id] || { name: category.name, totalAmount: 0, color: category.color, icon: category.icon };
            acc[category.id].totalAmount += exp.amount;
            return acc;
        }, {});

        let topCategoryName = 'N/A';
        let topCategoryAmount = 0;
        for (const catId in spendingByCategory) {
            if (spendingByCategory[catId].totalAmount > topCategoryAmount) {
                topCategoryAmount = spendingByCategory[catId].totalAmount;
                topCategoryName = spendingByCategory[catId].name;
            }
        }

        // Display enhanced stats
        uiCtrl.displayDashboardStats({
            targetMonthYear, // Pass the month string for display
            totalSpentMonth,
            expenseCountMonth,
            topCategoryName,
            topCategoryAmount
            /*, budgetStatus */ // Add budget status later
        });

        // Display recent expenses (using all expenses, not just current month)
        const recentExpenses = allExpenses
            .sort((a, b) => {
                 // Add checks for valid dates before sorting
                 const dateA = new Date(a.date);
                 const dateB = new Date(b.date);
                 if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
                 if (isNaN(dateA.getTime())) return 1; // Put invalid dates last
                 if (isNaN(dateB.getTime())) return -1; // Put invalid dates last
                 return dateB - dateA; // Sort by date descending
            })
            .slice(0, 5); // Get the top 5

        // Ensure the recent expenses list container exists and is ready
        // FIX: Use the correct DOM string from uiCtrl
        const recentListElement = document.querySelector(DOM.recentExpensesList);
        if (recentListElement) {
             recentListElement.innerHTML = ''; // Clear previous items
             // Pass all categories map for efficiency if needed, or just the array
             uiCtrl.displayExpenses(recentExpenses, categories); // Reuse display logic
        } else {
            // This warning should not appear now that HTML is fixed
            console.warn("Recent expenses list UL element couldn't be found.");
        }
    }

    // --- UPDATED: Load Analytics Data (with date range) ---
    function loadAnalyticsData(startDateStr = null, endDateStr = null) {
        console.log(`Loading analytics data for range: ${startDateStr || 'Default'} to ${endDateStr || 'Default'}`);
        const allExpenses = dataCtrl.getExpenses();
        const categories = dataCtrl.getCategories();
        const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

        let startDate, endDate, targetPeriodLabel;

        if (startDateStr && endDateStr) {
            // Use provided date range
            startDate = new Date(startDateStr + 'T00:00:00');
            endDate = new Date(endDateStr + 'T23:59:59');
            targetPeriodLabel = `${startDateStr} to ${endDateStr}`;
            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                 uiCtrl.displayMessage("Invalid date range selected.", "error");
                 // Optionally reset to default view or keep previous view? Resetting for now.
                 startDate = null; // Force default calculation below
            } else {
                 // Update UI date inputs to reflect the used range
                 uiCtrl.setAnalyticsDateFilters(startDateStr, endDateStr);
            }
        }

        // If no valid range provided, default to the most recent month with data
        if (!startDate || !endDate) {
            const targetMonthYear = getMostRecentMonthWithData(allExpenses); // YYYY-MM
            const [targetYear, targetMonth] = targetMonthYear.split('-');
            const startOfMonth = `${targetYear}-${targetMonth}-01`;
            const endOfMonthDate = new Date(parseInt(targetYear), parseInt(targetMonth), 0);
            const endOfMonth = `${targetYear}-${targetMonth}-${endOfMonthDate.getDate().toString().padStart(2, '0')}`;
            startDate = new Date(startOfMonth + 'T00:00:00');
            endDate = new Date(endOfMonth + 'T23:59:59');
            targetPeriodLabel = targetMonthYear;
            // Update UI date inputs to reflect the default range
            uiCtrl.setAnalyticsDateFilters(startOfMonth, endOfMonth);
        }

        console.log(`Filtering expenses between ${startDate.toISOString()} and ${endDate.toISOString()}`);

        // Filter expenses based on the final date range
        const filteredExpenses = allExpenses.filter(exp => {
             // Ensure exp.date is valid before creating Date object
             if (!exp.date || typeof exp.date !== 'string' || !exp.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                 return false; // Skip invalid format
             }
             const expenseDate = new Date(exp.date + 'T00:00:00');
             if (isNaN(expenseDate.getTime())) {
                 return false; // Skip invalid date
             }
             return expenseDate >= startDate && expenseDate <= endDate;
        });
        console.log(`Found ${filteredExpenses.length} expenses for the period.`);


        // --- Calculate data for charts ---

        // 1. Spending by Category
        const spendingByCategory = filteredExpenses.reduce((acc, exp) => {
            const category = categoryMap.get(exp.categoryId) || { id: 'unknown', name: 'Unknown', color: '#888', icon: '❓' };
            acc[category.id] = acc[category.id] || { name: category.name, totalAmount: 0, color: category.color, icon: category.icon };
            acc[category.id].totalAmount += exp.amount;
            return acc;
        }, {});
        const categoryChartData = Object.values(spendingByCategory).sort((a, b) => b.totalAmount - a.totalAmount);

        // 2. Spending by Description
        const spendingByDescription = filteredExpenses.reduce((acc, exp) => {
             const descKey = (exp.description || '(No Description)').toLowerCase(); // Group similar descriptions (case-insensitive)
             acc[descKey] = acc[descKey] || { description: exp.description || '(No Description)', totalAmount: 0 };
             acc[descKey].totalAmount += exp.amount;
             return acc;
        }, {});
        // Limit the number of slices for description pie chart for readability (e.g., top 10 + 'Other')
        const sortedDescriptions = Object.values(spendingByDescription).sort((a, b) => b.totalAmount - a.totalAmount);
        const topDescriptions = sortedDescriptions.slice(0, 10);
        const otherAmount = sortedDescriptions.slice(10).reduce((sum, item) => sum + item.totalAmount, 0);
        if (otherAmount > 0) {
            topDescriptions.push({ description: 'Other Descriptions', totalAmount: otherAmount });
        }
        const descriptionChartData = topDescriptions;


        // --- Display Charts ---
        uiCtrl.displayCategoryPieChart(categoryChartData, targetPeriodLabel);
        uiCtrl.displayCategoryBarChart(categoryChartData, targetPeriodLabel);
        uiCtrl.displayDescriptionPieChart(descriptionChartData, targetPeriodLabel);

    }

    // --- Load Budget Page Data ---
    function loadBudgetPageData() {
        console.log('Loading budget page data...');
        const categories = dataCtrl.getCategories();
        const budgets = dataCtrl.getBudgets();
        const allExpenses = dataCtrl.getExpenses();

        // Display the budget setting list
        uiCtrl.displayBudgetSetupList(categories, budgets);

        // Calculate budget status for the current month
        const targetMonthYear = getMostRecentMonthWithData(allExpenses); // Use same logic as dashboard
        const [targetYear, targetMonth] = targetMonthYear.split('-');
        const startOfMonth = `${targetYear}-${targetMonth}-01`;
        const endOfMonthDate = new Date(parseInt(targetYear), parseInt(targetMonth), 0);
        const endOfMonth = `${targetYear}-${targetMonth}-${endOfMonthDate.getDate().toString().padStart(2, '0')}`;
        const startDate = new Date(startOfMonth + 'T00:00:00');
        const endDate = new Date(endOfMonth + 'T23:59:59');

        const expensesCurrentMonth = allExpenses.filter(exp => {
             if (!exp.date || typeof exp.date !== 'string' || !exp.date.match(/^\d{4}-\d{2}-\d{2}$/)) return false;
             const expenseDate = new Date(exp.date + 'T00:00:00');
             if (isNaN(expenseDate.getTime())) return false;
             return expenseDate >= startDate && expenseDate <= endDate;
        });

        // Calculate spending per category for the month
        const spendingByCategory = expensesCurrentMonth.reduce((acc, exp) => {
            acc[exp.categoryId] = (acc[exp.categoryId] || 0) + exp.amount;
            return acc;
        }, {});

        // Prepare data for budget status display
        const budgetStatusData = categories
            .filter(cat => budgets[cat.id] !== undefined && budgets[cat.id] > 0) // Only show categories with a set budget > 0
            .map(cat => {
                const budgetAmount = budgets[cat.id];
                const spentAmount = spendingByCategory[cat.id] || 0;
                const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
                return {
                    name: cat.name,
                    icon: cat.icon,
                    spent: spentAmount,
                    budget: budgetAmount,
                    percentage: percentage,
                    isOverBudget: spentAmount > budgetAmount
                };
            })
            .sort((a, b) => (b.spent / b.budget) - (a.spent / a.budget)); // Sort by percentage used (desc)

        uiCtrl.displayBudgetStatus(budgetStatusData);
    }


    // Function to refresh all relevant views after major data changes (like import)
    function updateAllViews() {
        updateCategoryDropdowns();
        loadCategoriesForSettings();
        loadExpenses();
        loadDashboardData();
        loadAnalyticsData(); // Load analytics data as well
        loadBudgetPageData(); // Load budget data as well
        // Load budget data when implemented
        uiCtrl.showSection('dashboard'); // Go to a default view
        updateBottomNavActiveState('dashboard'); // Ensure nav state is correct
    }

    // --- Bulk Actions ---
    function updateBulkActionControlsState() {
        const selectedIds = uiCtrl.getSelectedExpenseIds();
        const selectedCount = selectedIds.length;
        const totalCheckboxes = document.querySelectorAll(`${DOM.expensesListContainer} .expense-select-checkbox`).length;

        uiCtrl.updateDeleteSelectedButtonState(selectedCount);
        // Update select-all checkbox state (checked if all are selected, indeterminate if some are, unchecked if none)
        const selectAllCheckbox = document.querySelector(DOM.selectAllCheckbox);
        if (selectAllCheckbox) {
            if (selectedCount === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (selectedCount === totalCheckboxes) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }
    }


    // --- Bottom Nav Active State ---
    function updateBottomNavActiveState(activeSectionId) {
        const bottomNavContainer = document.querySelector(BOTTOM_NAV_SELECTOR);
        if (!bottomNavContainer) return; // Don't run if bottom nav doesn't exist

        const bottomNavLinks = bottomNavContainer.querySelectorAll('a');
        bottomNavLinks.forEach(link => {
            // Ensure link has href attribute before checking
            const href = link.getAttribute('href');
            if (href && href === `#${activeSectionId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    function toggleTheme() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        const newTheme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
        console.log(`Theme toggled to: ${newTheme}`);
        // Update button text maybe?
        // document.querySelector(DOM.toggleThemeBtn).textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }

    function loadTheme() {
        const preferredTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light'; // Default to light
        applyTheme(preferredTheme);
        console.log(`Loaded theme: ${preferredTheme}`);
        // Set initial button text maybe?
        // const isDarkMode = preferredTheme === 'dark';
        // document.querySelector(DOM.toggleThemeBtn).textContent = isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }


    // --- Public ---
    return {
        init: function() {
            console.log('Application has started.');
            // Set initial state
            uiCtrl.setInitialDate(); // Set today's date in add form
            updateCategoryDropdowns(); // Populate categories initially

            // Removed bulk add logic

            loadTheme(); // Load saved theme preference
            loadDashboardData(); // Load initial dashboard data
            uiCtrl.showSection('dashboard'); // Set dashboard as active section initially
            updateBottomNavActiveState('dashboard'); // Set initial active state for bottom nav
            setupEventListeners(); // Attach all event listeners
        }
    };

})(DataController, UIController); // Pass modules into the controller

// Initialize the application - WAIT FOR DOM CONTENT LOADED
document.addEventListener('DOMContentLoaded', AppController.init);