document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References (grouped together) ---
    const totalArtistsInput = document.getElementById('total-artists');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const artistAgendaList = document.getElementById('artist-agenda-list');
    const startReviewBtn = document.getElementById('start-review-btn');
    const nextArtistBtn = document.getElementById('next-artist-btn');
    const nextShotBtn = document.getElementById('next-shot-btn'); // NEW Next Shot button
    const addArtistBtn = document.getElementById('add-artist-btn');
    const setCurrentTimeBtn = document.getElementById('set-current-time-btn');
    const pauseBtn = document.getElementById('pause-btn'); // New Pause button
    const undoBtn = document.getElementById('undo-btn'); // NEW Undo button
    const toggleShotsModeBtn = document.getElementById('toggle-shots-mode'); // NEW Toggle button

    const totalShotsDisplay = document.getElementById('total-shots-display');
    const totalTimeRemainingDisplay = document.getElementById('total-time-remaining-display');
    const totalShotsRemainingDisplay = document.getElementById('total-shots-remaining-display');
    const totalPeopleRemainingDisplay = document.getElementById('total-people-remaining-display');

    const currentArtistNameDisplay = document.getElementById('current-artist-name');
    const currentArtistTimeElapsedDisplay = document.getElementById('current-artist-time-elapsed');
    const currentArtistEstTimeRemDisplay = document.getElementById('current-artist-est-time-rem');

    // --- Toggle Flag ---
    // When true, include the active artist's shots (original behavior).
    // When false (default), exclude the active artist's shots.
    let includeActive = false;
    // Set the button's default appearance to inactive (gray)
    toggleShotsModeBtn.classList.add('inactive');

    // --- State ---
    let state = {
        artists: [],
        startTime: startTimeInput.value,  // Store start time as string HH:mm
        endTime: endTimeInput.value,      // Store end time as string HH:mm
        totalTimeAllotment: calculateTotalTimeAllotment(startTimeInput.value, endTimeInput.value), // Initial calculation
        sessionStartTime: null,
        currentArtistStartTime: null,
        currentArtistIndex: -1,
        timerInterval: null,
        totalTimeRemaining: 0,
        sessionStarted: false,
        paused: false,  // New property to control pause for artist list updates
        initialTotalShots: 0  // NEW property to capture the total shots when review starts
    };

    // This backup will store the state prior to a "Next Artist" action (only one undo is allowed)
    let undoBackup = null;

    // Sortable instance.  Needs to be accessible to multiple functions.
    let sortableInstance = null;

    // --- User Data (remains unchanged) ---
    const users = [
        { username: "nedyacet", firstName: "Nedy", lastName: "Acet" },
        { username: "pauliea", firstName: "Paulie", lastName: "Alam" },
        { username: "eanderson", firstName: "Eric", lastName: "Anderson" },
        { username: "landrus", firstName: "Lindsay", lastName: "Andrus" },
        { username: "joebackcheck", firstName: "Brendan", lastName: "Beesley" },
        { username: "mikeyb", firstName: "Michael", lastName: "Bidinger" },
        { username: "mariab", firstName: "Maria", lastName: "Bjarnadottir" },
        { username: "sequoia", firstName: "Sequoia", lastName: "Blankenship" },
        { username: "ebonifacio", firstName: "Evan", lastName: "Bonifacio" },
        { username: "earl", firstName: "Earl", lastName: "Brawley" },
        { username: "donaldbrooks", firstName: "Donald", lastName: "Brooks" },
        { username: "jimbrown", firstName: "James", lastName: "Brown" },
        { username: "hcastillo", firstName: "Heaven", lastName: "Castillo" },
        { username: "jackshaocheng", firstName: "Jack", lastName: "Cheng" },
        { username: "cchua", firstName: "Chris", lastName: "Chua" },
        { username: "chunchiu", firstName: "John Chun Chiu", lastName: "Lee" },
        { username: "coderre", firstName: "Brett", lastName: "Coderre" },
        { username: "bethdavid", firstName: "Beth", lastName: "David" },
        { username: "ydekker", firstName: "Youri", lastName: "Dekker" },
        { username: "rdenovan", firstName: "Robb", lastName: "Denovan" },
        { username: "brentd", firstName: "Brent", lastName: "Dienst" },
        { username: "adutz", firstName: "Andreas", lastName: "Dutz" },
        { username: "efazio", firstName: "Elena", lastName: "Fazio" },
        { username: "tacocat", firstName: "Robb", lastName: "Gibbs" },
        { username: "camryngray", firstName: "Camryn", lastName: "Gray" },
        { username: "jgustovich", firstName: "Jordan", lastName: "Gustovich" },
        { username: "ahatfield", firstName: "Aron", lastName: "Hatfield" },
        { username: "chaynes", firstName: "Christopher", lastName: "Haynes" },
        { username: "thsieh", firstName: "Trevor", lastName: "Hsieh" },
        { username: "dkane", firstName: "Dallas", lastName: "Kane" },
        { username: "irmak", firstName: "Irmak", lastName: "Karasinir" },
        { username: "kkim", firstName: "Ken", lastName: "Kim" },
        { username: "krause", firstName: "Shawn", lastName: "Krause" },
        { username: "krug", firstName: "Steve", lastName: "Krug" },
        { username: "bruce", firstName: "Bruce", lastName: "Kuei" },
        { username: "jlazare", firstName: "Jeremy", lastName: "Lazare" },
        { username: "wendell", firstName: "Wendell", lastName: "Lee" },
        { username: "holger", firstName: "Holger", lastName: "Leihe" },
        { username: "lluisllobera", firstName: "Lluis", lastName: "Llobera" },
        { username: "codyosaurus", firstName: "Cody", lastName: "Lyon" },
        { username: "mmajers", firstName: "Matt", lastName: "Majers" },
        { username: "amano", firstName: "Aviv", lastName: "Mano" },
        { username: "amcgriff", firstName: "Aaron", lastName: "McGriff" },
        { username: "chloemerwin", firstName: "Chloe", lastName: "Merwin" },
        { username: "jlmigita", firstName: "Jennifer", lastName: "Migita" },
        { username: "cameron", firstName: "Cameron", lastName: "Miyasaki" },
        { username: "bruna", firstName: "Bruna", lastName: "Berford" },
        { username: "shaunzye", firstName: "Sean", lastName: "Muriithi" },
        { username: "jcnavarro", firstName: "Juan Carlos", lastName: "Navarro-Carrion" },
        { username: "victor", firstName: "Victor", lastName: "Navone" },
        { username: "dnguyen", firstName: "Dan", lastName: "Nguyen" },
        { username: "eokba", firstName: "Eddy", lastName: "Okba" },
        { username: "jordi", firstName: "Jordi", lastName: "Onate Isal" },
        { username: "davidspeng", firstName: "David", lastName: "S Peng" },
        { username: "tpixton", firstName: "Tim", lastName: "Pixton" },
        { username: "bobby", firstName: "Bobby", lastName: "Podesta" },
        { username: "dpoznansky", firstName: "Deborah", lastName: "Poznansky" },
        { username: "jayson", firstName: "Jayson", lastName: "Price" },
        { username: "theresafreyes", firstName: "Theresa", lastName: "Reyes" },
        { username: "mrivera", firstName: "Mark", lastName: "Rivera" },
        { username: "arodriguez", firstName: "Adam", lastName: "Rodriguez" },
        { username: "jaime", firstName: "Jaime", lastName: "Roe" },
        { username: "montaque", firstName: "MontaQue", lastName: "Ruffin" },
        { username: "russ", firstName: "Robert", lastName: "Russ" },
        { username: "arutland", firstName: "Allison", lastName: "Rutland" },
        { username: "jryan", firstName: "Jamie", lastName: "Ryan" },
        { username: "gini", firstName: "Gini", lastName: "Santos" },
        { username: "msauls", firstName: "Mike", lastName: "Sauls" },
        { username: "sschumacher", firstName: "Stefan", lastName: "Schumacher" },
        { username: "ascott", firstName: "Anna", lastName: "Scott" },
        { username: "eserenko", firstName: "Elena", lastName: "Serenko" },
        { username: "ross", firstName: "Ross", lastName: "Stevenson" },
        { username: "mstocker", firstName: "Michael", lastName: "Stocker" },
        { username: "tstorhoff", firstName: "Teresa", lastName: "Storhoff" },
        { username: "bensu", firstName: "Benjamin", lastName: "Su" },
        { username: "rsuter", firstName: "Raphael", lastName: "Suter" },
        { username: "latanimoto", firstName: "Laura", lastName: "Aika Tanimoto" },
        { username: "rthompson", firstName: "Rob", lastName: "Thompson" },
        { username: "btower", firstName: "Becki", lastName: "Tower" },
        { username: "laclaude", firstName: "Jean-Claude", lastName: "Tran" },
        { username: "luribe", firstName: "Luis", lastName: "Uribe" },
        { username: "kristoph", firstName: "Kristophe", lastName: "Vergne" },
        { username: "thewallrus", firstName: "Nathan", lastName: "Wall" },
        { username: "rwesley", firstName: "Royce", lastName: "Wesley" },
        { username: "liv", firstName: "Olivia", lastName: "Whitaker" },
        { username: "rwight", firstName: "Ricky", lastName: "Wight" },
        { username: "awinterstein", firstName: "Alon", lastName: "Winterstein" },
        { username: "kureha", firstName: "Kureha", lastName: "Yokoo" },
        { username: "jyuster", firstName: "Jack", lastName: "Yuster" },
        { username: "tzach", firstName: "Tom", lastName: "Zach" }
    ];

    // Sort the array: first by firstName, then lastName, then username
    users.sort((a, b) => {
        if (a.firstName < b.firstName) return -1;
        if (a.firstName > b.firstName) return 1;
        if (a.lastName < b.lastName) return -1;
        if (a.lastName > b.lastName) return 1;
        if (a.username < b.username) return -1;
        if (a.username > b.username) return 1;
        return 0;
    });

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

                    // Prevent mousedown from closing lists prematurely
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
            if (e.keyCode == 40) { // Down arrow
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) { // Up arrow
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) { // Enter key
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                } else {
                    // If no suggestion is selected, use the first suggestion, or the current input
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
                        if (artist) {
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

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(Math.abs(seconds) / 60);
        const secs = Math.floor(Math.abs(seconds) % 60);
        const sign = seconds < 0 ? '-' : ''; // Handle negative times
        return sign + String(minutes).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
    }

    function calculateTotalShots() {
        return state.artists.reduce((sum, artist) => sum + parseInt(artist.shots, 10), 0);
    }

    function calculateTotalShotsRemaining() {
        return state.artists.reduce((sum, artist) =>
            artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
    }

    // Calculate total shots remaining excluding the current active artist.
    function calculateTotalShotsRemainingExcludingCurrent() {
        let total = state.artists.reduce((sum, artist) =>
            artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
        if (state.currentArtistIndex !== -1 && !state.artists[state.currentArtistIndex].completed) {
            total -= parseInt(state.artists[state.currentArtistIndex].shots, 10);
        }
        return total;
    }

    function calculateTotalPeopleRemaining() {
        let count = state.artists.reduce((sum, artist) => artist.completed ? sum : sum + 1, 0);
        if (state.currentArtistIndex !== -1 && !state.artists[state.currentArtistIndex].completed) {
            count -= 1;
        }
        return count;
    }

    // Calculate total time allotment based on start and end times
    function calculateTotalTimeAllotment(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);
        const endDate = new Date();
        endDate.setHours(endHours, endMinutes, 0, 0);

        // Check if end time is earlier than start time (crosses midnight)
        if (endDate <= startDate) {
            endDate.setDate(endDate.getDate() + 1); // Add one day to the end date
        }
        const diffInMilliseconds = endDate - startDate;
        return Math.max(0, Math.floor(diffInMilliseconds / 1000)); // Return in seconds
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
                artist.estimatedTime = "Done";
            }
        });
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
            if (index === state.currentArtistIndex && state.sessionStarted) {
                listItem.classList.add('active-artist');
            }
            if (artist.completed) {
                listItem.classList.add('completed-artist');
            }

            // --- Move Buttons Container ---
            const moveButtonsContainer = document.createElement('div');
            moveButtonsContainer.className = 'move-buttons-container';

            // --- Up Button ---
            const upBtn = document.createElement('button');
            upBtn.className = 'move-artist-btn';
            upBtn.dataset.direction = 'up';
            upBtn.dataset.artistId = artist.id;
            upBtn.tabIndex = -1; // Prevent tabbing to move buttons
            moveButtonsContainer.appendChild(upBtn);

            // --- Down Button ---
            const downBtn = document.createElement('button');
            downBtn.className = 'move-artist-btn';
            downBtn.dataset.direction = 'down';
            downBtn.dataset.artistId = artist.id;
            downBtn.tabIndex = -1; // Prevent tabbing to move buttons
            moveButtonsContainer.appendChild(downBtn);

            // --- Artist Details Div ---
            const artistDetailsDiv = document.createElement('div');
            artistDetailsDiv.className = 'artist-details';
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'artist-name-input';
            nameInput.placeholder = artist.name;
            nameInput.value = '';  // Use an empty string for the input value
            artistDetailsDiv.appendChild(nameInput);

            // --- Shots Div ---
            const shotsDiv = document.createElement('div');
            shotsDiv.className = 'shots-container'; // NEW: add a class for horizontal layout
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
            deleteBtn.tabIndex = -1; // Prevent tabbing to the delete button

            // --- Assemble List Item ---
            listItem.appendChild(moveButtonsContainer);
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
            upBtn.addEventListener('click', (event) => {
                const artistId = parseInt(event.target.dataset.artistId, 10);
                moveArtist(artistId, 'up');
            });
            downBtn.addEventListener('click', (event) => {
                const artistId = parseInt(event.target.dataset.artistId, 10);
                moveArtist(artistId, 'down');
            });

            // Combined Tab Key Handling
            function handleTab(event, inputType, currentIndex) {
                if (event.key === 'Tab' && !event.shiftKey) {
                    event.preventDefault();
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < state.artists.length) {
                        // Focus on the next input of the SAME type
                        const nextInput = artistAgendaList.children[nextIndex].querySelector(
                            inputType === 'name' ? '.artist-name-input' : '.artist-shots-input'
                        );
                        if (nextInput) {
                            nextInput.focus();
                        }
                    } else {
                        // Cycle back to the first input of the SAME type
                        const firstInput = artistAgendaList.children[0].querySelector(
                            inputType === 'name' ? '.artist-name-input' : '.artist-shots-input'
                        );
                        if (firstInput) {
                            firstInput.focus();
                        }
                    }
                }
            }
            nameInput.addEventListener('keydown', (event) => {
                handleTab(event, 'name', index);
            });
            shotsInput.addEventListener('keydown', (event) => {
                handleTab(event, 'shots', index);
            });
            // --- Add to List ---
            artistAgendaList.appendChild(listItem);

            // --- Autocomplete ---
            autocomplete(nameInput, users);
        });
    }

    function updateDisplay() {
        // Update People Remaining as before.
        const totalPeopleRemaining = calculateTotalPeopleRemaining();
        // If the session has started, use the captured initial total shots.
        if (state.sessionStarted) {
            totalShotsDisplay.textContent = state.initialTotalShots;
        } else {
            totalShotsDisplay.textContent = calculateTotalShots();
        }
        totalTimeRemainingDisplay.textContent = formatTime(state.totalTimeRemaining);
        // Use the toggle flag to decide which shots remaining value to display.
        // When includeActive is true, we use the original calculation (includes active artist).
        // When false, we exclude the active artist's shots.
        totalShotsRemainingDisplay.textContent = includeActive
            ? calculateTotalShotsRemaining()
            : calculateTotalShotsRemainingExcludingCurrent();
        totalPeopleRemainingDisplay.textContent = totalPeopleRemaining;
        calculateEstimatedTimePerArtist();
        // Only update the artist list if not paused
        if (!state.paused) {
            renderArtistList();
        }
        if (state.currentArtistIndex !== -1) {
            const currentArtist = state.artists[state.currentArtistIndex];
            currentArtistNameDisplay.textContent = currentArtist.name + " (" + currentArtist.shots + ")";
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
        // --- Update Next Shot Button ---
        // Disable if no active artist, if artist is completed,
        // or if the current artist has 1 or fewer shots left.
        if (state.currentArtistIndex === -1 ||
            state.artists[state.currentArtistIndex].completed ||
            state.artists[state.currentArtistIndex].shots <= 1) {
            nextShotBtn.disabled = true;
        } else {
            nextShotBtn.disabled = false;
        }
        updateSortableDraggability();
        totalArtistsInput.disabled = state.sessionStarted;
    }

    // --- Toggle Button Event Listener ---
    toggleShotsModeBtn.addEventListener('click', () => {
        includeActive = !includeActive;
        // When includeActive is true, button appears active (green);
        // when false, it appears inactive (gray).
        if (includeActive) {
            toggleShotsModeBtn.classList.remove('inactive');
        } else {
            toggleShotsModeBtn.classList.add('inactive');
        }
        updateDisplay();
    });

    // --- Pause Button Event Listener ---
    pauseBtn.addEventListener('click', () => {
        state.paused = !state.paused;
        pauseBtn.textContent = state.paused ? "Resume" : "Edit Artists";
        // Change color based on paused state:
        // When paused, use orange; otherwise, revert to gray.
        pauseBtn.style.backgroundColor = state.paused ? "#dbac47" : "#bdc3c7";
        if (!state.paused) {
            updateDisplay();
        }
    });

    function initializeArtists() {
        const numArtists = parseInt(totalArtistsInput.value, 10);
        state.artists = Array.from({ length: numArtists }, (_, i) => ({
            id: Date.now() + i,
            name: `Artist ${i + 1}`,
            shots: 1,
            estimatedTime: "00:00",
            completed: false
        }));
        // Calculate total time allotment and update state
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
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
        // Update the start time to current time automatically
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        startTimeInput.value = `${hours}:${minutes}`;
        state.startTime = startTimeInput.value;
        // Recalculate total time allotment with the updated start time
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
        state.totalTimeRemaining = state.totalTimeAllotment;
        
        // Capture the initial total shots at review start.
        state.initialTotalShots = calculateTotalShots();
        state.sessionStarted = true;
        state.currentArtistIndex = 0;
        startSessionTimer();
        startCurrentArtistTimer();
        nextArtistBtn.disabled = false;
        updateDisplay();
        startReviewBtn.disabled = true;
        startReviewBtn.style.cursor = "default";

        // Update Sortable draggability
        updateSortableDraggability();
    }

    function nextArtist() {
        // Store backup for undo (overwrite any previous backup)
        undoBackup = {
            previousIndex: state.currentArtistIndex
        };
        undoBtn.disabled = false;

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

    // --- Undo Button Event Listener ---
    undoBtn.addEventListener('click', () => {
        if (!undoBackup) return;
        // Stop the current artist timer if running
        stopCurrentArtistTimer();
        // Revert the currentArtistIndex to the previous value stored in backup
        state.currentArtistIndex = undoBackup.previousIndex;
        // Mark the artist as not completed
        if (state.currentArtistIndex !== -1) {
            state.artists[state.currentArtistIndex].completed = false;
            startCurrentArtistTimer();
        }
        // Ensure the session remains active and the next artist button is enabled
        state.sessionStarted = true;
        nextArtistBtn.disabled = false;
        // Clear the backup and disable the undo button
        undoBackup = null;
        undoBtn.disabled = true;
        updateDisplay();
    });

    // --- Modified Next Shot Button Functionality ---
    nextShotBtn.addEventListener('click', () => {
        if (state.currentArtistIndex === -1) return;
        const currentArtist = state.artists[state.currentArtistIndex];
        if (currentArtist.completed || currentArtist.shots <= 1) return;
        currentArtist.shots -= 1;
        updateDisplay();
    });

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
        if (artistIndexToDelete === state.currentArtistIndex) {
            stopCurrentArtistTimer();
        }
        if (state.currentArtistIndex > artistIndexToDelete) {
            state.currentArtistIndex--;
        } else if (state.currentArtistIndex === artistIndexToDelete) {
            if (state.artists.length > 1 && state.currentArtistIndex < state.artists.length - 1) {
                startCurrentArtistTimer();
            } else {
                state.currentArtistIndex = -1;
                if (state.sessionStarted) {
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

    // Move Artist Function
    function moveArtist(artistId, direction) {
        const currentIndex = state.artists.findIndex(artist => artist.id === artistId);
        if (currentIndex === -1) return;
        let newIndex;
        if (direction === 'up') {
            newIndex = Math.max(0, currentIndex - 1);
        } else if (direction === 'down') {
            newIndex = Math.min(state.artists.length - 1, currentIndex + 1);
        } else {
            return;
        }

        if (newIndex === currentIndex) return; // No move needed

        // Prevent moving above current artist during session
        if (state.sessionStarted && state.currentArtistIndex !== -1) {
            if (direction === 'up' && newIndex <= state.currentArtistIndex) {
                // Attempt to move to a position *before or at* the current.
                return; // Prevent the change.
            }
        }

        // Move the artist in the array
        const [movedArtist] = state.artists.splice(currentIndex, 1);
        state.artists.splice(newIndex, 0, movedArtist);

        // Update currentArtistIndex if necessary
        if (state.currentArtistIndex === currentIndex) {
            state.currentArtistIndex = newIndex;
        } else if (state.currentArtistIndex === newIndex) {
            state.currentArtistIndex = currentIndex;
        } else if (currentIndex < state.currentArtistIndex && newIndex >= state.currentArtistIndex) {
            state.currentArtistIndex--;
        } else if (currentIndex > state.currentArtistIndex && newIndex <= state.currentArtistIndex) {
            state.currentArtistIndex++;
        }
        renderArtistList();
        updateDisplay();
    }

    // Update Sortable Draggability
    function updateSortableDraggability() {
        if (sortableInstance) {
            if (state.sessionStarted && state.currentArtistIndex !== -1) {
                sortableInstance.option('group', {
                    name: 'artists',
                    pull: true,
                    put: (to) => {
                        // Prevent putting before the current artist.
                        return to.el.children.length <= state.currentArtistIndex;
                    }
                });
                // Loop through to set individual draggability
                for (let i = 0; i < artistAgendaList.children.length; i++){
                    const listItem = artistAgendaList.children[i];
                    if (i <= state.currentArtistIndex) {
                        sortableInstance.option('draggable', '.disabled-sortable');
                    } else {
                        sortableInstance.option('draggable', 'li');
                    }
                }
            } else {
                // If session not started, allow all dragging.
                sortableInstance.option('group', { name: 'artists', pull: true, put: true });
                sortableInstance.option('draggable', 'li');
            }
        }
    }

    // --- Event Listeners ---
    totalArtistsInput.addEventListener('change', initializeArtists);
    startTimeInput.addEventListener('change', () => {
        state.startTime = startTimeInput.value;
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
        state.totalTimeRemaining = state.totalTimeAllotment;
        updateDisplay();
    });
    endTimeInput.addEventListener('change', () => {
        state.endTime = endTimeInput.value;
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
        state.totalTimeRemaining = state.totalTimeAllotment;
        updateDisplay();
    });

    // Event listener for the "Set Current Time" button
    setCurrentTimeBtn.addEventListener('click', () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        startTimeInput.value = currentTime;
        state.startTime = currentTime;
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
        state.totalTimeRemaining = state.totalTimeAllotment;
        updateDisplay();
    });
    startReviewBtn.addEventListener('click', startReviewSession);
    nextArtistBtn.addEventListener('click', nextArtist);
    addArtistBtn.addEventListener('click', addArtist);

    // Initialize Sortable
    sortableInstance = Sortable.create(artistAgendaList, {
        draggable: 'li', // Default to all list items being draggable.
        group: {
            name: 'artists',
            pull: true,
            put: true,
        },
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
});
