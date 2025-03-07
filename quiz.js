import 'chart.js';

// Initialize default quiz data
let quizData = [
    {
        title: "Предпринимательство",
        questions: [
            "Вопрос 1 раздела 1",
            "Вопрос 2 раздела 1",
            "Вопрос 3 раздела 1",
            "Вопрос 4 раздела 1",
            "Вопрос 5 раздела 1",
            "Вопрос 6 раздела 1",
            "Вопрос 7 раздела 1"
        ]
    },
    {
        title: "Синхронизация",
        questions: [
            "Вопрос 1 раздела 2",
            "Вопрос 2 раздела 2",
            "Вопрос 3 раздела 2",
            "Вопрос 4 раздела 2",
            "Вопрос 5 раздела 2",
            "Вопрос 6 раздела 2",
            "Вопрос 7 раздела 2"
        ]
    },
    {
        title: "Коллаборация",
        questions: [
            "Вопрос 1 раздела 3",
            "Вопрос 2 раздела 3",
            "Вопрос 3 раздела 3",
            "Вопрос 4 раздела 3",
            "Вопрос 5 раздела 3",
            "Вопрос 6 раздела 3",
            "Вопрос 7 раздела 3"
        ]
    },
    {
        title: "Зрелость",
        questions: [
            "Вопрос 1 раздела 4",
            "Вопрос 2 раздела 4",
            "Вопрос 3 раздела 4",
            "Вопрос 4 раздела 4",
            "Вопрос 5 раздела 4",
            "Вопрос 6 раздела 4",
            "Вопрос 7 раздела 4"
        ]
    },
    {
        title: "Вариативность",
        questions: [
            "Вопрос 1 раздела 5",
            "Вопрос 2 раздела 5",
            "Вопрос 3 раздела 5",
            "Вопрос 4 раздела 5",
            "Вопрос 5 раздела 5",
            "Вопрос 6 раздела 5",
            "Вопрос 7 раздела 5"
        ]
    }
];

// Try to load saved quiz data from localStorage
const savedQuizData = localStorage.getItem('quizData');
if (savedQuizData) {
    try {
        quizData = JSON.parse(savedQuizData);
    } catch (e) {
        console.error("Failed to parse saved quiz data", e);
    }
}

// Initialize user responses
let userResponses = [];
for (let i = 0; i < quizData.length; i++) {
    userResponses.push(new Array(quizData[i].questions.length).fill(0));
}

// Current state
let currentSection = 0;
let currentQuestion = 0;
let chart = null;

// DOM elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen'),
    admin: document.getElementById('admin-screen')
};

const elements = {
    startButton: document.getElementById('start-button'),
    adminButton: document.getElementById('admin-button'),
    prevButton: document.getElementById('prev-button'),
    nextButton: document.getElementById('next-button'),
    restartButton: document.getElementById('restart-button'),
    saveAdminButton: document.getElementById('save-admin'),
    backAdminButton: document.getElementById('back-admin'),
    sectionTitle: document.getElementById('section-title'),
    questionText: document.getElementById('question-text'),
    ratingSlider: document.getElementById('rating-slider'),
    ratingValue: document.getElementById('rating-value'),
    progressBar: document.getElementById('progress-bar'),
    resultsChart: document.getElementById('results-chart'),
    adminSections: document.getElementById('admin-sections')
};

// Event listeners
elements.startButton.addEventListener('click', startQuiz);
elements.adminButton.addEventListener('click', showAdminScreen);
elements.prevButton.addEventListener('click', goToPreviousQuestion);
elements.nextButton.addEventListener('click', goToNextQuestion);
elements.restartButton.addEventListener('click', restartQuiz);
elements.saveAdminButton.addEventListener('click', saveAdminChanges);
elements.backAdminButton.addEventListener('click', goBackFromAdmin);
elements.ratingSlider.addEventListener('input', updateRatingValue);

// Functions
function showScreen(screenId) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    screens[screenId].classList.add('active');
}

function startQuiz() {
    showScreen('quiz');
    currentSection = 0;
    currentQuestion = 0;
    userResponses = [];
    for (let i = 0; i < quizData.length; i++) {
        userResponses.push(new Array(quizData[i].questions.length).fill(0));
    }
    showCurrentQuestion();
}

function showCurrentQuestion() {
    const section = quizData[currentSection];
    elements.sectionTitle.textContent = section.title;
    elements.questionText.textContent = section.questions[currentQuestion];
    
    // Update rating slider value
    elements.ratingSlider.value = userResponses[currentSection][currentQuestion];
    elements.ratingValue.textContent = userResponses[currentSection][currentQuestion];
    
    // Update progress bar
    const totalQuestions = quizData.reduce((acc, section) => acc + section.questions.length, 0);
    const questionsDone = quizData.slice(0, currentSection).reduce((acc, section) => acc + section.questions.length, 0) + currentQuestion;
    const progress = (questionsDone / totalQuestions) * 100;
    elements.progressBar.style.width = `${progress}%`;
    
    // Update button states
    elements.prevButton.disabled = currentSection === 0 && currentQuestion === 0;
    
    const isLastQuestion = currentSection === quizData.length - 1 && currentQuestion === section.questions.length - 1;
    elements.nextButton.textContent = isLastQuestion ? "Завершить" : "Далее";
}

function updateRatingValue() {
    elements.ratingValue.textContent = elements.ratingSlider.value;
    userResponses[currentSection][currentQuestion] = parseInt(elements.ratingSlider.value);
}

function goToPreviousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
    } else if (currentSection > 0) {
        currentSection--;
        currentQuestion = quizData[currentSection].questions.length - 1;
    }
    showCurrentQuestion();
}

