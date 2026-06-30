const app = document.getElementById("app");

const STORAGE = {
    bookmarks: "upsc_bookmarks",
    wrong: "upsc_wrong_questions",
    lastQuiz: "upsc_last_quiz"
};

function buildSubjectCatalog(subjectData) {
    return (subjectData || []).map(subject => ({
        name: subject.subject,
        icon: subject.icon,
        enabled: Boolean(subject.enabled),
        topics: (subject.topics || []).map(topic => ({
            ...topic,
            enabled: Boolean(topic.enabled),
            dataset: Array.isArray(topic.dataset) ? topic.dataset : []
        }))
    }));
}

const SUBJECTS = buildSubjectCatalog(UNIVERSAL_SUBJECT_DATA);

const QUIZ_META = {
    subject: "Polity",
    topic: "Constitution Articles"
};

const SCORE = {
    correct: 2,
    incorrect: -0.66
};

const QUIZ_LENGTHS = [10, 25, 50, 100];

const QUIZ_MODES = {
    normal: "normal",
    bookmarks: "bookmarks",
    wrong: "wrong"
};

const POLITY_TOPICS = [
    {
        id: "constitutionArticles",
        title: "Constitution Articles",
        icon: "scroll",
        enabled: true,
        type: "quiz"
    },
    {
        id: "fundamentalRights",
        title: "Fundamental Rights",
        icon: "shield",
        enabled: true,
        type: "quiz"
    },
    {
        id: "directivePrinciples",
        title: "Directive Principles",
        icon: "scroll",
        enabled: true,
        type: "quiz"
    },
    {
        id: "fundamentalDuties",
        title: "Fundamental Duties",
        icon: "check",
        enabled: true,
        type: "quiz"
    },
    {
        id: "preamble",
        title: "Preamble",
        icon: "scroll",
        enabled: true,
        type: "quiz"
    },
    {
        id: "constitutionalBodies",
        title: "Constitutional Bodies",
        icon: "users",
        enabled: true,
        type: "quiz"
    },
    {
        id: "parliament",
        title: "Parliament",
        icon: "users",
        enabled: true,
        type: "quiz"
    },
    {
        id: "president",
        title: "President",
        icon: "user",
        enabled: true,
        type: "quiz"
    },
    {
        id: "vicePresident",
        title: "Vice President",
        icon: "user",
        enabled: true,
        type: "quiz"
    },
    {
        id: "primeMinister",
        title: "Prime Minister",
        icon: "user",
        enabled: true,
        type: "quiz"
    },
    {
        id: "judiciary",
        title: "Judiciary",
        icon: "gavel",
        enabled: true,
        type: "quiz"
    },
    {
        id: "elections",
        title: "Elections",
        icon: "vote",
        enabled: true,
        type: "quiz"
    },
    {
        id: "federalism",
        title: "Federalism",
        icon: "globe",
        enabled: true,
        type: "quiz"
    },
    {
        id: "emergencyProvisions",
        title: "Emergency Provisions",
        icon: "alert",
        enabled: true,
        type: "quiz"
    },
    {
        id: "schedules",
        title: "Schedules",
        icon: "list",
        enabled: true,
        type: "quiz"
    },
    {
        id: "constitutionalAmendments",
        title: "Constitutional Amendments",
        icon: "pencil",
        enabled: true,
        type: "quiz"
    },
    {
        id: "pyqs",
        title: "Previous Year Questions",
        icon: "trophy",
        enabled: true,
        type: "pyq"
    },
    {
        id: "bookmarkedQuestions",
        title: "Bookmarked Questions",
        icon: "star",
        enabled: true,
        type: "revision"
    },
    {
        id: "wrongQuestions",
        title: "Wrong Questions",
        icon: "x",
        enabled: true,
        type: "revision"
    }
];

const QUESTION_TYPES = {
    mcq: "mcq",
    reverseMcq: "reverseMcq",
    matchTheFollowing: "matchTheFollowing",
    multipleCorrect: "multipleCorrect",
    assertionReason: "assertionReason",
    statementBased: "statementBased"
};

function pickQuestionType(item) {
    const available = Array.isArray(item.questionTypes) && item.questionTypes.length > 0
        ? item.questionTypes.filter(Boolean)
        : [QUESTION_TYPES.mcq, QUESTION_TYPES.reverseMcq, QUESTION_TYPES.matchTheFollowing, QUESTION_TYPES.multipleCorrect, QUESTION_TYPES.assertionReason, QUESTION_TYPES.statementBased];

    return available[Math.floor(Math.random() * available.length)] || QUESTION_TYPES.mcq;
}

function getQuestionFacts(item) {
    const facts = Array.isArray(item.facts) ? item.facts.filter(Boolean) : [];

    if (facts.length > 0) {
        return facts;
    }

    return [{
        statement: item.description || item.title || "Key constitutional fact",
        explanation: item.description || item.title || "Key constitutional fact",
        answer: item.title || item.description || "Key constitutional fact"
    }];
}

function buildOptionPool(item, answer, count = 3) {
    const pool = [];
    const related = Array.isArray(item.related) ? item.related.filter(Boolean) : [];
    const facts = getQuestionFacts(item);

    if (answer) {
        pool.push(answer);
    }

    facts.forEach(fact => {
        if (fact.answer && !pool.includes(fact.answer)) {
            pool.push(fact.answer);
        }
    });

    related.forEach(entry => {
        if (entry && !pool.includes(entry)) {
            pool.push(entry);
        }
    });

    const fallback = [item.title, item.description, item.topic, item.subject];
    fallback.forEach(entry => {
        if (entry && !pool.includes(entry)) {
            pool.push(entry);
        }
    });

    return shuffle([...new Set(pool)]).slice(0, count + 1);
}

function QuestionFactory(item, preferredType = null) {
    const type = preferredType || pickQuestionType(item);
    const generator = QuestionGenerators[type] || QuestionGenerators[QUESTION_TYPES.mcq];
    return generator(item);
}

