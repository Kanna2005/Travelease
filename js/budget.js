document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const expenseForm = document.getElementById('expenseForm');
    const expenseTableBody = document.getElementById('expenseTableBody');
    const expenseTotal = document.getElementById('expenseTotal');
    const totalBudgetInput = document.getElementById('totalBudget');
    const totalSpentElement = document.getElementById('totalSpent');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const budgetProgress = document.getElementById('budgetProgress');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const convertBtn = document.getElementById('convertBtn');
    const convertedAmount = document.getElementById('convertedAmount');
    
    // Initialize expenses array from localStorage or empty array
    let expenses = JSON.parse(localStorage.getItem('indiaTripExpenses')) || [];
    let totalBudget = parseFloat(localStorage.getItem('indiaTripBudget')) || 0;
    
    // Currency exchange rates (simplified - in real app use API)
    const exchangeRates = {
        USD: 83.5,
        EUR: 89.2,
        GBP: 105.3,
        AUD: 55.8,
        CAD: 61.2,
        SGD: 61.5
    };
    
    // Initialize charts
    let categoryChart, dailyChart;
    
    // Initialize the page
    function init() {
        totalBudgetInput.value = totalBudget;
        renderExpenseTable();
        updateBudgetSummary();
        initCharts();
    }
    
    // Render expense table
    function renderExpenseTable() {
        expenseTableBody.innerHTML = '';
        let total = 0;
        
        expenses.forEach((expense, index) => {
            total += parseFloat(expense.amount);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(expense.date)}</td>
                <td>${expense.category}</td>
                <td>${expense.description}</td>
                <td>${parseFloat(expense.amount).toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            expenseTableBody.appendChild(row);
        });
        
        expenseTotal.textContent = `${total.toFixed(2)} INR`;
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteExpense(index);
            });
        });
    }
    
    // Add new expense
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const description = document.getElementById('expenseDescription').value;
        
        if (!date || !category || isNaN(amount) || amount <= 0) {
            alert('Please fill all required fields with valid data');
            return;
        }
        
        const newExpense = {
            date,
            category,
            amount,
            description: description || 'No description'
        };
        
        expenses.push(newExpense);
        saveExpenses();
        renderExpenseTable();
        updateBudgetSummary();
        updateCharts();
        
        // Reset form
        expenseForm.reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    });
    
    // Delete expense
    function deleteExpense(index) {
        if (index >= 0 && index < expenses.length) {
            expenses.splice(index, 1);
            saveExpenses();
            renderExpenseTable();
            updateBudgetSummary();
            updateCharts();
        }
    }
    
    // Clear all expenses
    clearAllBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete all expenses?')) {
            expenses = [];
            saveExpenses();
            renderExpenseTable();
            updateBudgetSummary();
            updateCharts();
        }
    });
    
    // Save expenses to localStorage
    function saveExpenses() {
        localStorage.setItem('indiaTripExpenses', JSON.stringify(expenses));
    }
    
    // Update budget summary
    function updateBudgetSummary() {
        const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        totalSpentElement.textContent = totalSpent.toFixed(2);
        
        totalBudget = parseFloat(totalBudgetInput.value) || 0;
        localStorage.setItem('indiaTripBudget', totalBudget.toString());
        
        const remaining = totalBudget - totalSpent;
        remainingBudgetElement.textContent = remaining.toFixed(2);
        
        // Update progress bar
        if (totalBudget > 0) {
            const percentage = (totalSpent / totalBudget) * 100;
            budgetProgress.style.width = `${Math.min(percentage, 100)}%`;
            
            if (percentage > 90) {
                budgetProgress.className = 'progress-bar bg-danger';
            } else if (percentage > 70) {
                budgetProgress.className = 'progress-bar bg-warning';
            } else {
                budgetProgress.className = 'progress-bar bg-success';
            }
        } else {
            budgetProgress.style.width = '0%';
            budgetProgress.className = 'progress-bar bg-success';
        }
    }
    
    // Currency conversion
    convertBtn.addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('amount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        const rate = exchangeRates[fromCurrency];
        if (!rate) {
            alert('Invalid currency selected');
            return;
        }
        
        const converted = amount * rate;
        convertedAmount.textContent = `${converted.toFixed(2)} INR`;
    });
    
    // Initialize charts
    function initCharts() {
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        const dailyCtx = document.getElementById('dailyChart').getContext('2d');
        
        categoryChart = new Chart(categoryCtx, {
            type: 'pie',
            data: getCategoryChartData(),
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Expense by Category'
                    }
                }
            }
        });
        
        dailyChart = new Chart(dailyCtx, {
            type: 'bar',
            data: getDailyChartData(),
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Daily Expenses'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + ' INR';
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update charts
    function updateCharts() {
        if (categoryChart && dailyChart) {
            categoryChart.data = getCategoryChartData();
            categoryChart.update();
            
            dailyChart.data = getDailyChartData();
            dailyChart.update();
        }
    }
    
    // Get data for category chart
    function getCategoryChartData() {
        const categories = {};
        
        expenses.forEach(expense => {
            if (!categories[expense.category]) {
                categories[expense.category] = 0;
            }
            categories[expense.category] += parseFloat(expense.amount);
        });
        
        const labels = Object.keys(categories);
        const data = Object.values(categories);
        
        // If no expenses, show empty state
        if (labels.length === 0) {
            return {
                labels: ['No expenses'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#e9ecef']
                }]
            };
        }
        
        return {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                ]
            }]
        };
    }
    
    // Get data for daily chart
    function getDailyChartData() {
        const dailyExpenses = {};
        
        expenses.forEach(expense => {
            if (!dailyExpenses[expense.date]) {
                dailyExpenses[expense.date] = 0;
            }
            dailyExpenses[expense.date] += parseFloat(expense.amount);
        });
        
        // Sort dates
        const sortedDates = Object.keys(dailyExpenses).sort();
        const sortedAmounts = sortedDates.map(date => dailyExpenses[date]);
        
        // If no expenses, show empty state
        if (sortedDates.length === 0) {
            return {
                labels: ['No data'],
                datasets: [{
                    label: 'Daily Expenses (INR)',
                    data: [0],
                    backgroundColor: '#e9ecef'
                }]
            };
        }
        
        return {
            labels: sortedDates,
            datasets: [{
                label: 'Daily Expenses (INR)',
                data: sortedAmounts,
                backgroundColor: '#36A2EB'
            }]
        };
    }
    
    // Helper function to format date
    function formatDate(dateString) {
        try {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (error) {
            return dateString; // Return original if date parsing fails
        }
    }
    
    // Update budget when changed
    totalBudgetInput.addEventListener('change', updateBudgetSummary);
    totalBudgetInput.addEventListener('input', updateBudgetSummary);
    
    // Set default date to today
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    
    // Initialize the app
    init();
});