/* Hamburger Menu Toggle */
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });

        // Close menu when a link is clicked
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
            });
        });
    }

    // Resume PDF Download Handler
    const downloadBtn = document.getElementById('download-resume');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            downloadResumePDF();
        });
    }
});

/* Download Resume as PDF */
function downloadResumePDF() {
    // Fetch resume.html and convert to PDF
    fetch('resume.html')
        .then(response => response.text())
        .then(html => {
            // Create a temporary div with the resume content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Extract just the content body (avoid header/nav if present)
            const content = tempDiv.querySelector('body') || tempDiv;
            
            // PDF options
            const options = {
                margin: 10,
                filename: 'Gaoussou Douga-Keita-Resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
            };
            
            // Generate PDF and download
            html2pdf().set(options).from(content).save();
        })
        .catch(error => {
            console.error('Error downloading resume:', error);
            // Fallback: open resume page for manual PDF download
            window.open('resume.html', '_blank');
        });
}

/* Smooth Scroll */
function scrollToSection(id) {
    const sec = document.getElementById(id);
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
}

/* Animate sections on scroll */
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
});
document.querySelectorAll(".section").forEach(sec => observer.observe(sec));

/* Typewriter Effect */
const text = "Gaoussou Douga Keita";
let idx = 0;
function typeWriter() {
    document.getElementById("typewriter").textContent = text.slice(0, idx);
    idx++;
    if (idx <= text.length) {
        setTimeout(typeWriter, 150);
    }
}
typeWriter();

/* Skill Percentage Animation */
function animateSkillPercent() {
    const skills = document.querySelectorAll(".skill-percent");

    skills.forEach(el => {
        const target = parseInt(el.getAttribute("data-value"));
        let count = 0;

        const interval = setInterval(() => {
            if (count < target) {
                count++;
                el.textContent = count + "%";
            } else {
                clearInterval(interval);
            }
        }, 20);
    });
}

window.addEventListener("scroll", () => {
    const skills = document.getElementById("skills");
    const rect = skills.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        animateSkillPercent();
    }
});

/* Security Tips Rotator */
const securityTips = [
    "Always use strong, unique passwords for every account. Use at least 12 characters with mixed case, numbers, and symbols.",
    "Enable two-factor authentication (2FA) on all critical accounts for an extra layer of security.",
    "Keep your software, OS, and browser updated regularly to patch known security vulnerabilities.",
    "Never click on suspicious links or download attachments from unknown sources to avoid malware.",
    "Use a VPN when connecting to public Wi-Fi networks to encrypt your data and protect your privacy.",
    "Regularly back up your important files to protect against ransomware and data loss.",
    "Be cautious of phishing emails that impersonate legitimate organizations. Verify sender addresses carefully.",
    "Use a password manager to securely store and manage your passwords instead of reusing them.",
    "Disable unnecessary services and close unused ports on your systems to minimize attack surface.",
    "Monitor your accounts for unusual activity and set up security alerts to detect unauthorized access quickly."
];

let currentTipIndex = 0;

function displayTip() {
    const tipEl = document.getElementById("security-tip");
    const counterEl = document.getElementById("tip-counter");
    if (tipEl) tipEl.textContent = securityTips[currentTipIndex];
    if (counterEl) counterEl.textContent = (currentTipIndex + 1) + "/" + securityTips.length;
}

function nextTip() {
    currentTipIndex = (currentTipIndex + 1) % securityTips.length;
    displayTip();
}

function previousTip() {
    currentTipIndex = (currentTipIndex - 1 + securityTips.length) % securityTips.length;
    displayTip();
}

// Per-visit rotating tip (stored in localStorage)
let savedTip = parseInt(localStorage.getItem('tipIndex') || '0', 10);
// increment for this visit and wrap
savedTip = (savedTip + 1) % securityTips.length;
localStorage.setItem('tipIndex', savedTip);
currentTipIndex = savedTip;
displayTip();

/* Light/Dark Mode Toggle */
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeBtn = document.getElementById('theme-toggle');
    if (document.body.classList.contains('light-mode')) {
        if (themeBtn) themeBtn.textContent = '☀️ Light';
        localStorage.setItem('theme', 'light');
    } else {
        if (themeBtn) themeBtn.textContent = '🌙 Dark';
        localStorage.setItem('theme', 'dark');
    }
}

