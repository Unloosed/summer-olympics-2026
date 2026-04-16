document.addEventListener('DOMContentLoaded', () => {
    // --- Mock Authentication Logic ---
    const MOCK_USER_KEY = 'olympics_mock_user';
    const REGISTRATIONS_KEY = 'olympics_registrations';

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

    // --- Registration Logic ---
    const getRegistrations = () => JSON.parse(localStorage.getItem(REGISTRATIONS_KEY)) || {};

    const updateRegistrationUI = () => {
        const detailEl = document.querySelector('.event-detail');
        if (!detailEl) {
            // We might be on the directory page, update badges there
            updateDirectoryBadges();
            return;
        }

        const eventId = detailEl.dataset.eventId;
        const eventCapacity = parseInt(detailEl.dataset.eventCapacity) || 100;
        const registrations = getRegistrations();
        const eventRegs = registrations[eventId] || [];
        
        const statusBox = document.getElementById('registration-status');
        const signupBtn = document.getElementById('signup-button');
        const cancelBtn = document.getElementById('cancel-signup-button');
        const capacityText = document.getElementById('event-capacity-text');

        if (capacityText) {
            capacityText.innerText = `${eventRegs.length} / ${eventCapacity}`;
        }

        if (statusBox) {
            if (!currentUser) {
                statusBox.innerHTML = '<span class="status-badge">Login to see status</span>';
            } else {
                const isRegistered = eventRegs.some(u => u.id === currentUser.id);

                if (isRegistered) {
                    statusBox.innerHTML = '<span class="status-badge status-open">✓ You are registered!</span>';
                    if (signupBtn) signupBtn.style.display = 'none';
                    if (cancelBtn) cancelBtn.style.display = 'inline-block';
                } else {
                    if (eventRegs.length >= eventCapacity) {
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

    const updateDirectoryBadges = () => {
        const cards = document.querySelectorAll('.event-card');
        const registrations = getRegistrations();

        cards.forEach(card => {
            const eventId = card.dataset.id;
            const badge = document.getElementById(`status-badge-${eventId}`);
            if (!badge) return;

            // In a real app we'd need the capacity here too. 
            // For the mock, let's assume if it's in the detail page we have it.
            // Simplified for directory: just show "Registered" if user is in.
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
            }
        });
    }

    // Initialize UI
    updateAuthUI();
    updateRegistrationUI();
});
