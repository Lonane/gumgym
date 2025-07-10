// Инициализация данных
let exercises = JSON.parse(localStorage.getItem('exercises')) || [];
let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];
let records = JSON.parse(localStorage.getItem('records')) || [];
let userWeight = localStorage.getItem('userWeight') || '';
let nutritionNeeds = JSON.parse(localStorage.getItem('nutritionNeeds')) || { protein: 0, fat: 0, carbs: 0 };
let currentTheme = localStorage.getItem('theme') || 'theme-dark';
let isMobileView = localStorage.getItem('mobileView') === 'true';

// Данные о продуктах
const foodData = {
    chicken_breast: { name: "Куриная грудка", calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    eggs: { name: "Яйца", calories: 70, protein: 6, fat: 5, carbs: 0.6 },
    oatmeal: { name: "Овсянка", calories: 389, protein: 16.9, fat: 6.9, carbs: 66.3 },
    rice: { name: "Рис вареный", calories: 130, protein: 2.7, fat: 0.3, carbs: 28.2 },
    buckwheat: { name: "Гречка вареная", calories: 110, protein: 4.2, fat: 1.1, carbs: 21.3 },
    potato: { name: "Картофель вареный", calories: 86, protein: 1.7, fat: 0.1, carbs: 20 },
    banana: { name: "Банан", calories: 105, protein: 1.3, fat: 0.4, carbs: 27 },
    apple: { name: "Яблоко", calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
    orange: { name: "Апельсин", calories: 62, protein: 1.2, fat: 0.2, carbs: 15.4 },
    milk: { name: "Молоко 2.5%", calories: 52, protein: 2.9, fat: 2.5, carbs: 4.7 },
    cottage_cheese: { name: "Творог 5%", calories: 121, protein: 17, fat: 5, carbs: 3 },
    yogurt: { name: "Йогурт натуральный", calories: 59, protein: 3.5, fat: 3.3, carbs: 3.6 },
    beef: { name: "Говядина", calories: 250, protein: 26, fat: 15, carbs: 0 },
    salmon: { name: "Лосось", calories: 208, protein: 20, fat: 13, carbs: 0 },
    tuna: { name: "Тунец консервированный", calories: 132, protein: 29, fat: 1, carbs: 0 },
    bread: { name: "Хлеб цельнозерновой", calories: 69, protein: 3.6, fat: 1, carbs: 12 },
    pasta: { name: "Макароны вареные", calories: 131, protein: 5, fat: 1, carbs: 25 },
    nuts: { name: "Орехи смешанные", calories: 185, protein: 5, fat: 16, carbs: 6 },
    avocado: { name: "Авокадо", calories: 160, protein: 2, fat: 15, carbs: 9 },
    olive_oil: { name: "Оливковое масло", calories: 119, protein: 0, fat: 14, carbs: 0 },
    cheese: { name: "Сыр", calories: 113, protein: 7, fat: 9, carbs: 0.4 },
    protein_shake: { name: "Протеиновый коктейль", calories: 120, protein: 24, fat: 1, carbs: 3 }
};

// Загрузка страницы
document.addEventListener('DOMContentLoaded', function() {
    // Применяем сохраненную тему
    document.body.className = currentTheme;
    
    // Применяем сохраненный вид (мобильный/десктоп)
    if (isMobileView) {
        document.body.classList.add('mobile-view');
        document.getElementById('viewToggle').textContent = 'Десктопный вид';
    }
    
    renderExercises();
    renderFoodItems();
    renderRecords();
    updateNutritionSummary();
    initProgressChart();
    
    if (userWeight) {
        document.getElementById('userWeight').value = userWeight;
    }
    
    if (nutritionNeeds.protein > 0) {
        document.getElementById('nutritionNeeds').style.display = 'block';
        document.getElementById('proteinNeed').textContent = nutritionNeeds.protein;
        document.getElementById('fatNeed').textContent = nutritionNeeds.fat;
        document.getElementById('carbsNeed').textContent = nutritionNeeds.carbs;
    }

    // Назначение обработчиков событий
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигационные кнопки
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            showSection(this.dataset.section);
        });
    });

    // Форма тренировки
    document.getElementById('exerciseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addExercise();
    });

    // Форма питания
    document.getElementById('nutritionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addFoodItem();
    });

    // Форма рекордов
    document.getElementById('recordForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addRecord();
    });

    // Калькулятор жима
    document.getElementById('calculatorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateBenchPress();
    });

    // Кнопка расчета нормы БЖУ
    document.getElementById('calculateNutritionBtn').addEventListener('click', function(e) {
        e.preventDefault();
        calculateNutritionNeeds();
    });

    // Кнопка смены темы
    document.getElementById('themeToggle').addEventListener('click', changeTheme);

    // Кнопка переключения вида
    document.getElementById('viewToggle').addEventListener('click', toggleView);
}