function goToNextQuestion() {
    // Save current response
    userResponses[currentSection][currentQuestion] = parseInt(elements.ratingSlider.value);
    
    if (currentQuestion < quizData[currentSection].questions.length - 1) {
        currentQuestion++;
    } else if (currentSection < quizData.length - 1) {
        currentSection++;
        currentQuestion = 0;
    } else {
        showResults();
        return;
    }
    showCurrentQuestion();
}

function showResults() {
    showScreen('results');
    
    // Calculate average score for each section
    const results = userResponses.map(sectionResponses => {
        return sectionResponses.reduce((sum, value) => sum + value, 0) / sectionResponses.length;
    });
    
    // Create radar chart
    if (chart) {
        chart.destroy();
    }
    
    // Определение цветов для секторов
    const backgroundColors = [
        'rgba(75, 192, 75, 0.7)',  // Зеленый
        'rgba(75, 192, 75, 0.7)',  // Зеленый
        'rgba(75, 192, 75, 0.7)',  // Зеленый
        'rgba(255, 205, 86, 0.7)', // Желтый
        'rgba(255, 205, 86, 0.7)'  // Желтый
    ];
    
    const borderColors = [
        'rgba(40, 167, 69, 0.9)',  // Зеленый
        'rgba(40, 167, 69, 0.9)',  // Зеленый
        'rgba(40, 167, 69, 0.9)',  // Зеленый
        'rgba(255, 193, 7, 0.9)',  // Желтый
        'rgba(255, 193, 7, 0.9)'   // Желтый
    ];
    
    // Преобразуем данные для отображения (от 0 до 10 вместо -5 до 5)
    const displayData = results.map(value => value + 5);
    
    chart = new Chart(elements.resultsChart, {
        type: 'polarArea',
        data: {
            labels: quizData.map(section => section.title),
            datasets: [{
                label: 'Результаты',
                data: displayData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0,
                    max: 10,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    angleLines: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Скрываем легенду, так как подписи будут вокруг диаграммы
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            let value = context.raw - 5; // Возвращаем к исходному значению
                            return `${label}: ${value.toFixed(1)}`;
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        }
    });
    
    // Создаем подписи вокруг диаграммы
    createLabelsAroundChart();
    
    // Обновляем итоговый счет
    const totalScore = results.reduce((sum, value) => sum + value, 0) / results.length;
    document.getElementById('final-score').textContent = totalScore.toFixed(1);
}

// Функция для создания подписей вокруг диаграммы
function createLabelsAroundChart() {
    // Очищаем предыдущие подписи, если они есть
    const existingLabels = document.querySelectorAll('.chart-label');
    existingLabels.forEach(label => label.remove());
    
    const chartContainer = document.querySelector('.chart-container');
    const canvas = document.getElementById('results-chart');
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.85; // Радиус для размещения подписей
    
    // Создаем подписи для каждого раздела
    quizData.forEach((section, index) => {
        const angle = (index * (2 * Math.PI / quizData.length)) - Math.PI / 2; // Начинаем с верхней точки
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = section.title;
        
        // Позиционируем подпись
        label.style.position = 'absolute';
        label.style.left = `${x}px`;
        label.style.top = `${y}px`;
        label.style.transform = 'translate(-50%, -50%)';
        label.style.textAlign = 'center';
        label.style.fontWeight = 'bold';
        label.style.fontSize = '14px';
        label.style.color = '#333';
        label.style.maxWidth = '120px';
        label.style.textShadow = '0 0 5px white';
        
        chartContainer.appendChild(label);
    });
}

function restartQuiz() {
    showScreen('welcome');
}

function showAdminScreen() {
    showScreen('admin');
    renderAdminSections();
}

function renderAdminSections() {
    elements.adminSections.innerHTML = '';
    
    quizData.forEach((section, sectionIndex) => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'admin-section';
        
        const sectionHeader = document.createElement('h3');
        const sectionTitleInput = document.createElement('input');
        sectionTitleInput.type = 'text';
        sectionTitleInput.value = section.title;
        sectionTitleInput.dataset.section = sectionIndex;
        sectionTitleInput.className = 'section-title-input';
        
        sectionHeader.textContent = `Раздел ${sectionIndex + 1}: `;
        sectionHeader.appendChild(sectionTitleInput);
        sectionElement.appendChild(sectionHeader);
        
        section.questions.forEach((question, questionIndex) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'admin-question';
            
            const questionTextarea = document.createElement('textarea');
            questionTextarea.value = question;
            questionTextarea.dataset.section = sectionIndex;
            questionTextarea.dataset.question = questionIndex;
            questionTextarea.className = 'question-textarea';
            
            questionElement.appendChild(questionTextarea);
            sectionElement.appendChild(questionElement);
        });
        
        elements.adminSections.appendChild(sectionElement);
    });
}

function saveAdminChanges() {
    // Update section titles
    document.querySelectorAll('.section-title-input').forEach(input => {
        const sectionIndex = parseInt(input.dataset.section);
        quizData[sectionIndex].title = input.value;
    });
    
    // Update question texts
    document.querySelectorAll('.question-textarea').forEach(textarea => {
        const sectionIndex = parseInt(textarea.dataset.section);
        const questionIndex = parseInt(textarea.dataset.question);
        quizData[sectionIndex].questions[questionIndex] = textarea.value;
    });
    
    // Save to localStorage
    localStorage.setItem('quizData', JSON.stringify(quizData));
    
    alert('Изменения сохранены');
    goBackFromAdmin();
}

function goBackFromAdmin() {
    showScreen('welcome');
}

