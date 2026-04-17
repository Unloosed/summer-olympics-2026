document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Authentication Logic ---
    const MOCK_USER_KEY = 'olympics_mock_user';
    const REGISTRATIONS_KEY = 'olympics_registrations';

    // Google Sheets Data URL (CSV export)
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1wMNQwv8CZiVJCm3mkSbBReJvi-822EfoSDBU2sWmHmU/gviz/tq?tqx=out:csv&gid=1002595211';

    let currentUser = JSON.parse(localStorage.getItem(MOCK_USER_KEY));

    const updateAuthUI = () => {
        const authNotice = document.getElementById('auth-notice');
        const signupControls = document.getElementById('signup-controls');

        if (!authNotice || !signupControls) return;

        if (currentUser) {
            authNotice.innerHTML = `<p>Logged in as <strong>${currentUser.name}</strong>. <a href="#" id="mock-logout">Logout</a></p>`;
            signupControls.style.display = 'block';

            document.getElementById('mock-logout').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(MOCK_USER_KEY);
                currentUser = null;
                updateAuthUI();
                updateRegistrationUI();
            });
        } else {
            authNotice.innerHTML = `
                <p>You must be "logged in" to sign up.</p>
                <button id="mock-login-button" class="cta-button secondary">Simulate Login</button>
            `;
            signupControls.style.display = 'none';

            document.getElementById('mock-login-button').addEventListener('click', () => {
                const name = prompt("Enter your name to simulate login:", "Athlete One");
                if (name) {
                    currentUser = { name, id: Date.now() };
                    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(currentUser));
                    updateAuthUI();
                    updateRegistrationUI();
                }
            });
        }
    };

    // --- CSV Parsing Utility ---
    const parseCSV = (csvText) => {
        const lines = csvText.split('\n');
        if (lines.length === 0) return [];
        const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
        return lines.slice(1).filter(line => line.trim() !== '').map(line => {
            // Basic CSV parser that handles quoted values with commas
            const values = [];
            let current = '';
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.replace(/^"|"$/g, '').trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.replace(/^"|"$/g, '').trim());

            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        });
    };

    // --- XSS Prevention Utility ---
    const escapeHTML = (str) => {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    // --- Registration Logic ---
    const getRegistrations = () => JSON.parse(localStorage.getItem(REGISTRATIONS_KEY)) || {};

    const updateRegistrationUI = async () => {
        const detailEl = document.querySelector('.event-detail');
        if (!detailEl) {
            // We might be on the directory page, update badges there
            updateDirectoryBadges();
            return;
        }

        const eventId = detailEl.dataset.eventId;
        const eventTitle = detailEl.dataset.eventTitle;
        const eventCapacity = parseInt(detailEl.dataset.eventCapacity) || 100;

        let spreadsheetRegs = [];
        try {
            const response = await fetch(SHEET_CSV_URL);
            if (response.ok) {
                const csvText = await response.text();
                const allData = parseCSV(csvText);
                // Filter rows by matching event title
                // Based on GOOGLE_FORMS_SETUP.md, "Event Title" is a field.
                spreadsheetRegs = allData.filter(row => row['Event Title'] === eventTitle);

                // Also populate the participants table if it exists
                updateParticipantsTable(spreadsheetRegs);
            } else {
                throw new Error('Failed to fetch spreadsheet');
            }
        } catch (error) {
            console.error('Error fetching registrations from spreadsheet:', error);
            const container = document.getElementById('participants-container');
            const participantsList = document.getElementById('participants-list');
            if (participantsList) {
                participantsList.innerHTML = '<p class="error-text">Unable to load current participants from spreadsheet.</p>';
            }
            if (container) container.style.display = 'block';
        }

        // Fallback or combine with mock registrations if needed
        const localRegistrations = getRegistrations();
        const localEventRegs = localRegistrations[eventId] || [];

        // Use spreadsheet data for official count
        const totalCount = spreadsheetRegs.length;

        const statusBox = document.getElementById('registration-status');
        const signupBtn = document.getElementById('signup-button');
        const cancelBtn = document.getElementById('cancel-signup-button');
        const capacityText = document.getElementById('event-capacity-text');

        if (capacityText) {
            capacityText.innerText = `${totalCount} / ${eventCapacity}`;
        }

        if (statusBox) {
            if (!currentUser) {
                statusBox.innerHTML = '<span class="status-badge">Login to see status</span>';
            } else {
                // For the mock "Registered" status, we still use local storage
                // because we can't easily check the spreadsheet for the current user's entry
                // without email/id verification.
                const isRegisteredLocally = localEventRegs.some(u => u.id === currentUser.id);

                if (isRegisteredLocally) {
                    statusBox.innerHTML = '<span class="status-badge status-open">✓ You are registered!</span>';
                    if (signupBtn) signupBtn.style.display = 'none';
                    if (cancelBtn) cancelBtn.style.display = 'inline-block';
                } else {
                    if (totalCount >= eventCapacity) {
                        statusBox.innerHTML = '<span class="status-badge status-full">Event is Full</span>';
                        if (signupBtn) {
                            signupBtn.disabled = true;
                            signupBtn.innerText = 'Capacity Reached';
                            signupBtn.style.display = 'inline-block';
                        }
                        if (cancelBtn) cancelBtn.style.display = 'none';
                    } else {
                        statusBox.innerHTML = '<span class="status-badge status-open">Registration Open</span>';
                        if (signupBtn) {
                            signupBtn.disabled = false;
                            signupBtn.innerText = 'Sign Up for this Event';
                            signupBtn.style.display = 'inline-block';
                        }
                        if (cancelBtn) cancelBtn.style.display = 'none';
                    }
                }
            }
        }
    };

    const updateParticipantsTable = (participants) => {
        const container = document.getElementById('participants-container');
        const listDiv = document.getElementById('participants-list');
        if (!container || !listDiv) return;

        if (participants.length === 0) {
            listDiv.innerHTML = '<p>No participants signed up yet. Be the first!</p>';
        } else {
            const table = document.createElement('table');
            table.className = 'participants-table';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            ['Name', 'Team', 'Status'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            participants.forEach(p => {
                const tr = document.createElement('tr');

                const nameTd = document.createElement('td');
                nameTd.textContent = p['Full Name'] || 'Anonymous';
                tr.appendChild(nameTd);

                const teamTd = document.createElement('td');
                teamTd.textContent = p['Team Name'] || '-';
                tr.appendChild(teamTd);

                const statusTd = document.createElement('td');
                const badge = document.createElement('span');
                badge.className = 'status-badge status-open';
                badge.textContent = 'Registered';
                statusTd.appendChild(badge);
                tr.appendChild(statusTd);

                tbody.appendChild(tr);
            });
            table.appendChild(tbody);

            listDiv.innerHTML = '';
            listDiv.appendChild(table);
        }
        container.style.display = 'block';
    };

    const updateDirectoryBadges = () => {
        const cards = document.querySelectorAll('.event-card');
        const registrations = getRegistrations();

        cards.forEach(card => {
            const eventId = card.dataset.id;
            const badge = document.getElementById(`status-badge-${eventId}`);
            if (!badge) return;

            const eventRegs = registrations[eventId] || [];
            if (currentUser && eventRegs.some(u => u.id === currentUser.id)) {
                badge.innerText = '✓ Registered';
                badge.className = 'status-badge status-open';
            }
        });
    };

    // Signup Event Listeners
    const signupBtn = document.getElementById('signup-button');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            if (!currentUser) return;
            const detailEl = document.querySelector('.event-detail');
            const eventId = detailEl.dataset.eventId;
            const registrations = getRegistrations();

            if (!registrations[eventId]) registrations[eventId] = [];

            if (!registrations[eventId].some(u => u.id === currentUser.id)) {
                registrations[eventId].push(currentUser);
                localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
                alert("Successfully registered!");
                updateRegistrationUI();
            }
        });
    }

    const cancelBtn = document.getElementById('cancel-signup-button');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (!currentUser) return;
            const detailEl = document.querySelector('.event-detail');
            const eventId = detailEl.dataset.eventId;
            const registrations = getRegistrations();

            if (registrations[eventId]) {
                registrations[eventId] = registrations[eventId].filter(u => u.id !== currentUser.id);
                localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
                alert("Registration cancelled.");
                updateRegistrationUI();
            }
        });
    }

    // --- Search and Filter Logic ---
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const typeFilter = document.getElementById('type-filter');
    const statusFilter = document.getElementById('status-filter');
    const eventCards = document.querySelectorAll('.event-card');
    const noResults = document.getElementById('no-results');

    if (searchInput && categoryFilter && typeFilter) {
        const filterEvents = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const category = categoryFilter.value;
            const type = typeFilter.value;
            const status = statusFilter ? statusFilter.value : 'all';
            let visibleCount = 0;

            eventCards.forEach(card => {
                const title = card.dataset.title;
                const cardCategory = card.dataset.category;
                const isTeam = card.dataset.teamBased === 'true';
                const cardStatus = card.dataset.status;

                const matchesSearch = title.includes(searchTerm);
                const matchesCategory = category === 'all' || cardCategory === category;
                const matchesType = type === 'all' ||
                    (type === 'team' && isTeam) ||
                    (type === 'individual' && !isTeam);
                const matchesStatus = status === 'all' || cardStatus === status;

                if (matchesSearch && matchesCategory && matchesType && matchesStatus) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        };

        searchInput.addEventListener('input', filterEvents);
        categoryFilter.addEventListener('change', filterEvents);
        typeFilter.addEventListener('change', filterEvents);
        if (statusFilter) {
            statusFilter.addEventListener('change', filterEvents);
        }
    }

    // --- Google Form Submission Handling ---
    let formSubmitted = false;

    window.handleFormSubmit = () => {
        formSubmitted = true;
    };

    const hiddenIframe = document.getElementById('hidden_iframe');
    if (hiddenIframe) {
        hiddenIframe.addEventListener('load', () => {
            if (formSubmitted) {
                const form = document.getElementById('event-registration-form');
                const successMsg = document.getElementById('form-success-message');
                if (form) form.style.display = 'none';
                if (successMsg) successMsg.style.display = 'block';
                successMsg.scrollIntoView({ behavior: 'smooth' });
                // Re-fetch participants to update the list and capacity
                updateRegistrationUI();
            }
        });
    }

    // Initialize UI
    updateAuthUI();
    updateRegistrationUI();
});