const QuestionGenerators = {
    [QUESTION_TYPES.mcq]: (item) => {
        const facts = getQuestionFacts(item);
        const fact = facts[0] || {};
        const optionsPool = buildOptionPool(item, fact.answer, 3);
        const options = shuffle(optionsPool).slice(0, 4);
        const correctIndex = options.indexOf(fact.answer);

        return {
            ...item,
            id: item.id,
            engine: "universal",
            type: QUESTION_TYPES.mcq,
            prompt: fact.statement || item.title || item.description,
            options,
            correct: correctIndex >= 0 ? correctIndex : 0,
            explanation: fact.explanation || item.description || ""
        };
    },
    [QUESTION_TYPES.reverseMcq]: (item) => {
        const facts = getQuestionFacts(item);
        const fact = facts[0] || {};
        const optionsPool = buildOptionPool(item, fact.answer, 3);
        const options = shuffle(optionsPool).slice(0, 4);
        const correctIndex = options.indexOf(fact.answer);

        return {
            ...item,
            id: item.id,
            engine: "universal",
            type: QUESTION_TYPES.reverseMcq,
            prompt: `Which option best explains: ${fact.statement || item.title}`,
            options,
            correct: correctIndex >= 0 ? correctIndex : 0,
            explanation: fact.explanation || item.description || ""
        };
    },
    [QUESTION_TYPES.matchTheFollowing]: (item) => {
        const facts = getQuestionFacts(item).slice(0, 3);
        const options = shuffle([...(item.related || []), ...(facts.map(fact => fact.answer).filter(Boolean))]).slice(0, 3);
        const pairs = facts.map((fact, index) => ({
            left: fact.statement || `Fact ${index + 1}`,
            right: options[index % options.length] || item.title || item.description
        }));

        return {
            ...item,
            id: item.id,
            engine: "universal",
            type: QUESTION_TYPES.matchTheFollowing,
            prompt: item.title || "Match the following statements with the best option.",
            pairs,
            options: shuffle([...new Set(options)]).slice(0, 3),
            correct: pairs.map((_, index) => index % 3),
            explanation: item.description || ""
        };
    },
    [QUESTION_TYPES.multipleCorrect]: (item) => {
        const facts = getQuestionFacts(item);
        const options = shuffle([...facts.map(fact => fact.statement || fact.answer).filter(Boolean), ...(item.related || [])]).slice(0, 4);
        const correct = [0, 2].filter(index => index < options.length);

        return {
            ...item,
            id: item.id,
            engine: "universal",
            type: QUESTION_TYPES.multipleCorrect,
            prompt: item.title || "Select the statements that are correct.",
            options,
            correct,
            explanation: item.description || ""
        };
    },
    [QUESTION_TYPES.assertionReason]: (item) => {
        const facts = getQuestionFacts(item);
        const fact = facts[0] || {};
        const options = [
            "Both A and R are true and R is the correct explanation of A",
            "Both A and R are true but R is not the correct explanation of A",
            "A is true but R is false",
            "A is false but R is true"
        ];

        return {
            ...item,
            id: item.id,
            engine: "universal",
            type: QUESTION_TYPES.assertionReason,
            prompt: "Assertion and Reason",
            assertion: fact.statement || item.title || item.description,
            reason: fact.explanation || item.description || "",
            options,
            correct: 0,
            explanation: fact.explanation || item.description || ""
        };
    },
    [QUESTION_TYPES.statementBased]: (item) => {
        const facts = getQuestionFacts(item).slice(0, 3);
        const options = facts.map(fact => fact.statement || fact.answer || item.title || item.description);
        const correct = options.map((_, index) => index).filter((_, index) => index < 2);

        return {
            ...item,
            id: item.id,
            engine: "universal",
            type: QUESTION_TYPES.statementBased,
            prompt: item.title || "Select the statements that are true.",
            options,
            correct,
            explanation: item.description || ""
        };
    }
};

const QuestionRenderer = {
    [QUESTION_TYPES.mcq]: (question) => `
        <div class="options">
            ${question.options.map((option, index) => `
                <button class="option" data-index="${index}">${option}</button>
            `).join("")}
        </div>
    `,
    [QUESTION_TYPES.reverseMcq]: (question) => `
        <div class="options">
            ${question.options.map((option, index) => `
                <button class="option" data-index="${index}">${option}</button>
            `).join("")}
        </div>
    `,
    [QUESTION_TYPES.matchTheFollowing]: (question) => `
        <div class="options-list">
            ${question.pairs.map((pair, index) => `
                <div class="review-option-row">
                    <strong>${pair.left}</strong>
                    <select class="option" data-index="${index}">
                        <option value="">Select answer</option>
                        ${question.options.map((option, optionIndex) => `<option value="${optionIndex}">${option}</option>`).join("")}
                    </select>
                </div>
            `).join("")}
        </div>
    `,
    [QUESTION_TYPES.multipleCorrect]: (question) => `
        <div class="options">
            ${question.options.map((option, index) => `
                <button class="option option-toggle" data-index="${index}">${option}</button>
            `).join("")}
        </div>
    `,
    [QUESTION_TYPES.assertionReason]: (question) => `
        <div class="options-list">
            <div class="review-option-row"><strong>Assertion</strong><div>${question.assertion}</div></div>
            <div class="review-option-row"><strong>Reason</strong><div>${question.reason}</div></div>
            <div class="options">
                ${question.options.map((option, index) => `
                    <button class="option" data-index="${index}">${option}</button>
                `).join("")}
            </div>
        </div>
    `,
    [QUESTION_TYPES.statementBased]: (question) => `
        <div class="options">
            ${question.options.map((option, index) => `
                <button class="option option-toggle" data-index="${index}">${option}</button>
            `).join("")}
        </div>
    `
};

const ReviewRenderer = {
    [QUESTION_TYPES.mcq]: (question, selected, isCorrect) => {
        const answerText = question.options[selected] || "No answer";
        return `<div class="review-option-row ${isCorrect ? "correct" : ""}"><strong>Your answer</strong><div>${answerText}</div></div>`;
    },
    [QUESTION_TYPES.reverseMcq]: (question, selected, isCorrect) => {
        const answerText = question.options[selected] || "No answer";
        return `<div class="review-option-row ${isCorrect ? "correct" : ""}"><strong>Your answer</strong><div>${answerText}</div></div>`;
    },
    [QUESTION_TYPES.matchTheFollowing]: (question, selected, isCorrect) => `
        <div class="options-list">
            ${question.pairs.map((pair, index) => {
                const selectedValue = selected[index];
                const selectedText = selectedValue !== undefined && selectedValue !== "" ? question.options[selectedValue] : "Not answered";
                const correctText = question.options[question.correct[index]];
                const marker = selectedValue === question.correct[index] ? "✅ Correct" : "";
                return `
                    <div class="review-option-row ${selectedValue === question.correct[index] ? "correct" : ""}">
                        <div class="review-option-label">
                            <strong>${pair.left}</strong>
                            ${marker ? `<span class="review-option-marker">${marker}</span>` : ""}
                        </div>
                        <div>Your answer: ${selectedText}</div>
                        <div>Correct answer: ${correctText}</div>
                    </div>
                `;
            }).join("")}
        </div>
    `,
    [QUESTION_TYPES.multipleCorrect]: (question, selected, isCorrect) => `
        <div class="options-list">
            ${selected.map(index => `<div class="review-option-row"><strong>${question.options[index]}</strong><div>Selected</div></div>`).join("")}
        </div>
    `,
    [QUESTION_TYPES.assertionReason]: (question, selected, isCorrect) => {
        const answerText = question.options[selected] || "No answer";
        return `<div class="review-option-row ${isCorrect ? "correct" : ""}"><strong>Your answer</strong><div>${answerText}</div></div>`;
    },
    [QUESTION_TYPES.statementBased]: (question, selected, isCorrect) => `
        <div class="options-list">
            ${selected.map(index => `<div class="review-option-row"><strong>${question.options[index]}</strong><div>Selected</div></div>`).join("")}
        </div>
    `
};

