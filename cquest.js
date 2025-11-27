// ================================
// C Quest - Game State Management
// ================================
class GameState {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "Beginner",
                description: "Learn the basics of C program structure",
                color: "#4CAF50",
                unlocked: true,
                completed: false,
                challenges: [
                    {
                        id: 1,
                        title: "Program Structure",
                        type: "drag-drop",
                        description: "Arrange these lines to form a valid C program",
                        tags: ["#include <stdio.h>", "int main()", "{", "printf(\"Hello World\\n\");", "return 0;", "}"],
                        solution: ["#include <stdio.h>", "int main()", "{", "printf(\"Hello World\\n\");", "return 0;", "}"],
                        points: 100,
                        completed: false
                    },
                    {
                        id: 2,
                        title: "Data Types Quiz",
                        type: "quiz",
                        description: "Which data type stores whole numbers?",
                        options: ["int", "float", "char", "double"],
                        correct: 0,
                        points: 50,
                        completed: false
                    },
                    {
                        id: 3,
                        title: "Hello World",
                        type: "code-editor",
                        description: "Write a program that prints 'Hello World'",
                        solution: `#include <stdio.h>\nint main() {\n  printf("Hello World\\n");\n  return 0;\n}`,
                        points: 75,
                        completed: false
                    }


                ]
            },

            {
                id: 2,
                name: "Intermediate",
                description: "Master input/output, operators, and conditionals",
                color: "#2196F3",
                unlocked: false,
                completed: false,
                challenges: [
                    {
                        id: 5,
                        title: "Input Quiz",
                        type: "quiz",
                        description: "Which function is used to take input in C?",
                        options: ["printf()", "scanf()", "input()", "read()"],
                        correct: 1,
                        points: 50,
                        completed: false
                    },
                    {
                        id: 6,
                        title: "If-Else Fill Blank",
                        type: "fill-blank",
                        description: "Complete the syntax: if (___) { ___ } else { ___ }",
                        blanks: ["condition", "true_block", "false_block"],
                        template: "if (___) { ___ } else { ___ }",
                        points: 75,
                        completed: false
                    },
                    {
                        id: 7,
                        title: "Output Prediction",
                        type: "quiz",
                        description: "What is the output of:\nint x=5;\nprintf(\"%d\", x+2);",
                        options: ["5", "7", "2", "Error"],
                        correct: 1,
                        points: 100,
                        completed: false
                    },
                    {
                        id: 8,
                        title: "Operators Drag-Drop",
                        type: "drag-drop",
                        description: "Match operators with their meaning",
                        tags: ["+", "-", "*", "/"],
                        solution: ["+", "-", "*", "/"], // simplified
                        points: 100,
                        completed: false
                    }
                ]
            },

            {
                id: 3,
                name: "Advanced",
                description: "Work with loops, arrays, and functions",
                color: "#FF9800",
                unlocked: false,
                completed: false,
                challenges: [
                    {
                        id: 9,
                        title: "Loop Quiz",
                        type: "quiz",
                        description: "Which loop is guaranteed to run at least once?",
                        options: ["for", "while", "do-while", "foreach"],
                        correct: 2,
                        points: 75,
                        completed: false
                    },
                    {
                        id: 10,
                        title: "Array Fill Blank",
                        type: "fill-blank",
                        description: "Complete: int arr[___] = {1,2,3};",
                        blanks: ["3"],
                        template: "int arr[___] = {1,2,3};",
                        points: 75,
                        completed: false
                    },
                    {
                        id: 11,
                        title: "Function Code Editor",
                        type: "code-editor",
                        description: "Write a function that returns the sum of two integers",
                        solution: `int sum(int a, int b) {\n  return a+b;\n}`,
                        points: 150,
                        completed: false
                    },
                    {
                        id: 12,
                        title: "Pointer Syntax Fix",
                        type: "code-editor",
                        description: "Fix errors:\nint main(){\n int *p;\n p = &10;\n printf(\"%d\", *p);\n}",
                        solution: `int main(){\n int x=10;\n int *p;\n p = &x;\n printf("%d", *p);\n}`,
                        points: 200,
                        completed: false
                    }
                ]
            },

            {
                id: 4,
                name: "Expert",
                description: "Structures, file handling, and advanced debugging",
                color: "#9C27B0",
                unlocked: false,
                completed: false,
                challenges: [
                    {
                        id: 13,
                        title: "Struct Quiz",
                        type: "quiz",
                        description: "Which keyword defines a structure?",
                        options: ["struct", "class", "object", "define"],
                        correct: 0,
                        points: 100,
                        completed: false
                    },
                    {
                        id: 14,
                        title: "Struct Fill Blank",
                        type: "fill-blank",
                        description: "Complete: struct Point { int ___; int ___; };",
                        blanks: ["x", "y"],
                        template: "struct Point { int ___; int ___; };",
                        points: 100,
                        completed: false
                    },
                    {
                        id: 15,
                        title: "File Handling Code Editor",
                        type: "code-editor",
                        description: "Write code to open a file 'data.txt' for reading",
                        solution: `FILE *f = fopen("data.txt", "r");\nif(f==NULL){\n  printf("Error opening file");\n}`,
                        points: 200,
                        completed: false
                    },
                    {
                        id: 16,
                        title: "Output Prediction",
                        type: "quiz",
                        description: "What is the output?\nint a=5;\nint b=2;\nprintf(\"%d\", a/b);",
                        options: ["2.5", "2", "Error", "5"],
                        correct: 1,
                        points: 150,
                        completed: false
                    },
                    {
                        id: 17,
                        title: "Debugging Challenge",
                        type: "code-editor",
                        description: "Fix the errors:\n#include stdio.h\nint main( {\n int a=5\n printf(\"%d\", a);\n return 0 }",
                        solution: `#include <stdio.h>\nint main(){\n int a=5;\n printf("%d", a);\n return 0;\n}`,
                        points: 200,
                        completed: false
                    }
                ]
            }
        ];

        this.badges = [
            { name: "First Steps", description: "Complete your first C challenge", icon: "🥾", requirement: "complete_first_challenge", earned: false },
            { name: "Loop Master", description: "Master all loop challenges", icon: "🔄", requirement: "complete_loop_challenges", earned: false },
            { name: "Pointer Pro", description: "Solve pointer challenges", icon: "📌", requirement: "complete_pointer_challenge", earned: false },
            { name: "Struct Specialist", description: "Solve structure challenges", icon: "🧩", requirement: "complete_struct_challenge", earned: false },
            { name: "C Expert", description: "Complete all levels", icon: "👑", requirement: "complete_all_levels", earned: false }
        ];

        this.cReference = [
            { tag: "#include <stdio.h>", description: "Header file for input/output functions", example: "#include <stdio.h>" },
            { tag: "int main()", description: "Entry point of a C program", example: "int main() { return 0; }" },
            { tag: "printf()", description: "Prints formatted output", example: "printf(\"Hello World\\n\");" },
            { tag: "scanf()", description: "Reads formatted input", example: "scanf(\"%d\", &num);" },
            { tag: "for loop", description: "Repeats code a fixed number of times", example: "for(int i=0; i<5; i++) { }" },
            { tag: "pointer", description: "Stores memory address of a variable", example: "int *p = &x;" },
            { tag: "struct", description: "Defines a custom data type", example: "struct Point { int x; int y; };" }
        ];

        this.playerStats = { totalPoints: 0, streak: 0, badgesEarned: 0 };
        this.currentChallenge = null;
    }

    updateProgress() {
        for (let i = 0; i < this.levels.length; i++) {
            const level = this.levels[i];
            const allChallengesCompleted = level.challenges.every(c => c.completed);
            if (allChallengesCompleted && !level.completed) {
                level.completed = true;
                if (i < this.levels.length - 1) {
                    this.levels[i + 1].unlocked = true;
                }
            }
        }
        return this.checkBadges();
    }

    checkBadges() {
        const completedChallenges = this.levels.flatMap(l => l.challenges).filter(c => c.completed);
        const completedLevels = this.levels.filter(l => l.completed);

        if (completedChallenges.length >= 1 && !this.badges[0].earned) {
            this.badges[0].earned = true; this.playerStats.badgesEarned++; return this.badges[0];
        }
        if (completedLevels.length >= 1 && !this.badges[1].earned) {
            this.badges[1].earned = true; this.playerStats.badgesEarned++; return this.badges[1];
        }
        if (completedLevels.length === this.levels.length && !this.badges[4].earned) {
            this.badges[4].earned = true; this.playerStats.badgesEarned++; return this.badges[4];
        }
        return null;
    }

    completeChallenge(challengeId, points) {
        for (const level of this.levels) {
            const challenge = level.challenges.find(c => c.id === challengeId);
            if (challenge && !challenge.completed) {
                challenge.completed = true;
                this.playerStats.totalPoints += points;
                this.playerStats.streak++;
                this.updateProgress();
                return true;
            }
        }
        return false;
    }
}

