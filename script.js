document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const messageEl = document.getElementById('message');

    // Game settings
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 220;
    const innerRadius = 150;
    const handLength = 140;
    const handWidth = 10;
    const quadrantColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f']; // 0:Red, 1:Blue, 2:Green, 3:Yellow

    // Game state variables
    let score = 0;
    let handAngle = 0; // In degrees
    let prevAngle = 0; // The angle on the previous frame
    let handColor;
    let handDirection = 1; // 1 for clockwise, -1 for counter-clockwise
    let gameSpeed = 1.5; // Degrees per frame
    let isPlaying = false;
    let gameOver = true;

    // ### Drawing Functions ###

    function drawRing() {
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
            ctx.closePath();
            ctx.fillStyle = quadrantColors[i];
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#34495e';
        ctx.fill();
    }

    function drawHand() {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((handAngle * Math.PI) / 180);
        ctx.beginPath();
        ctx.rect(-handWidth / 2, -handLength, handWidth, handLength);
        ctx.fillStyle = handColor;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();
        ctx.restore();
    }

    // ### Game Logic Functions ###

    function getQuadrantFromAngle(angle) {
        const normalizedAngle = (angle % 360 + 360) % 360;
        return Math.floor(normalizedAngle / 90);
    }

    /**
     * Chooses a new random color for the hand.
     * It filters out the current hand color to ensure the new color is always different.
     */
    function chooseNewHandColor() {
        const currentColor = handColor;
        const availableColors = quadrantColors.filter(color => color !== currentColor);
        handColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    function resetGame() {
        score = 0;
        handAngle = 0;
        prevAngle = 0;
        gameSpeed = 1.5;
        handDirection = 1;
        isPlaying = true;
        gameOver = false;
        handColor = quadrantColors[Math.floor(Math.random() * 4)];
        scoreEl.textContent = `Score: ${score}`;
        messageEl.style.display = 'none';
        gameLoop();
    }

    function handleSuccess() {
        score++;
        scoreEl.textContent = `Score: ${score}`;
        handDirection *= -1;
        gameSpeed += 0.1;
        chooseNewHandColor();
    }

    function handleFailure() {
        isPlaying = false;
        gameOver = true;
        messageEl.innerHTML = `Game Over!<br>Final Score: ${score}<br>Press Spacebar to Restart`;
        messageEl.style.display = 'block';
    }

    // ### Main Game Loop ###

    function gameLoop() {
        if (!isPlaying) return;

        // --- Main Logic Update ---
        prevAngle = handAngle;
        handAngle += gameSpeed * handDirection;

        const prevQuadrant = getQuadrantFromAngle(prevAngle);
        const currentQuadrant = getQuadrantFromAngle(handAngle);
        const targetQuadrant = quadrantColors.indexOf(handColor);

        // A loss occurs if the hand crosses a boundary AND the quadrant it just left
        // was the target quadrant. This means the player missed their chance.
        if (prevQuadrant !== currentQuadrant && prevQuadrant === targetQuadrant) {
            handleFailure();
            return; // Stop the loop immediately
        }
        
        // --- Drawing ---
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRing();
        drawHand();

        requestAnimationFrame(gameLoop);
    }

    // ### Event Listener ###
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (gameOver) {
                resetGame();
                return;
            }
            if (isPlaying) {
                const currentQuadrant = getQuadrantFromAngle(handAngle);
                const targetQuadrant = quadrantColors.indexOf(handColor);
                if (currentQuadrant === targetQuadrant) {
                    handleSuccess();
                } else {
                    handleFailure();
                }
            }
        }
    });

    // Initial draw to show the starting screen
    drawRing();
});
