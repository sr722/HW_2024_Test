async function fetchDiary() {
    const response = await fetch('doofus-diary.json');
    const data = await response.json();
    return data;
}

let score = 0;
let doofus = document.getElementById('doofus');
let pulpitsContainer = document.getElementById('pulpits');
let scoreDisplay = document.getElementById('score');
let gameContainer = document.getElementById('game-container');
let activePulpits = [];
const pulpitWidth = 90;  // Width of a pulpit in pixels
const pulpitHeight = 90; // Height of a pulpit in pixels

let playerSpeed = 0;
let minPulpitDestroyTime = 0;
let maxPulpitDestroyTime = 0;
let pulpitSpawnTime = 0;

function moveDoofus(x, y) {
    let left = parseInt(doofus.style.left || '0');
    let top = parseInt(doofus.style.top || '0');
    doofus.style.left = `${left + x}px`;
    doofus.style.top = `${top + y}px`;
    checkForPulpit();
}

function checkForPulpit() {
    const doofusRect = doofus.getBoundingClientRect();
    
    for (let i = 0; i < activePulpits.length; i++) {
        const pulpit = activePulpits[i];
        const pulpitRect = pulpit.getBoundingClientRect();
        
        if (doofusRect.left < pulpitRect.right &&
            doofusRect.right > pulpitRect.left &&
            doofusRect.top < pulpitRect.bottom &&
            doofusRect.bottom > pulpitRect.top) {
            
            updateScore();
            removePulpit(pulpit);
            placeNewPulpit();
            return;
        }
    }
}

function updateScore() {
    score++;
    scoreDisplay.innerText = `Score: ${score}`;
}

function removePulpit(pulpit) {
    pulpitsContainer.removeChild(pulpit);
    activePulpits = activePulpits.filter(p => p !== pulpit);
}

function placeNewPulpit() {
    const pulpit = document.createElement('div');
    pulpit.className = 'pulpit';
    
    let x, y, positionValid;
    do {
        positionValid = true;
        x = Math.floor(Math.random() * (gameContainer.clientWidth - pulpitWidth));
        y = Math.floor(Math.random() * (gameContainer.clientHeight - pulpitHeight));
        
        for (let p of activePulpits) {
            const pRect = p.getBoundingClientRect();
            if (x < pRect.right - gameContainer.getBoundingClientRect().left &&
                x + pulpitWidth > pRect.left - gameContainer.getBoundingClientRect().left &&
                y < pRect.bottom - gameContainer.getBoundingClientRect().top &&
                y + pulpitHeight > pRect.top - gameContainer.getBoundingClientRect().top) {
                positionValid = false;
                break;
            }
        }
    } while (!positionValid);

    pulpit.style.left = `${x}px`;
    pulpit.style.top = `${y}px`;
    pulpitsContainer.appendChild(pulpit);
    activePulpits.push(pulpit);
    
    // Set up a timer for this pulpit
    setTimeout(() => {
        if (activePulpits.includes(pulpit)) {
            removePulpit(pulpit);
            placeNewPulpit();
        }
    }, minPulpitDestroyTime * 1000 + Math.random() * (maxPulpitDestroyTime - minPulpitDestroyTime) * 1000);
}

function startGame() {
    // Initialize the game with two initial pulpits
    for (let i = 0; i < 2; i++) {
        placeNewPulpit();
    }

    // Periodically place new pulpits
    setInterval(placeNewPulpit, pulpitSpawnTime * 1000);
}

window.addEventListener('keydown', (event) => {
    switch(event.key) {
        case 'ArrowUp':
            moveDoofus(0, -playerSpeed);
            break;
        case 'ArrowDown':
            moveDoofus(0, playerSpeed);
            break;
        case 'ArrowLeft':
            moveDoofus(-playerSpeed, 0);
            break;
        case 'ArrowRight':
            moveDoofus(playerSpeed, 0);
            break;
    }
});

fetchDiary().then(data => {
    playerSpeed = data.player_data.speed;
    minPulpitDestroyTime = data.pulpit_data.min_pulpit_destroy_time;
    maxPulpitDestroyTime = data.pulpit_data.max_pulpit_destroy_time;
    pulpitSpawnTime = data.pulpit_data.pulpit_spawn_time;
    console.log(data); // Use this data to configure your game
    startGame();
});
