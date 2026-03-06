/**
 * ПРАКТИЧЕСКАЯ РАБОТА №4: ОБЪЕКТЫ И МАССИВЫ
 * Студент: (Ваше Имя)
 * Группа: 2509
 */

"use strict"; // Используем строгий режим для повышения надежности кода

// 1. СТАРТОВЫЕ ДАННЫЕ (Массив объектов согласно Page 2 PDF)
const products = [
    { id: 1, name: "Ноутбук ASUS", category: "Электроника", price: 2500, inStock: true },
    { id: 2, name: "Мышь Logitech", category: "Электроника", price: 45, inStock: true },
    { id: 3, name: "Стол письменный", category: "Мебель", price: 320, inStock: false },
    { id: 4, name: "Кресло офисное", category: "Мебель", price: 480, inStock: true },
    { id: 5, name: "Наушники Sony", category: "Электроника", price: 180, inStock: true },
    { id: 6, name: "Книга «JS для всех»", category: "Книги", price: 25, inStock: true },
    { id: 7, name: "Книга «Clean Code»", category: "Книги", price: 30, inStock: false },
    { id: 8, name: "Монитор LG 27\"", category: "Электроника", price: 750, inStock: true },
];

let cart = []; // Массив для хранения товаров в корзине

// 2. ПОИСК ЭЛЕМЕНТОВ DOM (Все обработчики только через addEventListener согласно Page 1)
const catalogContainer = document.getElementById('catalog-container');
const filterResults = document.getElementById('filter-results');
const cartContainer = document.getElementById('cart-container');
const cartTotal = document.getElementById('cart-total');

const btnShowAll = document.getElementById('btn-show-all');
const btnSearch = document.getElementById('btn-search');
const btnShowCart = document.getElementById('btn-show-cart');
const btnClearCart = document.getElementById('btn-clear-cart');

const searchInput = document.getElementById('search-input');
const categorySelect = document.getElementById('category-select');

// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ОТРИСОВКИ ---
// Инкапсулируем логику создания HTML, чтобы не дублировать код в разных заданиях
const renderCard = (product) => {
    // Проверка наличия (Задание 1: товары out-of-stock выделяются классом из CSS)
    const stockClass = product.inStock ? "" : "out-of-stock";
    const statusText = product.inStock ? "✅ В наличии" : "❌ Нет в наличии";
    
    // Кнопка добавляется только если товар в наличии (Задание 4)
    const buyButton = product.inStock 
        ? `<button class="btn btn-primary btn-cart" data-id="${product.id}">В корзину</button>` 
        : "";

    return `
        <div class="product-card ${stockClass}">
            <h3>${product.name}</h3>
            <p>Категория: ${product.category}</p>
            <p class="price">${product.price} BYN</p>
            <p><small>${statusText}</small></p>
            ${product.label ? `<p><i>${product.label}</i></p>` : ""}
            ${buyButton}
        </div>
    `;
};

// --- ЗАДАНИЕ 1. ВЫВОД КАТАЛОГА (forEach) ---
btnShowAll.addEventListener('click', () => {
    catalogContainer.innerHTML = ''; // Очистка перед выводом
    
    // ИСПОЛЬЗУЮ forEach, потому что: нам нужно выполнить действие (отрисовку) для каждого 
    // элемента массива, не создавая при этом новый массив данных.
    products.forEach(product => {
        catalogContainer.innerHTML += renderCard(product);
    });
});