const QuestionValidator = {
    [QUESTION_TYPES.mcq]: (question, answer) => answer === question.correct,
    [QUESTION_TYPES.reverseMcq]: (question, answer) => answer === question.correct,
    [QUESTION_TYPES.matchTheFollowing]: (question, answer) => Array.isArray(question.correct) && answer.every((value, index) => value === question.correct[index]),
    [QUESTION_TYPES.multipleCorrect]: (question, answer) => {
        const expected = Array.isArray(question.correct) ? question.correct : [question.correct];
        const selected = Array.isArray(answer) ? answer : [answer];
        return expected.length === selected.length && expected.every(index => selected.includes(index));
    },
    [QUESTION_TYPES.assertionReason]: (question, answer) => answer === question.correct,
    [QUESTION_TYPES.statementBased]: (question, answer) => {
        const expected = Array.isArray(question.correct) ? question.correct : [question.correct];
        const selected = Array.isArray(answer) ? answer : [answer];
        return expected.length === selected.length && expected.every(index => selected.includes(index));
    }
};

const ResultsRenderer = {
    [QUESTION_TYPES.mcq]: (question) => question.explanation,
    [QUESTION_TYPES.reverseMcq]: (question) => question.explanation,
    [QUESTION_TYPES.matchTheFollowing]: (question) => question.explanation,
    [QUESTION_TYPES.multipleCorrect]: (question) => question.explanation,
    [QUESTION_TYPES.assertionReason]: (question) => question.explanation,
    [QUESTION_TYPES.statementBased]: (question) => question.explanation
};

const state = {
    screen: "home",
    bookmarks: readStorage(STORAGE.bookmarks, []),
    wrongQuestions: readStorage(STORAGE.wrong, []),
    lastQuiz: readStorage(STORAGE.lastQuiz, null),
    lastReview: null,
    quiz: createEmptyQuiz()
};

renderHome();

function renderLogo() {
    return `
    <span class="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
            <path d="M12 20c8 0 14 2 20 8 6-6 12-8 20-8v26c-8 0-14 2-20 8-6-6-12-8-20-8V20Z" fill="none" stroke="#F8FAFC" stroke-width="4" stroke-linejoin="round"/>
            <path d="M32 28v26" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
            <circle cx="32" cy="20" r="7" fill="none" stroke="#F59E0B" stroke-width="3"/>
            <path d="M32 13v14M25 20h14M27 15l10 10M37 15 27 25" stroke="#F59E0B" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
    </span>
    `;
}

function renderIcon(name, tone = "") {
    const icons = {
        book: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z"/></svg>`,
        play: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 5 11 7-11 7V5Z"/></svg>`,
        star: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21 7 14.2 2 9.3l6.9-1L12 2Z"/></svg>`,
        alert: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 7v6"/><path d="M12 17h.01"/></svg>`,
        chart: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>`,
        check: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg>`,
        x: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
        home: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>`,
        retry: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>`,
        scroll: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h9a2 2 0 0 1 2 2v11"/><path d="M4 7h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M7 7v10"/><path d="M11 7v10"/></svg>`,
        shield: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v6c0 5 3.5 7.8 7 9 3.5-1.2 7-4 7-9V6l-7-3Z"/></svg>`,
        users: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3"/><path d="M20 21v-2a3 3 0 0 0-2-2.9"/><path d="M15 4.1a3 3 0 0 1 0 5.8"/></svg>`,
        user: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>`,
        gavel: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 8-6 6-8-8 6-6Z"/><path d="m3 21 7-7"/><path d="m14 10 4 4"/></svg>`,
        vote: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M7 7v10"/><path d="M17 7v10"/><path d="M7 17h10"/><path d="M8 11h8"/></svg>`,
        globe: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20"/><path d="M12 2a15 15 0 0 0 0 20"/></svg>`,
        list: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>`,
        pencil: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m14 6 4 4"/></svg>`,
        trophy: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8"/><path d="M12 4v3"/><path d="M7 7h10l-1 4a5 5 0 0 1-8 0L7 7Z"/><path d="M8 15v3a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-3"/></svg>`
    };

    return `<span class="ui-icon ${tone}" aria-hidden="true">${icons[name] || icons.book}</span>`;
}

function createEmptyQuiz() {
    return {
        questions: [],
        total: 10,
        current: 0,
        correct: 0,
        incorrect: 0,
        marks: 0,
        mode: QUIZ_MODES.normal,
        engine: "constitution",
        subject: QUIZ_META.subject,
        topic: QUIZ_META.topic,
        answers: [],
        sourceItems: [],
        completed: false
    };
}

function renderScreenHeader(title, subtitle = "", backButtonId = null, backButtonHandler = null, backButtonLabel = "← Back") {
    const backButtonHtml = backButtonId
        ? `<button id="${backButtonId}" class="secondary-button header-nav-button" onclick="${backButtonHandler || ""}()">${backButtonLabel}</button>`
        : "";

    const subtitleHtml = subtitle
        ? `<p class="subtitle">${subtitle}</p>`
        : "";

    return `
    <div class="header page-header">
        <div class="header-nav-row">
            <div class="header-nav-left">${backButtonHtml}</div>
            <div class="header-nav-center"></div>
            <div class="header-nav-right">
                <button id="topHomeButton" class="header-home-button" onclick="renderHome()" aria-label="Go to Home">
                    ${renderLogo()}
                </button>
            </div>
        </div>

        <div class="header-title-block">
            <h1 class="title">
                ${title}
            </h1>
            ${subtitleHtml}
        </div>
    </div>
    `;
}

function readStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function saveBookmarks() {
    writeStorage(STORAGE.bookmarks, state.bookmarks);
}

function saveWrongQuestions() {
    writeStorage(STORAGE.wrong, state.wrongQuestions);
}

function persistQuizProgress(screen = "question") {
    state.lastQuiz = {
        engine: state.quiz.engine || "constitution",
        subject: state.quiz.subject || QUIZ_META.subject,
        topic: state.quiz.topic || getQuizTopic(state.quiz.mode),
        mode: state.quiz.mode,
        questions: state.quiz.total,
        current: state.quiz.current,
        remainingQuestions: Math.max(state.quiz.total - state.quiz.current, 0),
        score: Number(state.quiz.marks.toFixed(2)),
        correct: state.quiz.correct,
        incorrect: state.quiz.incorrect,
        accuracy: getAccuracy(),
        completed: Boolean(state.quiz.completed),
        sourceItems: state.quiz.sourceItems || [],
        questionsData: state.quiz.questions.map(question => ({
            id: question.id,
            article: question.article,
            engine: question.engine || "constitution",
            type: question.type,
            question: question.question,
            prompt: question.prompt,
            assertion: question.assertion,
            reason: question.reason,
            options: question.options || [],
            pairs: question.pairs || [],
            correct: question.correct,
            explanation: question.explanation,
            topic: question.topic
        })),
        answers: state.quiz.answers || [],
        lastScreen: screen,
        lastReview: state.lastReview ? {
            selected: state.lastReview.selected,
            isCorrect: state.lastReview.isCorrect,
            questionId: getQuestionIdentity(state.lastReview.question)
        } : null,
        dateTime: new Date().toLocaleString()
    };

    writeStorage(STORAGE.lastQuiz, state.lastQuiz);
}

