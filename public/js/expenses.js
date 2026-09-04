//Currency Helper
function getCurrency() {
    return localStorage.getItem('currency') || '৳';
}

function formatMoney(amount) {
    return getCurrency() + ' ' + Number(amount || 0).toLocaleString();
}

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('currencySelect');
    if (select) {
        select.value = getCurrency();
        select.addEventListener('change', () => {
            localStorage.setItem('currency', select.value);
            location.reload();
        });
    }
});

// Check if logged in
if (!getToken()) {
    window.location.href = 'index.html';
}

// Show user name
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userNameEl = document.getElementById('userName');
if (userNameEl) {
    userNameEl.textContent = user.name || 'User';
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        removeToken();
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

// Set today's date as default
const dateInput = document.getElementById('date');
if (dateInput) {
    dateInput.valueAsDate = new Date();
}

// Load everything on page load
window.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadExpenses();
    loadSummary();
    loadChart();
});

// EXPENSES
async function loadExpenses(query = '') {
    try {
        const expenses = await apiRequest(`/expenses${query}`);
        const tbody = document.getElementById('expenses-body');
        tbody.innerHTML = '';

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No expenses found</td></tr>';
            document.getElementById('total-count').textContent = '0';
            return;
        }

        expenses.forEach(exp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${exp.date ? exp.date.split('T')[0] : '-'}</td>
                <td>${exp.description || '-'}</td>
                <td>${exp.category_name || 'Uncategorized'}</td>
                <td>${formatMoney(exp.amount)}</td>
                <td>
                    <button class="delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('total-count').textContent = expenses.length;
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
}

// Add Expense
document.getElementById('expense-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const amount = document.getElementById('amount').value.trim();
    const description = document.getElementById('description').value.trim();
    const date = document.getElementById('date').value;
    const category_id = document.getElementById('category').value || null;

    if (!amount) {
        alert('Amount is required');
        return;
    }

    if (isNaN(amount)) {
        alert('Amount must be a number');
        return;
    }

    if (Number(amount) <= 0) {
        alert('Amount must be greater than 0');
        return;
    }

    if (!date) {
        alert('Date is required');
        return;
    }

    const body = {
        amount: Number(amount),
        description: description || null,
        date,
        category_id
    };

    try {
        await apiRequest('/expenses', 'POST', body);
        alert('Expense added successfully!');
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
        loadExpenses();
        loadSummary();
        loadChart();
    } catch (err) {
        alert(err.message || 'Failed to add expense');
    }
});

// Delete Expense
async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
        await apiRequest(`/expenses/${id}`, 'DELETE');
        loadExpenses();
        loadSummary();
        loadChart();
    } catch (err) {
        alert(err.message);
    }
}

// Filter
document.getElementById('filter-btn').addEventListener('click', () => {
    const start = document.getElementById('start-date').value;
    const end = document.getElementById('end-date').value;
    const category = document.getElementById('filter-category').value;
    const search = document.getElementById('search').value;

    let query = '?';
    if (start) query += `startDate=${start}&`;
    if (end) query += `endDate=${end}&`;
    if (category) query += `category_id=${category}&`;
    if (search) query += `search=${encodeURIComponent(search)}&`;

    loadExpenses(query);
});

// Reset Filter
document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    document.getElementById('filter-category').value = '';
    document.getElementById('search').value = '';
    loadExpenses();
});

// Load Summary
async function loadSummary() {
    try {
        const total = await apiRequest('/reports/total');
        document.getElementById('total-spent').textContent = formatMoney(total.total || 0);

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const monthData = await apiRequest(`/reports/total?month=${month}&year=${year}`);
        document.getElementById('month-spent').textContent = formatMoney(monthData.total || 0);
    } catch (err) {
        console.error(err);
    }
}

// CHART
let expenseChart = null;

async function loadChart(month = null, year = null) {
    try {
        const now = new Date();
        const selectedMonth = month || (now.getMonth() + 1);
        const selectedYear = year || now.getFullYear();

        const monthSelect = document.getElementById('chart-month');
        const yearSelect = document.getElementById('chart-year');
        if (monthSelect) monthSelect.value = selectedMonth;
        if (yearSelect) yearSelect.value = selectedYear;

        const data = await apiRequest(`/reports/monthly-summary?month=${selectedMonth}&year=${selectedYear}`);

        const labels = [];
        const amounts = [];

        if (data && data.length > 0) {
            data.forEach(item => {
                labels.push(item.category_name || 'Uncategorized');
                amounts.push(Number(item.total_amount) || 0);
            });
        } else {
            labels.push('No Data');
            amounts.push(0);
        }

        const canvas = document.getElementById('expenseChart');
        if (!canvas) {
            console.error('Canvas not found');
            return;
        }

        const ctx = canvas.getContext('2d');

        if (expenseChart) {
            expenseChart.destroy();
            expenseChart = null;
        }

        const currency = getCurrency();

        expenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount (' + currency + ')',
                    data: amounts,
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c',
                        '#4facfe', '#43e97b', '#fa709a', '#fee140',
                        '#a18cd1', '#fbc2eb'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: `Expenses - ${getMonthName(selectedMonth)} ${selectedYear}`,
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatMoney(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return currency + ' ' + value;
                            }
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error('Chart Error:', err);
    }
}

function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
}

// Chart Filter Button
const chartFilterBtn = document.getElementById('chart-filter-btn');
if (chartFilterBtn) {
    chartFilterBtn.addEventListener('click', () => {
        const month = document.getElementById('chart-month').value;
        const year = document.getElementById('chart-year').value;
        loadChart(month, year);
    });
}