// Load saved theme preference
if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    const tb = document.getElementById('theme-toggle');
    if (tb) tb.textContent = '☀️ Light';
}

/* Visitor Counter */
function initVisitorCounter() {
    let visitCount = localStorage.getItem('visitCount') || 0;
    visitCount = parseInt(visitCount) + 1;
    localStorage.setItem('visitCount', visitCount);
    const vc = document.getElementById('visitor-count');
    // Show only the visit number (remove the word "Visitors:")
    if (vc) vc.textContent = visitCount;
}

initVisitorCounter();

/* CTF Security Quiz — Refactored JS (drop-in) */

// Data (unchanged in content)
const quizQuestions = [
  {
    question: "What does the acronym 'SSL' stand for in web security?",
    options: ["Secure Socket Layer", "System Security Link", "Secure Storage Limit", "Source Safety Level"],
    correct: 0
  },
  {
    question: "Which of the following is the most secure password?",
    options: ["password123", "MyDog2024!", "qwerty", "12345678"],
    correct: 1
  },
  {
    question: "What type of attack involves sending a large amount of traffic to overload a server?",
    options: ["Phishing", "Distributed Denial of Service (DDoS)", "SQL Injection", "Man-in-the-Middle"],
    correct: 1
  }
];

// Centralized state
const QuizState = {
  currentIndex: 0,
  selectedIndex: null,
  score: 0,
  userAnswers: [],
  active: false
};

// Cache DOM refs once
const DOM = {
  startBtn: document.getElementById('start-quiz-btn'),
  content: document.getElementById('quiz-content'),
  progressFill: document.getElementById('progress-fill'),
  progressText: document.getElementById('progress-text'),
  questionEl: document.getElementById('quiz-question'),
  optionsEl: document.getElementById('quiz-options'),
  resultEl: document.getElementById('quiz-result'),
  nextBtn: document.getElementById('next-btn'),
  submitBtn: document.getElementById('submit-btn')
};

// Utility helpers
function setVisible(el, visible) {
  if (!el) return;
  el.style.display = visible ? 'block' : 'none';
}

function setDisabled(el, disabled) {
  if (!el) return;
  el.disabled = !!disabled;
  el.style.opacity = disabled ? '0.5' : '1';
}

function showMessage(text) {
  if (!DOM.resultEl) return;
  DOM.resultEl.textContent = text || '';
  DOM.resultEl.style.display = text ? 'block' : 'none';
}

function clearMessage() {
  showMessage('');
}

function updateProgress() {
  const total = quizQuestions.length;
  const current = QuizState.currentIndex;
  const pct = Math.round((current / total) * 100);
  if (DOM.progressFill) DOM.progressFill.style.width = pct + '%';
  if (DOM.progressText) DOM.progressText.textContent = `Question ${current + 1}/${total}`;
}

// Core flow
function startQuiz() {
  QuizState.active = true;
  QuizState.currentIndex = 0;
  QuizState.selectedIndex = null;
  QuizState.score = 0;
  QuizState.userAnswers = [];

  setVisible(DOM.startBtn, false);
  setVisible(DOM.content, true);

  renderQuestion();
}

