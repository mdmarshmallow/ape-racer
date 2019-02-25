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
    room.listen('excerpt', change => {
        excerpt.innerHTML = change.value;
    })
    room.listen('timeToStart', change => {
        countdown_number.innerHTML = change.value;
        if (change.value === 0) {
            text_input.disabled = false;
            text_input.addEventListener('keypress', e => {
                if (e.charCode === 32) { //space is clicked
                    room.send({ wordInput: text_input.value });
                    text_input.value = "";
                }
            });
        }
    });
}
