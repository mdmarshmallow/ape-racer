window.onload = init;

function init() {
    const text_input = document.getElementById('text_input');
    const excerpt = document.getElementById('excerpt');
    const countdown_number = document.getElementById('countdown_number');
    const name = document.getElementById('name').getAttribute('data-name');

    text_input.disabled = true;
    let client = new Colyseus.Client("ws://localhost:3000");
    let room = client.join('typeroom');
    room.onJoin.add(() => {
        room.send({ name });
    });
    room.listen('excerptArray', change => {
        let spanArray = change.value.map((value, index) => {
            return "<span id=" + index + ">" + value + "</span>";
        });
        excerpt.innerHTML = spanArray.join(" ");
        document.getElementById(0).className = 'highlight';
    })
    room.listen('timeToStart', change => {
        countdown_number.innerHTML = change.value;
        let wordCount = 0;
        if (change.value === 0) {
            text_input.disabled = false;
            text_input.addEventListener('keypress', e => {
                let wordInputted = text_input.value.replace(/\s/g, '');
                let word = document.getElementById(wordCount);
                if (e.charCode === 32) { //space is clicked
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
}
