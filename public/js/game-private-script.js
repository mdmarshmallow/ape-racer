window.onload = init;

function init() {
    const text_input = document.getElementById('text_input');
    const excerpt = document.getElementById('excerpt');
    const countdown_number = document.getElementById('countdown_number');
    const name = document.getElementById('name').getAttribute('data-name');
    const wpm_number = document.getElementById('wpm_number');
    const countdown = document.getElementById('countdown');
    const endButtons = document.getElementById('end');
    const create = document.getElementById('created');
    const startButton = document.getElementById('start_button');
    const codeBlock = document.getElementById('code_block');

    let playerCount = 0;

    let excerptArray;
    
    text_input.disabled = true;
    let host = window.document.location.host.replace(/:.*/, '');
    let client = new Colyseus.Client(location.protocol.replace("http", "ws") +
        host + (location.port ? ':' + location.port : ''));
    //join the private typeroom
    let room;
    if (create) {
        room = client.join('typeroom-private', {
            create,
            private: true ,
            name
        });
    } else {
        let code = document.getElementById('code_entered').getAttribute('data-code');
        room = client.join(code, {
            private: true,
            name
        });
    }

    client.onError.add((err) => {
        console.log(err);
        alert("You entered the wrong code");
        window.history.back();
    })

    room.onJoin.add(() => {
        if (create) {
            document.getElementById('code').innerHTML = "Code: " + room.id;
        }
        if (startButton) {
            startButton.addEventListener('click', e => {
                room.send({ timerStart: true });
                codeBlock.style.display = "none";
            })
        };
    });

    room.listen('excerptArray', change => {
        let spanArray = change.value.map((value, index) => {
            return "<span id=" + index + ">" + value + "</span>";
        });
        excerptArray = change.value;
        excerpt.innerHTML = spanArray.join(" ");
        document.getElementById(0).className = 'highlight';
    });

    room.listen('timeToStart', change => {
        countdown_number.innerHTML = change.value;
        let wordCount = 0;
        if (change.value === 0) {
            text_input.disabled = false;
            text_input.addEventListener('keypress', e => {
                let wordInputted = text_input.value.replace(/\s/g, '');
                let word = document.getElementById(wordCount);
                if (e.charCode === 32 && wordInputted == excerptArray[wordCount]) { //space is clicked
                    room.send({ wordInput: text_input.value });
                    text_input.value = '';
                    if (wordInputted === word.innerHTML) {
                        word.className = 'correct';
                    } else {
                        word.className = 'incorrect';
                    }
                    wordCount++;
                    word = document.getElementById(wordCount);
                    word.className = 'highlight';
                }
            });
            text_input.focus();
            text_input.addEventListener('keyup', e => {
                if (e.charCode !== 32) {
                    let wordInputted = text_input.value.replace(/\s/g, '');
                    let word = document.getElementById(wordCount);
                    let length = wordInputted.length;
                    let wordSubstring = word.innerHTML.substring(0, length);
                    if (wordInputted !== wordSubstring) {
                        word.className = 'highlight-wrong';
                    } else {
                        word.className = 'highlight';
                    }
                }
            });
        }
    });

    room.listen('players/:id/playerName', change => {
        if (change.operation === "add") {
            let progressBar = document.getElementById('player' + playerCount);
            progressBar.id = change.path.id;
            progressBar.style.display = "block";
            let progressMarker = document.getElementById('player' + playerCount);
            progressMarker.id = change.path.id + 'marker';
            let playerWPM = document.getElementById('player' + playerCount);
            playerWPM.id = change.path.id + 'wpm';
            let nameTag = document.getElementById('name' + playerCount);
            nameTag.innerHTML = change.value;
            playerCount++;
        }
    });

    room.listen('players/:id/wpm', change => {
        if (change.path['id'] === client.id) {
            wpm_number.innerHTML = Math.round(change.value);
        }
        let wpm_to_change = document.getElementById(change.path['id'] + 'wpm');
        wpm_to_change.innerHTML = Math.round(change.value);
    });

    room.listen('players/:id/percentageTraversed', change => {
        let progressMarker = document.getElementById(change.path['id']);
        //values gotten from progress bar values
        let percentage = 15 + (change.value * 100) * .1
        progressMarker.style.height = percentage + 'vh';
    });

    room.listen('players/:id/place', change => {
        if (change.path['id'] === client.id) {
            if (change.value === 1) {
                countdown.innerHTML = "You won!";
                endButtons.style.display = "block";
            } else if (change.value === 2) {
                countdown.innerHTML = "2nd place!"
                endButtons.style.display = "block";
            } else if (change.value === 3) {
                countdown.innerHTML = "3rd place!";
                endButtons.style.display = "block";
            } else if (change.value === 4) {
                countdown.innerHTML = "4th place!";
                endButtons.style.display = "block";
            }
        }
    });
}
