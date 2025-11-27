// Game State Management
class GameState {
  constructor() {
    this.levels = [
      {
        id: 1,
        name: "Novice",
        description: "Learn the basics of HTML structure",
        color: "#4CAF50",
        unlocked: true,
        completed: false,
        challenges: [
          {
            id: 1,
            title: "HTML Document Structure",
            type: "drag-drop",
            description: "Arrange these tags in the correct order to create a basic HTML document",
            tags: ["<!DOCTYPE html>", "<html>", "<head>", "<title>", "</title>", "</head>", "<body>", "</body>", "</html>"],
            solution: ["<!DOCTYPE html>", "<html>", "<head>", "<title>", "</title>", "</head>", "<body>", "</body>", "</html>"],
            points: 100,
            completed: false
          },
          {
            id: 2,
            title: "Headings Hierarchy",
            type: "quiz",
            description: "Which heading tag creates the largest heading?",
            options: ["<h6>", "<h1>", "<h3>", "<h5>"],
            correct: 1,
            points: 50,
            completed: false
          },
          {
            id: 3,
            title: "Paragraph Power",
            type: "code-editor",
            description: "Create a paragraph with the text 'Hello World'",
            solution: "<p>Hello World</p>",
            points: 75,
            completed: false
          }
        ]
      },
      {
        id: 2,
        name: "Apprentice",
        description: "Master links, images, and lists",
        color: "#2196F3",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 4,
            title: "Link Creation",
            type: "code-editor",
            description: "Create a link to 'https://example.com' with text 'Visit Example'",
            solution: "<a href=\"https://example.com\">Visit Example</a>",
            points: 100,
            completed: false
          },
          {
            id: 5,
            title: "Image Insertion",
            type: "fill-blank",
            description: "Complete the image tag: <img ___='image.jpg' ___='Description'>",
            blanks: ["src", "alt"],
            template: "<'img ___='image.jpg' ___='Description'>",
            points: 75,
            completed: false
          }
        ]
      },
      {
        id: 3,
        name: "Master",
        description: "Build forms and semantic elements",
        color: "#FF9800",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 6,
            title: "Form Elements",
            type: "drag-drop",
            description: "Build a simple contact form with proper structure",
            tags: ["<form>", "<label>", "<input>", "</label>", "</form>"],
            solution: ["<form>", "<label>", "<input>", "</label>", "</form>"],
            points: 150,
            completed: false
          },
          {
            id: 7,
            title: "Semantic HTML",
            type: "quiz",
            description: "Which tag represents the main content of a document?",
            options: ["<div>", "<main>", "<section>", "<content>"],
            correct: 1,
            points: 100,
            completed: false
          }
        ]
      },
      {
        id: 4,
        name: "Expert",
        description: "Advanced HTML and best practices",
        color: "#9C27B0",
        unlocked: false,
        completed: false,
        challenges: [
          {
            id: 8,
            title: "Accessibility Features",
            type: "code-editor",
            description: "Add proper ARIA labels and semantic markup to improve accessibility",
            solution: "<button aria-label=\"Close dialog\">X</button>",
            points: 200,
            completed: false
          }
        ]
      }
    ];
    
    this.badges = [
      { name: "First Steps", description: "Complete your first challenge", icon: "🥾", requirement: "complete_first_challenge", earned: false },
      { name: "Tag Master", description: "Master all basic HTML tags", icon: "🏷️", requirement: "complete_level_1", earned: false },
      { name: "Link Builder", description: "Create 5 different types of links", icon: "🔗", requirement: "create_5_links", earned: false },
      { name: "Form Wizard", description: "Build a complete form", icon: "📝", requirement: "complete_form_challenge", earned: false },
      { name: "HTML Expert", description: "Complete all levels", icon: "👑", requirement: "complete_all_levels", earned: false }
    ];
    
    this.htmlReference = [
      { tag: "<html>", description: "Root element of HTML document", example: "<html lang='en'>" },
      { tag: "<head>", description: "Contains metadata about the document", example: "<head><title>Page Title</title></head>" },
      { tag: "<body>", description: "Contains the visible content", example: "<body><h1>Welcome</h1></body>" },
      { tag: "<h1> to <h6>", description: "Heading elements from largest to smallest", example: "<h1>Main Heading</h1>" },
      { tag: "<p>", description: "Paragraph element", example: "<p>This is a paragraph.</p>" },
      { tag: "<a>", description: "Anchor/link element", example: "<a href='https://example.com'>Link text</a>" },
      { tag: "<img>", description: "Image element", example: "<img src='image.jpg' alt='Description'>" }
    ];
    
    this.playerStats = {
      totalPoints: 0,
      streak: 0,
      badgesEarned: 0
    };
    
    this.currentChallenge = null;
  }
  
  updateProgress() {
    // Update level unlock status
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
    
    // Check for badge requirements
    this.checkBadges();
  }
  
  checkBadges() {
    const completedChallenges = this.levels.flatMap(l => l.challenges).filter(c => c.completed);
    const completedLevels = this.levels.filter(l => l.completed);
    
    // First Steps badge
    if (completedChallenges.length >= 1 && !this.badges[0].earned) {
      this.badges[0].earned = true;
      this.playerStats.badgesEarned++;
      return this.badges[0];
    }
    
    // Tag Master badge (complete level 1)
    if (completedLevels.length >= 1 && !this.badges[1].earned) {
      this.badges[1].earned = true;
      this.playerStats.badgesEarned++;
      return this.badges[1];
    }
    
    // Form Wizard badge (complete form challenge)
    const formChallengeCompleted = completedChallenges.some(c => c.title === "Form Elements");
    if (formChallengeCompleted && !this.badges[3].earned) {
      this.badges[3].earned = true;
      this.playerStats.badgesEarned++;
      return this.badges[3];
    }
    
    // HTML Expert badge (complete all levels)
    if (completedLevels.length === this.levels.length && !this.badges[4].earned) {
      this.badges[4].earned = true;
      this.playerStats.badgesEarned++;
      return this.badges[4];
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
  successTitle: document.getElementById('successTitle'),
  successMessage: document.getElementById('successMessage'),
  pointsEarned: document.getElementById('pointsEarned'),
  badgeEarned: document.getElementById('badgeEarned'),
  badgeName: document.getElementById('badgeName'),
  continueBtn: document.getElementById('continueBtn'),
  htmlEditor: document.getElementById('htmlEditor'),
  preview: document.getElementById('preview'),
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
  
  // Initialize section-specific content
  if (sectionName === 'levels') {
    renderLevels();
  } else if (sectionName === 'achievements') {
    renderBadges();
  } else if (sectionName === 'reference') {
    renderReference();
  }
}

// Render Functions
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
        <div class="level-icon" style="background-color: ${level.color}">
          ${level.id}
        </div>
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
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
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
  
  gameState.htmlReference.forEach(item => {
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

// Challenge Functions
function openLevelChallenges(level) {
  // For simplicity, we'll open the first incomplete challenge
  const nextChallenge = level.challenges.find(c => !c.completed) || level.challenges[0];
  openChallenge(nextChallenge);
}

function openChallenge(challenge) {
  gameState.currentChallenge = challenge;
  elements.challengeTitle.textContent = challenge.title;
  elements.challengeDescription.textContent = challenge.description;
  
  // Clear previous content
  elements.challengeArea.innerHTML = '';
  
  // Render challenge based on type
  switch (challenge.type) {
    case 'quiz':
      renderQuizChallenge(challenge);
      break;
    case 'code-editor':
      renderCodeEditorChallenge(challenge);
      break;
    case 'fill-blank':
      renderFillBlankChallenge(challenge);
      break;
    case 'drag-drop':
      renderDragDropChallenge(challenge);
      break;
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
      // Remove previous selections
      quizContainer.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
      });
      // Select current option
      optionElement.classList.add('selected');
    });
    
    quizContainer.appendChild(optionElement);
  });
  
  elements.challengeArea.appendChild(quizContainer);
}

