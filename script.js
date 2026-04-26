const canvas = document.getElementById('reactionGame');
const ctx = canvas.getContext('2d');
const display = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');

let startTime, timeout;
let waitingForClick = false;

// Draw the initial standby state
function drawStandby() {
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "20px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Ready?", canvas.width/2, canvas.height/2);
}

drawStandby();

function startTest() {
    // Reset State for a new test
    ctx.fillStyle = "#ff4444"; // Red
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    display.innerText = "Wait for green...";
    waitingForClick = false;
    clearTimeout(timeout);

    // Random delay between 2 and 5 seconds
    const delay = Math.random() * 3000 + 2000;
    
    timeout = setTimeout(() => {
        ctx.fillStyle = "#00ff88"; // Green
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        display.innerText = "CLICK NOW!";
        startTime = Date.now();
        waitingForClick = true;
    }, delay);
}

// Event Listeners
startBtn.addEventListener('click', startTest);

canvas.addEventListener('mousedown', () => {
    if (waitingForClick) {
        // Successful click
        const reactionTime = Date.now() - startTime;
        display.innerText = `Reaction Time: ${reactionTime}ms! Click Start to try again.`;
        waitingForClick = false;
        
        // Draw success state
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#00ff88";
        ctx.fillText(`${reactionTime}ms`, canvas.width/2, canvas.height/2);

    } else if (display.innerText === "Wait for green...") {
        // Clicked too early
        clearTimeout(timeout);
        display.innerText = "Too early! Click Start to try again.";
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ff4444";
        ctx.fillText("Too early!", canvas.width/2, canvas.height/2);
    }
});