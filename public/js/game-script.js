window.onload = init;

function init() {
    document.getElementById('text_input').disabled = true;
    let client = new Colyseus.Client("ws://localhost:3000");
}
