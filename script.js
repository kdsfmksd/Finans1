let db = JSON.parse(localStorage.getItem('alpha_v5')) || {
    balance: 0,
    history: [],
    invested: 0,
    goal: { name: '', target: 0, date: '', photo: null, saved: 0 }
};

function showPage(pageId, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + pageId).classList.add('active');
    el.classList.add('active');
    refresh();
}

function save() {
    localStorage.setItem('alpha_v5', JSON.stringify(db));
    refresh();
}

function addIncome() {
    const val = parseFloat(document.getElementById('main-input').value);
    if (val > 0) { db.balance += val; document.getElementById('main-input').value = ''; save(); }
}

function addExpense() {
    const val = parseFloat(document.getElementById('main-input').value);
    const name = document.getElementById('exp-name').value || 'Расход';
    if (val > 0 && db.balance >= val) {
        db.balance -= val;
        db.history.unshift({ name, val, date: new Date().toLocaleTimeString() });
        document.getElementById('main-input').value = ''; save();
    }
}

function transferToGoal() {
    const val = parseFloat(document.getElementById('goal-action-amount').value);
    if (val > 0 && db.balance >= val) {
        db.balance -= val;
        db.goal.saved += val;
        db.history.unshift({ name: `🎯 В цель: ${db.goal.name}`, val, date: new Date().toLocaleTimeString() });
        document.getElementById('goal-action-amount').value = ''; save();
    }
}

function transferFromGoal() {
    const val = parseFloat(document.getElementById('goal-action-amount').value);
    if (val > 0 && db.goal.saved >= val) {
        db.goal.saved -= val;
        db.balance += val;
        document.getElementById('goal-action-amount').value = ''; save();
    }
}

function doInvest() {
    const val = parseFloat(document.getElementById('invest-amount').value);
    if (val > 0 && db.balance >= val) {
        db.balance -= val;
        db.invested += val;
        db.history.unshift({ name: "📈 Инвестиция", val, date: new Date().toLocaleTimeString() });
        document.getElementById('invest-amount').value = ''; save();
    }
}

function setGoal() {
    db.goal.name = document.getElementById('target-name').value;
    db.goal.target = parseFloat(document.getElementById('target-sum').value) || 0;
    db.goal.date = document.getElementById('target-date').value;
    save();
}

function refresh() {
    document.getElementById('total-balance').innerText = db.balance.toLocaleString() + ' ₽';
    document.getElementById('saved-in-goal').innerText = db.goal.saved.toLocaleString() + ' ₽';
    document.getElementById('goal-current-val').innerText = db.goal.saved.toLocaleString() + ' ₽';

    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
    document.getElementById('day-limit').innerText = Math.floor(db.balance / days).toLocaleString() + ' ₽';

    const target = db.goal.target || 0;
    const saved = db.goal.saved || 0;
    if (target > 0) {
        const percent = Math.min((saved / target) * 100, 100);
        document.getElementById('goal-percent').innerText = Math.floor(percent) + '%';
        document.getElementById('goal-ring').style.strokeDashoffset = 283 - (283 * (percent / 100));
        
        if (db.goal.date) {
            const gDate = new Date(db.goal.date);
            const months = (gDate.getFullYear() - now.getFullYear()) * 12 + (gDate.getMonth() - now.getMonth());
            document.getElementById('monthly-pay').innerText = Math.ceil((target - saved) / (months <= 0 ? 1 : months)).toLocaleString() + ' ₽';
        }
    }

    document.getElementById('can-invest').innerText = Math.floor(db.balance * 0.2).toLocaleString() + ' ₽';
    document.getElementById('history-list').innerHTML = db.history.slice(0, 5).map(h => `
        <div class="stat-item"><span>${h.name}</span><b>-${h.val.toLocaleString()} ₽</b></div>
    `).join('');
}

document.getElementById('bg-picker').oninput = (e) => { document.body.style.backgroundColor = e.target.value; };
window.onload = refresh;
setInterval(() => {
    const d = new Date();
    document.getElementById('clock').innerText = d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
}, 1000);