function saveLastQuiz() {
    const total = state.quiz.correct + state.quiz.incorrect;
    const accuracy = getAccuracy();

    state.quiz.completed = true;
    state.lastQuiz = {
        engine: state.quiz.engine || "constitution",
        subject: state.quiz.subject || QUIZ_META.subject,
        topic: state.quiz.topic || getQuizTopic(state.quiz.mode),
        mode: state.quiz.mode,
        questions: state.quiz.total,
        current: state.quiz.current,
        remainingQuestions: Math.max(state.quiz.total - state.quiz.current, 0),
        score: Number(state.quiz.marks.toFixed(2)),
        correct: state.quiz.correct,
        incorrect: state.quiz.incorrect,
        accuracy,
        completed: true,
        sourceItems: state.quiz.sourceItems || [],
        questionsData: state.quiz.questions.map(question => ({
            id: question.id,
            article: question.article,
            engine: question.engine || "constitution",
            type: question.type,
            question: question.question,
            prompt: question.prompt,
            assertion: question.assertion,
            reason: question.reason,
            options: question.options || [],
            pairs: question.pairs || [],
            correct: question.correct,
            explanation: question.explanation,
            topic: question.topic
        })),
        answers: state.quiz.answers || [],
        lastScreen: "results",
        lastReview: state.lastReview ? {
            selected: state.lastReview.selected,
            isCorrect: state.lastReview.isCorrect,
            questionId: getQuestionIdentity(state.lastReview.question)
        } : null,
        dateTime: new Date().toLocaleString()
    };

    writeStorage(STORAGE.lastQuiz, state.lastQuiz);
}

function getQuestionIdentity(question) {
    if (!question) {
        return "";
    }

    if (question.engine === "universal" && question.id) {
        return `universal:${question.id}`;
    }

    if (question.article) {
        return `constitution:${question.article}`;
    }

    if (question.id) {
        return `universal:${question.id}`;
    }

    return String(question);
}

function isBookmarked(target) {
    const key = getQuestionIdentity(target);
    return state.bookmarks.includes(key);
}

function toggleBookmark(target) {
    const key = getQuestionIdentity(target);

    if (isBookmarked(target)) {
        state.bookmarks = state.bookmarks.filter(saved => saved !== key);
    } else {
        state.bookmarks.push(key);
    }

    saveBookmarks();
}

function setScreen(screen) {
    state.screen = screen;
}

function renderHome() {
    setScreen("home");

    app.innerHTML = `
    <main class="app-shell">
        <div class="header app-header">
            ${renderLogo()}
            <div>
                <h1 class="title">
                    UPSC Revision
                </h1>

                <p class="subtitle">
                    Revise. Practice. Repeat.
                </p>
            </div>
        </div>

        ${renderRevisionHub()}

        <p class="section-label">Subjects</p>
        <div class="subject-grid">
            ${SUBJECTS.map(renderSubjectCard).join("")}
        </div>
    </main>
    `;

    const openPolity = document.getElementById("openPolity");

    if (openPolity) {
        openPolity.onclick = renderPolity;
    }

    const continueButton = document.getElementById("continueLastQuiz");
    const retryButton = document.getElementById("retryLastQuiz");
    const bookmarkedRevisionButton = document.getElementById("startBookmarkedRevision");
    const wrongRevisionButton = document.getElementById("startWrongRevision");

    if (continueButton) {
        continueButton.disabled = !state.lastQuiz;
        continueButton.onclick = continueLastQuiz;
    }

    if (retryButton) {
        retryButton.onclick = retryLastQuiz;
    }

    if (bookmarkedRevisionButton) {
        bookmarkedRevisionButton.onclick = () => startRevisionQuiz(QUIZ_MODES.bookmarks);
    }

    if (wrongRevisionButton) {
        wrongRevisionButton.onclick = () => startRevisionQuiz(QUIZ_MODES.wrong);
    }
}

function renderRevisionHub() {
    const lastQuiz = state.lastQuiz;
    const bookmarkCount = state.bookmarks.length;
    const wrongCount = state.wrongQuestions.length;

    const lastQuizDetails = lastQuiz
        ? `
        <p class="detail-row"><span>Subject</span><strong>${lastQuiz.subject}</strong></p>
        <p class="detail-row"><span>Topic</span><strong>${lastQuiz.topic}</strong></p>
        <p class="detail-row"><span>Questions</span><strong>${lastQuiz.questions}</strong></p>
        <p class="detail-row"><span>Score</span><strong>${lastQuiz.score.toFixed(2)} Marks</strong></p>
        <p class="detail-row"><span>Correct</span><strong>${lastQuiz.correct}</strong></p>
        <p class="detail-row"><span>Incorrect</span><strong>${lastQuiz.incorrect}</strong></p>
        <p class="detail-row"><span>Date &amp; Time</span><strong>${lastQuiz.dateTime}</strong></p>
        `
        : `
        <p class="detail-row"><span>Subject</span><strong>-</strong></p>
        <p class="detail-row"><span>Topic</span><strong>-</strong></p>
        <p class="detail-row"><span>Questions</span><strong>-</strong></p>
        <p class="detail-row"><span>Score</span><strong>-</strong></p>
        <p class="detail-row"><span>Correct</span><strong>-</strong></p>
        <p class="detail-row"><span>Incorrect</span><strong>-</strong></p>
        <p class="detail-row"><span>Date &amp; Time</span><strong>-</strong></p>
        `;

    const bookmarkAction = bookmarkCount > 0
        ? `
        <button id="startBookmarkedRevision" class="accent-button">
            Start Revision
        </button>
        `
        : `
        <p>
            Bookmark questions during review and they will appear here.
        </p>
        `;

    const wrongAction = wrongCount > 0
        ? `
        <button id="startWrongRevision" class="accent-button">
            Start Revision
        </button>
        `
        : `
        <p>
            Incorrect answers will be saved here for focused revision.
        </p>
        `;

    return `
    <section class="card hub-card">
        <div class="hub-title-row">
            <div>
                <p class="section-label">Study Console</p>
                <h2>Revision Hub</h2>
            </div>
            ${renderIcon("chart", "accent")}
        </div>

        <div class="hub-section">
            <div class="review-heading">
                ${renderIcon("play", "primary")}
                <h3>Continue Last Quiz</h3>
            </div>

            <div class="action-row">
                <button id="continueLastQuiz" class="secondary-button">
                    Continue
                </button>

                <button id="retryLastQuiz" ${lastQuiz ? "" : "disabled"}>
                    Retry
                </button>
            </div>

            <div class="hub-grid">
                ${lastQuizDetails}
            </div>
        </div>

        <div class="hub-section">
            <div class="review-heading">
                ${renderIcon("star", "accent")}
                <h3>Bookmarked Questions</h3>
            </div>

            <p class="muted-copy">Bookmarks : ${bookmarkCount}</p>
            ${bookmarkAction}
        </div>

        <div class="hub-section">
            <div class="review-heading">
                ${renderIcon("alert", "danger")}
                <h3>Wrong Questions</h3>
            </div>

            <p class="muted-copy">Wrong Questions : ${wrongCount}</p>
            ${wrongAction}
        </div>
    </section>
    `;
}

