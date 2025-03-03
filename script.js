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
    const currentArtistShotsDisplay = document.getElementById('current-artist-shots'); // Keep reference, but we won't use its textContent
    const currentArtistTimeElapsedDisplay = document.getElementById('current-artist-time-elapsed');
    const currentArtistEstTimeRemDisplay = document.getElementById('current-artist-est-time-rem');

    let state = {
        artists: [],
        totalTimeAllotment: parseInt(totalTimeInput.value, 10) * 60, // in seconds
        sessionStartTime: null,
        currentArtistStartTime: null,
        currentArtistIndex: -1,
        timerInterval: null,
        totalTimeRemaining: 0, // Initialize totalTimeRemaining
        sessionStarted: false, // Add sessionStarted to track the state
    };

    // --- Utility Functions ---
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
        renderArtistList(); // Re-render the artist list to update estimated times

        if (state.currentArtistIndex !== -1) {
            const currentArtist = state.artists[state.currentArtistIndex];
            //  Display name and shots in parentheses
            currentArtistNameDisplay.textContent = `${currentArtist.name} (${currentArtist.shots})`;
            // currentArtistShotsDisplay.textContent = currentArtist.shots;  // NO LONGER SETTING TEXT CONTENT
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
            // currentArtistShotsDisplay.textContent = ''; // NO LONGER SETTING TEXT CONTENT
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
        artistAgendaList.innerHTML = ''; // Clear the list
        state.artists.forEach((artist, index) => {
            const listItem = document.createElement('li');
            listItem.dataset.id = artist.id; // For tracking and reordering

            if (index === state.currentArtistIndex && state.sessionStartTime) {
                listItem.classList.add('active-artist');
            }
            if (artist.completed) {
                listItem.classList.add('completed-artist');
            }

            listItem.innerHTML = `
            <div class="artist-details">
                <input type="text" class="artist-name-input" value="${artist.name}" placeholder="Artist Name">
            </div>
            <div>
                <label>Shots:</label>
                <input type="number" class="artist-shots-input" value="${artist.shots}" min="1">
            </div>
            <span class="estimated-time ${artist.estimatedTime.startsWith('-') ? 'negative-time' : ''}">${artist.estimatedTime}</span>
            <button class="delete-artist-btn">Delete</button>
            `;

            // Event listener for shots input change
            const shotsInput = listItem.querySelector('.artist-shots-input');
            shotsInput.addEventListener('change', (event) => {
                artist.shots = parseInt(event.target.value, 10);
                if (isNaN(artist.shots) || artist.shots < 1) {
                    artist.shots = 1;
                    shotsInput.value = 1;
                }
                calculateEstimatedTimePerArtist();
                updateDisplay();
            });

            // Event listener for artist name input change
            const nameInput = listItem.querySelector('.artist-name-input');
            nameInput.addEventListener('change', (event) => {
                artist.name = event.target.value;
                updateDisplay(); // Re-render to update the name if needed in other displays
            });

            // Event listener for delete button
            const deleteBtn = listItem.querySelector('.delete-artist-btn');
            deleteBtn.addEventListener('click', () => {
                deleteArtist(artist.id);
            });


            artistAgendaList.appendChild(listItem);
        });
    }


    function initializeArtists() {
        const numArtists = parseInt(totalArtistsInput.value, 10);
        state.artists = Array.from({ length: numArtists }, (_, i) => ({
            id: Date.now() + i, // Simple unique ID
            name: `Artist ${i + 1}`,
            shots: 1,
            estimatedTime: "00:00",
            completed: false
        }));
        state.totalTimeRemaining = state.totalTimeAllotment; //init total time remaining.
        renderArtistList();
        updateDisplay();
    }


    function startSessionTimer() {
        state.sessionStartTime = Date.now();
        state.timerInterval = setInterval(() => {
            //Correctly calculate the elapsed time.
            const elapsedSeconds = Math.floor((Date.now() - state.sessionStartTime) / 1000);
            state.totalTimeRemaining = Math.max(0, state.totalTimeAllotment - elapsedSeconds);
            updateDisplay();
            if (state.totalTimeRemaining <= 0) {
                clearInterval(state.timerInterval);
                state.timerInterval = null;
                alert("Session Time is up!");
            }
        }, 1000);
    }

    function startCurrentArtistTimer() {
        state.currentArtistStartTime = Date.now();
        state.currentArtistTimerInterval = setInterval(() => {
            updateDisplay(); //Update will handle current artist elapsed time
        }, 1000);
    }

    function stopCurrentArtistTimer() {
        if (state.currentArtistTimerInterval) {
            clearInterval(state.currentArtistTimerInterval);
            state.currentArtistTimerInterval = null;
        }
    }


    function startReviewSession() {
        if (state.artists.length === 0) return;
        // Check if the session has already started
        if (state.sessionStarted) return;

        state.sessionStarted = true;
        state.currentArtistIndex = 0;
        state.totalTimeRemaining = state.totalTimeAllotment; //Initialize at the start

        startSessionTimer();
        startCurrentArtistTimer();
        nextArtistBtn.disabled = false;
        updateDisplay();

        // Disable the Start Review button
        startReviewBtn.disabled = true;
        // startReviewBtn.style.backgroundColor = "grey"; // Optional: visually grey it out REMOVED
        startReviewBtn.style.cursor = "default";    // Optional: change cursor
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
            state.currentArtistIndex = -1; // No current artist
            state.sessionStarted = false;
            nextArtistBtn.disabled = true;
            clearInterval(state.timerInterval); // Stop total session timer as well, if not already stopped.
            state.timerInterval = null;
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

        //Check if we're deleting the current artist
        if(artistIndexToDelete === state.currentArtistIndex){
            stopCurrentArtistTimer(); //Stop their timer
        }

        // Adjust currentArtistIndex if deleting an artist before or at the current artist
        if (state.currentArtistIndex > artistIndexToDelete) {
            state.currentArtistIndex--; // Move to the previous artist if possible
        } else if(state.currentArtistIndex === artistIndexToDelete) {
            //If current artist is being deleted, and there are more artists after, move forward
            if (state.artists.length > 1 && state.currentArtistIndex < state.artists.length -1) {
                //Dont change index, just restart timer for next artist.
                startCurrentArtistTimer();
            } else {
                //Session is over if this was the last artist, or there were no other artists.
                state.currentArtistIndex = -1;
                if(state.sessionStarted) { //If session was running, end it.
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
        state.totalTimeAllotment += timeToAddMinutes * 60; // Increase total time.
        //Crucially, adjust the remaining time, not just the allotment
        state.totalTimeRemaining += timeToAddMinutes * 60;


        if (!state.sessionStartTime) { //If session hasn't started, we don't need to adjust start time.
            state.sessionStartTime = Date.now(); //Start it.
            startSessionTimer(); //Start timer.
        }

        updateDisplay();
    }


    // --- Event Listeners ---
    totalArtistsInput.addEventListener('change', initializeArtists);
    totalTimeInput.addEventListener('change', () => {
        state.totalTimeAllotment = parseInt(totalTimeInput.value, 10) * 60;
        state.totalTimeRemaining = state.totalTimeAllotment; //Update remaining time
        updateDisplay();
    });
    startReviewBtn.addEventListener('click', startReviewSession);
    nextArtistBtn.addEventListener('click', nextArtist);
    addArtistBtn.addEventListener('click', addArtist);
    addTimeBtn.addEventListener('click', addSessionTime);


    // --- Drag and Drop Setup ---
    Sortable.create(artistAgendaList, {
        draggable: 'li',
        onUpdate: function (evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            if (oldIndex !== newIndex) {
                const movedArtist = state.artists[oldIndex];
                state.artists.splice(oldIndex, 1); // Remove from old position
                state.artists.splice(newIndex, 0, movedArtist); // Insert at new position

                if (state.currentArtistIndex === oldIndex) {
                    state.currentArtistIndex = newIndex; // Update current artist index if it was moved
                } else if (state.currentArtistIndex > oldIndex && state.currentArtistIndex <= newIndex) {
                    state.currentArtistIndex--; // Adjust index if moved artist was before current and moved after current
                } else if (state.currentArtistIndex < oldIndex && state.currentArtistIndex >= newIndex) {
                    state.currentArtistIndex++; // Adjust index if moved artist was after current and moved before current
                }
                renderArtistList(); // Re-render to reflect order change in UI
                updateDisplay(); // Recalculate and update times based on new order
            }
        },
        // onRemove is NO LONGER NEEDED.  We handle deletion with the button.
    });


    // --- Initialization ---
    initializeArtists();
    updateDisplay();
});