function renderQuestion() {
  // End if out of bounds
  if (QuizState.currentIndex >= quizQuestions.length) {
    showFinalResults();
    return;
  }

  const q = quizQuestions[QuizState.currentIndex];

  // Progress
  updateProgress();

  // Question text
  if (DOM.questionEl) {
    DOM.questionEl.textContent = q.question;
  }

  // Options (with letters A/B/C/D)
  if (DOM.optionsEl) {
    DOM.optionsEl.innerHTML = '';
    q.options.forEach((opt, i) => {
      const div = document.createElement('div');
      div.className = 'quiz-option';
      div.id = 'option-' + i;
      div.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + i)}.</span> ${opt}`;
      div.addEventListener('click', () => selectAnswer(i));
      DOM.optionsEl.appendChild(div);
    });
  }

  // Reset selection and UI states
  QuizState.selectedIndex = null;
  clearMessage();

  const isLast = QuizState.currentIndex === quizQuestions.length - 1;
  setVisible(DOM.nextBtn, !isLast);
  setVisible(DOM.submitBtn, isLast);

  if (!isLast) setDisabled(DOM.nextBtn, true);
}

function selectAnswer(index) {
  // Clear previous selection styles
  const allOpts = DOM.optionsEl ? DOM.optionsEl.querySelectorAll('.quiz-option') : [];
  allOpts.forEach(opt => {
    opt.classList.remove('selected');
    opt.style.transform = '';
  });

  // Add selection style
  const el = document.getElementById('option-' + index);
  if (el) {
    el.classList.add('selected');
    el.style.transform = 'scale(1.02)';
  }

  QuizState.selectedIndex = index;
  clearMessage();

  // Enable next if not last
  const isLast = QuizState.currentIndex === quizQuestions.length - 1;
  if (!isLast) setDisabled(DOM.nextBtn, false);
}

function recordCurrentAnswer() {
  const q = quizQuestions[QuizState.currentIndex];
  const sel = QuizState.selectedIndex;

  const isCorrect = sel === q.correct;
  QuizState.userAnswers.push({
    questionNum: QuizState.currentIndex + 1,
    question: q.question,
    userAnswer: q.options[sel],
    correctAnswer: q.options[q.correct],
    isCorrect
  });

  if (isCorrect) QuizState.score++;
}

function nextQuestion() {
  if (QuizState.selectedIndex === null) {
    showMessage('⚠️ Please select an answer before proceeding!');
    return;
  }
  recordCurrentAnswer();
  QuizState.currentIndex++;
  renderQuestion();
}

function submitQuiz() {
  if (QuizState.selectedIndex === null) {
    showMessage('⚠️ Please select an answer before submitting!');
    return;
  }
  recordCurrentAnswer();
  showFinalResults();
}

function showFinalResults() {
  QuizState.active = false;

  const total = quizQuestions.length;
  const pct = Math.round((QuizState.score / total) * 100);

  let html = '<div class="final-results">';
  html += '<h3>🎯 Quiz Complete!</h3>';
  html += `<div class="score-display">
      <p class="final-score">Your Score: <span>${QuizState.score}/${total}</span></p>
      <p class="score-percentage">Percentage: <span>${pct}%</span></p>
    </div>`;

  const missed = QuizState.userAnswers.filter(a => !a.isCorrect);

  if (missed.length > 0) {
    html += '<div class="missed-section">';
    html += `<h4>❌ Questions You Missed (${missed.length}):</h4>`;
    html += '<div class="missed-list">';
    missed.forEach(m => {
      html += `<div class="missed-item">
        <p class="missed-question"><strong>Q${m.questionNum}:</strong> ${m.question}</p>
        <p class="user-answer"><span class="wrong">Your Answer:</span> ${m.userAnswer}</p>
        <p class="correct-answer"><span class="right">✓ Correct Answer:</span> ${m.correctAnswer}</p>
      </div>`;
    });
    html += '</div></div>';
  } else {
    html += '<p class="perfect-score">🏆 Perfect Score! You got all questions correct!</p>';
  }

  html += '</div>';

  // Replace question content with results
  if (DOM.questionEl) DOM.questionEl.innerHTML = html;
  if (DOM.optionsEl) DOM.optionsEl.innerHTML = '';
  clearMessage();

  // Hide action buttons, show restart via start button
  setVisible(DOM.nextBtn, false);
  setVisible(DOM.submitBtn, false);

  if (DOM.startBtn) {
    setVisible(DOM.startBtn, true);
    DOM.startBtn.textContent = '🔄 Restart Quiz';
  }
}

// Expose functions expected by your existing HTML
window.startQuiz = startQuiz;
window.nextQuestion = nextQuestion;
window.submitQuiz = submitQuiz;
window.selectAnswer = selectAnswer;


/* Mobile navigation toggle */
function toggleNav() {
    const header = document.querySelector('header');
    const btn = document.getElementById('nav-toggle');
    if (!header || !btn) return;
    const isOpen = header.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// Close mobile nav when clicking outside or on a nav link (optional UX)
document.addEventListener('click', (e) => {
    const header = document.querySelector('header');
    const nav = document.getElementById('main-nav');
    const btn = document.getElementById('nav-toggle');
    if (!header || !nav || !btn) return;
    const target = e.target;
    if (header.classList.contains('nav-open')) {
        // if clicking a link inside nav, close
        if (nav.contains(target) && target.tagName === 'A') {
            header.classList.remove('nav-open');
            btn.setAttribute('aria-expanded', 'false');
        }
        // if clicking outside header, close
        if (!header.contains(target) && target !== btn) {
            header.classList.remove('nav-open');
            btn.setAttribute('aria-expanded', 'false');
        }
    }
});

// Attach toggle handler to nav-toggle if present
window.addEventListener('DOMContentLoaded', () => {
    const navBtn = document.getElementById('nav-toggle');
    if (navBtn) navBtn.addEventListener('click', toggleNav);
    // ensure nav is visible on larger screens if resized
    window.addEventListener('resize', () => {
        if (window.innerWidth > 800) {
            const header = document.querySelector('header');
            if (header && header.classList.contains('nav-open')) {
                header.classList.remove('nav-open');
                const btn = document.getElementById('nav-toggle');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            }
        }
    });
    // Animate skill bars on scroll
    animateSkillBars();
    // Highlight code blocks
    highlightCode();
});

/* ===== SKILL DASHBOARD ===== */
function animateSkillBars() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                animateBar('bar-networking', 80);
                animateBar('bar-cybersecurity', 75);
                animateBar('bar-linux', 70);
                animateBar('bar-pentesting', 85);
            }
        });
    });
    const dashboard = document.getElementById('skill-dashboard');
    if (dashboard) observer.observe(dashboard);
}

function animateBar(barId, targetValue) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    let current = 0;
    const interval = setInterval(() => {
        if (current < targetValue) {
            current++;
            bar.style.width = current + '%';
            bar.parentElement.parentElement.querySelector('.skill-value').textContent = current + '%';
        } else {
            clearInterval(interval);
        }
    }, 15);
}

/* ===== CODE SHOWCASE ===== */
function highlightCode() {
    document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
    });
}

/* ===== INCIDENT RESPONSE SIMULATOR ===== */
const incidentScenarios = [
    {
        title: 'Unauthorized Login Detected',
        scenario: '🚨 ALERT: Unusual login activity detected from an IP in a foreign country at 2:47 AM. The user\'s password was changed 10 minutes ago. What do you do?',
        choices: [
            { text: 'Immediately lock the account', points: 10, feedback: '✓ Correct! Fast response limits damage.' },
            { text: 'Check logs for suspicious activity', points: 8, feedback: '✓ Good! Gather info before acting.' },
            { text: 'Ignore — it\'s probably a VPN', points: 0, feedback: '✗ Risky! Always investigate unauthorized access.' },
            { text: 'Wait and monitor the account', points: 3, feedback: '✗ Too slow! Take immediate action.' }
        ]
    },
    {
        title: 'Ransomware Detected',
        scenario: '⚠️ ALERT: Your antivirus detected ransomware on a workstation. Files are being encrypted. What\'s your immediate response?',
        choices: [
            { text: 'Isolate the machine from the network NOW', points: 10, feedback: '✓ Excellent! Stops propagation immediately.' },
            { text: 'Notify the user to back up files', points: 0, feedback: '✗ NO! This spreads the malware faster.' },
            { text: 'Contact the attacker for ransom', points: 0, feedback: '✗ NEVER pay ransoms. Isolate first, restore later.' },
            { text: 'Run a security scan', points: 2, feedback: '✗ Too late — network isolation is critical.' }
        ]
    },
    {
        title: 'Data Exfiltration Detected',
        scenario: '🔓 ALERT: Suspicious outbound traffic detected to unknown IP (5GB transferred). Possible data breach. What do you do?',
        choices: [
            { text: 'Block the destination IP and check logs', points: 10, feedback: '✓ Smart! Stop the leak and investigate.' },
            { text: 'Immediately shut down the server', points: 8, feedback: '✓ Good defensive move.' },
            { text: 'Continue monitoring to gather evidence', points: 5, feedback: '⚠️ Risky — data is still being stolen.' },
            { text: 'Assume it\'s a misconfiguration', points: 0, feedback: '✗ Dangerous assumption. Treat as breach.' }
        ]
    },
    {
        title: 'DDoS Attack Incoming',
        scenario: '💥 ALERT: Your web server is under DDoS attack. Bandwidth usage at 95%. Website is slow. What\'s your action?',
        choices: [
            { text: 'Activate DDoS mitigation & contact ISP', points: 10, feedback: '✓ Perfect! Minimize downtime.' },
            { text: 'Increase server bandwidth', points: 5, feedback: '⚠️ Helps but not sufficient.' },
            { text: 'Shut down the website temporarily', points: 7, feedback: '✓ Prevents cascading failures.' },
            { text: 'Do nothing — it will pass', points: 0, feedback: '✗ DDoS can last hours!' }
        ]
    },
    {
        title: 'Privilege Escalation Attempt',
        scenario: '🔐 ALERT: Log shows failed privilege escalation attempts from a compromised user account (50 attempts in 2 minutes). React now!',
        choices: [
            { text: 'Disable the account & force password reset', points: 10, feedback: '✓ Stops attacker cold.' },
            { text: 'Monitor activity and alert the user', points: 6, feedback: '⚠️ Good but too slow.' },
            { text: 'Check if the user made these attempts', points: 4, feedback: '⚠️ Investigate later — stop threat first.' },
            { text: 'Ignore — all privilege escalations fail', points: 0, feedback: '✗ One success is a breach!' }
        ]
    }
];

let currentIncidentIndex = 0;
let incidentScore = 0;
let incidentAnswered = false;

function startIncidentSimulator() {
    currentIncidentIndex = 0;
    incidentScore = 0;
    incidentAnswered = false;
    const startBtn = document.getElementById('start-incident-btn');
    const content = document.getElementById('incident-content');
    const scoreDiv = document.getElementById('incident-score');
    if (startBtn) startBtn.style.display = 'none';
    if (content) content.style.display = 'block';
    if (scoreDiv) scoreDiv.style.display = 'none';
    displayIncidentScenario();
}

function displayIncidentScenario() {
    if (currentIncidentIndex >= incidentScenarios.length) {
        showIncidentFinalScore();
        return;
    }
    incidentAnswered = false;
    const scenario = incidentScenarios[currentIncidentIndex];
    const scenarioEl = document.getElementById('incident-scenario');
    const choicesEl = document.getElementById('incident-choices');
    const feedbackEl = document.getElementById('incident-feedback');
    
    if (scenarioEl) scenarioEl.textContent = `[${currentIncidentIndex + 1}/5] ${scenario.scenario}`;
    if (feedbackEl) feedbackEl.textContent = '';
    
    let choicesHTML = '';
    scenario.choices.forEach((choice, idx) => {
        choicesHTML += `<button class="incident-choice-btn" onclick="submitIncidentChoice(${idx})">${choice.text}</button>`;
    });
    if (choicesEl) choicesEl.innerHTML = choicesHTML;
}

function submitIncidentChoice(choiceIndex) {
    if (incidentAnswered) return;
    incidentAnswered = true;
    
    const scenario = incidentScenarios[currentIncidentIndex];
    const choice = scenario.choices[choiceIndex];
    const feedbackEl = document.getElementById('incident-feedback');
    
    incidentScore += choice.points;
    if (feedbackEl) feedbackEl.textContent = choice.feedback;
    
    setTimeout(() => {
        currentIncidentIndex++;
        displayIncidentScenario();
    }, 2500);
}

function showIncidentFinalScore() {
    const content = document.getElementById('incident-content');
    const scoreDiv = document.getElementById('incident-score');
    const startBtn = document.getElementById('start-incident-btn');
    
    if (content) content.style.display = 'none';
    if (scoreDiv) {
        scoreDiv.style.display = 'block';
        const maxScore = incidentScenarios.reduce((sum, s) => sum + Math.max(...s.choices.map(c => c.points)), 0);
        const percentage = Math.round((incidentScore / maxScore) * 100);
        scoreDiv.innerHTML = `<h3>Incident Response Complete!</h3><p>Your Score: <strong>${incidentScore}/${maxScore}</strong> (${percentage}%)</p>`;
    }
    if (startBtn) {
        startBtn.style.display = 'block';
        startBtn.textContent = 'Restart Incident Response';
    }
}

/* ===== MULTI LEVEL CTF CHALLENGES ===== */
const ctfChallenges = [
    {
        level: 1,
        title: 'Caesar Cipher',
        challenge: 'Decrypt this Caesar cipher (shift of 3): "KHOOR ZRUOG"',
        answer: 'hello world',
        hint: 'Shift each letter back by 3.'
    },
    {
        level: 2,
        title: 'Base64 Decoding',
        challenge: 'Decode this Base64 string: "Y3liZXJzZWN1cml0eQ=="',
        answer: 'cybersecurity',
        hint: 'Use Base64 decoder tool or knowledge.'
    },
    {
        level: 3,
        title: 'Hash Identification',
        challenge: 'What hash algorithm produced: "5e884898da28047151d0e56f8dc62927"?',
        answer: 'md5',
        hint: 'It\'s 32 characters long.'
    },
    {
        level: 4,
        title: 'Binary to ASCII',
        challenge: 'Convert binary to ASCII: 01100110 01101100 01100001 01100111',
        answer: 'flag',
        hint: 'Each 8 bits = 1 character.'
    },
    {
        level: 5,
        title: 'SQL Injection Prevention',
        challenge: 'What character is commonly used to escape quotes in SQL?',
        answer: 'backslash',
        hint: 'It\'s a single character used for escaping.'
    }
];

let currentCTFIndex = 0;
let ctfScore = 0;

function startCTFChallenges() {
    currentCTFIndex = 0;
    ctfScore = 0;
    const startScreen = document.getElementById('ctf-start-screen');
    const challengeView = document.getElementById('ctf-challenge-view');
    if (startScreen) startScreen.style.display = 'none';
    if (challengeView) challengeView.style.display = 'block';
    displayCTFChallenge();
}

function displayCTFChallenge() {
    if (currentCTFIndex >= ctfChallenges.length) {
        showCTFFinalResults();
        return;
    }
    
    const challenge = ctfChallenges[currentCTFIndex];
    const challengeText = document.getElementById('ctf-challenge-text');
    const input = document.getElementById('ctf-answer-input');
    const feedback = document.getElementById('ctf-feedback');
    const progress = document.getElementById('ctf-progress');
    
    if (challengeText) challengeText.textContent = `Level ${challenge.level}: ${challenge.title} — ${challenge.challenge}`;
    if (input) { input.value = ''; input.focus(); }
    if (feedback) feedback.textContent = '';
    if (progress) progress.textContent = `Progress: ${currentCTFIndex}/${ctfChallenges.length}`;
}

function submitCTFAnswer() {
    const input = document.getElementById('ctf-answer-input');
    const feedback = document.getElementById('ctf-feedback');
    if (!input || !input.value) {
        if (feedback) feedback.textContent = 'Please enter an answer!';
        return;
    }
    
    const challenge = ctfChallenges[currentCTFIndex];
    const userAnswer = input.value.toLowerCase().trim();
    const correctAnswer = challenge.answer.toLowerCase().trim();
    
    if (userAnswer === correctAnswer) {
        if (feedback) feedback.textContent = '✓ Correct! Next level unlocked.';
        ctfScore++;
    } else {
        if (feedback) feedback.textContent = `✗ Incorrect. Hint: ${challenge.hint}`;
    }
    
    setTimeout(() => {
        currentCTFIndex++;
        displayCTFChallenge();
    }, 2000);
}

function showCTFFinalResults() {
    const challengeView = document.getElementById('ctf-challenge-view');
    const resultsView = document.getElementById('ctf-results');
    const startScreen = document.getElementById('ctf-start-screen');
    
    if (challengeView) challengeView.style.display = 'none';
    if (resultsView) {
        resultsView.style.display = 'block';
        const percentage = Math.round((ctfScore / ctfChallenges.length) * 100);
        resultsView.innerHTML = `<h3>CTF Challenge Complete!</h3><p>You solved: <strong>${ctfScore}/${ctfChallenges.length}</strong> challenges (${percentage}%)</p><button class="ctf-start-btn" onclick="resetCTF()">Restart CTF</button>`;
    }
}

function resetCTF() {
    const challengeView = document.getElementById('ctf-challenge-view');
    const resultsView = document.getElementById('ctf-results');
    const startScreen = document.getElementById('ctf-start-screen');
    if (challengeView) challengeView.style.display = 'none';
    if (resultsView) resultsView.style.display = 'none';
    if (startScreen) startScreen.style.display = 'block';
}


// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initNetworkSimulator();
});


