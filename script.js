/**
 * ПРАКТИЧЕСКАЯ РАБОТА №3: ФУНКЦИИ И SCOPE
 * 
 * Архитектура решения:
 * 1. Global Scope (Константы и конфигурация).
 * 2. Validation Layer (Системная индикация рамок .success/.error).
 * 3. Logic Layer (Чистые функции для расчетов).
 * 4. UI Bridge (Обработчики событий для взаимодействия с DOM).
 */

// --- 0. КОНСТАНТЫ (GLOBAL SCOPE) ---
// Вынос параметров в глобальную область видимости избавляет от "магических чисел" 
// и позволяет централизованно управлять логикой приложения.
const CONFIG = {
    LBS_RATE: 2.20462,
    BMR_MALE_BONUS: 5,
    BMR_FEMALE_OFFSET: -161,
    FEET_TO_CM: 30.48,
    INCH_TO_CM: 2.54,
    // Правила для "живой" валидации по ID элементов из HTML
    RULES: {
        weightBMI: { min: 20, max: 300 },
        heightBMI: { min: 50, max: 250 },
        weightInput: { min: 0.1, max: 1000 },
        weightBMR: { min: 20, max: 300 },
        heightBMR: { min: 50, max: 250 },
        ageBMR: { min: 10, max: 120 },
        heightInput: { min: 50, max: 250 },
        feetInput: { min: 1, max: 8 },
        inchesInput: { min: 0, max: 11 },
        weightPro: { min: 20, max: 300 },
        heightPro: { min: 50, max: 250 }
    }
};

// --- 1. ТЕМА ОФОРМЛЕНИЯ (LEXICAL ENVIRONMENT) ---
const themeBtn = document.getElementById('themeToggle');

/**
 * Используется Arrow Function (Стрелочная функция). 
 * Выбор обоснован лаконичностью синтаксиса для вспомогательных задач.
 * Функция получает доступ к themeBtn через лексическое окружение (внешний Scope).
 */
const switchTheme = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    if (themeBtn) themeBtn.innerText = isDark ? '☀️' : '🌙';
};

// Автоматическая установка темы по времени суток (19:00 - 07:00)
const hour = new Date().getHours();
switchTheme(hour >= 19 || hour < 7);

if (themeBtn) {
    themeBtn.onclick = () => switchTheme(!document.body.classList.contains('dark-mode'));
}

// --- 2. ЖИВАЯ ВАЛИДАЦИЯ И UI (DOM MANIPULATION) ---

/**
 * Функция validate(el) управляет визуальным состоянием полей (рамками).
 * Добавляет классы .success (зеленый) или .error (красный) из CSS.
 * Соблюдает принцип SRP (Single Responsibility) — отвечает только за индикацию.
 */
function validate(el) {
    const rule = CONFIG.RULES[el.id];
    if (!rule) return true;

    const val = parseFloat(el.value);
    // КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: использование логического && вместо побитового &
    const isValid = !isNaN(val) && val >= rule.min && val <= rule.max;

    if (el.value.trim() === "") {
        el.classList.remove('error', 'success');
        return false;
    }

    if (isValid) {
        el.classList.add('success'); el.classList.remove('error');
    } else {
        el.classList.add('error'); el.classList.remove('success');
    }
    return isValid;
}

/**
 * Универсальный мост для вывода данных в блоки .result.
 * Активирует видимость плашки добавлением класса .show.
 */
function output(id, text, isError = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = text;
    el.classList.add('show');
    // Динамическая стилизация цвета текста и полоски в зависимости от статуса
    el.style.color = isError ? "#ff4757" : "";
    el.style.borderLeftColor = isError ? "#ff4757" : "#2ecc71";
}

// Глобальный слушатель событий для мгновенного отклика интерфейса
document.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT') validate(e.target);
    
    // Скрываем блок результата при изменении данных для обеспечения актуальности
    const section = e.target.closest('section');
    if (section) section.querySelector('.result')?.classList.remove('show');
});

// --- 3. РЕАЛИЗАЦИЯ ЗАДАНИЙ ---

// # Задание 1: ИМТ (FUNCTION DECLARATION) #
/**
 * Выбран тип Function Declaration. 
 * Преимущество: поддержка Hoisting (всплытия), что позволяет структурировать 
 * код, вызывая функции в HTML до их фактического описания в скрипте.
 */
function handleBMI() {
    const w = document.getElementById('weightBMI'), h = document.getElementById('heightBMI');
    if (validate(w) && validate(h)) {
        const bmi = (w.value / ((h.value / 100) ** 2)).toFixed(1);
        let cat = bmi < 18.5 ? "Дефицит" : bmi < 25 ? "Норма" : "Избыток/Ожирение";
        output('bmiResult', `Ваш ИМТ: ${bmi} (${cat})`);
    }
}