function renderSubjectCard(subject) {
    const button = subject.enabled
        ? `<button id="open${subject.name}">Open</button>`
        : `<button class="secondary-button" disabled>Coming Soon</button>`;

    return `
    <div class="card subject-card ${subject.enabled ? "" : "disabled"}">
        <div class="subject-meta">
            <span class="subject-icon">${subject.icon}</span>
            <div>
                <h2>${subject.name}</h2>
                <p class="subtitle">${subject.enabled ? "Available now" : "Coming soon"}</p>
            </div>
        </div>
        ${button}
    </div>
    `;
}

function getSubjectConfig(subjectName) {
    return SUBJECTS.find(subject => subject.name === subjectName) || null;
}

function renderPolityTopicCard(topic) {
    const isEnabled = Boolean(topic.enabled);
    const tone = isEnabled ? "accent" : "";
    const actionHandler = topic.id === "constitutionArticles"
        ? "renderQuizLength()"
        : topic.id === "bookmarkedQuestions"
            ? "startRevisionQuiz(QUIZ_MODES.bookmarks)"
            : topic.id === "wrongQuestions"
                ? "startRevisionQuiz(QUIZ_MODES.wrong)"
                : `startUniversalQuiz('${topic.id}')`;
    const buttonMarkup = isEnabled
        ? `<button class="polity-action-button" onclick="${actionHandler}">${topic.id === "constitutionArticles" ? "Start Quiz" : "Start Quiz"}</button>`
        : `<button class="polity-action-button secondary-button" disabled>Coming Soon</button>`;

    return `
    <div class="card polity-card ${isEnabled ? "" : "disabled"}">
        <div class="review-heading">
            ${renderIcon(topic.icon, tone)}
            <h2>
                ${topic.title}
            </h2>
        </div>

        ${buttonMarkup}
    </div>
    `;
}

function renderPolity() {
    setScreen("polity");
    const politySubject = getSubjectConfig("Polity");
    const topics = [
        { id: "constitutionArticles", title: "Constitution Articles", icon: "scroll", enabled: true, type: "quiz" },
        ...((politySubject && politySubject.topics ? politySubject.topics : []).filter(topic => topic.id !== "constitutionArticles"))
    ];

    app.innerHTML = `
    <main class="app-shell">
        ${renderScreenHeader("Polity", "Select Topic", "backHome", "renderHome", "← Home")}
        ${topics.map(renderPolityTopicCard).join("")}
    </main>
    `;

    document.getElementById("backHome").onclick = renderHome;
    document.getElementById("topHomeButton").onclick = renderHome;
}

function renderNoQuestionsAvailable(topicTitle) {
    setScreen("noQuestions");

    app.innerHTML = `
    <main class="app-shell">
        ${renderScreenHeader("No Questions Available", topicTitle, "backPolity", "renderPolity", "← Polity")}

        <div class="card quiz-card">
            <p class="subtitle">No questions are available for this topic yet.</p>
            <p>New data can be added by extending the topic dataset.</p>
        </div>
    </main>
    `;

    document.getElementById("backPolity").onclick = renderPolity;
    document.getElementById("topHomeButton").onclick = renderHome;
}

function renderQuizLength() {
    setScreen("quizLength");

    app.innerHTML = `
    <main class="app-shell">
        ${renderScreenHeader("Constitution Articles", "Choose Quiz Length", "backPolity", "renderPolity", "← Polity")}

        <div class="card">
            <div class="length-grid">
                ${QUIZ_LENGTHS.map(length => `
                <button class="length" data-count="${length}">
                    ${length} Questions
                </button>
                `).join("")}
            </div>
        </div>
    </main>
    `;

    document.querySelectorAll(".length").forEach(button => {
        button.onclick = () => startQuiz(Number(button.dataset.count));
    });

    document.getElementById("backPolity").onclick = renderPolity;
    document.getElementById("topHomeButton").onclick = renderHome;
}

function startQuiz(total = state.quiz.total, sourceCards = CONSTITUTION_CARDS, mode = QUIZ_MODES.normal, engine = "constitution", subject = QUIZ_META.subject, topic = QUIZ_META.topic) {
    state.quiz = createEmptyQuiz();
    state.quiz.total = total;
    state.quiz.mode = mode;
    state.quiz.engine = engine;
    state.quiz.subject = subject;
    state.quiz.topic = topic;
    state.quiz.sourceItems = Array.isArray(sourceCards) ? sourceCards : [];

    if (engine === "universal") {
        state.quiz.questions = buildUniversalQuestions(total, sourceCards);
    } else {
        state.quiz.questions = buildQuizQuestions(total, sourceCards);
    }

    state.quiz.total = state.quiz.questions.length;
    state.quiz.current = 0;
    state.quiz.completed = false;
    state.quiz.answers = [];
    state.lastReview = null;
    persistQuizProgress("question");

    renderQuestion();
}

function buildQuizQuestions(total, sourceCards = CONSTITUTION_CARDS) {
    const shuffled = [...sourceCards].sort(() => Math.random() - 0.5);
    const questionCount = Math.min(total, shuffled.length);
    const questionTypes = buildQuestionTypes(questionCount);

    return shuffled
        .slice(0, questionCount)
        .map((item, index) => createQuestion(item, questionTypes[index]));
}

function buildUniversalQuestions(total, sourceCards = []) {
    const dataset = Array.isArray(sourceCards) ? sourceCards : [];
    const shuffled = shuffle([...dataset]);
    const questionCount = Math.min(total, shuffled.length);

    if (questionCount === 0) {
        return [];
    }

    return shuffled
        .slice(0, questionCount)
        .map(item => QuestionFactory(item));
}

function buildQuestionTypes(total) {
    const typeACount = Math.round(total / 2);
    const types = Array.from({ length: total }, (_, index) => index < typeACount
        ? "descriptionToArticle"
        : "articleToDescription");

    return shuffle(types);
}

function createQuestion(item, type = "descriptionToArticle") {
    const correctArticle = item.article;
    const correctDescription = item.body;
    const articleList = CONSTITUTION_CARDS.map(card => card.article);
    const distractorArticles = getDistractorArticles(articleList, correctArticle);
    const options = type === "descriptionToArticle"
        ? buildArticleOptions(correctArticle, distractorArticles)
        : buildDescriptionOptions(correctDescription, distractorArticles);

    return {
        article: correctArticle,
        type,
        engine: "constitution",
        question: buildQuestionPrompt(item, type),
        options,
        correct: options.indexOf(type === "descriptionToArticle" ? correctArticle : correctDescription),
        explanation: `${correctArticle} deals with "${correctDescription}".`
    };
}

function buildQuestionPrompt(item, type) {
    if (type === "articleToDescription") {
        return `${item.article} deals with—`;
    }

    const body = (item.body || "").trim();
    const words = body.split(/\s+/).filter(Boolean);
    const isShortHeading = words.length <= 3 || body.length <= 22;

    if (!isShortHeading || !body) {
        return body || "Which Article of the Constitution is being referred to?";
    }

    return formatShortHeadingQuestion(body);
}

