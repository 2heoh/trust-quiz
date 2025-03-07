import 'chart.js';

// Initialize default quiz data
let quizData = [
    {
        title: "Раздел 1",
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
        title: "Раздел 2",
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
        title: "Раздел 3",
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
        title: "Раздел 4",
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
        title: "Раздел 5",
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
    
    chart = new Chart(elements.resultsChart, {
        type: 'radar',
        data: {
            labels: quizData.map(section => section.title),
            datasets: [{
                label: 'Результаты',
                data: results,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgb(54, 162, 235)',
                pointBackgroundColor: 'rgb(54, 162, 235)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(54, 162, 235)'
            }]
        },
        options: {
            scales: {
                r: {
                    min: -5,
                    max: 5,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            elements: {
                line: {
                    borderWidth: 3
                }
            }
        }
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

