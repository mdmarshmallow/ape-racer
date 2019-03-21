window.onload = init;

function init() {
    const nameInput = document.getElementById('name-input');

    nameInput.addEventListener('keypress', e => {
        if (nameInput.value.length > 7) {
            alert("Name cannot be longer than 7 characters");
            nameInput.disabled = true;
            nameInput.value = nameInput.value.substring(0, 7);
            nameInput.disabled = false;
        } 
    });
}