function formatShortHeadingQuestion(body) {
    const normalized = body.trim().toLowerCase();

    if (/definition|definitions/.test(normalized)) {
        return "Which Article contains the constitutional definitions used throughout the Constitution?";
    }

    if (/commencement/.test(normalized)) {
        return "Which Article specifies the commencement of the Constitution?";
    }

    if (/repeal|repeals/.test(normalized)) {
        return "Which Article of the Constitution deals with repeals?";
    }

    return `Which Article of the Constitution deals with ${normalized}?`;
}

function buildArticleOptions(correctArticle, distractorArticles) {
    return shuffle([...distractorArticles, correctArticle]);
}

function buildDescriptionOptions(correctDescription, distractorArticles) {
    const articleLookup = new Map(CONSTITUTION_CARDS.map(card => [card.article, card.body]));
    const distractorDescriptions = distractorArticles.map(article => articleLookup.get(article));

    return shuffle([correctDescription, ...distractorDescriptions]);
}

function getDistractorArticles(articleList, correct) {
    const currentIndex = articleList.indexOf(correct);
    let wrong = [];

    for (let offset = -3; offset <= 3; offset++) {
        if (offset === 0) {
            continue;
        }

        const index = currentIndex + offset;

        if (index >= 0 && index < articleList.length) {
            wrong.push(articleList[index]);
        }
    }

    wrong = shuffle([...new Set(wrong)]).slice(0, 3);

    while (wrong.length < 3) {
        const random = articleList[Math.floor(Math.random() * articleList.length)];

        if (random !== correct && !wrong.includes(random)) {
            wrong.push(random);
        }
    }

    return wrong;
}

function shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
}

function getCardsByArticles(articles) {
    return CONSTITUTION_CARDS.filter(card => articles.includes(card.article));
}

function getQuizSourceCards(mode) {
    if (mode === QUIZ_MODES.bookmarks) {
        return getCardsByArticles(state.bookmarks);
    }

    if (mode === QUIZ_MODES.wrong) {
        return getCardsByArticles(state.wrongQuestions);
    }

    return CONSTITUTION_CARDS;
}

function parseBookmarkEntry(entry) {
    if (typeof entry !== "string") {
        return { engine: "constitution", id: entry };
    }

    const [engine, ...rest] = entry.split(":");
    const id = rest.join(":");

    if (engine === "universal") {
        return { engine: "universal", id };
    }

    return { engine: "constitution", id };
}

function getQuestionBookmarkKey(question) {
    if (!question || typeof question !== "object") {
        return String(question || "");
    }

    if (question.engine === "universal" && question.id) {
        return `universal:${question.id}`;
    }

    if (question.article) {
        return `constitution:${question.article}`;
    }

    if (question.id) {
        return `universal:${question.id}`;
    }

    return String(question);
}

function buildRevisionQuestions(entries) {
    return entries
        .map(entry => {
            const parsed = typeof entry === "string" ? parseBookmarkEntry(entry) : { engine: entry.engine || "constitution", id: entry.id };

            if (parsed.engine === "universal") {
                const item = getUniversalDatasetEntries().find(question => question.id === parsed.id);
                return item ? QuestionFactory(item) : null;
            }

            const card = CONSTITUTION_CARDS.find(item => item.article === parsed.id);
            return card ? createQuestion(card, "descriptionToArticle") : null;
        })
        .filter(Boolean);
}

function getUniversalDatasetEntries() {
    const polity = getSubjectConfig("Polity");
    if (!polity) {
        return [];
    }

    return polity.topics.reduce((all, topic) => all.concat(Array.isArray(topic.dataset) ? topic.dataset : []), []);
}

function getUniversalTopicDataset(topicId) {
    const politySubject = getSubjectConfig("Polity");
    const topic = politySubject && politySubject.topics ? politySubject.topics.find(item => item.id === topicId) : null;
    return topic && Array.isArray(topic.dataset) ? topic.dataset : [];
}

function startUniversalQuiz(topicId) {
    const politySubject = getSubjectConfig("Polity");
    const topic = politySubject && politySubject.topics ? politySubject.topics.find(item => item.id === topicId) : null;
    const topicTitle = topic ? topic.title : "Fundamental Rights";
    const dataset = getUniversalTopicDataset(topicId);

    if (dataset.length === 0) {
        renderNoQuestionsAvailable(topicTitle);
        return;
    }

    startQuiz(10, dataset, QUIZ_MODES.normal, "universal", "Polity", topicTitle);
}

function startRevisionQuiz(mode) {
    const sourceEntries = mode === QUIZ_MODES.bookmarks ? state.bookmarks : state.wrongQuestions;

    if (sourceEntries.length === 0) {
        return;
    }

    const questions = buildRevisionQuestions(sourceEntries);

    if (questions.length === 0) {
        return;
    }

    state.quiz = createEmptyQuiz();
    state.quiz.total = questions.length;
    state.quiz.mode = mode;
    state.quiz.engine = questions.every(question => question.engine === "universal") ? "universal" : questions.every(question => question.engine === "constitution") ? "constitution" : "mixed";
    state.quiz.subject = "Polity";
    state.quiz.topic = mode === QUIZ_MODES.bookmarks ? "Bookmarked Questions" : "Wrong Questions";
    state.quiz.questions = questions;
    state.quiz.sourceItems = sourceEntries;
    state.quiz.current = 0;
    state.quiz.completed = false;
    state.quiz.answers = [];
    state.lastReview = null;
    persistQuizProgress("question");

    renderQuestion();
}

function continueLastQuiz() {
    if (!state.lastQuiz) {
        return;
    }

    if (state.lastQuiz.completed) {
        state.quiz = createEmptyQuiz();
        state.quiz.engine = state.lastQuiz.engine || "constitution";
        state.quiz.subject = state.lastQuiz.subject || QUIZ_META.subject;
        state.quiz.topic = state.lastQuiz.topic || getQuizTopic(state.lastQuiz.mode);
        state.quiz.mode = state.lastQuiz.mode || QUIZ_MODES.normal;
        state.quiz.total = Array.isArray(state.lastQuiz.questionsData) ? state.lastQuiz.questionsData.length : state.lastQuiz.questions || 0;
        state.quiz.current = state.lastQuiz.current || 0;
        state.quiz.correct = state.lastQuiz.correct || 0;
        state.quiz.incorrect = state.lastQuiz.incorrect || 0;
        state.quiz.marks = Number(state.lastQuiz.score || 0);
        state.quiz.questions = (state.lastQuiz.questionsData || []).map(question => {
            if (question.engine === "universal") {
                const source = getUniversalDatasetEntries().find(item => item.id === question.id);
                return source ? QuestionFactory(source) : question;
            }

            return question;
        });
        state.quiz.sourceItems = state.lastQuiz.sourceItems || [];
        state.quiz.completed = true;
        state.lastReview = state.lastQuiz.lastReview || null;
        renderResults();
        return;
    }

    const questions = (state.lastQuiz.questionsData || []).map(question => {
        if (question.engine === "universal") {
            const source = getUniversalDatasetEntries().find(item => item.id === question.id);
            return source ? QuestionFactory(source) : question;
        }

        return question;
    });

    state.quiz = createEmptyQuiz();
    state.quiz.engine = state.lastQuiz.engine || "constitution";
    state.quiz.subject = state.lastQuiz.subject || QUIZ_META.subject;
    state.quiz.topic = state.lastQuiz.topic || getQuizTopic(state.lastQuiz.mode);
    state.quiz.mode = state.lastQuiz.mode || QUIZ_MODES.normal;
    state.quiz.total = questions.length;
    state.quiz.current = state.lastQuiz.current || 0;
    state.quiz.correct = state.lastQuiz.correct || 0;
    state.quiz.incorrect = state.lastQuiz.incorrect || 0;
    state.quiz.marks = Number(state.lastQuiz.score || 0);
    state.quiz.questions = questions;
    state.quiz.sourceItems = state.lastQuiz.sourceItems || [];
    state.quiz.answers = state.lastQuiz.answers || [];
    state.quiz.completed = false;
    state.lastReview = state.lastQuiz.lastReview || null;

    if (state.lastQuiz.lastScreen === "review" && state.lastReview) {
        renderReview(state.quiz.questions[state.quiz.current], state.lastReview.selected, state.lastReview.isCorrect);
        return;
    }

    renderQuestion();
}

