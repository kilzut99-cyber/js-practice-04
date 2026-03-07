/**
* ПРАКТИЧЕСКАЯ РАБОТА №4: ОБЪЕКТЫ И МАССИВЫ
* Студент: (Ваше Имя)
* Группа: 2509
*/
"use strict"; // Используем строгий режим для повышения надежности кода и предотвращения использования необъявленных переменных

// 1. СТАРТОВЫЕ ДАННЫЕ (Массив объектов согласно Page 2 PDF)
// Каждая запись — это объект, представляющий товар с уникальными характеристиками
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

let cart = []; // Инициализируем пустой массив для хранения товаров в корзине

// 2. ПОИСК ЭЛЕМЕНТОВ DOM (Все обработчики только через addEventListener согласно Page 1)
// Получаем ссылки на узлы дерева документа для дальнейшего взаимодействия
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
// Инкапсулируем логику создания HTML-разметки для карточки, чтобы не дублировать код в разных задачах
const renderCard = (product) => {
    // Проверка наличия (Задание 1: товары out-of-stock выделяются специальным классом из CSS)
    const stockClass = product.inStock ? "" : "out-of-stock";
    // Формируем текстовую метку статуса
    const statusText = product.inStock ? "✅ В наличии" : "❌ Нет в наличии";

    // Кнопка добавляется в HTML-строку только если товар в наличии (Задание 4)
    // Используем data-атрибут для хранения ID товара, чтобы потом его легко найти
    const buyButton = product.inStock
        ? `<button class="btn btn-primary btn-cart" data-id="${product.id}">В корзину</button>`
        : "";

    // Возвращаем готовую HTML-структуру карточки (используем шаблонные строки ``)
    return `
    <div class="product-card ${stockClass}">
        <h3>${product.name}</h3>
        <p>Категория: ${product.category}</p>
        <p class="price">${product.price} BYN</p>
        <p><small>${statusText}</small></p>
        <!-- Если у объекта есть свойство label (из map в Задании 3), выводим его -->
        ${product.label ? `<p><i>${product.label}</i></p>` : ""}
        ${buyButton}
    </div>
    `;
};

// --- ЗАДАНИЕ 1. ВЫВОД КАТАЛОГА (forEach) ---
btnShowAll.addEventListener('click', () => {
    catalogContainer.innerHTML = ''; // Очистка контейнера перед выводом, чтобы избежать дублирования
    // ИСПОЛЬЗУЮ forEach, потому что: нам нужно выполнить действие (отрисовку) для каждого 
    // элемента массива, не создавая при этом новый массив данных.
    products.forEach(product => {
        // На каждой итерации добавляем сгенерированный HTML в конец контейнера
        catalogContainer.innerHTML += renderCard(product);
    });
});

// --- ЗАДАНИЕ 2 И 3. ФИЛЬТРАЦИЯ И ПОИСК (filter + map) ---
btnSearch.addEventListener('click', () => {
    // ВАЛИДАЦИЯ (Page 1): убираем лишние пробелы (trim) и приводим к нижнему регистру для нечувствительного поиска
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedCategory = categorySelect.value; // Получаем текущее значение из выпадающего списка

    // Цепочка методов для обработки данных (Подсказка на Page 4)
    const filtered = products
        // ИСПОЛЬЗУЮ filter, потому что: это позволяет отобрать только те товары, 
        // которые соответствуют строке поиска, не меняя оригинальный массив products.
        .filter(p => p.name.toLowerCase().includes(searchText))
        // Второй filter: если выбрано "Все", возвращаем true (пропускаем всех), иначе сверяем категорию
        .filter(p => selectedCategory === "Все" || p.category === selectedCategory)
        // ИСПОЛЬЗУЮ map, потому что: по Заданию 3 нужно преобразовать объекты, 
        // добавив им новое вычисляемое поле label для отображения на странице.
        .map(p => ({
            ...p, // Spread-оператор: копируем все существующие свойства объекта
            label: `${p.name} — ${p.price} BYN` // Добавляем новую характеристику
        }));

    filterResults.innerHTML = ''; // Сброс предыдущих результатов поиска
    if (filtered.length === 0) {
        // Обработка ситуации, когда ни один товар не подошел под фильтр
        filterResults.innerHTML = '<p class="empty-state">Товары не найдены</p>';
    } else {
        // Отрисовываем результаты через forEach (перебор без возврата значения)
        filtered.forEach(p => {
            filterResults.innerHTML += renderCard(p);
        });
    }
});