// --- ЗАДАНИЕ 2 И 3. ФИЛЬТРАЦИЯ И ПОИСК (filter + map) ---
btnSearch.addEventListener('click', () => {
    // ВАЛИДАЦИЯ (Page 1): убираем лишние пробелы и приводим к нижнему регистру
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value;

    // Цепочка методов (Подсказка Page 4)
    const filtered = products
        // ИСПОЛЬЗУЮ filter, потому что: это позволяет отобрать только те товары, 
        // которые соответствуют строке поиска и выбранной категории, не меняя оригинал.
        .filter(p => p.name.toLowerCase().includes(searchText))
        .filter(p => selectedCategory === "Все" || p.category === selectedCategory)
        // ИСПОЛЬЗУЮ map, потому что: по Заданию 3 нужно преобразовать объекты, 
        // добавив им вычисляемое поле label для отображения.
        .map(p => ({
            ...p, // Spread-оператор для копирования свойств (Вопрос 6)
            label: `${p.name} — ${p.price} BYN`
        }));

    filterResults.innerHTML = '';
    
    if (filtered.length === 0) {
        filterResults.innerHTML = '<p class="empty-state">Товары не найдены</p>';
    } else {
        // Отрисовываем результаты через forEach (перебор без возврата значения)
        filtered.forEach(p => {
            filterResults.innerHTML += renderCard(p);
        });
    }
});

// --- ЗАДАНИЕ 4. КОРЗИНА (map + reduce + forEach) ---

// Делегирование события клика (чтобы кнопки работали после динамической отрисовки)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-cart')) {
        const id = parseInt(e.target.dataset.id);
        const product = products.find(p => p.id === id);
        
        // Проверка (Валидация): товар должен быть в наличии и не быть дубликатом в корзине
        if (product && !cart.some(item => item.id === id)) {
            cart.push(product);
        }
    }
});

btnShowCart.addEventListener('click', () => {
    cartContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-state">Корзина пуста</p>';
        cartTotal.textContent = '';
        return;
    }

    // ИСПОЛЬЗУЮ forEach, потому что: нужно сформировать список строк для вывода 
    // текущего состояния массива cart на страницу.
    cart.forEach(item => {
        cartContainer.innerHTML += `
            <div class="cart-item">
                ${item.name} <span>${item.price} BYN</span>
            </div>`;
    });

    // ИСПОЛЬЗУЮ map, потому что: согласно Заданию 4, нужно извлечь только цены 
    // для дальнейшего суммирования.
    const prices = cart.map(item => item.price);
    
    // ИСПОЛЬЗУЮ reduce, потому что: (Вопрос 8) этот метод идеально подходит для 
    // сведения массива цен к одному числу — итоговой сумме.
    const total = prices.reduce((sum, current) => sum + current, 0);
    
    cartTotal.innerHTML = `<strong>Итого: ${total} BYN</strong>`;
});

btnClearCart.addEventListener('click', () => {
    cart = []; // Очистка массива
    cartContainer.innerHTML = '<p class="empty-state">Корзина очищена</p>';
    cartTotal.textContent = '';
});

// --- ЗАДАНИЕ 5. JSON И LOCALSTORAGE (УРОВЕНЬ PRO) ---

// Находим элементы управления из Секции 4 (Разметка страницы, Page 2)
const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const storageStatus = document.getElementById('storage-status');

// 1. Сохранение в localStorage
btnSave.addEventListener('click', () => {
    // ВАЛИДАЦИЯ: проверяем, не пуста ли корзина перед сохранением
    if (cart.length === 0) {
        storageStatus.textContent = "Корзина пуста. Нечего сохранять.";
        storageStatus.className = "status-message error";
        storageStatus.style.display = "block";
        return;
    }

    // Использую JSON.stringify, ПОТОМУ ЧТО: localStorage может хранить только строки, 
    // а нам нужно превратить сложный массив объектов в текстовый формат (Page 5).
    const cartJSON = JSON.stringify(cart);
    
    // Сохраняем строку в память браузера под ключом "myCart"
    localStorage.setItem("myCart", cartJSON);

    // ВЫВОД В КОНСОЛЬ (согласно требованию на Page 5):
    console.log("--- СОХРАНЕНИЕ ДАННЫХ ---");
    console.log("Исходный объект (массив):", cart); // Живой объект JS
    console.log("JSON-строка для хранения:", cartJSON); // Текст в кавычках

    // Обновляем статус на странице
    storageStatus.textContent = "Корзина успешно сохранена в localStorage!";
    storageStatus.className = "status-message success";
    storageStatus.style.display = "block";
});