// Initialize game state
const gameState = new GameState();
// ================================
// C Quest - DOM Elements & Navigation
// ================================

// DOM Elements
const elements = {
    totalPoints: document.getElementById('totalPoints'),
    badgeCount: document.getElementById('badgeCount'),
    streakCount: document.getElementById('streakCount'),
    levelsGrid: document.getElementById('levelsGrid'),
    challengeModal: document.getElementById('challengeModal'),
    challengeTitle: document.getElementById('challengeTitle'),
    challengeDescription: document.getElementById('challengeDescription'),
    challengeArea: document.getElementById('challengeArea'),
    submitAnswer: document.getElementById('submitAnswer'),
    showHint: document.getElementById('showHint'),
    closeModal: document.getElementById('closeModal'),
    successModal: document.getElementById('successModal'),
    pointsEarned: document.getElementById('pointsEarned'),
    badgeEarned: document.getElementById('badgeEarned'),
    badgeName: document.getElementById('badgeName'),
    continueBtn: document.getElementById('continueBtn'),
    cEditor: document.getElementById('cEditor'),
    cOutput: document.getElementById('cOutput'),
    badgesGrid: document.getElementById('badgesGrid'),
    referenceContent: document.getElementById('referenceContent'),
    navTabs: document.querySelectorAll('.nav-tab'),
    gameSections: document.querySelectorAll('.game-section')
};

