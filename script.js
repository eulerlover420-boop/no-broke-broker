// Financial Tracker Application
class FinancialTracker {
    constructor() {
        this.transactions = this.loadFromStorage('transactions') || [];
        this.bills = this.loadFromStorage('bills') || [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateBalance();
        this.renderTransactions();
        this.renderBills();
        this.checkBillReminders();
    }

    setupEventListeners() {
        // Transaction form
        document.getElementById('transactionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTransaction();
        });

        // Bill form
        document.getElementById('billForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addBill();
        });
    }

    // Transaction Management
    addTransaction() {
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;

        if (!description || !amount || !type) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        const transaction = {
            id: Date.now(),
            description,
            amount,
            type,
            date: new Date().toISOString()
        };

        this.transactions.unshift(transaction);
        this.saveToStorage('transactions', this.transactions);
        this.updateBalance();
        this.renderTransactions();
        
        // Reset form
        document.getElementById('transactionForm').reset();
        this.showNotification('Transaction added successfully!', 'success');
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveToStorage('transactions', this.transactions);
        this.updateBalance();
        this.renderTransactions();
        this.showNotification('Transaction deleted', 'info');
    }

    // Bill Management
    addBill() {
        const name = document.getElementById('billName').value.trim();
        const amount = parseFloat(document.getElementById('billAmount').value);
        const day = parseInt(document.getElementById('billDay').value);

        if (!name || !amount || !day || day < 1 || day > 31) {
            this.showNotification('Please fill in all fields correctly', 'error');
            return;
        }

        const bill = {
            id: Date.now(),
            name,
            amount,
            day
        };

        this.bills.push(bill);
        this.saveToStorage('bills', this.bills);
        this.renderBills();
        
        // Reset form
        document.getElementById('billForm').reset();
        this.showNotification('Bill reminder added!', 'success');
    }

    deleteBill(id) {
        this.bills = this.bills.filter(b => b.id !== id);
        this.saveToStorage('bills', this.bills);
        this.renderBills();
        this.showNotification('Bill reminder deleted', 'info');
    }

    checkBillReminders() {
        const today = new Date().getDate();
        const upcomingBills = this.bills.filter(bill => {
            const daysUntil = bill.day - today;
            return daysUntil >= 0 && daysUntil <= 3;
        });

        if (upcomingBills.length > 0) {
            const billNames = upcomingBills.map(b => b.name).join(', ');
            setTimeout(() => {
                this.showNotification(`Upcoming bills: ${billNames}`, 'reminder');
            }, 1000);
        }
    }

    // Balance Calculations
    updateBalance() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expense;

        document.getElementById('totalBalance').textContent = this.formatCurrency(balance);
        document.getElementById('totalIncome').textContent = this.formatCurrency(income);
        document.getElementById('totalExpense').textContent = this.formatCurrency(expense);
    }

    // Rendering
    renderTransactions() {
        const container = document.getElementById('transactionsList');
        
        if (this.transactions.length === 0) {
            container.innerHTML = '<div class="empty-state">No transactions yet. Add your first transaction above!</div>';
            return;
        }

        container.innerHTML = this.transactions.map(t => `
            <div class="transaction-item ${t.type}">
                <span class="transaction-description">${this.escapeHtml(t.description)}</span>
                <div style="display: flex; align-items: center;">
                    <span class="transaction-amount">
                        ${t.type === 'income' ? '+' : '-'}${this.formatCurrency(t.amount)}
                    </span>
                    <button class="transaction-delete" onclick="tracker.deleteTransaction(${t.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderBills() {
        const container = document.getElementById('billsList');
        
        if (this.bills.length === 0) {
            container.innerHTML = '<div class="empty-state">No bill reminders set. Add one above!</div>';
            return;
        }

        const sortedBills = [...this.bills].sort((a, b) => a.day - b.day);

        container.innerHTML = sortedBills.map(bill => {
            const today = new Date().getDate();
            const daysUntil = bill.day - today;
            const isDue = daysUntil >= 0 && daysUntil <= 3;
            
            return `
                <div class="bill-item ${isDue ? 'bill-due' : ''}">
                    <div class="bill-info">
                        <div class="bill-name">${this.escapeHtml(bill.name)}</div>
                        <div class="bill-day">
                            Due on day ${bill.day} of each month
                            ${isDue ? ` • <strong>Due ${daysUntil === 0 ? 'today' : `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`}</strong>` : ''}
                        </div>
                    </div>
                    <span class="bill-amount">${this.formatCurrency(bill.amount)}</span>
                    <button class="bill-delete" onclick="tracker.deleteBill(${bill.id})">
                        Delete
                    </button>
                </div>
            `;
        }).join('');
    }

    // Utility Functions
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return null;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            zIndex: '1000',
            animation: 'slideIn 0.3s ease',
            maxWidth: '300px'
        });

        // Add to DOM
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Add notification animations to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .bill-due {
        border-left: 4px solid rgba(252, 165, 165, 0.8) !important;
        background: rgba(252, 165, 165, 0.08) !important;
    }
`;
document.head.appendChild(style);

// Initialize the app
const tracker = new FinancialTracker();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus on transaction description
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('description').focus();
    }
});
