document.addEventListener('DOMContentLoaded', () => {

    /* ==== Responsive Navbar Toggle ==== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menuToggle && mobileMenu && menuIcon) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('animate-slide-down');
            menuIcon.innerHTML = !mobileMenu.classList.contains('hidden')
                ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`
                : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"/>`;
        });
    }

    /* ==== Elements ==== */
    const calculateBtn = document.getElementById('calculate-btn');
    const suggestBtn = document.getElementById('suggest-btn');
    const cpnResultEl = document.getElementById('cpn-result');
    const errorMessageEl = document.getElementById('error-message');
    const resultsContainer = document.getElementById('results-container');
    const suggestionsOutputEl = document.getElementById('suggestions-output');
    const fieldSelectEl = document.getElementById('field-select');
    const top5Btn = document.getElementById('top5-btn');

    /* ==== Department Lists ==== */
    const itDepts = ['Information Technology', 'Computer Science', 'Data Science', 'Artificial Intelligence', 'AI'];
    const engineeringDepts = ['Software Engineering', 'Physics', 'Mathematics'];
    const medicalDepts = ['Pharmacy', 'Biochemistry', 'Microbiology', 'Physiology', 'Zoology', 'Botany', 'Biotechnology', 'Food Science'];
    const commerceDepts = ['Commerce', 'BBA', 'Forensic Accounting', 'Banking & Finance', 'Accounting', 'Economics'];
    const naturalScienceDepts = ['Chemistry', 'Geology', 'Statistics', 'Environmental Science'];
    const artsDepts = ['English', 'History', 'Political Science', 'Sociology', 'Sindhi', 'Pakistani Studies', 'Philosophy', 'Psychology', 'International Relations', 'Education', 'Mass Communication'];
    const veryHighCompetition = ['Pharmacy', 'Law'];

    const generalDepts = [
        ...itDepts,
        ...commerceDepts,
        'Public Administration',
        'Education',
        'Mass Communication'
    ];

    const preMedicalAllowed = [
        ...medicalDepts,
        ...generalDepts,
        'Chemistry', 'Environmental Science', 'Psychology', 'Sociology', 'English', 'History', 'Economics'
    ].filter((v, i, a) => a.indexOf(v) === i);

    const engineeringAllowed = [
        ...engineeringDepts,
        ...generalDepts,
        'Chemistry', 'Geology', 'Statistics', 'Environmental Science'
    ].filter((v, i, a) => a.indexOf(v) === i);

    /* ==== Event Listeners ==== */
    calculateBtn.addEventListener('click', calculateCPN);
    suggestBtn.addEventListener('click', showSuggestions);
    if (top5Btn) top5Btn.addEventListener('click', showTop10Picks);

    /* ==== Calculate CPN ==== */
    function calculateCPN() {
        resetUI();
        const matricPerc = parseFloat(document.getElementById('matric-percentage').value);
        const interPerc = parseFloat(document.getElementById('inter-percentage').value);
        const testScore = parseFloat(document.getElementById('test-score').value);

        if (!validateInputs(matricPerc, interPerc, testScore)) return;

        const cpn = (testScore * 0.6) + (interPerc * 0.3) + (matricPerc * 0.1);
        displayResult(cpn);
    }

    function validateInputs(matric, inter, test) {
        if (isNaN(matric) || isNaN(inter) || isNaN(test)) return showError("Please fill in all fields with numbers.");
        if (matric < 0 || matric > 100 || inter < 0 || inter > 100) return showError("Percentages must be between 0 and 100.");
        if (test < 0 || test > 100) return showError("Test score must be between 0 and 100.");
        return true;
    }

    function displayResult(cpn) {
        cpnResultEl.textContent = cpn.toFixed(2);
        resultsContainer.classList.remove('hidden');
    }

    /* ==== Show Department Suggestions ==== */
    function showSuggestions() {
        const cpn = parseFloat(cpnResultEl.textContent);
        if (isNaN(cpn)) return showError("Calculate your CPN first.");

        const field = (fieldSelectEl && fieldSelectEl.value) ? fieldSelectEl.value : 'pre-engineering';
        let available = [];

        if (field === 'pre-medical' || field === 'premedical') {
            available = preMedicalAllowed;
        } else if (field === 'pre-engineering' || field === 'engineering') {
            available = engineeringAllowed;
        } else {
            available = generalDepts.concat(artsDepts);
        }

        itDepts.forEach(d => { if (!available.includes(d)) available.push(d); });

        let suggestions = available.map(name => {
            const prob = evaluateChanceForDept(name, cpn);
            return { name, ...prob };
        });

        suggestions.sort((a, b) => {
            const scoreA = scoreValue(a.text), scoreB = scoreValue(b.text);
            if (scoreB !== scoreA) return scoreB - scoreA;
            const boostA = itDepts.includes(a.name) ? 0.1 : 0;
            const boostB = itDepts.includes(b.name) ? 0.1 : 0;
            if (boostB !== boostA) return boostB - boostA;
            return a.name.localeCompare(b.name);
        });

        // ✅ Working Renderer
        renderSuggestionsList(
            suggestions,
            `Department Suggestions — ${field === 'pre-medical' ? 'Pre-Medical' : field === 'pre-engineering' ? 'Pre-Engineering' : 'General'}`
        );
    }

    /* ==== Renderer (Fixed) ==== */
    function renderSuggestionsList(list, heading) {
        suggestionsOutputEl.classList.remove('hidden');
        suggestionsOutputEl.innerHTML = `
            <div class="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-md animate-fade-in">
              <h3 class="text-2xl font-semibold text-blue-700 mb-4">${heading}</h3>
              <ul class="text-left max-w-md mx-auto list-disc list-inside text-gray-700 space-y-2">
                ${list.map(item =>
                    `<li><span class="font-medium">${item.name}</span> 
                    <span class="badge ${item.class}">${item.text}</span></li>`
                ).join('')}
              </ul>
            </div>
        `;
    }

    /* ==== Chance Logic ==== */
    function evaluateChanceForDept(deptName, cpn) {
        if (veryHighCompetition.includes(deptName)) {
            if (cpn >= 75) return { text: 'High', class: 'badge-high' };
            if (cpn >= 68) return { text: 'Good', class: 'badge-good' };
            if (cpn >= 60) return { text: 'Possible', class: 'badge-possible' };
            return { text: 'Low', class: 'badge-low' };
        }

        if (artsDepts.includes(deptName) || ['Chemistry', 'Geology', 'Environmental Science', 'Food Science'].includes(deptName)) {
            if (cpn >= 55) return { text: 'High', class: 'badge-high' };
            if (cpn >= 50) return { text: 'Good', class: 'badge-good' };
            if (cpn >= 45) return { text: 'Possible', class: 'badge-possible' };
            return { text: 'Low', class: 'badge-low' };
        }

        if (itDepts.includes(deptName) || commerceDepts.includes(deptName)) {
            if (cpn >= 70) return { text: 'High', class: 'badge-high' };
            if (cpn >= 62) return { text: 'Good', class: 'badge-good' };
            if (cpn >= 55) return { text: 'Possible', class: 'badge-possible' };
            return { text: 'Low', class: 'badge-low' };
        }

        if (engineeringDepts.includes(deptName) || deptName.toLowerCase().includes('engineering')) {
            if (cpn >= 70) return { text: 'High', class: 'badge-high' };
            if (cpn >= 63) return { text: 'Good', class: 'badge-good' };
            if (cpn >= 58) return { text: 'Possible', class: 'badge-possible' };
            return { text: 'Low', class: 'badge-low' };
        }

        if (medicalDepts.includes(deptName)) {
            if (cpn >= 68) return { text: 'High', class: 'badge-high' };
            if (cpn >= 60) return { text: 'Good', class: 'badge-good' };
            if (cpn >= 55) return { text: 'Possible', class: 'badge-possible' };
            return { text: 'Low', class: 'badge-low' };
        }

        if (cpn >= 70) return { text: 'High', class: 'badge-high' };
        if (cpn >= 60) return { text: 'Good', class: 'badge-good' };
        if (cpn >= 55) return { text: 'Possible', class: 'badge-possible' };
        return { text: 'Low', class: 'badge-low' };
    }

    function scoreValue(label) {
        switch (label) {
            case 'High': return 4;
            case 'Good': return 3;
            case 'Possible': return 2;
            default: return 1;
        }
    }

    /* ==== Top 10 Picks ==== */
    function showTop10Picks() {
        const cpnValue = parseFloat(cpnResultEl.textContent);
        if (isNaN(cpnValue)) return showError("Calculate your CPN first.");

        const field = (fieldSelectEl && fieldSelectEl.value) ? fieldSelectEl.value : 'pre-engineering';
        let available = [];

        if (field === 'pre-medical' || field === 'premedical') available = preMedicalAllowed;
        else if (field === 'pre-engineering' || field === 'engineering') available = engineeringAllowed;
        else available = generalDepts.concat(artsDepts);

        itDepts.forEach(d => { if (!available.includes(d)) available.push(d); });

        const scored = available.map(name => {
            const prob = evaluateChanceForDept(name, cpnValue);
            return { name, text: prob.text, class: prob.class, score: scoreValue(prob.text) };
        });

        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            const priorityA = (itDepts.includes(a.name) || commerceDepts.includes(a.name) || engineeringDepts.includes(a.name)) ? 1 : 0;
            const priorityB = (itDepts.includes(b.name) || commerceDepts.includes(b.name) || engineeringDepts.includes(b.name)) ? 1 : 0;
            if (priorityB !== priorityA) return priorityB - priorityA;
            return a.name.localeCompare(b.name);
        });

        const top10 = scored.slice(0, 10);

        suggestionsOutputEl.classList.remove('hidden');
        suggestionsOutputEl.innerHTML = `
            <div class="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 shadow-md animate-fade-in">
              <h3 class="text-2xl font-semibold text-blue-700 mb-4">Top 10 Best Picks (Field: ${field}) — CPN ${cpnValue.toFixed(2)}</h3>
              <ul class="list-decimal list-inside text-gray-700 space-y-2">
                ${top10.map(item => `<li>${item.name} <span class="text-sm text-gray-500">(${item.text})</span></li>`).join('')}
              </ul>
            </div>
        `;
    }

    /* ==== UI Helpers ==== */
    function resetUI() {
        errorMessageEl.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        suggestionsOutputEl.classList.add('hidden');
        suggestionsOutputEl.innerHTML = '';
    }

    function showError(message) {
        errorMessageEl.textContent = message;
        errorMessageEl.classList.remove('hidden');
        return false;
    }
});