// Navigation
function initNavigation() {
    elements.navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSection = tab.dataset.tab;
            switchSection(targetSection);
        });
    });
}

function switchSection(sectionName) {
    // Update active tab
    elements.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === sectionName);
    });

    // Update active section
    elements.gameSections.forEach(section => {
        section.classList.toggle('active', section.id === `${sectionName}-section`);
    });

    // Section-specific rendering
    if (sectionName === 'levels') renderLevels();
    else if (sectionName === 'achievements') renderBadges();
    else if (sectionName === 'reference') renderReference();
}
// ================================
// C Quest - Rendering Functions
// ================================

function renderLevels() {
    elements.levelsGrid.innerHTML = '';
    gameState.levels.forEach(level => {
        const completedChallenges = level.challenges.filter(c => c.completed).length;
        const totalChallenges = level.challenges.length;
        const progress = (completedChallenges / totalChallenges) * 100;

        const levelCard = document.createElement('div');
        levelCard.className = `level-card ${!level.unlocked ? 'locked' : ''}`;
        levelCard.innerHTML = `
      <div class="level-header">
        <div class="level-icon" style="background-color: ${level.color}">${level.id}</div>
        <div class="level-info">
          <h3>${level.name}</h3>
          <p>${level.description}</p>
        </div>
      </div>
      <div class="level-progress">
        <div class="level-stats">
          <span>${completedChallenges}/${totalChallenges} Challenges</span>
          <span>${level.completed ? '✓ Complete' : level.unlocked ? 'Available' : '🔒 Locked'}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      </div>
    `;
        if (level.unlocked) {
            levelCard.addEventListener('click', () => openLevelChallenges(level));
        }
        elements.levelsGrid.appendChild(levelCard);
    });
}

function renderBadges() {
    elements.badgesGrid.innerHTML = '';
    gameState.badges.forEach(badge => {
        const badgeCard = document.createElement('div');
        badgeCard.className = `badge-card ${badge.earned ? 'earned' : ''}`;
        badgeCard.innerHTML = `
      <div class="badge-icon">${badge.icon}</div>
      <h3 class="badge-name">${badge.name}</h3>
      <p class="badge-description">${badge.description}</p>
    `;
        elements.badgesGrid.appendChild(badgeCard);
    });
}