// Показать секцию
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Если это секция прогресса - обновляем график
    if (sectionId === 'progress') {
        updateProgressChart();
    }
}

// Добавление упражнения
function addExercise() {
    const exercise = {
        name: document.getElementById('exerciseName').value,
        sets: parseInt(document.getElementById('sets').value),
        reps: parseInt(document.getElementById('reps').value),
        weight: parseFloat(document.getElementById('weight').value),
        restTime: document.getElementById('restTime').value ? parseFloat(document.getElementById('restTime').value) : 0,
        date: new Date().toLocaleString()
    };
    
    exercises.push(exercise);
    localStorage.setItem('exercises', JSON.stringify(exercises));
    
    renderExercises();
    document.getElementById('exerciseForm').reset();
    
    // Анимация успешного добавления
    const button = document.querySelector('#exerciseForm button');
    button.textContent = '✓ Добавлено!';
    button.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
        button.textContent = 'Добавить упражнение';
        button.style.backgroundColor = '';
    }, 2000);
}

// Отображение упражнений
function renderExercises() {
    const exerciseList = document.getElementById('exerciseList');
    exerciseList.innerHTML = '';
    
    if (exercises.length === 0) {
        exerciseList.innerHTML = '<p>Нет записанных упражнений</p>';
        return;
    }
    
    exercises.slice().reverse().forEach(exercise => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        
        exerciseItem.innerHTML = `
            <div class="exercise-header">
                <div class="exercise-name">${exercise.name}</div>
                <div class="exercise-date">${exercise.date}</div>
            </div>
            <div class="exercise-details">
                <div class="exercise-detail">${exercise.sets} × ${exercise.reps}</div>
                <div class="exercise-detail">${exercise.weight} кг</div>
                <div class="exercise-detail">Отдых: ${exercise.restTime} мин</div>
                <div class="exercise-detail">Объем: ${(exercise.sets * exercise.reps * exercise.weight).toFixed(1)} кг</div>
            </div>
        `;
        
        exerciseList.appendChild(exerciseItem);
    });
}

// Добавление продукта
function addFoodItem() {
    const foodId = document.getElementById('foodItem').value;
    const quantity = parseFloat(document.getElementById('foodQuantity').value);
    
    if (!foodId || !quantity) return;
    
    const foodItem = {
        id: foodId,
        name: foodData[foodId].name,
        quantity: quantity,
        calories: foodData[foodId].calories * quantity,
        protein: foodData[foodId].protein * quantity,
        fat: foodData[foodId].fat * quantity,
        carbs: foodData[foodId].carbs * quantity,
        date: new Date().toLocaleString()
    };
    
    foodItems.push(foodItem);
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
    
    renderFoodItems();
    updateNutritionSummary();
    document.getElementById('nutritionForm').reset();
    
    // Анимация успешного добавления
    const button = document.querySelector('#nutritionForm button');
    button.textContent = '✓ Добавлено!';
    button.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
        button.textContent = 'Добавить';
        button.style.backgroundColor = '';
    }, 2000);
}

// Отображение продуктов
function renderFoodItems() {
    const foodList = document.getElementById('foodList');
    foodList.innerHTML = '';
    
    if (foodItems.length === 0) {
        foodList.innerHTML = '<p>Нет записанных продуктов</p>';
        return;
    }
    
    // Фильтруем только сегодняшние записи
    const today = new Date().toLocaleDateString();
    const todayItems = foodItems.filter(item => new Date(item.date).toLocaleDateString() === today);
    
    if (todayItems.length === 0) {
        foodList.innerHTML = '<p>Сегодня еще не было добавлено продуктов</p>';
        return;
    }
    
    todayItems.slice().reverse().forEach(item => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        
        foodItem.innerHTML = `
            <div class="food-info">
                <div class="food-name">${item.name} (${item.quantity} ${item.id === 'eggs' ? 'шт' : item.id === 'olive_oil' ? 'ст.л.' : item.id === 'nuts' || item.id === 'cheese' ? 'г' : item.id === 'bread' ? 'ломтик' : 'порция'})</div>
                <div class="food-details">
                    <div class="food-detail">${item.calories.toFixed(0)} ккал</div>
                    <div class="food-detail">${item.protein.toFixed(1)} г белка</div>
                    <div class="food-detail">${item.fat.toFixed(1)} г жиров</div>
                    <div class="food-detail">${item.carbs.toFixed(1)} г углеводов</div>
                </div>
            </div>
            <div class="food-date">${new Date(item.date).toLocaleTimeString()}</div>
        `;
        
        foodList.appendChild(foodItem);
    });
}

