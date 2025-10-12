document.addEventListener('DOMContentLoaded', () => {

    /* ==== Responsive Navbar Toggle (with hamburger ↔ cross animation) ==== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon'); // SVG icon inside button

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
    if (calculateBtn) {
        const matricObtainedEl = document.getElementById('matric-obtained');
        const matricTotalEl = document.getElementById('matric-total');
        const interObtainedEl = document.getElementById('inter-obtained');
        const interTotalEl = document.getElementById('inter-total');
        const testScoreEl = document.getElementById('test-score');
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

        calculateBtn.addEventListener('click', calculateCPN);
        suggestBtn.addEventListener('click', showSuggestions);

        function calculateCPN() {
            resetUI();
            const matricObtained = parseFloat(matricObtainedEl.value);
            const matricTotal = parseFloat(matricTotalEl.value);
            const interObtained = parseFloat(interObtainedEl.value);
            const interTotal = parseFloat(interTotalEl.value);
            const testScore = parseFloat(testScoreEl.value);
            if (!validateInputs(matricObtained, matricTotal, interObtained, interTotal, testScore)) return;

            const matricPercentage = (matricObtained / matricTotal) * 100;
            const interPercentage = (interObtained / interTotal) * 100;
            const cpn = (testScore * 0.6) + (interPercentage * 0.3) + (matricPercentage * 0.1);
            displayResult(cpn);
        }

        function showSuggestions() {
            const cpn = parseFloat(cpnResultEl.textContent);
            if (isNaN(cpn)) return;
            const selectedField = fieldSelectEl.value;
            const fieldDepartments = departments[selectedField] || [];
            const commonDepartments = departments['common'] || [];
            let allSuggestions = [...fieldDepartments, ...commonDepartments];
            allSuggestions = allSuggestions.map(dept => ({ ...dept, ...getProbability(cpn, dept.minCPN) }));
            allSuggestions.sort((a, b) => b.score - a.score || b.minCPN - a.minCPN);

            let outputHTML = `
                <h3 class="text-2xl font-bold text-gray-800 text-center mb-6">
                    Department Suggestions (Highest Chance First)
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            `;
            allSuggestions.forEach(dept => {
                outputHTML += `
                    <div class="bg-white border rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
                        <span class="font-semibold text-gray-700">${dept.name}</span>
                        <span class="badge ${dept.class}">${dept.text}</span>
                    </div>`;
            });
            outputHTML += `</div>`;
            suggestionsOutputEl.innerHTML = outputHTML;
            suggestionsOutputEl.classList.remove('hidden');
        }

        function getProbability(userCPN, minCPN) {
            const diff = userCPN - minCPN;
            if (diff >= 5) return { text: "High", class: "badge-high", score: 4 };
            if (diff >= 2) return { text: "Good", class: "badge-good", score: 3 };
            if (diff >= -2) return { text: "Possible", class: "badge-possible", score: 2 };
            return { text: "Low", class: "badge-low", score: 1 };
        }

        function validateInputs(mo, mt, io, it, ts) {
            if (isNaN(mo) || isNaN(mt) || isNaN(io) || isNaN(it) || isNaN(ts)) return showError("Please fill in all fields with numbers.");
            if (mo <= 0 || mt <= 0 || io <= 0 || it <= 0 || ts < 0) return showError("Marks and scores must be positive numbers.");
            if (mo > mt || io > it) return showError("Obtained marks cannot be greater than total marks.");
            if (ts > 100) return showError("Test score cannot be greater than 100.");
            return true;
        }

        function displayResult(cpn) {
            cpnResultEl.textContent = cpn.toFixed(4);
            resultsContainer.classList.remove('hidden');
        }

        function showError(message) {
            errorMessageEl.textContent = message;
            errorMessageEl.classList.remove('hidden');
            return false;
        }

        function resetUI() {
            errorMessageEl.classList.add('hidden');
            resultsContainer.classList.add('hidden');
            suggestionsOutputEl.classList.add('hidden');
            suggestionsOutputEl.innerHTML = '';
        }
    }

    /* ==== Contact Form Handling ==== */
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        const statusMessage = document.getElementById("status-message");
        const submitButton = document.getElementById("submit-button");

        async function handleContactSubmit(event) {
            event.preventDefault();
            const data = new FormData(event.target);
            submitButton.disabled = true;
            submitButton.innerText = "Sending...";

            fetch(event.target.action, {
                method: contactForm.method,
                body: data,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    statusMessage.innerHTML = "<p class='text-green-600 font-semibold'>Thanks for your submission!</p>";
                    contactForm.reset();
                } else {
                    response.json().then(data => {
                        const errorMsg = data.errors ? data.errors.map(e => e.message).join(", ") : "Oops! There was a problem.";
                        statusMessage.innerHTML = `<p class='text-red-600 font-semibold'>${errorMsg}</p>`;
                    })
                }
            }).catch(() => {
                statusMessage.innerHTML = "<p class='text-red-600 font-semibold'>Oops! There was a problem submitting your form.</p>";
            }).finally(() => {
                submitButton.disabled = false;
                submitButton.innerText = "Send Message";
            });
        }

        contactForm.addEventListener("submit", handleContactSubmit);
    }
});
