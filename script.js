// Используем новую версию ключа БД, чтобы сбросить старые ошибки
let db = JSON.parse(localStorage.getItem('alpha_v4_final')) || {
    balance: 0,
    history: [],
    invested: 0,
    goal: { name: '', target: 0, date: '', photo: null, saved: 0 }
};

const $ = (id) => document.getElementById(id);

function showPage(pageId, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    $( 'page-' + pageId ).classList.add('active');
    el.classList.add('active');
}

// Тема
$('bg-picker').oninput = function(e) {
    const color = e.target.value;
    document.body.style.backgroundColor = color;
    const r = parseInt(color.slice(1,3), 16), g = parseInt(color.slice(3,5), 16), b = parseInt(color.slice(5,7), 16);
    document.body.style.color = (r*299 + g*587 + b*114)/1000 > 125 ? '#000' : '#fff';
};

// --- ГЛАВНАЯ ---
function addIncome() {
    const val = Number($('main-input').value);
    if (val > 0) { db.balance += val; $('main-input').value = ''; save(); }
}

function addExpense() {
    const val = Number($('main-input').value);
    const name = $('exp-name').value || 'Расход';
    if (val > 0 && db.balance >= val) {
        db.balance -= val;
        db.history.unshift({ name, val, date: new Date().toLocaleTimeString() });
        $('main-input').value = ''; $('exp-name').value = ''; save();
    }
}

// --- КОПИТЬ ---
function transferToGoal() {
    const val = Number($('goal-action-amount').value);
    if (val > 0 && db.balance >= val) {
        db.balance -= val;
        db.goal.saved += val;
        db.history.unshift({ name: `🎯 В цель: ${db.goal.name || 'Копилка'}`, val, date: new Date().toLocaleTimeString() });
        $('goal-action-amount').value = ''; save();
    }
}

function transferFromGoal() {
    const val = Number($('goal-action-amount').value);
    if (val > 0 && db.goal.saved >= val) {
        db.goal.saved -= val;
        db.balance += val;
        $('goal-action-amount').value = ''; save();
    }
}

function setGoal() {
    db.goal.name = $('target-name').value;
    db.goal.target = Number($('target-sum').value);
    db.goal.date = $('target-date').value;
    save();
}

// --- ИНВЕСТ ---
function doInvest() {
    const val = Number($('invest-amount').value);
    if (val > 0 && db.balance >= val) {
        db.balance -= val;
        db.invested += val;
        db.history.unshift({ name: `📈 Инвестиция`, val, date: new Date().toLocaleTimeString() });
        $('invest-amount').value = ''; save();
    }
}

// Фото
$('goal-file').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => { db.goal.photo = reader.result; save(); };
    reader.readAsDataURL(e.target.files[0]);
};

// Рендер и Математика
function refresh() {
    $('total-balance').innerText = db.balance.toLocaleString() + ' ₽';
    $('saved-in-goal').innerText = db.goal.saved.toLocaleString() + ' ₽';
    $('goal-current-val').innerText = db.goal.saved.toLocaleString() + ' ₽';

    const now = new Date();
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate() + 1;
    $('day-limit').innerText = Math.floor(db.balance / days).toLocaleString() + ' ₽';

    // Математика цели
    const target = Number(db.goal.target) || 0;
    const saved = Number(db.goal.saved) || 0;
    
    if (target > 0) {
        const percent = Math.min((saved / target) * 100, 100);
        $('goal-percent').innerText = Math.floor(percent) + '%';
        $('goal-ring').style.strokeDashoffset = 283 - (283 * (percent / 100));
        
        const left = target - saved;
        if ($('target-date').value) {
            const gDate = new Date($('target-date').value);
            const months = (gDate.getFullYear() - now.getFullYear()) * 12 + (gDate.getMonth() - now.getMonth());
            $('monthly-pay').innerText = Math.ceil(left / (months <= 0 ? 1 : months)).toLocaleString() + ' ₽';
        }
    }

    // Инвест потенциал (уменьшается по мере инвестирования)
    // Потенциал = 20% от текущего баланса МИНУС то, что уже инвестировали в этом сеансе
    const potential = Math.floor(db.balance * 0.2);
    $('can-invest').innerText = potential.toLocaleString() + ' ₽';

    $('history-list').innerHTML = db.history.slice(0, 5).map(h => `
        <div class="stat-item"><span>${h.name}</span><b>-${h.val.toLocaleString()} ₽</b></div>
    `).join('');

    if (db.goal.photo) $('photo-preview').innerHTML = `<img src="${db.goal.photo}">`;
}

// Добавьте это в HTML секции ИНВЕСТ:
// <input type="number" id="invest-amount" placeholder="Сумма для инвестирования">
// <button class="btn-inc" onclick="doInvest()">ИНВЕСТИРОВАТЬ</button>

function save() {
    localStorage.setItem('alpha_v4_final', JSON.stringify(db));
    refresh();
}

setInterval(() => {
    const d = new Date();
    $('clock').innerText = d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
}, 1000);

window.onload = refresh;