// Обновление сводки по питанию
function updateNutritionSummary() {
    // Фильтруем только сегодняшние записи
    const today = new Date().toLocaleDateString();
    const todayItems = foodItems.filter(item => new Date(item.date).toLocaleDateString() === today);
    
    const totals = todayItems.reduce((acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.fat += item.fat;
        acc.carbs += item.carbs;
        return acc;
    }, { calories: 0, protein: 0, fat: 0, carbs: 0 });
    
    document.getElementById('totalCalories').textContent = totals.calories.toFixed(0);
    document.getElementById('totalProtein').textContent = totals.protein.toFixed(1);
    document.getElementById('totalFat').textContent = totals.fat.toFixed(1);
    document.getElementById('totalCarbs').textContent = totals.carbs.toFixed(1);
}

// Расчет нормы БЖУ
function calculateNutritionNeeds() {
    const weight = parseFloat(document.getElementById('userWeight').value);
    
    if (!weight || weight < 30) {
        alert('Пожалуйста, введите корректный вес');
        return;
    }
    
    userWeight = weight;
    localStorage.setItem('userWeight', userWeight);
    
    // Расчет по формуле: 1.5–2 г белка; 0.8–1.5 г жиров; 2 г углеводов на кг веса
    nutritionNeeds = {
        protein: Math.round(weight * 1.8),
        fat: Math.round(weight * 1.2),
        carbs: Math.round(weight * 2)
    };
    
    localStorage.setItem('nutritionNeeds', JSON.stringify(nutritionNeeds));
    
    document.getElementById('nutritionNeeds').style.display = 'block';
    document.getElementById('proteinNeed').textContent = nutritionNeeds.protein;
    document.getElementById('fatNeed').textContent = nutritionNeeds.fat;
    document.getElementById('carbsNeed').textContent = nutritionNeeds.carbs;
}

// Добавление рекорда
function addRecord() {
    const record = {
        exercise: document.getElementById('recordExercise').value,
        value: parseFloat(document.getElementById('recordValue').value),
        date: new Date().toLocaleDateString()
    };
    
    // Проверяем, есть ли уже рекорд для этого упражнения
    const existingIndex = records.findIndex(r => r.exercise.toLowerCase() === record.exercise.toLowerCase());
    
    if (existingIndex >= 0) {
        // Обновляем существующий рекорд, если новый больше
        if (record.value > records[existingIndex].value) {
            records[existingIndex] = record;
        }
    } else {
        // Добавляем новый рекорд
        records.push(record);
    }
    
    localStorage.setItem('records', JSON.stringify(records));
    renderRecords();
    document.getElementById('recordForm').reset();
    
    // Анимация успешного добавления
    const button = document.querySelector('#recordForm button');
    button.textContent = '✓ Добавлено!';
    button.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
        button.textContent = 'Добавить рекорд';
        button.style.backgroundColor = '';
    }, 2000);
}

// Отображение рекордов
function renderRecords() {
    const recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = '';
    
    if (records.length === 0) {
        recordsList.innerHTML = '<p>Нет записанных рекордов</p>';
        return;
    }
    
    records.slice().reverse().forEach(record => {
        const recordCard = document.createElement('div');
        recordCard.className = 'record-card';
        
        recordCard.innerHTML = `
            <div class="record-name">${record.exercise}</div>
            <div class="record-value">${record.value} кг</div>
            <div class="record-date">${record.date}</div>
        `;
        
        recordsList.appendChild(recordCard);
    });
}