function retryLastQuiz() {
    if (!state.lastQuiz) {
        return;
    }

    const mode = state.lastQuiz.mode || QUIZ_MODES.normal;
    const engine = state.lastQuiz.engine || "constitution";
    const subject = state.lastQuiz.subject || QUIZ_META.subject;
    const topic = state.lastQuiz.topic || getQuizTopic(mode);

    if (engine === "universal") {
        startQuiz(state.lastQuiz.questions || 5, state.lastQuiz.sourceItems || [], mode, engine, subject, topic);
        return;
    }

    startQuiz(state.lastQuiz.questions || 10, state.lastQuiz.sourceItems || CONSTITUTION_CARDS, mode, engine, subject, topic);
}

function retryCurrentQuiz() {
    const mode = state.quiz.mode;
    const engine = state.quiz.engine || "constitution";

    if (engine === "universal") {
        startQuiz(state.quiz.total, state.quiz.sourceItems || [], mode, engine, state.quiz.subject || "Polity", state.quiz.topic || "Fundamental Rights");
        return;
    }

    startQuiz(state.quiz.total, state.quiz.sourceItems || CONSTITUTION_CARDS, mode, engine, state.quiz.subject || QUIZ_META.subject, state.quiz.topic || QUIZ_META.topic);
}

function getQuizTopic(mode) {
    if (mode === QUIZ_MODES.bookmarks) {
        return "Bookmarked Questions";
    }

    if (mode === QUIZ_MODES.wrong) {
        return "Wrong Questions";
    }

    return state.quiz?.topic || QUIZ_META.topic;
}

function goBackToReview() {
    if (state.lastReview) {
        renderReview(state.lastReview.question, state.lastReview.selected, state.lastReview.isCorrect);
        return;
    }

    renderQuestion();
}

function renderQuestion() {
    setScreen("question");

    const q = state.quiz.questions[state.quiz.current];
    if (!q) {
        renderResults();
        return;
    }

    const progress = (state.quiz.current / state.quiz.total) * 100;
    const headerTitle = state.quiz.engine === "universal" ? (state.quiz.topic || "Universal Quiz") : "Constitution Articles";
    const backTarget = state.quiz.engine === "universal" ? "renderPolity" : "renderQuizLength";
    const backLabel = state.quiz.engine === "universal" ? "← Polity" : "← Constitution Articles";

    app.innerHTML = `
    <main class="app-shell">
        ${renderScreenHeader(headerTitle, `Question ${state.quiz.current + 1} / ${state.quiz.total}`, "topBackButton", backTarget, backLabel)}

        <div class="card quiz-card">
            <div class="progress">
                <div
                    class="progress-fill"
                    style="width:${progress}%">
                </div>
            </div>

            ${renderScoreboard()}

            <h2 class="question">
                ${state.quiz.engine === "universal" ? (q.prompt || q.question || q.assertion) : q.question}
            </h2>

            ${renderQuestionContent(q)}
        </div>
    </main>
    `;

    if (state.quiz.engine === "universal") {
        const buttons = document.querySelectorAll(".option");
        buttons.forEach(button => {
            button.onclick = () => {
                if (q.type === QUESTION_TYPES.multipleCorrect || q.type === QUESTION_TYPES.statementBased) {
                    button.classList.toggle("selected");
                    return;
                }

                if (q.type === QUESTION_TYPES.matchTheFollowing) {
                    return;
                }

                reviewQuestion(Number(button.dataset.index));
            };
        });

        const submitButton = document.getElementById("submitAnswerButton");
        if (submitButton) {
            submitButton.onclick = () => {
                if (q.type === QUESTION_TYPES.matchTheFollowing) {
                    const answers = Array.from(document.querySelectorAll("select.option")).map(select => Number(select.value));
                    reviewQuestion(answers);
                    return;
                }

                const selected = Array.from(document.querySelectorAll(".option.selected")).map(button => Number(button.dataset.index));
                reviewQuestion(selected);
            };
        }
    } else {
        document.querySelectorAll(".option").forEach(button => {
            button.onclick = () => reviewQuestion(Number(button.dataset.index));
        });
    }

    document.getElementById("topHomeButton").onclick = renderHome;
}

function renderQuestionContent(question) {
    if (state.quiz.engine !== "universal") {
        return `
        <div class="options">
            ${question.options.map((option, index) => `
            <button class="option" data-index="${index}">${option}</button>
            `).join("")}
        </div>
        `;
    }

    const renderer = QuestionRenderer[question.type] || QuestionRenderer[QUESTION_TYPES.mcq];
    const content = renderer(question);
    const needsSubmit = question.type === QUESTION_TYPES.matchTheFollowing || question.type === QUESTION_TYPES.multipleCorrect;

    return `${content}${needsSubmit ? `<button id="submitAnswerButton" class="accent-button">Submit Answer</button>` : ""}`;
}

function renderUniversalReview(question, selected, isCorrect) {
    const renderer = ReviewRenderer[question.type] || ReviewRenderer[QUESTION_TYPES.mcq];
    const selectedValue = Array.isArray(selected) ? selected : [selected];
    const correctText = Array.isArray(question.correct)
        ? question.correct.map(index => question.options[index]).filter(Boolean).join(", ")
        : question.options[question.correct] || "No answer";
    const incorrectOptions = (question.options || []).filter((option, index) => {
        if (Array.isArray(question.correct)) {
            return !question.correct.includes(index);
        }

        return index !== question.correct;
    });

    return `
    <div class="options-list">
        ${renderer(question, selected, isCorrect)}
        <div class="review-option-row correct">
            <div class="review-option-label"><strong>Correct answer</strong></div>
            <div>${correctText}</div>
        </div>
        <div class="review-option-row">
            <div class="review-option-label"><strong>Explanation</strong></div>
            <div>${question.explanation || ""}</div>
        </div>
        <div class="review-option-row">
            <div class="review-option-label"><strong>Why the other options are incorrect</strong></div>
            <div>${incorrectOptions.map(option => `<div>• ${option}</div>`).join("")}</div>
        </div>
    </div>
    `;
}

