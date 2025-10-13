document.addEventListener('DOMContentLoaded', () => {

    /* ==== Responsive Navbar Toggle (hamburger ↔ cross) ==== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');

    if (menuToggle && mobileMenu && menuIcon) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('animate-slide-down');

            // Toggle hamburger ↔ cross icon
            if (!mobileMenu.classList.contains('hidden')) {
                menuIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"/>
                `;
            } else {
                menuIcon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16m-7 6h7"/>
                `;
            }
        });
    }

    /* ==== CPN Calculator Logic ==== */
    const calculateBtn = document.getElementById('calculate-btn');
    const suggestBtn = document.getElementById('suggest-btn');
    const cpnResultEl = document.getElementById('cpn-result');
    const errorMessageEl = document.getElementById('error-message');
    const resultsContainer = document.getElementById('results-container');
    const suggestionsOutputEl = document.getElementById('suggestions-output');
    const fieldSelectEl = document.getElementById('field-select');

    const departments = {
        'pre-engineering': [
            { name: "Software Engineering", minCPN: 78 },
            { name: "Computer Science", minCPN: 75 },
            { name: "Information Technology", minCPN: 74 },
            { name: "Electronics", minCPN: 72 },
            { name: "Telecommunication", minCPN: 70 },
        ],
        'pre-medical': [
            { name: "Pharm-D", minCPN: 80 },
            { name: "Chemistry", minCPN: 68 },
            { name: "Zoology", minCPN: 68 },
            { name: "Botany", minCPN: 65 },
        ],
        'common': [
            { name: "Public Administration", minCPN: 63 },
            { name: "English Literature", minCPN: 62 },
            { name: "Economics", minCPN: 60 },
            { name: "International Relations", minCPN: 58 },
            { name: "Sociology", minCPN: 56 },
            { name: "Sindhi", minCPN: 55 },
        ]
    };

    /* ==== Event Listeners ==== */
    calculateBtn.addEventListener('click', calculateCPN);
    suggestBtn.addEventListener('click', showSuggestions);

    /* ==== Calculate CPN ==== */
    function calculateCPN() {
        resetUI();

        const matricPerc = parseFloat(document.getElementById('matric-percentage').value);
        const interPerc = parseFloat(document.getElementById('inter-percentage').value);
        const testScore = parseFloat(document.getElementById('test-score').value);

        if (!validateInputs(matricPerc, interPerc, testScore)) return;

        // Weighted CPN calculation
        const cpn = (testScore * 0.6) + (interPerc * 0.3) + (matricPerc * 0.1);
        displayResult(cpn);
    }

    /* ==== Input Validation ==== */
    function validateInputs(matric, inter, test) {
        if (isNaN(matric) || isNaN(inter) || isNaN(test)) {
            return showError("Please fill in all fields with numbers.");
        }
        if (matric < 0 || matric > 100 || inter < 0 || inter > 100) {
            return showError("Percentages must be between 0 and 100.");
        }
        if (test < 0 || test > 100) {
            return showError("Test score must be between 0 and 100.");
        }
        return true;
    }

    /* ==== Display CPN Result ==== */
    function displayResult(cpn) {
        cpnResultEl.textContent = cpn.toFixed(2);
        resultsContainer.classList.remove('hidden');
    }

    /* ==== Show Department Suggestions ==== */
    function showSuggestions() {
        const cpn = parseFloat(cpnResultEl.textContent);
        if (isNaN(cpn)) return;

        const selectedField = fieldSelectEl.value;
        const fieldDepartments = departments[selectedField] || [];
        const commonDepartments = departments['common'] || [];
        let allDepartments = [...fieldDepartments, ...commonDepartments];

        // Add probability info
        allDepartments = allDepartments.map(dept => ({ ...dept, ...getProbability(cpn, dept.minCPN) }));

        // Sort by probability (high → low)
        allDepartments.sort((a, b) => b.score - a.score || b.minCPN - a.minCPN);

        // Render suggestions
        let outputHTML = `
            <h3 class="text-2xl font-bold text-gray-800 text-center mb-6">
                Department Suggestions (Highest Chance First)
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        `;
        allDepartments.forEach(dept => {
            outputHTML += `
                <div class="bg-white border rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                    <span class="font-semibold text-gray-700">${dept.name}</span>
                    <span class="badge ${dept.class}">${dept.text}</span>
                </div>
            `;
        });
        outputHTML += `</div>`;

        suggestionsOutputEl.innerHTML = outputHTML;
        suggestionsOutputEl.classList.remove('hidden');
    }

    /* ==== Probability Calculation ==== */
    function getProbability(userCPN, minCPN) {
        const diff = userCPN - minCPN;
        if (diff >= 5) return { text: "High", class: "badge-high", score: 4 };
        if (diff >= 2) return { text: "Good", class: "badge-good", score: 3 };
        if (diff >= -2) return { text: "Possible", class: "badge-possible", score: 2 };
        return { text: "Low", class: "badge-low", score: 1 };
    }

    /* ==== Reset UI ==== */
    function resetUI() {
        errorMessageEl.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        suggestionsOutputEl.classList.add('hidden');
        suggestionsOutputEl.innerHTML = '';
    }

    /* ==== Show Error ==== */
    function showError(message) {
        errorMessageEl.textContent = message;
        errorMessageEl.classList.remove('hidden');
        return false;
    }

});