// --- ЗАДАНИЕ 4. КОРЗИНА (map + reduce + forEach) ---
// Делегирование события клика: слушаем клики на всем документе
// Это нужно, чтобы кнопки "В корзину" работали даже на динамически созданных карточках
document.addEventListener('click', (e) => {
    // Проверяем, что клик был именно по кнопке добавления
    if (e.target.classList.contains('btn-cart')) {
        // Достаем ID товара из атрибута data-id (превращаем строку в число)
        const id = parseInt(e.target.dataset.id);
        // Метод find ищет в исходном массиве объект с таким же ID
        const product = products.find(p => p.id === id);

        // Проверка (Валидация): товар должен существовать и еще не присутствовать в корзине
        // Используем метод some, который возвращает true, если в корзине уже есть такой ID
        if (product && !cart.some(item => item.id === id)) {
            cart.push(product); // Добавляем ссылку на объект в массив корзины
            // alert удален для бесшумного добавления товара в корзину
        }
    }
});

// Обработчик кнопки "Показать корзину"
btnShowCart.addEventListener('click', () => {
    cartContainer.innerHTML = ''; // Очистка списка перед выводом
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-state">Корзина пуста</p>';
        cartTotal.textContent = ''; // Стираем итоговую сумму
        return; // Выходим из функции
    }

    // ИСПОЛЬЗУЮ forEach, потому что: нужно сформировать список строк для вывода 
    // текущего состояния массива cart в HTML-структуру страницы.
    cart.forEach(item => {
        cartContainer.innerHTML += `
        <div class="cart-item">
            ${item.name} <span>${item.price} BYN</span>
        </div>`;
    });

    // ИСПОЛЬЗУЮ map, потому что: согласно Заданию 4, нужно извлечь только числовые цены
    // из массива объектов товаров для их дальнейшего математического суммирования.
    const prices = cart.map(item => item.price);

    // ИСПОЛЬЗУЮ reduce, потому что: этот метод идеально подходит для 
    // "свертки" (сведения) массива цен к одному единственному числу — итоговой сумме.
    // 0 в конце — это начальное значение аккумулятора (sum)
    const total = prices.reduce((sum, current) => sum + current, 0);

    // Вывод итоговой суммы с использованием жирного шрифта
    cartTotal.innerHTML = `<strong>Итого: ${total} BYN</strong>`;
});

// Кнопка полной очистки корзины
btnClearCart.addEventListener('click', () => {
    cart = []; // Перезаписываем глобальный массив пустым
    cartContainer.innerHTML = '<p class="empty-state">Корзина очищена</p>';
    cartTotal.textContent = ''; // Очищаем визуальное поле суммы
});

// --- ЗАДАНИЕ 5. JSON И LOCALSTORAGE (УРОВЕНЬ PRO) ---
// Находим элементы управления из Секции 4 (Разметка страницы на Page 2)
const btnSave = document.getElementById('btn-save');
const btnLoad = document.getElementById('btn-load');
const storageStatus = document.getElementById('storage-status');

// 1. Сохранение в localStorage
btnSave.addEventListener('click', () => {
    // ВАЛИДАЦИЯ: проверяем, не пуста ли корзина перед сохранением, чтобы не писать пустые строки
    if (cart.length === 0) {
        storageStatus.textContent = "Корзина пуста. Нечего сохранять.";
        storageStatus.className = "status-message error";
        storageStatus.style.display = "block"; // Делаем сообщение видимым
        return;
    }

    // Использую JSON.stringify, ПОТОМУ ЧТО: localStorage умеет хранить только строки, 
    // а наш массив cart — это сложная структура объектов. Нам нужно превратить её в текст.
    const cartJSON = JSON.stringify(cart);

    // Сохраняем полученную строку в память браузера под ключом "myCart"
    localStorage.setItem("myCart", cartJSON);

    // ВЫВОД В КОНСОЛЬ (согласно техническому требованию на Page 5):
    console.log("--- СОХРАНЕНИЕ ДАННЫХ ---");
    console.log("Исходный объект (массив):", cart); // В консоли увидим структуру массива
    console.log("JSON-строка для хранения:", cartJSON); // В консоли увидим текст в кавычках

    // Информируем пользователя на странице
    storageStatus.textContent = "Корзина успешно сохранена в localStorage!";
    storageStatus.className = "status-message success"; // Меняем цвет на зеленый через CSS-класс
    storageStatus.style.display = "block";
});

