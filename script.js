document.addEventListener('DOMContentLoaded', () => {
    const totalArtistsInput = document.getElementById('total-artists');
    const totalTimeInput = document.getElementById('total-time');
    const artistAgendaList = document.getElementById('artist-agenda-list');
    const startReviewBtn = document.getElementById('start-review-btn');
    const nextArtistBtn = document.getElementById('next-artist-btn');
    const addArtistBtn = document.getElementById('add-artist-btn');
    const addTimeBtn = document.getElementById('add-time-btn');
    const addTimeInput = document.getElementById('add-time-input');

    const totalShotsDisplay = document.getElementById('total-shots-display');
    const totalTimeRemainingDisplay = document.getElementById('total-time-remaining-display');
    const totalShotsRemainingDisplay = document.getElementById('total-shots-remaining-display');
    const totalPeopleRemainingDisplay = document.getElementById('total-people-remaining-display');

    const currentArtistNameDisplay = document.getElementById('current-artist-name');
    const currentArtistTimeElapsedDisplay = document.getElementById('current-artist-time-elapsed');
    const currentArtistEstTimeRemDisplay = document.getElementById('current-artist-est-time-rem');

    let state = {
        artists: [],
        totalTimeAllotment: parseInt(totalTimeInput.value, 10) * 60,
        sessionStartTime: null,
        currentArtistStartTime: null,
        currentArtistIndex: -1,
        timerInterval: null,
        totalTimeRemaining: 0,
        sessionStarted: false,
    };

    const users = [
        { username: "msauls", firstName: "Mike", lastName: "Sauls" },
        { username: "sdoe", firstName: "Steve", lastName: "Doe" },
        { username: "bsagget", firstName: "Bob", lastName: "Sagget" },
        { username: "psauls", firstName: "Penny", lastName: "Sauls" }
    ];

    // --- Autocomplete Function ---
    function autocomplete(inp, arr) {
        let currentFocus;

        inp.addEventListener("input", function(e) {
            const val = this.value;
            closeAllLists();
            if (!val) { return false; }
            currentFocus = -1;

            const a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.insertAdjacentElement('afterend', a);

            for (let i = 0; i < arr.length; i++) {
                const user = arr[i];
                const firstNameMatch = user.firstName.toLowerCase().includes(val.toLowerCase());
                const lastNameMatch = user.lastName.toLowerCase().includes(val.toLowerCase());
                const usernameMatch = user.username.toLowerCase().startsWith(val.toLowerCase());

                if (firstNameMatch || lastNameMatch || usernameMatch) {
                    const b = document.createElement("DIV");
                    b.innerHTML = user.username;
                    b.innerHTML += "<input type='hidden' value='" + user.username + "'>";
                    b.style.width = "100%";
                    b.style.height = "auto";
                    b.style.display = "block";

                    b.addEventListener("click", function(e) {
                        inp.value = this.getElementsByTagName("input")[0].value;

                        const artistId = parseInt(inp.closest('li').dataset.id, 10);
                        const artist = state.artists.find(a => a.id === artistId);
                        if (artist) {
                            artist.name = inp.value;
                            updateDisplay();
                        }
                        closeAllLists();
                    });

                    // --- Prevent mousedown from closing lists prematurely ---
                    b.addEventListener("mousedown", function(e) {
                        e.stopPropagation();
                    });

                    a.appendChild(b);
                }
            }
        });

        inp.addEventListener("keydown", function(e) {
            let x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) {
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) {
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) {
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                } else {
                    let firstSuggestion = x && x[0] ? x[0].getElementsByTagName("input")[0].value : null;
                    if (firstSuggestion) {
                        inp.value = firstSuggestion;
                        const artistId = parseInt(inp.closest('li').dataset.id, 10);
                        const artist = state.artists.find(a => a.id === artistId);
                        if (artist) {
                            artist.name = inp.value;
                            updateDisplay();
                        }
                    } else {
                        const artistId = parseInt(inp.closest('li').dataset.id, 10);
                        const artist = state.artists.find(a => a.id === artistId);
                        if(artist){
                            artist.name = inp.value;
                            updateDisplay();
                        }
                    }
                    closeAllLists();
                }
            }
        });

        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("autocomplete-active");
        }

        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
    }

    function closeAllLists(elmnt) {
        const x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != document.activeElement) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

    function formatTime(seconds) {
        const minutes = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.floor(Math.abs(seconds) % 60);
        const sign = seconds < 0 ? '-' : '';
        return sign + String(minutes).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
    }

    function calculateTotalShots() {
        return state.artists.reduce((sum, artist) => sum + parseInt(artist.shots, 10), 0);
    }

    function calculateTotalShotsRemaining() {
        return state.artists.reduce((sum, artist) => artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
    }

    function calculateTotalPeopleRemaining() {
        return state.artists.reduce((sum, artist) => artist.completed ? sum : sum + 1, 0);
    }

    function calculateEstimatedTimePerArtist() {
        const totalRemainingShots = calculateTotalShotsRemaining();
        const remainingArtistsCount = state.artists.filter(artist => !artist.completed).length;

        if (totalRemainingShots === 0 || remainingArtistsCount === 0 || state.totalTimeRemaining <= 0) {
            state.artists.forEach(artist => artist.estimatedTime = "00:00");
            return;
        }

        const remainingTimePerShot = state.totalTimeRemaining / totalRemainingShots;

        state.artists.forEach(artist => {
            if (!artist.completed) {
                const estimatedSeconds = remainingTimePerShot * parseInt(artist.shots, 10);
                artist.estimatedTime = formatTime(estimatedSeconds);
            } else {
                artist.estimatedTime = "Completed";
            }
        });
    }

function updateDisplay() {
    const totalShots = calculateTotalShots();
    const totalShotsRemaining = calculateTotalShotsRemaining();
    const totalPeopleRemaining = calculateTotalPeopleRemaining();

    totalShotsDisplay.textContent = totalShots;
    totalTimeRemainingDisplay.textContent = formatTime(state.totalTimeRemaining);
    totalShotsRemainingDisplay.textContent = totalShotsRemaining;
    totalPeopleRemainingDisplay.textContent = totalPeopleRemaining;

    calculateEstimatedTimePerArtist();
    renderArtistList();

    if (state.currentArtistIndex !== -1) {
        const currentArtist = state.artists[state.currentArtistIndex];
        currentArtistNameDisplay.textContent = `${currentArtist.name} (${currentArtist.shots})`; // CORRECTED LINE
        const elapsedTime = Math.floor((Date.now() - state.currentArtistStartTime) / 1000);
        currentArtistTimeElapsedDisplay.textContent = formatTime(elapsedTime);

        const estimatedTimeInSeconds = timeToSeconds(currentArtist.estimatedTime);
        const remainingEstTimeForCurrent = estimatedTimeInSeconds - elapsedTime;
        currentArtistEstTimeRemDisplay.textContent = formatTime(remainingEstTimeForCurrent);
        if (remainingEstTimeForCurrent < 0) {
            currentArtistEstTimeRemDisplay.classList.add('negative-time');
        } else {
            currentArtistEstTimeRemDisplay.classList.remove('negative-time');
        }
    } else {
        currentArtistNameDisplay.textContent = '';
        currentArtistTimeElapsedDisplay.textContent = '00:00';
        currentArtistEstTimeRemDisplay.textContent = '00:00';
    }
}

    function timeToSeconds(timeStr) {
        if (timeStr === "Completed") return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    function renderArtistList() {
        artistAgendaList.innerHTML = ''; // Clear existing content

        state.artists.forEach((artist, index) => {
            const listItem = document.createElement('li');
            listItem.dataset.id = artist.id;

            if (index === state.currentArtistIndex && state.sessionStartTime) {
                listItem.classList.add('active-artist');
            }
            if (artist.completed) {
                listItem.classList.add('completed-artist');
            }

            // --- Artist Details Div ---
            const artistDetailsDiv = document.createElement('div');
            artistDetailsDiv.className = 'artist-details';

            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'artist-name-input';
            nameInput.value = artist.name;
            nameInput.placeholder = 'Artist Name';
            artistDetailsDiv.appendChild(nameInput);

            // --- Shots Div ---
            const shotsDiv = document.createElement('div');

            const shotsLabel = document.createElement('label');
            shotsLabel.textContent = 'Shots:';
            shotsDiv.appendChild(shotsLabel);

            const shotsInput = document.createElement('input');
            shotsInput.type = 'number';
            shotsInput.className = 'artist-shots-input';
            shotsInput.value = artist.shots;
            shotsInput.min = '1';
            shotsDiv.appendChild(shotsInput);

            // --- Estimated Time Span ---
            const estimatedTimeSpan = document.createElement('span');
            estimatedTimeSpan.className = `estimated-time ${artist.estimatedTime.startsWith('-') ? 'negative-time' : ''}`;
            estimatedTimeSpan.textContent = artist.estimatedTime;

            // --- Delete Button ---
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-artist-btn';
            deleteBtn.textContent = 'Delete';

            // --- Assemble List Item ---
            listItem.appendChild(artistDetailsDiv);
            listItem.appendChild(shotsDiv);
            listItem.appendChild(estimatedTimeSpan);
            listItem.appendChild(deleteBtn);

            // --- Event Listeners ---
            shotsInput.addEventListener('change', (event) => {
                artist.shots = parseInt(event.target.value, 10);
                if (isNaN(artist.shots) || artist.shots < 1) {
                    artist.shots = 1;
                    shotsInput.value = 1;
                }
                calculateEstimatedTimePerArtist();
                updateDisplay();
            });

            nameInput.addEventListener('change', (event) => {
                artist.name = event.target.value;
                updateDisplay();
            });

            deleteBtn.addEventListener('click', () => {
                deleteArtist(artist.id);
            });

            // --- Add to List ---
            artistAgendaList.appendChild(listItem);

            // --- Autocomplete ---
            autocomplete(nameInput, users);
        });
    }

    function initializeArtists() {
        const numArtists = parseInt(totalArtistsInput.value, 10);
        state.artists = Array.from({ length: numArtists }, (_, i) => ({
            id: Date.now() + i,
            name: `Artist ${i + 1}`,
            shots: 1,
            estimatedTime: "00:00",
            completed: false
        }));
        state.totalTimeRemaining = state.totalTimeAllotment;
        renderArtistList();
        updateDisplay();
    }

    function startSessionTimer() {
        state.sessionStartTime = Date.now();
        state.timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - state.sessionStartTime) / 1000);
            state.totalTimeRemaining = Math.max(0, state.totalTimeAllotment - elapsedSeconds);
            updateDisplay();
            if (state.totalTimeRemaining <= 0) {
                clearInterval(state.timerInterval);
                alert("Session Time is up!");
            }
        }, 1000);
    }

    function startCurrentArtistTimer() {
        state.currentArtistStartTime = Date.now();
        state.currentArtistTimerInterval = setInterval(() => {
            updateDisplay();
        }, 1000);
    }

    function stopCurrentArtistTimer() {
        if (state.currentArtistTimerInterval) {
            clearInterval(state.currentArtistTimerInterval);
            state.currentArtistTimerInterval = null;
        }
    }

    function startReviewSession() {
        if (state.artists.length === 0 || state.sessionStarted) return;

        state.sessionStarted = true;
        state.currentArtistIndex = 0;
        state.totalTimeRemaining = state.totalTimeAllotment;

        startSessionTimer();
        startCurrentArtistTimer();
        nextArtistBtn.disabled = false;
        updateDisplay();

        startReviewBtn.disabled = true;
        startReviewBtn.style.cursor = "default";
    }

    function nextArtist() {
        if (state.currentArtistIndex !== -1) {
            state.artists[state.currentArtistIndex].completed = true;
            stopCurrentArtistTimer();
        }

        state.currentArtistIndex++;

        if (state.currentArtistIndex < state.artists.length) {
            startCurrentArtistTimer();
        } else {
            state.currentArtistIndex = -1;
            state.sessionStarted = false;
            nextArtistBtn.disabled = true;
            clearInterval(state.timerInterval);
            alert("Review session completed for all artists!");
        }
        updateDisplay();
    }

    function addArtist() {
        const newArtist = {
            id: Date.now(),
            name: `Artist ${state.artists.length + 1}`,
            shots: 1,
            estimatedTime: "00:00",
            completed: false
        };
        state.artists.push(newArtist);
        renderArtistList();
        updateDisplay();
    }

    function deleteArtist(artistId) {
        const artistIndexToDelete = state.artists.findIndex(artist => artist.id === artistId);
        if (artistIndexToDelete === -1) return;

        if(artistIndexToDelete === state.currentArtistIndex){
            stopCurrentArtistTimer();
        }

        if (state.currentArtistIndex > artistIndexToDelete) {
            state.currentArtistIndex--;
        } else if(state.currentArtistIndex === artistIndexToDelete) {
            if (state.artists.length > 1 && state.currentArtistIndex < state.artists.length -1) {
                startCurrentArtistTimer();
            } else {
                state.currentArtistIndex = -1;
                if(state.sessionStarted) {
                    clearInterval(state.timerInterval);
                    state.timerInterval = null;
                    state.sessionStarted = false;
                    nextArtistBtn.disabled = true;
                    alert("Review session completed after deleting last artist!");
                }
            }
        }
        state.artists.splice(artistIndexToDelete, 1);
        renderArtistList();
        updateDisplay();
    }

    function addSessionTime() {
        const timeToAddMinutes = parseInt(addTimeInput.value, 10);
        if (isNaN(timeToAddMinutes) || timeToAddMinutes < 1) {
            alert("Please enter a valid time to add.");
            return;
        }
        state.totalTimeAllotment += timeToAddMinutes * 60;
        state.totalTimeRemaining += timeToAddMinutes * 60;

        if (!state.sessionStartTime) {
            state.sessionStartTime = Date.now();
            startSessionTimer();
        }
        updateDisplay();
    }

    totalArtistsInput.addEventListener('change', initializeArtists);
    totalTimeInput.addEventListener('change', () => {
        state.totalTimeAllotment = parseInt(totalTimeInput.value, 10) * 60;
        state.totalTimeRemaining = state.totalTimeAllotment;
        updateDisplay();
    });
    startReviewBtn.addEventListener('click', startReviewSession);
    nextArtistBtn.addEventListener('click', nextArtist);
    addArtistBtn.addEventListener('click', addArtist);
    addTimeBtn.addEventListener('click', addSessionTime);

    Sortable.create(artistAgendaList, {
        draggable: 'li',
        onUpdate: function (evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            if (oldIndex !== newIndex) {
                const movedArtist = state.artists[oldIndex];
                state.artists.splice(oldIndex, 1);
                state.artists.splice(newIndex, 0, movedArtist);

                if (state.currentArtistIndex === oldIndex) {
                    state.currentArtistIndex = newIndex;
                } else if (state.currentArtistIndex > oldIndex && state.currentArtistIndex <= newIndex) {
                    state.currentArtistIndex--;
                } else if (state.currentArtistIndex < oldIndex && state.currentArtistIndex >= newIndex) {
                    state.currentArtistIndex++;
                }
                renderArtistList();
                updateDisplay();
            }
        },
    });

    initializeArtists();
    updateDisplay();
}); //End of DOMContentLoaded