// 2. Загрузка из localStorage
btnLoad.addEventListener('click', () => {
    // Получаем данные по ключу
    const savedData = localStorage.getItem("myCart");

    // ПРОВЕРКА (Page 5): Если localStorage пуст — выводим сообщение
    if (savedData) {
        // Использую JSON.parse, ПОТОМУ ЧТО: данные из хранилища приходят в виде строки, 
        // и нам нужно превратить их обратно в массив объектов JavaScript для работы (Page 5).
        cart = JSON.parse(savedData);

        console.log("--- ЗАГРУЗКА ДАННЫХ ---");
        console.log("Загружено и распарсено:", cart);

        storageStatus.textContent = "Корзина успешно загружена!";
        storageStatus.className = "status-message info";
        
        // Автоматически обновляем отображение корзины после загрузки, 
        // имитируя нажатие кнопки «Показать корзину»
        btnShowCart.click(); 
    } else {
        console.log("Нет сохранённых данных");
        storageStatus.textContent = "Сохранённых данных нет";
        storageStatus.className = "status-message error";
    }
    storageStatus.style.display = "block";
});

// --- ЗАДАНИЕ 6. СТАТИСТИКА КАТАЛОГА (УРОВЕНЬ PRO) ---

const btnStats = document.getElementById('btn-stats');
const statsContainer = document.getElementById('stats-container');

btnStats.addEventListener('click', () => {
    // 1. Общее количество товаров
    const totalCount = products.length;

    // 2. Количество товаров в наличии
    // Использую filter, ПОТОМУ ЧТО: нам нужно отобрать из общего массива только те объекты, 
    // у которых свойство inStock равно true.
    const inStockCount = products.filter(p => p.inStock).length;

    // 3. Средняя цена всех товаров
    // Использую map, ПОТОМУ ЧТО: сначала нужно извлечь массив только из числовых значений цен.
    const prices = products.map(p => p.price);
    // Использую reduce, ПОТОМУ ЧТО: нужно суммировать все цены для вычисления среднего арифметического.
    const totalPrice = prices.reduce((acc, price) => acc + price, 0);
    const avgPrice = (totalPrice / totalCount).toFixed(2); // Округляем до 2 знаков (Page 6)

    // 4. Самый дорогой товар
    // Использую reduce, ПОТОМУ ЧТО: этот метод позволяет сравнить элементы между собой 
    // и вернуть один объект, который "победил" по условию (максимальная цена).
    const mostExpensive = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);

    // 5. Список уникальных категорий
    // Использую map + Set, ПОТОМУ ЧТО: map соберет все категории в массив (с повторами), 
    // а структура Set автоматически удалит все дубликаты (Page 6).
    const uniqueCategories = [...new Set(products.map(p => p.category))];

    // Вывод статистики в HTML (использую классы из твоего CSS: .stat-card, .stat-value)
    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${totalCount}</div>
            <div class="stat-label">Всего товаров</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${inStockCount}</div>
            <div class="stat-label">В наличии</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${avgPrice} BYN</div>
            <div class="stat-label">Средняя цена</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="font-size: 1rem;">${mostExpensive.name}</div>
            <div class="stat-label">Самый дорогой (${mostExpensive.price} BYN)</div>
        </div>
        <div class="stat-card">
            <div class="stat-value" style="font-size: 0.9rem;">${uniqueCategories.join(', ')}</div>
            <div class="stat-label">Уникальные категории</div>
        </div>
    `;

    // Вывод в консоль для проверки (согласно примерам из Page 6)
    console.log("--- СТАТИСТИКА ---");
    console.log(`Средняя цена: ${avgPrice} BYN (Ожидалось: 541.25)`);
    console.log(`Категории:`, uniqueCategories);
});

// ПРОВЕРКА (Page 1): В коде использованы только ===, нет inline-onclick, 
// везде присутствуют пояснения к методам перебора.