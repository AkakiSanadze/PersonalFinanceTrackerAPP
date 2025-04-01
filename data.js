// ====================================
// Data Module (data.js)
// Handles data storage and retrieval using localStorage
// ====================================

const DataController = (function() {

    // --- Private ---

    const STORAGE_KEYS = {
        expenses: 'financeTrackerExpenses',
        categories: 'financeTrackerCategories',
        budgets: 'financeTrackerBudgets' // Add later
    };

    // Helper function to get data from localStorage
    const getData = (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    };

    // Helper function to save data to localStorage
    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };

    // Simple ID generator (replace with UUID later if needed)
    const generateId = () => {
        return '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    };

    // Initial default categories (can be modified by user)
    const defaultCategories = [
        { id: generateId(), name: 'Food', color: '#FF6384', icon: '🍔', isDefault: true },
        { id: generateId(), name: 'Transport', color: '#36A2EB', icon: '🚗', isDefault: true },
        { id: generateId(), name: 'Utilities', color: '#FFCE56', icon: '💡', isDefault: true },
        { id: generateId(), name: 'Entertainment', color: '#4BC0C0', icon: '🎬', isDefault: true },
        { id: generateId(), name: 'Other', color: '#9966FF', icon: '❓', isDefault: true }
    ];

    // Initialize categories if they don't exist
    if (!localStorage.getItem(STORAGE_KEYS.categories)) {
        saveData(STORAGE_KEYS.categories, defaultCategories);
    }

    // --- Public ---

    return {
        // --- Expenses ---
        getExpenses: () => {
            return getData(STORAGE_KEYS.expenses);
        },

        addExpense: (expenseData) => {
            const expenses = getData(STORAGE_KEYS.expenses);
            const newExpense = {
                id: generateId(),
                amount: parseFloat(expenseData.amount),
                date: expenseData.date, // Store as string YYYY-MM-DD for simplicity
                categoryId: expenseData.categoryId,
                description: expenseData.description.trim(),
                notes: expenseData.notes ? expenseData.notes.trim() : '',
                createdAt: new Date().toISOString()
            };
            expenses.push(newExpense);
            saveData(STORAGE_KEYS.expenses, expenses);
            console.log('Expense added:', newExpense);
            return newExpense;
        },

        updateExpense: (id, updatedData) => {
            let expenses = getData(STORAGE_KEYS.expenses);
            let updated = false;
            expenses = expenses.map(expense => {
                if (expense.id === id) {
                    updated = true;
                    return {
                        ...expense,
                        amount: parseFloat(updatedData.amount),
                        date: updatedData.date,
                        categoryId: updatedData.categoryId,
                        description: updatedData.description.trim(),
                        notes: updatedData.notes ? updatedData.notes.trim() : ''
                        // createdAt remains the same
                    };
                }
                return expense;
            });
            if (updated) {
                saveData(STORAGE_KEYS.expenses, expenses);
                console.log('Expense updated:', id);
            } else {
                 console.warn('Expense not found for update:', id);
            }
            return updated;
        },

        deleteExpense: (id) => {
            let expenses = getData(STORAGE_KEYS.expenses);
            const initialLength = expenses.length;
            expenses = expenses.filter(expense => expense.id !== id);
            if (expenses.length < initialLength) {
                saveData(STORAGE_KEYS.expenses, expenses);
                console.log('Expense deleted:', id);
                return true;
            }
             console.warn('Expense not found for deletion:', id);
            return false;
        },

        getExpenseById: (id) => {
            const expenses = getData(STORAGE_KEYS.expenses);
            return expenses.find(expense => expense.id === id);
        },

        // --- Categories ---
        getCategories: () => {
            return getData(STORAGE_KEYS.categories);
        },

        addCategory: (categoryData) => {
            const categories = getData(STORAGE_KEYS.categories);
            // Prevent duplicate names (case-insensitive check)
            if (categories.some(cat => cat.name.toLowerCase() === categoryData.name.toLowerCase())) {
                console.warn(`Category "${categoryData.name}" already exists.`);
                return null; // Indicate failure
            }
            const newCategory = {
                id: generateId(),
                name: categoryData.name.trim(),
                color: categoryData.color || '#cccccc', // Default color
                icon: categoryData.icon || '🏷️', // Default icon
                isDefault: false // User-added categories are not default
            };
            categories.push(newCategory);
            saveData(STORAGE_KEYS.categories, categories);
            console.log('Category added:', newCategory);
            return newCategory;
        },

        updateCategory: (id, updatedData) => {
            let categories = getData(STORAGE_KEYS.categories);
             // Prevent duplicate names (case-insensitive check, excluding self)
            if (categories.some(cat => cat.id !== id && cat.name.toLowerCase() === updatedData.name.toLowerCase())) {
                console.warn(`Another category with the name "${updatedData.name}" already exists.`);
                return false; // Indicate failure
            }
            let updated = false;
            categories = categories.map(category => {
                if (category.id === id) {
                    // Allow editing all fields except isDefault
                    updated = true;
                    return {
                        ...category,
                        name: updatedData.name.trim(),
                        color: updatedData.color || category.color,
                        icon: updatedData.icon || category.icon
                    };
                }
                return category;
            });
             if (updated) {
                saveData(STORAGE_KEYS.categories, categories);
                console.log('Category updated:', id);
            } else {
                 console.warn('Category not found for update:', id);
            }
            return updated;
        },

        deleteCategory: (id) => {
            let categories = getData(STORAGE_KEYS.categories);
            const categoryToDelete = categories.find(cat => cat.id === id);

            if (!categoryToDelete) {
                 console.warn('Category not found for deletion:', id);
                return false; // Not found
            }
            // Removed block preventing deletion of default categories

            // Check if category is used by any expense
            const expenses = getData(STORAGE_KEYS.expenses);
            if (expenses.some(exp => exp.categoryId === id)) {
                console.warn(`Cannot delete category "${categoryToDelete.name}" as it is used by expenses.`);
                // Optionally: Ask user to reassign expenses or delete them first
                return false;
            }

            categories = categories.filter(category => category.id !== id);
            saveData(STORAGE_KEYS.categories, categories);
            console.log('Category deleted:', id);
            return true;
        },

        getCategoryById: (id) => {
            const categories = getData(STORAGE_KEYS.categories);
            return categories.find(category => category.id === id);
        },

        // --- Budgets (Placeholders) ---
        getBudgets: () => {
            // return getData(STORAGE_KEYS.budgets);
            console.warn('Budget functionality not yet implemented.');
            return [];
        },
        addBudget: (budgetData) => {
             console.warn('Budget functionality not yet implemented.');
        },
        updateBudget: (id, updatedData) => {
             console.warn('Budget functionality not yet implemented.');
        },
        deleteBudget: (id) => {
             console.warn('Budget functionality not yet implemented.');
        },

        // --- Data Export/Import ---
        exportData: () => {
            const data = {
                expenses: getData(STORAGE_KEYS.expenses),
                categories: getData(STORAGE_KEYS.categories),
                budgets: getData(STORAGE_KEYS.budgets) // Include budgets when implemented
            };
            return JSON.stringify(data, null, 2); // Pretty print JSON
        },

        importData: (jsonData) => {
            try {
                const data = JSON.parse(jsonData);
                if (data.expenses && Array.isArray(data.expenses)) {
                    saveData(STORAGE_KEYS.expenses, data.expenses);
                }
                if (data.categories && Array.isArray(data.categories)) {
                    // Maybe merge instead of overwrite? For now, overwrite.
                    saveData(STORAGE_KEYS.categories, data.categories);
                }
                 if (data.budgets && Array.isArray(data.budgets)) {
                    saveData(STORAGE_KEYS.budgets, data.budgets);
                }
                console.log('Data imported successfully.');
                return true;
            } catch (error) {
                console.error('Error importing data:', error);
                return false;
            }
        }
    };

})(); // Immediately invoke the function expression