const COLORS = ["red", "blue", "green", "yellow", "orange", "purple"];
let secretCode = [];
let dragColor = null;

function generateCode() {
    secretCode = [];
    for (let i = 0; i < 4; i++) {
        secretCode.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    // For demo, uncomment to see the code:
    // console.log("Secret:", secretCode);
}

function handleDragStart(e) {
    dragColor = e.target.dataset.color;
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    if (dragColor) {
        e.target.className = `slot filled ${dragColor}`;
        e.target.dataset.color = dragColor;
    }
}

function getGuess() {
    const slots = document.querySelectorAll('#current-guess .slot');
    return Array.from(slots).map(slot => slot.dataset.color || null);
}

function checkGuess() {
    const guess = getGuess();
    if (guess.some(color => !color)) {
        document.getElementById('feedback').textContent = "Fill all slots!";
        return;
    }

    let codeCopy = [...secretCode];
    let guessCopy = [...guess];
    let black = 0, white = 0;

    // First pass: black pegs (correct color & position)
    for (let i = 0; i < 4; i++) {
        if (guessCopy[i] === codeCopy[i]) {
            black++;
            codeCopy[i] = guessCopy[i] = null;
        }
    }
    // Second pass: white pegs (correct color, wrong position)
    for (let i = 0; i < 4; i++) {
        if (guessCopy[i] && codeCopy.includes(guessCopy[i])) {
            white++;
            codeCopy[codeCopy.indexOf(guessCopy[i])] = null;
        }
    }

    // Add guess to history
    addGuessToHistory(guess, black, white);

    // Reset current guess row
    document.querySelectorAll('#current-guess .slot').forEach(slot => {
        slot.className = 'slot';
        slot.dataset.color = '';
    });

    document.getElementById('feedback').textContent = "";

    if (black === 4) {
        setTimeout(() => {
            // Show overlay
            document.getElementById('victory-code').textContent = "The code was: " + secretCode.join(", ");
            document.getElementById('victory-overlay').style.display = "flex";
            // Fire confetti
            if (window.confetti) {
                confetti({
                    particleCount: 200,
                    spread: 90,
                    origin: { y: 0.6 }
                });
            }
        }, 100);
    }
}

function addGuessToHistory(guess, black, white) {
    const history = document.getElementById('history');
    const row = document.createElement('div');
    row.className = 'guess-row';

    // Show guess colors
    guess.forEach(color => {
        const slot = document.createElement('div');
        slot.className = `slot filled ${color}`;
        row.appendChild(slot);
    });

    // Show feedback
    const feedback = document.createElement('span');
    feedback.className = 'feedback';
    feedback.textContent = "●".repeat(black) + "○".repeat(white);
    row.appendChild(feedback);

    history.appendChild(row);
}

function handlePegDoubleClick(e) {
    const color = e.target.dataset.color;
    const slots = document.querySelectorAll('#current-guess .slot');
    for (let slot of slots) {
        if (!slot.dataset.color || slot.dataset.color === "") {
            slot.className = `slot filled ${color}`;
            slot.dataset.color = color;
            break;
        }
    }
}

function setupDragAndDrop() {
    document.querySelectorAll('.peg').forEach(peg => {
        peg.addEventListener('dragstart', handleDragStart);
        peg.addEventListener('dblclick', handlePegDoubleClick); // Add this line
    });

    document.querySelectorAll('.slot').forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('drop', handleDrop);
    });
}

document.getElementById('submit-guess').addEventListener('click', checkGuess);

generateCode();
setupDragAndDrop();