// 2. Загрузка из localStorage
btnLoad.addEventListener('click', () => {
    // Получаем строковые данные по нашему ключу
    const savedData = localStorage.getItem("myCart");

    // ПРОВЕРКА (Page 5): Если данных в памяти нет, getItem вернет null
    if (savedData) {
        // Использую JSON.parse, ПОТОМУ ЧТО: данные из хранилища приходят в виде текста (строки), 
        // и нам нужно превратить их обратно в живой массив объектов JS для дальнейшей работы.
        cart = JSON.parse(savedData);

        console.log("--- ЗАГРУЗКА ДАННЫХ ---");
        console.log("Загружено и распарсено:", cart);

        storageStatus.textContent = "Корзина успешно загружена из localStorage!";
        storageStatus.className = "status-message info"; // Синий фон сообщения

        // Автоматически обновляем отображение корзины после загрузки, 
        // программно вызывая событие клика на кнопку «Показать корзину»
        btnShowCart.click(); 
    } else {
        // Если данных нет, уведомляем об ошибке
        console.log("Нет сохранённых данных");
        storageStatus.textContent = "Сохранённых данных нет";
        storageStatus.className = "status-message error";
    }
    storageStatus.style.display = "block";
});

// --- ЗАДАНИЕ 6. СТАТИСТИКА КАТАЛОГА (УРОВЕНЬ PRO) ---
// Поиск элементов из Секции 5
const btnStats = document.getElementById('btn-stats');
const statsContainer = document.getElementById('stats-container');

btnStats.addEventListener('click', () => {
    // 1. Общее количество товаров (просто длина исходного массива)
    const totalCount = products.length;

    // 2. Количество товаров в наличии
    // Использую filter, ПОТОМУ ЧТО: нам нужно отобрать из общего массива только те объекты, 
    // у которых логическое свойство inStock равно true.
    const inStockCount = products.filter(p => p.inStock).length;

    // 3. Средняя цена всех товаров
    // Использую map, ПОТОМУ ЧТО: сначала нужно извлечь массив только из числовых значений цен.
    const prices = products.map(p => p.price);
    // Использую reduce, ПОТОМУ ЧТО: нужно просуммировать все цены для вычисления среднего.
    const totalPrice = prices.reduce((acc, price) => acc + price, 0);
    // Рассчитываем среднее и округляем до 2 знаков после запятой (метод toFixed, Page 6)
    const avgPrice = (totalPrice / totalCount).toFixed(2);

    // 4. Самый дорогой товар
    // Использую reduce, ПОТОМУ ЧТО: этот метод позволяет сравнивать элементы между собой 
    // в процессе перебора и вернуть один объект, который "победил" по условию (макс. цена).
    const mostExpensive = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);

    // 5. Список уникальных категорий
    // Использую map + Set, ПОТОМУ ЧТО: map соберет все категории в массив (там будут повторы), 
    // а специальная структура Set автоматически удалит все дубликаты (Page 6).
    // [... ] — Spread-оператор превращает Set обратно в обычный массив.
    const uniqueCategories = [...new Set(products.map(p => p.category))];

    // Вывод статистики в HTML (использую CSS классы: .stat-card, .stat-value)
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
        <div class="stat-value">${mostExpensive.name} \n(${mostExpensive.price} BYN)</div>
        <div class="stat-label">Самый дорогой </div>
    </div>
    <div class="stat-card">
        <div class="stat-value">${uniqueCategories.join(', ')}</div>
        <div class="stat-label">Категории</div>
    </div>
    `;

    // Вывод аналитики в консоль для сверки с ТЗ (Page 6)
    console.log("--- СТАТИСТИКА ---");
    console.log(`Средняя цена: ${avgPrice} BYN (Ожидалось: 541.25)`);
    console.log(`Категории:`, uniqueCategories);
});

// ПРОВЕРКА (Page 1): В коде использованы только строгие сравнения ===, нет старого атрибута inline-onclick, 
// везде присутствуют подробные пояснения к использованным методам перебора массивов.