function renderReference() {
    elements.referenceContent.innerHTML = '';
    const referenceGrid = document.createElement('div');
    referenceGrid.className = 'reference-grid';
    gameState.cReference.forEach(item => {
        const referenceItem = document.createElement('div');
        referenceItem.className = 'reference-item';
        referenceItem.innerHTML = `
      <div class="reference-tag">${item.tag}</div>
      <div class="reference-description">${item.description}</div>
      <div class="reference-example">${item.example}</div>
    `;
        referenceGrid.appendChild(referenceItem);
    });
    elements.referenceContent.appendChild(referenceGrid);
}
// ================================
// C Quest - Challenges & Feedback
// ================================

// Render Challenge Types
function openLevelChallenges(level) {
    const nextChallenge = level.challenges.find(c => !c.completed) || level.challenges[0];
    openChallenge(nextChallenge);
}

function openChallenge(challenge) {
    gameState.currentChallenge = challenge;
    elements.challengeTitle.textContent = challenge.title;
    elements.challengeDescription.textContent = challenge.description;
    elements.challengeArea.innerHTML = '';

    switch (challenge.type) {
        case 'quiz': renderQuizChallenge(challenge); break;
        case 'code-editor': renderCodeEditorChallenge(challenge); break;
        case 'fill-blank': renderFillBlankChallenge(challenge); break;
        case 'drag-drop': renderDragDropChallenge(challenge); break;
    }
    elements.challengeModal.classList.add('active');
}

function renderQuizChallenge(challenge) {
    const quizContainer = document.createElement('div');
    quizContainer.className = 'quiz-options';
    challenge.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'quiz-option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', () => {
            quizContainer.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            optionElement.classList.add('selected');
        });
        quizContainer.appendChild(optionElement);
    });
    elements.challengeArea.appendChild(quizContainer);
}

function renderCodeEditorChallenge(challenge) {
    const editorContainer = document.createElement('div');
    editorContainer.innerHTML = `<textarea class="code-editor" rows="8" placeholder="Type your C code here..."></textarea>`;
    elements.challengeArea.appendChild(editorContainer);
}

function renderFillBlankChallenge(challenge) {
    const container = document.createElement('div');
    container.className = 'fill-blank-container';
    let template = challenge.template;
    challenge.blanks.forEach((blank, index) => {
        template = template.replace('___', `<input type="text" class="blank-input" data-index="${index}" placeholder="${blank}">`);
    });
    container.innerHTML = template;
    elements.challengeArea.appendChild(container);
}

function renderDragDropChallenge(challenge) {
    const container = document.createElement('div');
    container.className = 'drag-drop-container';
    const dropZones = document.createElement('div');
    dropZones.className = 'drop-zones';
    challenge.tags.forEach((tag, i) => {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.dataset.index = i;
        zone.textContent = `Drop item ${i + 1} here`;
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        dropZones.appendChild(zone);
    });
    const draggableItems = document.createElement('div');
    draggableItems.className = 'draggable-items';
    [...challenge.tags].sort(() => Math.random() - 0.5).forEach(tag => {
        const item = document.createElement('div');
        item.className = 'draggable-item';
        item.textContent = tag;
        item.draggable = true;
        item.dataset.tag = tag;
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        draggableItems.appendChild(item);
    });
    container.appendChild(dropZones);
    container.appendChild(draggableItems);
    elements.challengeArea.appendChild(container);
}

// Drag & Drop Handlers
let draggedElement = null;
function handleDragStart(e) { draggedElement = e.target; e.target.classList.add('dragging'); }
function handleDragEnd(e) { e.target.classList.remove('dragging'); draggedElement = null; }
function handleDragOver(e) { e.preventDefault(); e.target.classList.add('drag-over'); }
function handleDrop(e) {
    e.preventDefault(); e.target.classList.remove('drag-over');
    if (draggedElement && !e.target.classList.contains('filled')) {
        e.target.textContent = draggedElement.dataset.tag;
        e.target.classList.add('filled');
        e.target.dataset.tag = draggedElement.dataset.tag;
        draggedElement.remove();
    }
}