function renderCodeEditorChallenge(challenge) {
  const editorContainer = document.createElement('div');
  editorContainer.innerHTML = `
    <textarea class="code-editor" placeholder="Type your HTML code here..." rows="6"></textarea>
  `;
  
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
  
  // Create drop zones
  const dropZones = document.createElement('div');
  dropZones.className = 'drop-zones';
  dropZones.id = 'dropZones';
  
  for (let i = 0; i < challenge.tags.length; i++) {
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.dataset.index = i;
    dropZone.textContent = `Drop item ${i + 1} here`;
    
    // Add drag and drop event listeners
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    
    dropZones.appendChild(dropZone);
  }
  
  // Create draggable items
  const draggableItems = document.createElement('div');
  draggableItems.className = 'draggable-items';
  draggableItems.id = 'draggableItems';
  
  // Shuffle the tags for the challenge
  const shuffledTags = [...challenge.tags].sort(() => Math.random() - 0.5);
  
  shuffledTags.forEach((tag, index) => {
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

// Drag and Drop Handlers
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.target;
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedElement = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.target.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.target.classList.remove('drag-over');
  
  if (draggedElement && !e.target.classList.contains('filled')) {
    e.target.textContent = draggedElement.dataset.tag;
    e.target.classList.add('filled');
    e.target.dataset.tag = draggedElement.dataset.tag;
    
    // Remove the dragged element from the available items
    draggedElement.remove();
  }
}

// Answer Submission
function submitAnswer() {
  if (!gameState.currentChallenge) return;
  
  const challenge = gameState.currentChallenge;
  let isCorrect = false;
  let userAnswer = null;
  
  switch (challenge.type) {
    case 'quiz':
      isCorrect = checkQuizAnswer(challenge);
      break;
    case 'code-editor':
      isCorrect = checkCodeEditorAnswer(challenge);
      break;
    case 'fill-blank':
      isCorrect = checkFillBlankAnswer(challenge);
      break;
    case 'drag-drop':
      isCorrect = checkDragDropAnswer(challenge);
      break;
  }
  
  if (isCorrect) {
    gameState.completeChallenge(challenge.id, challenge.points);
    const earnedBadge = gameState.checkBadges();
    showSuccessModal(challenge.points, earnedBadge);
  } else {
    showErrorFeedback();
  }
}

function checkQuizAnswer(challenge) {
  const selectedOption = document.querySelector('.quiz-option.selected');
  if (!selectedOption) return false;
  
  const selectedIndex = parseInt(selectedOption.dataset.index);
  const isCorrect = selectedIndex === challenge.correct;
  
  // Show visual feedback
  document.querySelectorAll('.quiz-option').forEach((option, index) => {
    if (index === challenge.correct) {
      option.classList.add('correct');
    } else if (index === selectedIndex && !isCorrect) {
      option.classList.add('incorrect');
    }
  });
  
  return isCorrect;
}

function checkCodeEditorAnswer(challenge) {
  const userCode = elements.challengeArea.querySelector('.code-editor').value.trim();
  const solution = challenge.solution.trim();
  
  // Simple comparison - in a real app, you'd want more sophisticated checking
  return userCode === solution;
}

function checkFillBlankAnswer(challenge) {
  const inputs = elements.challengeArea.querySelectorAll('.blank-input');
  let allCorrect = true;
  
  inputs.forEach((input, index) => {
    const userAnswer = input.value.trim();
    const correctAnswer = challenge.blanks[index];
    
    if (userAnswer !== correctAnswer) {
      allCorrect = false;
      input.classList.add('error-feedback');
    } else {
      input.classList.add('success-feedback');
    }
  });
  
  return allCorrect;
}

function checkDragDropAnswer(challenge) {
  const dropZones = document.querySelectorAll('.drop-zone');
  let allCorrect = true;
  
  dropZones.forEach((zone, index) => {
    const expectedTag = challenge.solution[index];
    const actualTag = zone.dataset.tag;
    
    if (actualTag !== expectedTag) {
      allCorrect = false;
      zone.classList.add('error-feedback');
    } else {
      zone.classList.add('success-feedback');
    }
  });
  
  return allCorrect;
}

function showSuccessModal(points, badge) {
  elements.pointsEarned.textContent = points;
  
  if (badge) {
    elements.badgeEarned.style.display = 'block';
    elements.badgeName.textContent = badge.name;
  } else {
    elements.badgeEarned.style.display = 'none';
  }
  
  updateStats();
  elements.successModal.classList.add('active');
}

function showErrorFeedback() {
  elements.challengeArea.classList.add('error-feedback');
  setTimeout(() => {
    elements.challengeArea.classList.remove('error-feedback');
  }, 1000);
}

// Update UI Stats
function updateStats() {
  elements.totalPoints.textContent = gameState.playerStats.totalPoints;
  elements.badgeCount.textContent = gameState.playerStats.badgesEarned;
  elements.streakCount.textContent = gameState.playerStats.streak;
}

// Sandbox functionality
function initSandbox() {
  elements.htmlEditor.addEventListener('input', updatePreview);
  updatePreview(); // Initial preview
}

function updatePreview() {
  const htmlCode = elements.htmlEditor.value;
  const previewDoc = elements.preview.contentDocument || elements.preview.contentWindow.document;
  previewDoc.open();
  previewDoc.write(htmlCode);
  previewDoc.close();
}

// Event Listeners
function initEventListeners() {
  elements.closeModal.addEventListener('click', () => {
    elements.challengeModal.classList.remove('active');
  });
  
  elements.submitAnswer.addEventListener('click', submitAnswer);
  
  elements.continueBtn.addEventListener('click', () => {
    elements.successModal.classList.remove('active');
    elements.challengeModal.classList.remove('active');
    renderLevels(); // Refresh levels display
  });
  
  elements.showHint.addEventListener('click', () => {
    // Simple hint system - in a real app, you'd have specific hints per challenge
    alert('Hint: Check the HTML reference section for tag examples!');
  });
  
  // Close modals when clicking outside
  elements.challengeModal.addEventListener('click', (e) => {
    if (e.target === elements.challengeModal) {
      elements.challengeModal.classList.remove('active');
    }
  });
  
  elements.successModal.addEventListener('click', (e) => {
    if (e.target === elements.successModal) {
      elements.successModal.classList.remove('active');
    }
  });
}

// Initialize the application
function initGame() {
  initNavigation();
  initEventListeners();
  initSandbox();
  updateStats();
  renderLevels();
  renderBadges();
  renderReference();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);