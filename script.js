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
    const quadrantColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f']; // Red, Blue, Green, Yellow

    // Game state variables
    let score = 0;
    let handAngle = 0; // In degrees
    let handColor;
    let handDirection = 1; // 1 for clockwise, -1 for counter-clockwise
    let gameSpeed = 1.5; // Degrees per frame
    let isPlaying = false;
    let gameOver = true;
    let missed = false; // Flag to track if the player missed a quadrant

    // ### Drawing Functions ###

    function drawRing() {
        // Draw the four colored quadrants
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            // Arc goes from i*90 degrees to (i+1)*90 degrees
            ctx.arc(centerX, centerY, radius, (i * Math.PI) / 2, ((i + 1) * Math.PI) / 2);
            ctx.closePath();
            ctx.fillStyle = quadrantColors[i];
            ctx.fill();
        }

        // Draw the inner circle to create the "ring" effect
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#34495e'; // Match canvas background
        ctx.fill();
    }

    function drawHand() {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((handAngle * Math.PI) / 180); // Convert angle to radians for rotation
        
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
        // Normalize angle to be between 0 and 360
        const normalizedAngle = (angle % 360 + 360) % 360;
        return Math.floor(normalizedAngle / 90);
    }

    function chooseNewHandColor() {
        const availableColors = quadrantColors.filter(color => color !== handColor);
        handColor = availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    function resetGame() {
        score = 0;
        handAngle = 0;
        gameSpeed = 1.5;
        handDirection = 1;
        isPlaying = true;
        gameOver = false;
        missed = false;

        // Start with a random hand color
        handColor = quadrantColors[Math.floor(Math.random() * 4)];
        
        scoreEl.textContent = `Score: ${score}`;
        messageEl.style.display = 'none';
        
        gameLoop();
    }

    function handleSuccess() {
        score++;
        scoreEl.textContent = `Score: ${score}`;
        
        // Reverse direction and increase speed
        handDirection *= -1;
        gameSpeed += 0.1;

        // Choose a new color for the hand
        chooseNewHandColor();
        missed = false; // Reset miss flag for the new target
    }

    function handleFailure() {
        isPlaying = false;
        gameOver = true;
        messageEl.innerHTML = `Game Over!<br>Final Score: ${score}<br>Press Spacebar to Restart`;
        messageEl.style.display = 'block';
    }

    function checkLossCondition() {
        const currentQuadrant = getQuadrantFromAngle(handAngle);
        const targetQuadrant = quadrantColors.indexOf(handColor);

        // If the hand is in the target quadrant, set the missed flag to false
        if (currentQuadrant === targetQuadrant) {
            missed = true;
        } 
        // If the hand is NOT in the target quadrant but the missed flag is true, it means it just passed it.
        else if (missed) {
            handleFailure();
        }
    }
    
    // ### Main Game Loop ###

    function gameLoop() {
        if (!isPlaying) return;

        // Update state
        handAngle += gameSpeed * handDirection;
        checkLossCondition();

        // Clear and redraw canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRing();
        drawHand();

        if (isPlaying) {
            requestAnimationFrame(gameLoop);
        }
    }

    // ### Event Listener ###
    
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent page from scrolling
            
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