// Answer Submission
function submitAnswer() {
    if (!gameState.currentChallenge) return;
    const challenge = gameState.currentChallenge;
    let isCorrect = false;
    switch (challenge.type) {
        case 'quiz': isCorrect = checkQuizAnswer(challenge); break;
        case 'code-editor': isCorrect = checkCodeEditorAnswer(challenge); break;
        case 'fill-blank': isCorrect = checkFillBlankAnswer(challenge); break;
        case 'drag-drop': isCorrect = checkDragDropAnswer(challenge); break;
    }
    if (isCorrect) {
        gameState.completeChallenge(challenge.id, challenge.points);
        const badge = gameState.checkBadges();
        showSuccessModal(challenge.points, badge);
    } else showErrorFeedback();
}

// Validation Functions
function checkQuizAnswer(challenge) {
    const selected = document.querySelector('.quiz-option.selected');
    if (!selected) return false;
    const idx = parseInt(selected.dataset.index);
    const correct = idx === challenge.correct;
    document.querySelectorAll('.quiz-option').forEach((opt, i) => {
        if (i === challenge.correct) opt.classList.add('correct');
        else if (i === idx && !correct) opt.classList.add('incorrect');
    });
    return correct;
}

function checkCodeEditorAnswer(challenge) {
    const userCode = elements.challengeArea.querySelector('.code-editor').value.trim();
    return userCode === challenge.solution.trim();
}

function checkFillBlankAnswer(challenge) {
    const inputs = elements.challengeArea.querySelectorAll('.blank-input');
    let allCorrect = true;
    inputs.forEach((input, i) => {
        if (input.value.trim() !== challenge.blanks[i]) {
            allCorrect = false; input.classList.add('error-feedback');
        } else input.classList.add('success-feedback');
    });
    return allCorrect;
}

function checkDragDropAnswer(challenge) {
    const zones = document.querySelectorAll('.drop-zone');
    let allCorrect = true;
    zones.forEach((zone, i) => {
        if (zone.dataset.tag !== challenge.solution[i]) {
            allCorrect = false; zone.classList.add('error-feedback');
        } else zone.classList.add('success-feedback');
    });
    return allCorrect;
}

// Feedback
function showSuccessModal(points, badge) {
    elements.pointsEarned.textContent = points;
    if (badge) { elements.badgeEarned.style.display = 'block'; elements.badgeName.textContent = badge.name; }
    else elements.badgeEarned.style.display = 'none';
    updateStats(); elements.successModal.classList.add('active');
}
function showErrorFeedback() {
    elements.challengeArea.classList.add('error-feedback');
    setTimeout(() => elements.challengeArea.classList.remove('error-feedback'), 1000);
}
function updateStats() {
    elements.totalPoints.textContent = gameState.playerStats.totalPoints;
    elements.badgeCount.textContent = gameState.playerStats.badgesEarned;
    elements.streakCount.textContent = gameState.playerStats.streak;
}

// Sandbox Simulation
function initSandbox() {
    elements.cEditor.addEventListener('input', updateCOutput);
    updateCOutput();
}
function updateCOutput() {
    const code = elements.cEditor.value;
    // Simple simulation: detect printf statements and show output
    const match = code.match(/printf\("([^"]*)"/);
    elements.cOutput.textContent = match ? match[1] : "(no output)";
}

// Event Listeners
function initEventListeners() {
    elements.closeModal.addEventListener('click', () => elements.challengeModal.classList.remove('active'));
    elements.submitAnswer.addEventListener('click', submitAnswer);
    elements.continueBtn.addEventListener('click', () => {
        elements.successModal.classList.remove('active');
        elements.challengeModal.classList.remove('active');
        renderLevels();
    });
    elements.showHint.addEventListener('click', () => alert('Hint: Check the C Reference Guide for syntax examples!'));
    elements.challengeModal.addEventListener('click', e => { if (e.target === elements.challengeModal) elements.challengeModal.classList.remove('active'); });
    elements.successModal.addEventListener('click', e => { if (e.target === elements.successModal) elements.successModal.classList.remove('active'); });
}

// Initialize Game
function initGame() {
    initNavigation();
    initEventListeners();
    initSandbox();
    updateStats();
    renderLevels();
    renderBadges();
    renderReference();
}
document.addEventListener('DOMContentLoaded', initGame);