// Расчет жима
function calculateBenchPress() {
    const maxWeight = parseFloat(document.getElementById('maxWeight').value);
    const desiredReps = parseInt(document.getElementById('desiredReps').value);
    const currentReps = parseInt(document.getElementById('currentReps').value) || 1;
    const experience = parseFloat(document.getElementById('trainingExperience').value) || 1;
    
    // Формула Бжицки
    let calculatedWeight = maxWeight * (1 + 0.033 * desiredReps) / (1 + 0.033 * currentReps);
    
    // Корректировка на опыт (новички могут делать больше повторений с тем же весом)
    calculatedWeight *= (1 + (experience * 0.02));
    
    // Округляем до ближайших 2.5 кг
    calculatedWeight = Math.round(calculatedWeight / 2.5) * 2.5;
    
    document.getElementById('calculatedWeight').textContent = calculatedWeight + ' кг';
    
    let details = '';
    if (calculatedWeight > maxWeight) {
        details = 'Вы можете увеличить вес на ' + (calculatedWeight - maxWeight) + ' кг для ' + desiredReps + ' повторений!';
    } else if (calculatedWeight < maxWeight) {
        details = 'Для ' + desiredReps + ' повторений рекомендуется снизить вес на ' + (maxWeight - calculatedWeight) + ' кг.';
    } else {
        details = 'Ваш текущий вес оптимален для ' + desiredReps + ' повторений.';
    }
    
    document.getElementById('calculationDetails').textContent = details;
    document.getElementById('calculatorResult').style.display = 'block';
}

// Инициализация графика прогресса
let progressChart;
function initProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Максимальный вес (кг)',
                    data: [],
                    borderColor: '#ff0080',
                    backgroundColor: 'rgba(255, 0, 128, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Общий объем (кг)',
                    data: [],
                    borderColor: '#ff66b3',
                    backgroundColor: 'rgba(255, 102, 179, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    updateProgressChart();
}

// Обновление графика прогресса
function updateProgressChart() {
    if (exercises.length === 0) {
        document.getElementById('progressText').textContent = 'Нет данных для отображения прогресса';
        return;
    }
    
    // Группируем упражнения по дате
    const groupedByDate = {};
    exercises.forEach(exercise => {
        const date = new Date(exercise.date).toLocaleDateString();
        if (!groupedByDate[date]) {
            groupedByDate[date] = [];
        }
        groupedByDate[date].push(exercise);
    });
    
    // Сортируем даты
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(a) - new Date(b));
    
    // Рассчитываем максимальный вес и объем для каждой даты
    const maxWeights = [];
    const totalVolumes = [];
    
    sortedDates.forEach(date => {
        const dateExercises = groupedByDate[date];
        let maxWeight = 0;
        let totalVolume = 0;
        
        dateExercises.forEach(exercise => {
            if (exercise.weight > maxWeight) {
                maxWeight = exercise.weight;
            }
            totalVolume += exercise.sets * exercise.reps * exercise.weight;
        });
        
        maxWeights.push(maxWeight);
        totalVolumes.push(totalVolume);
    });
    
    // Обновляем график
    progressChart.data.labels = sortedDates;
    progressChart.data.datasets[0].data = maxWeights;
    progressChart.data.datasets[1].data = totalVolumes;
    progressChart.update();
    
    // Анализ прогресса
    let progressText = '';
    if (maxWeights.length > 1) {
        const lastWeight = maxWeights[maxWeights.length - 1];
        const prevWeight = maxWeights[maxWeights.length - 2];
        const progress = lastWeight - prevWeight;
        
        if (progress > 0) {
            progressText = `Отличный прогресс! Ваш максимальный вес увеличился на ${progress.toFixed(1)} кг с последней тренировки.`;
        } else if (progress < 0) {
            progressText = `Ваш максимальный вес уменьшился на ${Math.abs(progress).toFixed(1)} кг. Возможно, вам нужен отдых.`;
        } else {
            progressText = 'Ваш максимальный вес остался на прежнем уровне. Попробуйте увеличить нагрузку.';
        }
    } else {
        progressText = 'Продолжайте тренировки, чтобы увидеть прогресс!';
    }
    
    document.getElementById('progressText').textContent = progressText;
}

// Смена темы
function changeTheme() {
    const themes = ['theme-dark', 'theme-light', 'theme-neon', 'theme-pastel'];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    
    document.body.className = currentTheme;
    localStorage.setItem('theme', currentTheme);
    
    // Обновляем текст кнопки
    const themeNames = ['Темная', 'Светлая', 'Неоновая', 'Пастельная'];
    document.getElementById('themeToggle').textContent = themeNames[nextIndex] + ' тема';
}

// Переключение вида (мобильный/десктоп)
function toggleView() {
    isMobileView = !isMobileView;
    localStorage.setItem('mobileView', isMobileView);
    
    if (isMobileView) {
        document.body.classList.add('mobile-view');
        document.getElementById('viewToggle').textContent = 'Десктопный вид';
    } else {
        document.body.classList.remove('mobile-view');
        document.getElementById('viewToggle').textContent = 'Мобильный вид';
    }
}