function renderConstitutionReview(question, selected, isCorrect) {
    return `
    <div class="options">
        ${question.options.map((option, index) => renderReviewOption(option, index, question.correct, selected, isCorrect)).join("")}
    </div>

    <div class="explanation-box">
        <h3>
            Learn Every Option
        </h3>

        <div class="options-list">
            ${question.options.map((option, index) => {
                const description = CONSTITUTION_CARDS.find(card => card.article === option)?.body || option;
                const isCorrect = index === question.correct;
                const isSelected = index === selected;
                const marker = isCorrect ? "✅ Correct" : isSelected ? "Your choice" : "";
                return `
                <div class="review-option-row ${isCorrect ? "correct" : ""}">
                    <div class="review-option-label">
                        <strong>${option}</strong>
                        ${marker ? `<span class="review-option-marker">${marker}</span>` : ""}
                    </div>
                    <div>${description}</div>
                </div>
                `;
            }).join("")}
        </div>
    </div>
    `;
}

function renderScoreboard() {
    return `
    <div class="scoreboard">
        <div>
            ${renderIcon("check", "success")} ${state.quiz.correct}
        </div>

        <div>
            ${renderIcon("x", "danger")} ${state.quiz.incorrect}
        </div>

        <div>
            ${state.quiz.marks.toFixed(2)}
            Marks
        </div>
    </div>
    `;
}

function reviewQuestion(selected) {
    const q = state.quiz.questions[state.quiz.current];
    const isCorrect = state.quiz.engine === "universal"
        ? QuestionValidator[q.type](q, selected)
        : selected === q.correct;

    updateScore(q, isCorrect);
    state.quiz.answers[state.quiz.current] = selected;
    state.lastReview = { question: q, selected, isCorrect };
    persistQuizProgress("review");
    renderReview(q, selected, isCorrect);
}

function updateScore(question, isCorrect) {
    if (isCorrect) {
        state.quiz.correct++;
        state.quiz.marks += SCORE.correct;
        return;
    }

    state.quiz.incorrect++;
    state.quiz.marks += SCORE.incorrect;
    saveWrongQuestion(question);
}

function saveWrongQuestion(target) {
    const key = getQuestionIdentity(target);

    if (state.wrongQuestions.includes(key)) {
        return;
    }

    state.wrongQuestions.push(key);
    saveWrongQuestions();
}

function renderReview(q, selected, isCorrect) {
    setScreen("review");

    app.innerHTML = `
    <main class="app-shell">
        ${renderScreenHeader("Review", `Question ${state.quiz.current + 1} / ${state.quiz.total}`, "topBackButton", "renderQuestion", "← Quiz")}

        <div class="card quiz-card">
            ${renderScoreboard()}

            <h2 class="question">
                ${state.quiz.engine === "universal" ? (q.prompt || q.question || q.assertion) : q.question}
            </h2>

            ${state.quiz.engine === "universal" ? renderUniversalReview(q, selected, isCorrect) : renderConstitutionReview(q, selected, isCorrect)}

            <button id="bookmarkButton" class="secondary-button">
                ${getBookmarkLabel(q)}
            </button>

            <div class="explanation-box">
                <h3>
                    Explanation
                </h3>

                <p>
                    ${q.explanation}
                </p>
            </div>

            <button id="nextButton">
                ${isLastQuestion() ? "Finish Quiz" : "Next Question"}
            </button>
        </div>
    </main>
    `;

    document.getElementById("bookmarkButton").onclick = () => {
        toggleBookmark(q);
        document.getElementById("bookmarkButton").textContent = getBookmarkLabel(q);
    };

    document.getElementById("nextButton").onclick = goToNextQuestion;
    document.getElementById("topHomeButton").onclick = renderHome;
}

function renderReviewOption(option, index, correctIndex, selectedIndex, isCorrect) {
    let cls = "option";

    if (index === correctIndex) {
        cls += " correct";
    }

    if (index === selectedIndex && !isCorrect) {
        cls += " wrong";
    }

    return `
    <button
        class="${cls}"
        disabled>
        ${option}
    </button>
    `;
}

function getBookmarkLabel(article) {
    return isBookmarked(article)
        ? "\u2605 Remove Bookmark"
        : "\u2606 Bookmark";
}

function isLastQuestion() {
    return state.quiz.current + 1 === state.quiz.total;
}

function goToNextQuestion() {
    state.quiz.current++;

    if (state.quiz.current >= state.quiz.total) {
        renderResults();
        return;
    }

    persistQuizProgress("question");
    renderQuestion();
}

function renderResults() {
    setScreen("results");
    saveLastQuiz();
    const accuracy = Number(getAccuracy());
    const ringOffset = 339.292 - (339.292 * accuracy / 100);

    app.innerHTML = `
    <main class="app-shell">
        ${renderScreenHeader("Quiz Complete", getQuizTopic(state.quiz.mode), "topBackButton", "goBackToReview", "← Review")}

        <div class="card results-card">
            <div class="score-hero">
                <svg class="score-ring" viewBox="0 0 120 120" aria-label="Accuracy ${getAccuracy()}%">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(148, 163, 184, .16)" stroke-width="10"/>
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#2563EB" stroke-width="10" stroke-linecap="round" stroke-dasharray="339.292" stroke-dashoffset="${ringOffset}" transform="rotate(-90 60 60)"/>
                    <text x="60" y="58" text-anchor="middle" font-size="24">${getAccuracy()}%</text>
                    <text x="60" y="78" text-anchor="middle" font-size="10" fill="#94A3B8">Accuracy</text>
                </svg>

                <div>
                    <p class="section-label">Final Score</p>
                    <div class="score-value">${state.quiz.marks.toFixed(2)}</div>
                    <p class="subtitle">Marks</p>
                </div>
            </div>

            <div class="result-grid">
                <div class="stat-card">
                    <span>Correct</span>
                    <strong>${state.quiz.correct}</strong>
                </div>

                <div class="stat-card">
                    <span>Incorrect</span>
                    <strong>${state.quiz.incorrect}</strong>
                </div>

                <div class="stat-card">
                    <span>Bookmarks</span>
                    <strong>${state.bookmarks.length}</strong>
                </div>

                <div class="stat-card">
                    <span>Wrong Saved</span>
                    <strong>${state.wrongQuestions.length}</strong>
                </div>
            </div>

            <div class="action-row">
                <button id="retryButton">
                    Retry Quiz
                </button>

                <button id="homeButton" class="secondary-button">
                    Home
                </button>
            </div>
        </div>
    </main>
    `;

    document.getElementById("retryButton").onclick = retryCurrentQuiz;
    document.getElementById("homeButton").onclick = renderHome;
    document.getElementById("topHomeButton").onclick = renderHome;
}

function getAccuracy() {
    const total = state.quiz.correct + state.quiz.incorrect;

    if (total === 0) {
        return "0";
    }

    return ((state.quiz.correct / total) * 100).toFixed(1);
}
