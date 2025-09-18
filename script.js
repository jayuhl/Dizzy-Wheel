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
    const handLength = 145; // Adjusted length to fit within the ring
    const handWidth = 10;
    const quadrantColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f']; // 0:Red, 1:Blue, 2:Green, 3:Yellow

    // Game state variables
    let score = 0;
    let handAngle = 0; // In degrees
    let prevAngle = 0; 
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
            // Angles in canvas start at 3 o'clock.
            // 0: 3-6 o'clock (Red), 1: 6-9 o'clock (Blue), etc.
            ctx.arc(centerX, centerY, radius, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
            ctx.closePath();
            ctx.fillStyle = quadrantColors[i];
            ctx.fill();
        }
        // Draw inner circle to make a ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#34495e';
        ctx.fill();
    }

    /**
     * **FIXED**: Draws the hand as a line pointing from the center.
     * This aligns the visual angle (0 degrees = 3 o'clock) with the arc drawing logic.
     */
    function drawHand() {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((handAngle * Math.PI) / 180); // Convert game angle to radians
        
        ctx.beginPath();
        ctx.moveTo(0, 0); // Start at the center
        ctx.lineTo(handLength, 0); // Draw line outwards along the new x-axis
        
        ctx.strokeStyle = handColor;
        ctx.lineWidth = handWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
    }

    // ### Game Logic Functions ###

    function getQuadrantFromAngle(angle) {
        // Normalizes angle to 0-359 and returns quadrant index (0, 1, 2, or 3)
        const normalizedAngle = (angle % 360 + 360) % 360;
        return Math.floor(normalizedAngle / 90);
    }

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
        
        // **FIXED**: Increase speed to make the game harder
        gameSpeed += 0.15;
        
        // Reverse direction
        handDirection *= -1;
        
        // Pick a new color
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

        prevAngle = handAngle;
        handAngle += gameSpeed * handDirection;

        const prevQuadrant = getQuadrantFromAngle(prevAngle);
        const currentQuadrant = getQuadrantFromAngle(currentQuadrant);
        const targetQuadrant = quadrantColors.indexOf(handColor);

        // Loss condition: if we just left the target quadrant without scoring
        if (prevQuadrant !== currentQuadrant && prevQuadrant === targetQuadrant) {
            handleFailure();
            return; 
        }
        
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