// # Задание 2: КОНВЕРТЕР (FUNCTION EXPRESSION) #
/**
 * Выбран тип Function Expression (анонимные функции в переменных).
 * Особенность: не всплывают (no hoisting). Доступны строго после инициализации, 
 * что предотвращает их случайный вызов до загрузки конфигурации.
 */
const toLbs = (kg) => (kg * CONFIG.LBS_RATE).toFixed(2);
const toKg = (lbs) => (lbs / CONFIG.LBS_RATE).toFixed(2);

function handleKgToLbs() {
    const el = document.getElementById('weightInput');
    if (validate(el)) output('weightResult', `${el.value} кг = ${toLbs(el.value)} lbs`);
}
function handleLbsToKg() {
    const el = document.getElementById('weightInput');
    if (validate(el)) output('weightResult', `${el.value} lbs = ${toKg(el.value)} кг`);
}

// # Задание 3: КАЛОРИИ (BMR + LEXICAL SCOPE) #
/**
 * Демонстрирует работу лексического окружения: функция ищет коэффициенты 
 * BMR_BONUS во внешнем Scope (объекте CONFIG), когда не находит их внутри себя.
 */
function handleBMR() {
    const w = document.getElementById('weightBMR'), h = document.getElementById('heightBMR'),
          a = document.getElementById('ageBMR'), g = document.getElementById('genderBMR');

    if (validate(w) && validate(h) && validate(a) && g.value) {
        const bonus = (g.value === 'male') ? CONFIG.BMR_MALE_BONUS : CONFIG.BMR_FEMALE_OFFSET;
        const bmr = (10 * w.value) + (6.25 * h.value) - (5 * a.value) + bonus;
        const genderText = g.value === 'male' ? 'мужчина' : 'женщина';
        output('bmrResult', `Ваша базовая норма калорий: ${Math.round(bmr)} ккал/день (${genderText}, ${a.value} лет)`);
    } else if (!g.value) {
        g.classList.add('error');
        output('bmrResult', "Ошибка: выберите пол!", true);
    }
}

// # Задание 4: РОСТ (ARROW FUNCTIONS & FORMATTING) #
/**
 * Arrow Functions выбраны за лаконичность. 
 * ИСПРАВЛЕНО: Реализован корректный расчет остатка дюймов (0-11) и формат 5'9".
 */
const cmToFtIn = (cm) => {
    const total = cm / 2.54;
    return `${Math.floor(total / 12)}'${Math.round(total % 12)}" (${Math.floor(total / 12)} футов ${Math.round(total % 12)} дюймов)`;
};

function handleCmToFeet() {
    const el = document.getElementById('heightInput');
    if (validate(el)) output('heightResult', `${el.value} см = ${cmToFtIn(el.value)}`);
}

function handleFeetToCm() {
    const f = document.getElementById('feetInput'), i = document.getElementById('inchesInput');
    if (validate(f) && validate(i)) {
        const res = Math.round((f.value * CONFIG.FEET_TO_CM) + (i.value * CONFIG.INCH_TO_CM));
        output('heightResult2', `${f.value}'${i.value}" = ${res} см`);
    }
}

// # Задание 5: УРОВЕНЬ PRO (CLOSURES / ЗАМЫКАНИЯ) #
/**
 * ТЕОРИЯ: Внутренняя функция "захватывает" переменные min/max и продолжает 
 * иметь к ним доступ даже после того, как createValidator завершила работу.
 * Возвращает текст ошибки, что делает валидацию более информативной.
 */
function createValidator(min, max, label) {
    return (val) => {
        const num = parseFloat(val);
        return (num >= min && num <= max) ? null : `❌ Ошибка: [${label}] вне нормы (${min}-${max})`;
    };
}

const checkWeight = createValidator(CONFIG.RULES.weightPro.min, CONFIG.RULES.weightPro.max, "Вес");
const checkHeight = createValidator(CONFIG.RULES.heightPro.min, CONFIG.RULES.heightPro.max, "Рост");

function handleProValidation() {
    const w = document.getElementById('weightPro'), h = document.getElementById('heightPro');
    // Визуальная индикация рамок перед финальной проверкой
    validate(w); validate(h);
    
    const err = checkWeight(w.value) || checkHeight(h.value);
    if (!err) output('proResult', "✅ Данные корректны! Вес и рост в норме.");
    else output('proResult', err, true);
}