document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References (grouped together) ---
    const totalArtistsInput = document.getElementById('total-artists');
    const startTimeInput = document.getElementById('start-time');
    const endTimeInput = document.getElementById('end-time');
    const artistAgendaList = document.getElementById('artist-agenda-list');
    const startReviewBtn = document.getElementById('start-review-btn');
    const nextArtistBtn = document.getElementById('next-artist-btn');
    const nextShotBtn = document.getElementById('next-shot-btn'); // Next Shot button
    const addArtistBtn = document.getElementById('add-artist-btn');
    const setCurrentTimeBtn = document.getElementById('set-current-time-btn');
    const pauseBtn = document.getElementById('pause-btn'); // Pause button
    const undoBtn = document.getElementById('undo-btn'); // Undo button
    const toggleShotsModeBtn = document.getElementById('toggle-shots-mode'); // Shots mode toggle button

    // New Simplified Section DOM Elements
    const simpleCurrentArtistDisplay = document.getElementById('simple-current-artist');
    const simpleCurrentTimeElapsedDisplay = document.getElementById('simple-current-time-elapsed');
    const simpleCurrentTimeRemainingDisplay = document.getElementById('simple-current-time-remaining');
    const simpleTotalTimeRemainingDisplay = document.getElementById('simple-total-time-remaining');
    const simplePeopleRemainingDisplay = document.getElementById('simple-people-remaining');
    const simpleShotsRemainingDisplay = document.getElementById('simple-shots-remaining');
    const simpleToggleShotsModeBtn = document.getElementById('simple-toggle-shots-mode');
    const simpleNextShotBtn = document.getElementById('simple-next-shot-btn');
    const simpleNextArtistBtn = document.getElementById('simple-next-artist-btn');
    const simpleUndoBtn = document.getElementById('simple-undo-btn');

    // Reference for the new Time Permitting toggle button in the agenda setup
    const timePermittingToggle = document.getElementById('time-permitting-toggle');

    const totalShotsDisplay = document.getElementById('total-shots-display');
    const totalTimeRemainingDisplay = document.getElementById('total-time-remaining-display');
    const totalShotsRemainingDisplay = document.getElementById('total-shots-remaining-display');
    const totalPeopleRemainingDisplay = document.getElementById('total-people-remaining-display');

    const currentArtistNameDisplay = document.getElementById('current-artist-name');
    const currentArtistTimeElapsedDisplay = document.getElementById('current-artist-time-elapsed');
    const currentArtistEstTimeRemDisplay = document.getElementById('current-artist-est-time-rem');

    // Time Permitting section elements (if available)
    const tpCurrentArtistNameDisplay = document.getElementById('tp-current-artist-name');
    const tpCurrentArtistTimeElapsedDisplay = document.getElementById('tp-current-artist-time-elapsed');
    const tpCurrentArtistEstTimeRemDisplay = document.getElementById('tp-current-artist-est-time-rem');
    const tpTotalShotsDisplay = document.getElementById('tp-total-shots-display');
    const tpTotalTimeRemainingDisplay = document.getElementById('tp-total-time-remaining-display');
    const tpTotalPeopleRemainingDisplay = document.getElementById('tp-total-people-remaining-display');
    const tpTotalShotsRemainingDisplay = document.getElementById('tp-total-shots-remaining-display');

    // --- Toggle Flag ---
    // When true, include the active artist's shots (original behavior).
    // When false (default), exclude the active artist's shots.
    let includeActive = false;
    toggleShotsModeBtn.classList.add('inactive');

    // --- State ---
    let state = {
        artists: [],
        startTime: startTimeInput.value,  // HH:mm string
        endTime: endTimeInput.value,        // HH:mm string
        totalTimeAllotment: calculateTotalTimeAllotment(startTimeInput.value, endTimeInput.value),
        sessionStartTime: null,
        currentArtistStartTime: null,
        currentArtistIndex: -1,
        timerInterval: null,
        totalTimeRemaining: 0,
        sessionStarted: false,
        paused: false,  
        initialTotalShots: 0,  
        timePermittingIndex: 0, // index at which the divider is placed when enabled
        timePermittingEnabled: false // default is disabled
    };

	// Pause while drag & dropping
	let isDragging = false;

    // Backup for undo (one step)
    let undoBackup = null;

    // Sortable instance for artist list
    let sortableInstance = null;

    // --- Event Listeners for Simplified Section Buttons ---
    simpleNextShotBtn.addEventListener('click', () => {
        nextShotBtn.click();
    });
    simpleNextArtistBtn.addEventListener('click', () => {
        nextArtistBtn.click();
    });
    simpleUndoBtn.addEventListener('click', () => {
        undoBtn.click();
    });
    simpleToggleShotsModeBtn.addEventListener('click', () => {
        toggleShotsModeBtn.click();
    });

    // --- User Data ---
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

    // Sort users by firstName, then lastName, then username.
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

    // Format seconds as MM:SS
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
        return state.artists.reduce((sum, artist) =>
            artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
    }

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

    function calculateTotalTimeAllotment(startTime, endTime) {
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(startHours, startMinutes, 0, 0);
        const endDate = new Date();
        endDate.setHours(endHours, endMinutes, 0, 0);
        if (endDate <= startDate) {
            endDate.setDate(endDate.getDate() + 1);
        }
        const diffInMilliseconds = endDate - startDate;
        return Math.floor(diffInMilliseconds / 1000);
    }

    // Only update estimated times for non-active artists.
    function calculateEstimatedTimePerArtist() {
        const prioritizedArtists = state.timePermittingEnabled 
            ? state.artists.slice(0, state.timePermittingIndex) 
            : state.artists;
        const totalRemainingShots = prioritizedArtists.reduce((sum, artist) =>
            artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
        if (totalRemainingShots === 0 || state.totalTimeRemaining === 0) {
            prioritizedArtists.forEach(artist => {
                if (!artist.completed) {
                    artist.estimatedTime = "00:00";
                }
            });
        } else {
            const remainingTimePerShot = state.totalTimeRemaining / totalRemainingShots;
            prioritizedArtists.forEach(artist => {
                if (artist.completed) {
                    artist.estimatedTime = "Done";
                } else {
                    if (state.currentArtistIndex !== -1 && state.artists[state.currentArtistIndex].id === artist.id) {
                        // Leave the estimatedTime unchanged for the active artist.
                    } else {
                        artist.estimatedTime = formatTime(remainingTimePerShot * parseInt(artist.shots, 10));
                    }
                }
            });
        }
        const nonPrioritizedArtists = state.timePermittingEnabled 
            ? state.artists.slice(state.timePermittingIndex) 
            : [];
        nonPrioritizedArtists.forEach(artist => {
            artist.estimatedTime = "N/A";
        });
    }

    // Only update Time Permitting estimates for non-active artists.
    function calculateTimePermittingEstimates() {
        const prioritizedArtists = state.timePermittingEnabled 
            ? state.artists.slice(0, state.timePermittingIndex)
            : state.artists;
        const totalShotsPrioritized = prioritizedArtists.reduce((sum, artist) => 
            !artist.completed ? sum + parseInt(artist.shots, 10) : sum, 0);
        const timePerShot = totalShotsPrioritized > 0 ? state.totalTimeRemaining / totalShotsPrioritized : 0;
        prioritizedArtists.forEach(artist => {
           if (!artist.completed) {
               if (state.currentArtistIndex !== -1 && state.artists[state.currentArtistIndex].id === artist.id) {
                   // Do not update active artist's time permitting estimate.
               } else {
                   artist.tpEstimatedTime = formatTime(timePerShot * parseInt(artist.shots, 10));
               }
           } else {
               artist.tpEstimatedTime = "Done";
           }
        });
    }

    function timeToSeconds(timeStr) {
        if (timeStr === "Completed") return 0;
        const parts = timeStr.split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }

    // --- Render Artist List (divider rendered only if Time Permitting is enabled) ---
    function renderArtistList() {
        artistAgendaList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < state.artists.length; i++) {
            if (state.timePermittingEnabled && i === state.timePermittingIndex) {
                fragment.appendChild(createTimePermittingLineItem());
            }
            const artist = state.artists[i];
            const listItem = document.createElement('li');
            listItem.dataset.id = artist.id;
            
            if (state.timePermittingEnabled) {
                if (i >= state.timePermittingIndex) {
                    listItem.classList.add('below-divider');
                }
            }
            
            if (i === state.currentArtistIndex && state.sessionStarted) {
                listItem.classList.add('active-artist');
            }
            if (artist.completed) {
                listItem.classList.add('completed-artist');
            }
            
            const moveButtonsContainer = document.createElement('div');
            moveButtonsContainer.className = 'move-buttons-container';

            const upBtn = document.createElement('button');
            upBtn.className = 'move-artist-btn';
            upBtn.dataset.direction = 'up';
            upBtn.dataset.artistId = artist.id;
            upBtn.tabIndex = -1;
            moveButtonsContainer.appendChild(upBtn);

            const downBtn = document.createElement('button');
            downBtn.className = 'move-artist-btn';
            downBtn.dataset.direction = 'down';
            downBtn.dataset.artistId = artist.id;
            downBtn.tabIndex = -1;
            moveButtonsContainer.appendChild(downBtn);

            const artistDetailsDiv = document.createElement('div');
            artistDetailsDiv.className = 'artist-details';
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'artist-name-input';
            nameInput.placeholder = artist.name;
            nameInput.value = '';
            artistDetailsDiv.appendChild(nameInput);

            const shotsDiv = document.createElement('div');
            shotsDiv.className = 'shots-container';
            const shotsLabel = document.createElement('label');
            shotsLabel.textContent = 'Shots:';
            shotsDiv.appendChild(shotsLabel);
            const shotsInput = document.createElement('input');
            shotsInput.type = 'number';
            shotsInput.className = 'artist-shots-input';
            shotsInput.value = artist.shots;
            shotsInput.min = '1';
            shotsDiv.appendChild(shotsInput);

            const estimatedTimeSpan = document.createElement('span');
            if (state.sessionStarted && state.currentArtistIndex === i) {
                const elapsedTime = Math.floor((Date.now() - state.currentArtistStartTime) / 1000);
                const estimatedTimeInSeconds = timeToSeconds(artist.tpEstimatedTime || "00:00");
                const remainingEstTimeForCurrent = estimatedTimeInSeconds - elapsedTime;
                estimatedTimeSpan.textContent = formatTime(remainingEstTimeForCurrent);
                estimatedTimeSpan.className = `estimated-time ${remainingEstTimeForCurrent < 0 ? 'negative-time' : ''}`;
            } else {
                estimatedTimeSpan.className = `estimated-time ${artist.estimatedTime.startsWith('-') ? 'negative-time' : ''}`;
                estimatedTimeSpan.textContent = artist.estimatedTime;
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-artist-btn';
            deleteBtn.textContent = 'Delete';
            deleteBtn.tabIndex = -1;

            listItem.appendChild(moveButtonsContainer);
            listItem.appendChild(artistDetailsDiv);
            listItem.appendChild(shotsDiv);
            listItem.appendChild(estimatedTimeSpan);
            listItem.appendChild(deleteBtn);

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
            function handleTab(event, inputType, currentIndex) {
                if (event.key === 'Tab' && !event.shiftKey) {
                    event.preventDefault();
                    const nextIndex = currentIndex + 1;
                    if (nextIndex < state.artists.length) {
                        const nextInput = artistAgendaList.children[nextIndex].querySelector(
                            inputType === 'name' ? '.artist-name-input' : '.artist-shots-input'
                        );
                        if (nextInput) {
                            nextInput.focus();
                        }
                    } else {
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
                handleTab(event, 'name', i);
            });
            shotsInput.addEventListener('keydown', (event) => {
                handleTab(event, 'shots', i);
            });
            fragment.appendChild(listItem);
        }
        if (state.timePermittingEnabled && state.timePermittingIndex >= state.artists.length) {
            fragment.appendChild(createTimePermittingLineItem());
        }
        artistAgendaList.appendChild(fragment);

        const nameInputs = artistAgendaList.querySelectorAll('.artist-name-input');
        nameInputs.forEach(input => autocomplete(input, users));
    }

    function createTimePermittingLineItem() {
        const lineItem = document.createElement('li');
        lineItem.className = 'time-permitting-line';
        lineItem.dataset.divider = "true";
        lineItem.textContent = "Time Permitting Line";

        const moveButtonsContainer = document.createElement('div');
        moveButtonsContainer.className = 'move-buttons-container';

        const upBtn = document.createElement('button');
        upBtn.className = 'move-artist-btn';
        upBtn.dataset.direction = 'up';
        upBtn.textContent = '';
        upBtn.tabIndex = -1;
        upBtn.addEventListener('click', () => {
            if (state.timePermittingIndex > 0) {
                state.timePermittingIndex--;
                updateDisplay();
            }
        });
        moveButtonsContainer.appendChild(upBtn);

        const downBtn = document.createElement('button');
        downBtn.className = 'move-artist-btn';
        downBtn.dataset.direction = 'down';
        downBtn.textContent = '';
        downBtn.tabIndex = -1;
        downBtn.addEventListener('click', () => {
            if (state.timePermittingIndex < state.artists.length) {
                state.timePermittingIndex++;
                updateDisplay();
            }
        });
        moveButtonsContainer.appendChild(downBtn);

        lineItem.insertBefore(moveButtonsContainer, lineItem.firstChild);
        return lineItem;
    }

// ... existing code remains unchanged

function updateDisplay() {
    const prioritizedArtists = state.timePermittingEnabled 
        ? state.artists.slice(0, state.timePermittingIndex) 
        : state.artists;
        
    // Update totals in the main summary section
    const prioritizedTotalShots = prioritizedArtists.reduce((sum, artist) => sum + parseInt(artist.shots, 10), 0);
    totalShotsDisplay.textContent = prioritizedTotalShots;

    totalTimeRemainingDisplay.textContent = formatTime(state.totalTimeRemaining);
    if (state.totalTimeRemaining < 0) {
        totalTimeRemainingDisplay.classList.add('negative-time');
    } else {
        totalTimeRemainingDisplay.classList.remove('negative-time');
    }

    let prioritizedShotsRemaining = prioritizedArtists.reduce((sum, artist) =>
        artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
    if (state.currentArtistIndex !== -1 && state.currentArtistIndex < prioritizedArtists.length && !state.artists[state.currentArtistIndex].completed) {
        const activeArtist = state.artists[state.currentArtistIndex];
        if (includeActive) {
            const shotsDone = activeArtist.shotsDone || 0;
            prioritizedShotsRemaining -= parseInt(activeArtist.shots, 10);
            prioritizedShotsRemaining += (parseInt(activeArtist.shots, 10) - shotsDone);
        } else {
            prioritizedShotsRemaining -= parseInt(activeArtist.shots, 10);
        }
    }
    totalShotsRemainingDisplay.textContent = prioritizedShotsRemaining;
    
    let prioritizedPeopleRemaining = prioritizedArtists.reduce((sum, artist) => artist.completed ? sum : sum + 1, 0);
    if (state.currentArtistIndex !== -1 && !state.artists[state.currentArtistIndex].completed) {
        if (!state.timePermittingEnabled || state.currentArtistIndex < state.timePermittingIndex) {
            prioritizedPeopleRemaining -= 1;
        }
    }
    totalPeopleRemainingDisplay.textContent = prioritizedPeopleRemaining;
    
    calculateEstimatedTimePerArtist();
    calculateTimePermittingEstimates();
    
if (!state.paused && 
    !document.querySelector('.artist-name-input:focus, .artist-shots-input:focus') && 
    !isDragging) {
  renderArtistList();
}


    
    // Update current artist display in the main section
    if (state.currentArtistIndex !== -1 && state.currentArtistIndex < prioritizedArtists.length) {
        const currentArtist = state.artists[state.currentArtistIndex];
        const shotsDone = currentArtist.shotsDone || 0;
        const remainingShots = currentArtist.shots - shotsDone;
        currentArtistNameDisplay.textContent = currentArtist.name + " (" + remainingShots + "/" + currentArtist.shots + ")";
        const elapsedTime = Math.floor((Date.now() - state.currentArtistStartTime) / 1000);
        currentArtistTimeElapsedDisplay.textContent = formatTime(elapsedTime);
        const estimatedTimeInSeconds = timeToSeconds(currentArtist.tpEstimatedTime || "00:00");
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
    
    if (state.currentArtistIndex === -1 ||
        state.artists[state.currentArtistIndex].completed ||
        (state.artists[state.currentArtistIndex].shots - (state.artists[state.currentArtistIndex].shotsDone || 0)) <= 1) {
        nextShotBtn.disabled = true;
    } else {
        nextShotBtn.disabled = false;
    }
    
    updateSortableDraggability();
    totalArtistsInput.disabled = state.sessionStarted;
    if (state.timePermittingEnabled) {
        updateTimePermittingDisplay();
    }
    
    // --- Update Simplified Section ---
    // Update the current artist row (first row) in the simplified section.
    // It now displays the artist's name along with the remaining shots as a single number.
    // Also update the dedicated progress bar for the current artist's shots.
    if (state.currentArtistIndex !== -1 && state.currentArtistIndex < prioritizedArtists.length) {
        const currentArtist = state.artists[state.currentArtistIndex];
        const shotsDone = currentArtist.shotsDone || 0;
        const remainingShots = currentArtist.shots - shotsDone;
        // Update current artist info: display artist's name and remaining shots.
        const simpleCurrentShotsEl = document.getElementById('simple-current-shots');
        if (simpleCurrentShotsEl) {
            simpleCurrentShotsEl.textContent = currentArtist.name + " (" + remainingShots + ")";
        }
        // Update current artist's progress bar for shots (remaining/total)
        const progressCurrentEl = document.getElementById('progress-current');
        if (progressCurrentEl) {
            if (currentArtist.shots > 0) {
                let progressCurrentPercent = (remainingShots / currentArtist.shots) * 100;
                progressCurrentEl.style.width = Math.max(0, Math.min(100, progressCurrentPercent)) + '%';
            } else {
                progressCurrentEl.style.width = '0%';
            }
        }
    } else {
        const simpleCurrentShotsEl = document.getElementById('simple-current-shots');
        if (simpleCurrentShotsEl) {
            simpleCurrentShotsEl.textContent = '0';
        }
        const progressCurrentEl = document.getElementById('progress-current');
        if (progressCurrentEl) {
            progressCurrentEl.style.width = '0%';
        }
    }
    
    // Mirror the other simplified section values
    const simpleCurrentTimeElapsedDisplay = document.getElementById('simple-current-time-elapsed');
    const simpleCurrentTimeRemainingDisplay = document.getElementById('simple-current-time-remaining');
    const simpleTotalTimeRemainingDisplay = document.getElementById('simple-total-time-remaining');
    const simplePeopleRemainingDisplay = document.getElementById('simple-people-remaining');
    const simpleShotsRemainingDisplay = document.getElementById('simple-shots-remaining');
    const simpleToggleShotsModeBtn = document.getElementById('simple-toggle-shots-mode');
    
    if (simpleCurrentTimeElapsedDisplay) {
        simpleCurrentTimeElapsedDisplay.textContent = currentArtistTimeElapsedDisplay.textContent;
    }
    if (simpleCurrentTimeRemainingDisplay) {
        simpleCurrentTimeRemainingDisplay.textContent = currentArtistEstTimeRemDisplay.textContent;
    }
    if (simpleTotalTimeRemainingDisplay) {
        simpleTotalTimeRemainingDisplay.textContent = totalTimeRemainingDisplay.textContent;
        if (state.totalTimeRemaining < 0) {
            simpleTotalTimeRemainingDisplay.classList.add('negative-time');
        } else {
            simpleTotalTimeRemainingDisplay.classList.remove('negative-time');
        }
    }
    if (simplePeopleRemainingDisplay) {
        simplePeopleRemainingDisplay.textContent = totalPeopleRemainingDisplay.textContent;
    }
    if (simpleShotsRemainingDisplay) {
        simpleShotsRemainingDisplay.textContent = totalShotsRemainingDisplay.textContent;
    }
    if (simpleToggleShotsModeBtn) {
        if (toggleShotsModeBtn.classList.contains('inactive')) {
            simpleToggleShotsModeBtn.classList.add('inactive');
            simpleToggleShotsModeBtn.classList.remove('active');
        } else {
            simpleToggleShotsModeBtn.classList.remove('inactive');
            simpleToggleShotsModeBtn.classList.add('active');
        }
    }
    
    // Mirror disabled states for simplified buttons
    const simpleNextShotBtn = document.getElementById('simple-next-shot-btn');
    const simpleNextArtistBtn = document.getElementById('simple-next-artist-btn');
    const simpleUndoBtn = document.getElementById('simple-undo-btn');
    if (simpleNextShotBtn) {
        simpleNextShotBtn.disabled = nextShotBtn.disabled;
    }
    if (simpleNextArtistBtn) {
        simpleNextArtistBtn.disabled = nextArtistBtn.disabled;
    }
    if (simpleUndoBtn) {
        simpleUndoBtn.disabled = undoBtn.disabled;
    }
    
    // --- Update Progress Bars for Totals in Simplified Section ---
    // Total Time Progress (reversed: full at start, empties over time)
    const progressTotalEl = document.getElementById('progress-total');
    if (state.totalTimeAllotment > 0) {
        let progressTotalPercent = (state.totalTimeRemaining / state.totalTimeAllotment) * 100;
        progressTotalEl.style.width = Math.max(0, Math.min(100, progressTotalPercent)) + '%';
    } else {
        progressTotalEl.style.width = '0%';
    }
    
    // People Progress (reversed: full at start, empties as people are processed)
    const progressPeopleEl = document.getElementById('progress-people');
    let initialPeople = state.timePermittingEnabled ? state.timePermittingIndex : state.artists.length;
    if (initialPeople > 0) {
        let currentPeopleRemaining = parseInt(totalPeopleRemainingDisplay.textContent, 10);
        let progressPeoplePercent = (currentPeopleRemaining / initialPeople) * 100;
        progressPeopleEl.style.width = Math.max(0, Math.min(100, progressPeoplePercent)) + '%';
    } else {
        progressPeopleEl.style.width = '0%';
    }
    
    // Shots Progress (reversed: full at start, empties as shots are completed)
    const progressShotsEl = document.getElementById('progress-shots');
    if (state.initialTotalShots > 0) {
        let currentShotsRemaining = parseInt(totalShotsRemainingDisplay.textContent, 10);
        let progressShotsPercent = (currentShotsRemaining / state.initialTotalShots) * 100;
        progressShotsEl.style.width = Math.max(0, Math.min(100, progressShotsPercent)) + '%';
    } else {
        progressShotsEl.style.width = '0%';
    }
}




    function updateTimePermittingDisplay() {
        const prioritizedArtists = state.timePermittingEnabled 
            ? state.artists.slice(0, state.timePermittingIndex) 
            : state.artists;
        const tpTotalShots = prioritizedArtists.reduce((sum, artist) => sum + parseInt(artist.shots, 10), 0);
        if(tpTotalShotsDisplay) tpTotalShotsDisplay.textContent = tpTotalShots;
        if(tpTotalTimeRemainingDisplay) {
            tpTotalTimeRemainingDisplay.textContent = formatTime(state.totalTimeRemaining);
            if (state.totalTimeRemaining < 0) {
                tpTotalTimeRemainingDisplay.classList.add('negative-time');
            } else {
                tpTotalTimeRemainingDisplay.classList.remove('negative-time');
            }
        }
        let tpShotsRemaining = prioritizedArtists.reduce((sum, artist) => 
            artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
        if (state.currentArtistIndex !== -1 && state.currentArtistIndex < state.timePermittingIndex && !state.artists[state.currentArtistIndex].completed) {
            tpShotsRemaining -= parseInt(state.artists[state.currentArtistIndex].shots, 10);
        }
        if(tpTotalShotsRemainingDisplay) tpTotalShotsRemainingDisplay.textContent = tpShotsRemaining;
        let tpPeopleRemaining = prioritizedArtists.reduce((sum, artist) => artist.completed ? sum : sum + 1, 0);
        if (state.currentArtistIndex !== -1 && state.currentArtistIndex < state.timePermittingIndex && !state.artists[state.currentArtistIndex].completed) {
            tpPeopleRemaining -= 1;
        }
        if(tpTotalPeopleRemainingDisplay) tpTotalPeopleRemainingDisplay.textContent = tpPeopleRemaining;
        if (state.currentArtistIndex !== -1 && state.currentArtistIndex < state.timePermittingIndex) {
            const currentArtist = state.artists[state.currentArtistIndex];
            if(tpCurrentArtistNameDisplay) tpCurrentArtistNameDisplay.textContent = currentArtist.name + " (" + currentArtist.shots + ")";
            const elapsedTime = Math.floor((Date.now() - state.currentArtistStartTime) / 1000);
            if(tpCurrentArtistTimeElapsedDisplay) tpCurrentArtistTimeElapsedDisplay.textContent = formatTime(elapsedTime);
            const estimatedTimeInSeconds = timeToSeconds(currentArtist.tpEstimatedTime || "00:00");
            const remainingEstTimeForCurrent = estimatedTimeInSeconds - elapsedTime;
            if(tpCurrentArtistEstTimeRemDisplay) tpCurrentArtistEstTimeRemDisplay.textContent = formatTime(remainingEstTimeForCurrent);
        } else {
            if(tpCurrentArtistNameDisplay) tpCurrentArtistNameDisplay.textContent = '';
            if(tpCurrentArtistTimeElapsedDisplay) tpCurrentArtistTimeElapsedDisplay.textContent = '00:00';
            if(tpCurrentArtistEstTimeRemDisplay) tpCurrentArtistEstTimeRemDisplay.textContent = '00:00';
        }
    }

    toggleShotsModeBtn.addEventListener('click', () => {
        includeActive = !includeActive;
        if (includeActive) {
            toggleShotsModeBtn.classList.remove('inactive');
        } else {
            toggleShotsModeBtn.classList.add('inactive');
        }
        updateDisplay();
    });

    pauseBtn.addEventListener('click', () => {
        state.paused = !state.paused;
        pauseBtn.textContent = state.paused ? "Resume" : "Edit Agenda";
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
            tpEstimatedTime: "00:00",
            completed: false
        }));
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
        state.totalTimeRemaining = state.totalTimeAllotment;
        if (!state.timePermittingEnabled) {
            state.timePermittingIndex = state.artists.length;
        }
        renderArtistList();
        updateDisplay();
    }

    function startSessionTimer() {
        state.sessionStartTime = Date.now();
        state.timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - state.sessionStartTime) / 1000);
            state.totalTimeRemaining = state.totalTimeAllotment - elapsedSeconds;
            updateDisplay();
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

    function nextArtist() {
        undoBackup = { previousIndex: state.currentArtistIndex };
        undoBtn.disabled = false;
        if (state.currentArtistIndex !== -1) {
            state.artists[state.currentArtistIndex].completed = true;
            stopCurrentArtistTimer();
        }
        state.currentArtistIndex++;
        
        if (state.timePermittingEnabled && state.currentArtistIndex >= state.timePermittingIndex) {
             state.timePermittingIndex = Math.min(state.currentArtistIndex + 1, state.artists.length);
        }
        
        if (state.currentArtistIndex < state.artists.length) {
            const currentArtist = state.artists[state.currentArtistIndex];
            if (currentArtist.shotsDone === undefined) {
                currentArtist.shotsDone = 0;
            }
            const prioritizedArtists = state.timePermittingEnabled 
                ? state.artists.slice(0, state.timePermittingIndex) 
                : state.artists;
            const totalRemainingShots = prioritizedArtists.reduce((sum, artist) =>
                artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
            if (totalRemainingShots > 0) {
                const remainingTimePerShot = state.totalTimeRemaining / totalRemainingShots;
                currentArtist.tpEstimatedTime = formatTime(remainingTimePerShot * parseInt(currentArtist.shots, 10));
            } else {
                currentArtist.tpEstimatedTime = "00:00";
            }
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

    undoBtn.addEventListener('click', () => {
        if (!undoBackup) return;
        stopCurrentArtistTimer();
        state.currentArtistIndex = undoBackup.previousIndex;
        if (state.currentArtistIndex !== -1) {
            state.artists[state.currentArtistIndex].completed = false;
            const currentArtist = state.artists[state.currentArtistIndex];
            const prioritizedArtists = state.timePermittingEnabled 
                ? state.artists.slice(0, state.timePermittingIndex) 
                : state.artists;
            const totalRemainingShots = prioritizedArtists.reduce((sum, artist) =>
                artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
            if (totalRemainingShots > 0) {
                const remainingTimePerShot = state.totalTimeRemaining / totalRemainingShots;
                currentArtist.tpEstimatedTime = formatTime(remainingTimePerShot * parseInt(currentArtist.shots, 10));
            } else {
                currentArtist.tpEstimatedTime = "00:00";
            }
            startCurrentArtistTimer();
        }
        state.sessionStarted = true;
        nextArtistBtn.disabled = false;
        undoBackup = null;
        undoBtn.disabled = true;
        updateDisplay();
    });

    nextShotBtn.addEventListener('click', () => {
        if (state.currentArtistIndex === -1) return;
        const currentArtist = state.artists[state.currentArtistIndex];
        const shotsDone = currentArtist.shotsDone || 0;
        const remainingShots = currentArtist.shots - shotsDone;
        if (currentArtist.completed || remainingShots <= 1) return;
        currentArtist.shotsDone = shotsDone + 1;
        updateDisplay();
    });

    function addArtist() {
        const newArtist = {
            id: Date.now(),
            name: `Artist ${state.artists.length + 1}`,
            shots: 1,
            estimatedTime: "00:00",
            tpEstimatedTime: "00:00",
            completed: false
        };
        state.artists.push(newArtist);
        if (!state.timePermittingEnabled) {
            state.timePermittingIndex = state.artists.length;
        }
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
        if (state.timePermittingIndex > state.artists.length) {
            state.timePermittingIndex = state.artists.length;
        }
        renderArtistList();
        updateDisplay();
    }

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
        if (newIndex === currentIndex) return;
        if (state.sessionStarted && state.currentArtistIndex !== -1) {
            if (direction === 'up' && newIndex <= state.currentArtistIndex) {
                return;
            }
        }
        const [movedArtist] = state.artists.splice(currentIndex, 1);
        state.artists.splice(newIndex, 0, movedArtist);
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

    function updateSortableDraggability() {
        if (sortableInstance) {
            sortableInstance.option('draggable', 'li');
        }
    }

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

    timePermittingToggle.addEventListener('click', () => {
        state.timePermittingEnabled = !state.timePermittingEnabled;
        if (state.timePermittingEnabled) {
            timePermittingToggle.classList.add('active');
            timePermittingToggle.classList.remove('inactive');
        } else {
            timePermittingToggle.classList.remove('active');
            timePermittingToggle.classList.add('inactive');
            state.timePermittingIndex = state.artists.length;
        }
        updateDisplay();
    });

sortableInstance = Sortable.create(artistAgendaList, {
  draggable: 'li',
  group: {
    name: 'artists',
    pull: true,
    put: true,
  },
  onStart: function (evt) {
    isDragging = true;
  },
  onEnd: function (evt) {
    isDragging = false;
    // Re-render the list once the drag is complete
    renderArtistList();
    updateDisplay();
  },
        onUpdate: function (evt) {
            const items = Array.from(artistAgendaList.children);
            let dividerDOMIndex = state.timePermittingEnabled ? items.findIndex(item => item.dataset.divider === "true") : -1;
            if (evt.item.dataset.divider === "true") {
                if (state.timePermittingEnabled) {
                    let count = 0;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].dataset.divider === "true") break;
                        count++;
                    }
                    state.timePermittingIndex = count;
                }
            } else {
                let oldDOMIndex = evt.oldIndex;
                let newDOMIndex = evt.newIndex;
                let oldArtistIndex = (state.timePermittingEnabled && oldDOMIndex > dividerDOMIndex) ? oldDOMIndex - 1 : oldDOMIndex;
                let newArtistIndex = (state.timePermittingEnabled && newDOMIndex > dividerDOMIndex) ? newDOMIndex - 1 : newDOMIndex;
                const [movedArtist] = state.artists.splice(oldArtistIndex, 1);
                state.artists.splice(newArtistIndex, 0, movedArtist);
                if (state.timePermittingEnabled) {
                    let newDividerCount = 0;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].dataset.divider === "true") break;
                        newDividerCount++;
                    }
                    state.timePermittingIndex = newDividerCount;
                } else {
                    state.timePermittingIndex = state.artists.length;
                }
            }
            renderArtistList();
            updateDisplay();
        },
        onMove: function (evt, originalEvent) {
            const dragged = evt.dragged;
            if (dragged.dataset.divider === "true") return true;
            let allItems = Array.from(artistAgendaList.children);
            let draggedDOMIndex = allItems.indexOf(dragged);
            let artistCountBefore = 0;
            for (let i = 0; i < draggedDOMIndex; i++) {
                if (!allItems[i].dataset.divider) {
                    artistCountBefore++;
                }
            }
            if (state.sessionStarted && state.currentArtistIndex !== -1 && artistCountBefore <= state.currentArtistIndex) {
                return false;
            }
            return true;
        }
    });

    function startReviewSession() {
        if (state.artists.length === 0 || state.sessionStarted) return;
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        startTimeInput.value = `${hours}:${minutes}`;
        state.startTime = startTimeInput.value;
        state.totalTimeAllotment = calculateTotalTimeAllotment(state.startTime, state.endTime);
        state.totalTimeRemaining = state.totalTimeAllotment;
        state.initialTotalShots = calculateTotalShots();
        state.sessionStarted = true;
        state.currentArtistIndex = 0;
        const currentArtist = state.artists[state.currentArtistIndex];
        currentArtist.shotsDone = 0;
        const prioritizedArtists = state.timePermittingEnabled 
                ? state.artists.slice(0, state.timePermittingIndex) 
                : state.artists;
        const totalRemainingShots = prioritizedArtists.reduce((sum, artist) =>
                artist.completed ? sum : sum + parseInt(artist.shots, 10), 0);
        if (totalRemainingShots > 0) {
            const remainingTimePerShot = state.totalTimeRemaining / totalRemainingShots;
            currentArtist.tpEstimatedTime = formatTime(remainingTimePerShot * parseInt(currentArtist.shots, 10));
        } else {
            currentArtist.tpEstimatedTime = "00:00";
        }
        startSessionTimer();
        startCurrentArtistTimer();
        nextArtistBtn.disabled = false;
        updateDisplay();
        startReviewBtn.disabled = true;
        startReviewBtn.style.cursor = "default";
        updateSortableDraggability();
    }

    initializeArtists();
    updateDisplay();
});
