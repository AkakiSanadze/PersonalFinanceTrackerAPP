// ====================================
// UI Module (ui.js)
// Handles DOM manipulation and user interface updates
// ====================================

const UIController = (function() {

    // --- Private ---

    // Store DOM elements for quick access
    const DOMstrings = {
        // Navigation
        navLinks: 'nav a',
        sections: 'main > section',
        // Dashboard
        quickStats: '#quick-stats',
        recentExpensesList: '#recent-expenses ul', // Assuming ul inside #recent-expenses
        goToFullFormBtn: '#go-to-full-form-btn',
        quickAddForm: '#quick-add-form',
        quickDescriptionInput: '#quick-description',
        quickAmountInput: '#quick-amount',
        quickCategorySelect: '#quick-category',
        quickAddSubmitBtn: '#quick-add-submit-btn',
        // Add/Edit Expense Form
        expenseForm: '#expense-form',
        editExpenseForm: '#edit-expense-form',
        addAmount: '#amount',
        addDate: '#date',
        addCategory: '#category',
        addDescription: '#description',
        addNotes: '#notes',
        addSubmitBtn: '#expense-form button[type="submit"]',
        cancelAddBtn: '#cancel-add-btn',
        manageCategoriesBtn: '#manage-categories-btn',
        editExpenseModal: '#edit-expense-modal',
        editExpenseId: '#edit-expense-id',
        editAmount: '#edit-amount',
        editDate: '#edit-date',
        editCategory: '#edit-category',
        editDescription: '#edit-description',
        editNotes: '#edit-notes',
        editSubmitBtn: '#edit-expense-form button[type="submit"]',
        cancelEditBtn: '#cancel-edit-btn',
        // Expenses List
        expensesListContainer: '#expense-items', // The <ul> element
        expensesListSection: '#expenses-list',
        filters: '#filters', // Placeholder for filter controls
        pagination: '#pagination', // Placeholder for pagination
        bulkActionsContainer: '#bulk-actions',
        selectAllCheckbox: '#select-all-expenses',
        deleteSelectedBtn: '#delete-selected-expenses-btn',
        // Analytics
        analyticsSection: '#analytics',
        analyticsStartDate: '#analytics-start-date',
        analyticsEndDate: '#analytics-end-date',
        applyDateFilterBtn: '#apply-date-filter-btn',
        categoryPieChartCanvas: '#category-pie-chart', // Renamed
        categoryBarChartCanvas: '#category-bar-chart', // New
        descriptionPieChartCanvas: '#description-pie-chart', // New
        // Budget
        budgetSection: '#budget',
        budgetCategoryList: '#budget-category-list', // For setting budgets
        saveBudgetsBtn: '#save-budgets-btn',
        budgetStatusList: '#budget-status-list', // For displaying status
        // Settings
        settingsSection: '#settings',
        categoryListSettings: '#category-list-settings',
        newCategoryName: '#new-category-name',
        newCategoryColor: '#new-category-color',
        addCategoryBtn: '#add-category-btn',
        exportDataBtn: '#export-data-btn',
        importFile: '#import-file',
        importDataBtn: '#import-data-btn',
        importFilenameDisplay: '#import-filename', // New
        toggleThemeBtn: '#toggle-theme-btn',
        // General
        currentYear: '#current-year',
        mainContent: 'main' // Or specific container if needed
    };

    // Helper to format currency (can be improved)
    const formatCurrency = (amount, currency = 'USD') => {
        // Basic formatting, consider locale and currency symbol later
        // Ensure amount is a number before calling toFixed
        const numAmount = parseFloat(amount);
        return !isNaN(numAmount) ? numAmount.toFixed(2) : '0.00';
    };


     // Helper to format date (can be improved)
    const formatDate = (dateString) => {
        // Assuming dateString is 'YYYY-MM-DD'
        try {
            // Add time component to avoid potential timezone issues with just date string
            const date = new Date(dateString + 'T00:00:00');
            // Check if date is valid
            if (isNaN(date.getTime())) {
                throw new Error("Invalid date value");
            }
            return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return "Invalid Date"; // Fallback for invalid dates
        }
    };

    // --- Public ---
    return {
        getDOMstrings: () => {
            return DOMstrings;
        },

        // Expose formatCurrency for use in other modules if needed
        formatCurrency: formatCurrency,

        // --- Section Management ---
        showSection: (sectionId) => {
            const allSections = document.querySelectorAll(DOMstrings.sections);
            allSections.forEach(section => {
                if (section.id === sectionId) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
            console.log(`Showing section: ${sectionId}`);
        },

        // --- Category Management ---
        populateCategoryDropdown: (categories, selectElementId) => {
            const selectElement = document.getElementById(selectElementId);
            if (!selectElement) {
                 console.warn(`Dropdown element not found: #${selectElementId}`);
                 return;
            }
            // Keep the first option (e.g., "Select Category")
            const firstOption = selectElement.options[0];
            selectElement.innerHTML = ''; // Clear existing options
            if (firstOption && firstOption.value === "") { // Ensure it's the placeholder
                selectElement.appendChild(firstOption); // Add back the default option
            } else {
                 // Add a default placeholder if it wasn't there or was removed
                 const placeholder = document.createElement('option');
                 placeholder.value = "";
                 placeholder.textContent = "Select Category";
                 placeholder.disabled = true; // Optional: make it non-selectable
                 placeholder.selected = true; // Optional: make it selected by default
                 selectElement.appendChild(placeholder);
            }

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                selectElement.appendChild(option);
            });
        },

        displayCategoriesSettings: (categories) => {
            const listContainer = document.getElementById('category-list-settings');
            if (!listContainer) return;
            listContainer.innerHTML = ''; // Clear existing list
            categories.forEach(category => {
                const li = document.createElement('li');
                li.dataset.id = category.id;
                li.innerHTML = `
                    <span style="color: ${category.color}; margin-right: 5px;">${category.icon || '🏷️'}</span>
                    <span>${category.name}</span> <!-- Removed default indicator here -->
                    <div>
                        <button class="edit-category-btn">Edit</button>
                        <button class="delete-category-btn destructive">Delete</button>
                        ${category.isDefault ? '<span style="font-size: 0.8em; color: grey; margin-left: 5px;">(Default)</span>' : ''}
                    </div>
                `;
                // Add event listeners for edit/delete buttons in the main controller
                listContainer.appendChild(li);
            });
        },

        getNewCategoryInput: () => {
            const nameInput = document.getElementById('new-category-name');
            const colorInput = document.getElementById('new-category-color');
            const name = nameInput.value.trim();
            const color = colorInput.value;
            if (!name) {
                alert('Category name cannot be empty.');
                return null;
            }
            return { name, color };
        },

        clearNewCategoryInput: () => {
             document.getElementById('new-category-name').value = '';
             document.getElementById('new-category-color').value = '#cccccc'; // Reset color
        },


        // --- Expense Management ---
        displayExpenses: (expenses, categories) => {
            const listContainer = document.querySelector(DOMstrings.expensesListContainer);
            if (!listContainer) return;
            listContainer.innerHTML = ''; // Clear existing list

            // Show bulk actions only if there are expenses
            UIController.showBulkActions(expenses.length > 0); // Use UIController as 'this' might be different
            UIController.setSelectAllCheckboxState(false); // Uncheck select all
            UIController.updateDeleteSelectedButtonState(0); // Disable delete button

            if (expenses.length === 0) {
                listContainer.innerHTML = '<li>No expenses recorded yet.</li>';
                return;
            }

            // Create a map for quick category lookup
            const categoryMap = new Map(categories.map(cat => [cat.id, cat]));

            expenses.forEach(expense => {
                const category = categoryMap.get(expense.categoryId) || { name: 'Unknown', color: '#888', icon: '❓' };
                const li = document.createElement('li');
                li.dataset.id = expense.id; // Store ID for editing/deleting
                li.innerHTML = `
                    <input type="checkbox" class="expense-select-checkbox" value="${expense.id}">
                    <div>
                        <span style="color: ${category.color}; margin-right: 5px;">${category.icon || '🏷️'}</span>
                        <strong>${expense.description || '(No Description)'}</strong> (${category.name})
                        <br>
                        <small>${formatDate(expense.date)} ${expense.notes ? `- ${expense.notes}` : ''}</small>
                    </div>
                    <div class="expense-item-actions">
                        <span>${formatCurrency(expense.amount)}</span>
                        <button class="edit-expense-btn">Edit</button>
                        <button class="delete-expense-btn destructive">Delete</button> <!-- Added destructive class -->
                    </div>
                `;
                // Add event listeners for edit/delete buttons in the main controller
                listContainer.appendChild(li);
            });
        },

        getExpenseInput: () => {
            const amountInput = document.querySelector(DOMstrings.addAmount);
            const dateInput = document.querySelector(DOMstrings.addDate);
            const categorySelect = document.querySelector(DOMstrings.addCategory);
            const descriptionInput = document.querySelector(DOMstrings.addDescription);
            const notesInput = document.querySelector(DOMstrings.addNotes);

            const amount = parseFloat(amountInput?.value);
            const date = dateInput?.value;
            const categoryId = categorySelect?.value;
            const description = descriptionInput?.value.trim();
            const notes = notesInput?.value.trim();


            // Basic validation (Description is now optional)
            if (isNaN(amount) || amount <= 0) {
                alert('Amount must be a positive number.');
                amountInput?.focus();
                return null;
            }
             if (!date) {
                alert('Please select a date.');
                 dateInput?.focus();
                return null;
            }
             if (!categoryId) {
                alert('Please select a category.');
                 categorySelect?.focus();
                return null;
            }


            return {
                amount: amount,
                date: date, // Keep as YYYY-MM-DD string
                categoryId: categoryId,
                description: description, // Can be empty
                notes: notes
            };
        },

        clearExpenseForm: () => {
            document.querySelector(DOMstrings.expenseForm)?.reset();
             // Set date to today by default after reset
            const dateInput = document.querySelector(DOMstrings.addDate);
             if(dateInput) dateInput.valueAsDate = new Date();
        },

        populateEditForm: (expense, categories) => {
            document.querySelector(DOMstrings.editExpenseId).value = expense.id;
            document.querySelector(DOMstrings.editAmount).value = expense.amount;
            document.querySelector(DOMstrings.editDate).value = expense.date; // Assumes date is YYYY-MM-DD
            document.querySelector(DOMstrings.editDescription).value = expense.description;
            document.querySelector(DOMstrings.editNotes).value = expense.notes || '';

            // Populate and select the correct category
            const categorySelect = document.querySelector(DOMstrings.editCategory);
            UIController.populateCategoryDropdown(categories, 'edit-category'); // Use the specific ID
            categorySelect.value = expense.categoryId;

            // Show the modal (using flex as defined in new CSS)
            const modal = document.querySelector(DOMstrings.editExpenseModal);
            if(modal) modal.style.display = 'flex';
        },

         getEditExpenseInput: () => {
            const id = document.querySelector(DOMstrings.editExpenseId).value;
            const amountInput = document.querySelector(DOMstrings.editAmount);
            const dateInput = document.querySelector(DOMstrings.editDate);
            const categorySelect = document.querySelector(DOMstrings.editCategory);
            const descriptionInput = document.querySelector(DOMstrings.editDescription);
            const notesInput = document.querySelector(DOMstrings.editNotes);

            const amount = parseFloat(amountInput?.value);
            const date = dateInput?.value;
            const categoryId = categorySelect?.value;
            const description = descriptionInput?.value.trim();
            const notes = notesInput?.value.trim();


            // Basic validation (Description is optional)
             if (isNaN(amount) || amount <= 0) {
                alert('Amount must be a positive number.');
                 amountInput?.focus();
                return null;
            }
             if (!date) {
                alert('Please select a date.');
                 dateInput?.focus();
                return null;
            }
             if (!categoryId) {
                alert('Please select a category.');
                 categorySelect?.focus();
                return null;
            }


            return {
                id: id,
                amount: amount,
                date: date,
                categoryId: categoryId,
                description: description, // Can be empty
                notes: notes
            };
        },

         hideEditForm: () => {
             const modal = document.querySelector(DOMstrings.editExpenseModal);
             if(modal) modal.style.display = 'none';
             document.querySelector(DOMstrings.editExpenseForm)?.reset(); // Clear form on hide
        },


        // --- Dashboard ---
        displayDashboardStats: (stats) => {
            const statsContainer = document.querySelector(DOMstrings.quickStats);
            if (!statsContainer) return;
            // Example: stats = { totalSpentMonth: 123.45, topCategoryName: 'Food', expenseCountMonth: 10, targetMonthYear: '2025-03' }
            statsContainer.innerHTML = `
                <p><strong>Stats for ${stats.targetMonthYear || 'Latest Month'}</strong></p>
                <p>Total Spent: ${formatCurrency(stats.totalSpentMonth || 0)}</p>
                <p>Top Category (by amount): ${stats.topCategoryName || 'N/A'} (${formatCurrency(stats.topCategoryAmount || 0)})</p>
                <p>Number of Expenses: ${stats.expenseCountMonth || 0}</p>
                <!-- <p>Budget Usage: ${stats.budgetStatus !== undefined ? stats.budgetStatus + '%' : 'N/A'}</p> -->
            `;
        },
        displayRecentExpenses: (expenses, categories) => {
             // Similar to displayExpenses, but maybe fewer details or limited number
             // For now, just reuse displayExpenses logic but target recent expenses list
             const listContainer = document.querySelector(DOMstrings.recentExpensesList);
             if (!listContainer) {
                 // Need to ensure the target element exists in HTML (e.g., <ul>)
                 console.warn('Recent expenses list container not found.');
                 return;
             }
             // Clear and display (limit number in the main controller if needed)
             listContainer.innerHTML = ''; // Clear before displaying
             if (expenses.length === 0) {
                 listContainer.innerHTML = '<li>No recent expenses.</li>';
                 return;
             }
             // Create a map for quick category lookup
             const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
             expenses.forEach(expense => {
                 const category = categoryMap.get(expense.categoryId) || { name: 'Unknown', color: '#888', icon: '❓' };
                 const li = document.createElement('li');
                 // Don't add checkbox or edit/delete to recent list for simplicity
                 li.innerHTML = `
                     <div>
                         <span style="color: ${category.color}; margin-right: 5px;">${category.icon || '🏷️'}</span>
                         <strong>${expense.description || '(No Description)'}</strong> (${category.name})
                         <br>
                         <small>${formatDate(expense.date)}</small>
                     </div>
                     <div>
                         <span>${formatCurrency(expense.amount)}</span>
                     </div>
                 `;
                 listContainer.appendChild(li);
             });
        },

        // --- NEW: Quick Add Form UI ---
        getQuickAddInput: () => {
            const descriptionInput = document.querySelector(DOMstrings.quickDescriptionInput);
            const amountInput = document.querySelector(DOMstrings.quickAmountInput);
            const categorySelect = document.querySelector(DOMstrings.quickCategorySelect);

            const description = descriptionInput?.value.trim();
            const amount = parseFloat(amountInput?.value);
            const categoryId = categorySelect?.value;

            if (!description) {
                alert('Please enter a description for the quick add expense.');
                descriptionInput?.focus();
                return null;
            }
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid positive amount.');
                amountInput?.focus();
                return null;
            }
             if (!categoryId) {
                alert('Please select a category.');
                categorySelect?.focus();
                return null;
            }

            return { description, amount, categoryId };
        },

        clearQuickAddForm: () => {
            const form = document.querySelector(DOMstrings.quickAddForm);
            form?.reset();
            // Reset category dropdown to default option
            const categorySelect = document.querySelector(DOMstrings.quickCategorySelect);
            if (categorySelect) categorySelect.value = "";
        },

        // --- Analytics ---
        // Keep track of chart instances to destroy before re-rendering
        chartInstances: {},

        displayCategoryPieChart: (categoryData, targetPeriod) => { // Renamed, added targetPeriod
            const ctx = document.querySelector(DOMstrings.categoryPieChartCanvas)?.getContext('2d');
            if (!ctx) {
                console.error('Category pie chart canvas context not found.');
                return;
            }

            // Destroy previous chart instance if it exists
            const chartKey = 'categoryPieChart';
            if (UIController.chartInstances[chartKey]) {
                UIController.chartInstances[chartKey].destroy();
            }

            // Prepare data for Chart.js
            const labels = categoryData.map(item => item.name);
            const data = categoryData.map(item => item.totalAmount);
            const backgroundColors = categoryData.map(item => item.color);

            UIController.chartInstances[chartKey] = new Chart(ctx, {
                type: 'pie', // Or 'doughnut'
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Expenses by Category',
                        data: data,
                        backgroundColor: backgroundColors,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: `Spending by Category (${targetPeriod || 'Selected Period'})`
                        },
                        tooltip: { // Corrected tooltip configuration
                             callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    const value = context.parsed;
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
                                    if (value !== null) {
                                        label += `${formatCurrency(value)} (${percentage})`;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
            console.log('UI: Category Pie chart rendered.');
        },

        displayCategoryBarChart: (categoryData, targetPeriod) => {
            const ctx = document.querySelector(DOMstrings.categoryBarChartCanvas)?.getContext('2d');
            if (!ctx) {
                console.error('Category bar chart canvas context not found.');
                return;
            }
            const chartKey = 'categoryBarChart';
            if (UIController.chartInstances[chartKey]) {
                UIController.chartInstances[chartKey].destroy();
            }

            const totalAmount = categoryData.reduce((sum, item) => sum + item.totalAmount, 0);
            const labels = categoryData.map(item => item.name);
            const data = categoryData.map(item => item.totalAmount);
            const percentages = categoryData.map(item => totalAmount > 0 ? ((item.totalAmount / totalAmount) * 100).toFixed(1) : 0);
            const backgroundColors = categoryData.map(item => item.color);

            UIController.chartInstances[chartKey] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Amount Spent',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: backgroundColors, // Optional: border color
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y', // Horizontal bars
                    responsive: true,
                    plugins: {
                        legend: { display: false }, // Hide legend for bar chart
                        title: {
                            display: true,
                            text: `Spending by Category (${targetPeriod || 'Selected Period'})`
                        },
                        tooltip: {
                             callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.x !== null) {
                                        // Add percentage to tooltip
                                        const index = context.dataIndex;
                                        label += `${formatCurrency(context.parsed.x)} (${percentages[index]}%)`;
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                     scales: {
                        x: {
                            beginAtZero: true,
                            title: { display: true, text: 'Amount' }
                        }
                    }
                }
            });
             console.log('UI: Category Bar chart rendered.');
        },

        displayDescriptionPieChart: (descriptionData, targetPeriod) => {
             const ctx = document.querySelector(DOMstrings.descriptionPieChartCanvas)?.getContext('2d');
             if (!ctx) {
                 console.error('Description pie chart canvas context not found.');
                 return;
             }
             const chartKey = 'descriptionPieChart';
             if (UIController.chartInstances[chartKey]) {
                 UIController.chartInstances[chartKey].destroy();
             }

             const totalAmount = descriptionData.reduce((sum, item) => sum + item.totalAmount, 0);
             const labels = descriptionData.map(item => item.description);
             const data = descriptionData.map(item => item.totalAmount);
             // Generate colors dynamically or use a predefined palette
             const backgroundColors = generateColorPalette(data.length);
             const percentages = descriptionData.map(item => totalAmount > 0 ? ((item.totalAmount / totalAmount) * 100).toFixed(1) : 0);


             UIController.chartInstances[chartKey] = new Chart(ctx, {
                 type: 'pie',
                 data: {
                     labels: labels,
                     datasets: [{
                         label: 'Expenses by Description',
                         data: data,
                         backgroundColor: backgroundColors,
                         hoverOffset: 4
                     }]
                 },
                 options: {
                     responsive: true,
                     plugins: {
                         legend: {
                             position: 'top',
                         },
                         title: {
                             display: true,
                             text: `Spending by Description (${targetPeriod || 'Selected Period'})`
                         },
                          tooltip: { // Corrected tooltip configuration
                             callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    const value = context.parsed;
                                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
                                    // const index = context.dataIndex; // Percentage already calculated if needed
                                    if (value !== null) {
                                        label += `${formatCurrency(value)} (${percentage})`;
                                    }
                                    return label;
                                }
                            }
                        }
                     }
                 }
             });
              console.log('UI: Description Pie chart rendered.');
        },

        // --- Analytics Filters ---
        getDateFilterRange: () => {
            const startDate = document.querySelector(DOMstrings.analyticsStartDate).value;
            const endDate = document.querySelector(DOMstrings.analyticsEndDate).value;
            // Basic validation: ensure end date is not before start date
            if (startDate && endDate && startDate > endDate) {
                alert('End date cannot be before start date.');
                return null;
            }
            return { startDate, endDate };
        },

        setAnalyticsDateFilters: (startDate, endDate) => {
             document.querySelector(DOMstrings.analyticsStartDate).value = startDate;
             document.querySelector(DOMstrings.analyticsEndDate).value = endDate;
        },

        // --- General UI ---
        setInitialDate: () => {
            // Set default date for add expense form to today
            const dateInput = document.querySelector(DOMstrings.addDate);
            if (dateInput) {
                dateInput.valueAsDate = new Date();
            }
        },

        displayMessage: (message, type = 'info') => {
            // Simple alert for now, could be improved with a dedicated message area
            alert(`[${type.toUpperCase()}] ${message}`);
        },

        // --- Data Export/Import ---
        triggerDownload: (filename, text) => {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        },

         // --- Bulk Actions UI ---
         showBulkActions: (show = true) => {
            const container = document.querySelector(DOMstrings.bulkActionsContainer);
            if (container) {
                container.style.display = show ? 'block' : 'none';
            }
        },

        getSelectedExpenseIds: () => {
            const checkboxes = document.querySelectorAll(`${DOMstrings.expensesListContainer} .expense-select-checkbox:checked`);
            return Array.from(checkboxes).map(cb => cb.value);
        },

        setSelectAllCheckboxState: (checked) => {
             const checkbox = document.querySelector(DOMstrings.selectAllCheckbox);
             if (checkbox) {
                 checkbox.checked = checked;
                 checkbox.indeterminate = false; // Reset indeterminate state
             }
        },

        updateDeleteSelectedButtonState: (selectedCount) => {
             const button = document.querySelector(DOMstrings.deleteSelectedBtn);
             if (button) {
                 button.disabled = selectedCount === 0;
                 button.textContent = selectedCount > 0 ? `Delete Selected (${selectedCount})` : 'Delete Selected';
             }
        },

        // --- Budget ---
        displayBudgetSetupList: (categories, budgets) => {
            const listContainer = document.querySelector(DOMstrings.budgetCategoryList);
            if (!listContainer) return;
            listContainer.innerHTML = ''; // Clear list

            categories.forEach(category => {
                const budgetAmount = budgets[category.id] || ''; // Get existing budget or empty string
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${category.icon || '🏷️'} ${category.name}:</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="No budget set"
                        value="${budgetAmount}"
                        data-category-id="${category.id}"
                        class="budget-input"
                    >
                `;
                listContainer.appendChild(li);
            });
        },

        getBudgetInputs: () => {
            const inputs = document.querySelectorAll(`${DOMstrings.budgetCategoryList} .budget-input`);
            const budgets = {};
            let isValid = true;
            inputs.forEach(input => {
                const categoryId = input.dataset.categoryId;
                const amount = input.value.trim();
                if (amount) { // Only save if an amount is entered
                    const parsedAmount = parseFloat(amount);
                    if (isNaN(parsedAmount) || parsedAmount < 0) {
                        alert(`Invalid budget amount entered for category ID ${categoryId}. Please enter a positive number or leave blank.`);
                        input.focus();
                        isValid = false;
                    } else {
                        budgets[categoryId] = parsedAmount;
                    }
                } else {
                     // If input is empty, consider it as deleting the budget for that category
                     // We handle the actual deletion/update in the controller based on this object
                     // Mark for deletion or simply don't include? Let's not include.
                }
            });
            return isValid ? budgets : null;
        },

        displayBudgetStatus: (budgetStatusData) => {
            // budgetStatusData = [ { name, icon, spent, budget, percentage, isOverBudget }, ... ]
            const listContainer = document.querySelector(DOMstrings.budgetStatusList);
            if (!listContainer) return;
            listContainer.innerHTML = ''; // Clear list

            if (budgetStatusData.length === 0) {
                listContainer.innerHTML = '<li>No budgets set or no spending this period.</li>';
                return;
            }

            budgetStatusData.forEach(item => {
                const li = document.createElement('li');
                const percentage = item.percentage > 100 ? 100 : item.percentage; // Cap progress bar at 100% visually
                const overBudgetClass = item.isOverBudget ? 'over-budget' : '';
                li.innerHTML = `
                    <div class="budget-item-details">
                        <span>${item.icon || '🏷️'} ${item.name}</span>
                        <small>Spent: ${formatCurrency(item.spent)} / Budget: ${formatCurrency(item.budget)}</small>
                    </div>
                    <progress class="${overBudgetClass}" max="100" value="${percentage.toFixed(1)}"></progress>
                    <span style="margin-left: 5px; font-size: 0.9em; width: 45px; text-align: right;">${item.percentage.toFixed(1)}%</span>
                `;
                listContainer.appendChild(li);
            });
        }


    };

})(); // Immediately invoke the function expression


// Helper function to generate a color palette (simple version)
function generateColorPalette(count) {
    const colors = [];
    // Basic HSL color generation - can be improved
    for (let i = 0; i < count; i++) {
        const hue = (i * (360 / count)) % 360;
        colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    return colors;
}