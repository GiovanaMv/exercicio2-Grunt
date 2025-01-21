const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    color: 'white',
    speed: 5,
};

let level = 1;
let collected = 0;
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

const enemies = [];
const collectibles = [];

let motionSupported = false;
let tilt = { x: 0, y: 0 };

function createEnemiesAndCollectibles() {
    enemies.length = 0;
    collectibles.length = 0;

    const numEnemies = level + 5;
    const numCollectibles = level;

    for (let i = 0; i < numEnemies; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 20,
            color: getRandomColor(),
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4
        });
    }

    for (let i = 0; i < numCollectibles; i++) {
        collectibles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 10,
            color: getRandomColor()
        });
    }
}

function getRandomColor() {
    const colors = ['#FF00FF', '#00FFFF', '#39FF14', '#FF4500', '#FF1493', '#FFFF00', '#00FF7F', '#9400D3', '#1E90FF', '#FFD700', '#FF69B4', '#8A2BE2'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.rect(enemy.x, enemy.y, enemy.size, enemy.size);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawCollectibles() {
    collectibles.forEach(collectible => {
        ctx.beginPath();
        ctx.arc(collectible.x, collectible.y, collectible.radius, 0, Math.PI * 2);
        ctx.fillStyle = collectible.color;
        ctx.fill();
        ctx.closePath();
    });
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateBallPosition() {
    if (keys.ArrowUp && ball.y - ball.radius > 0) ball.y -= ball.speed;
    if (keys.ArrowDown && ball.y + ball.radius < canvas.height) ball.y += ball.speed;
    if (keys.ArrowLeft && ball.x - ball.radius > 0) ball.x -= ball.speed;
    if (keys.ArrowRight && ball.x + ball.radius < canvas.width) ball.x += ball.speed;

    // Movimento por sensores
    if (motionSupported) {
        ball.x += tilt.x * ball.speed * 0.5;
        ball.y += tilt.y * ball.speed * 0.5;

        // Limitar os movimentos dentro do canvas
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;

        if (enemy.x <= 0 || enemy.x + enemy.size >= canvas.width) enemy.dx *= -1;
        if (enemy.y <= 0 || enemy.y + enemy.size >= canvas.height) enemy.dy *= -1;
    });
}

function checkCollisions() {
    enemies.forEach(enemy => {
        const distX = ball.x - (enemy.x + enemy.size / 2);
        const distY = ball.y - (enemy.y + enemy.size / 2);
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < ball.radius + enemy.size / 2) {
            alert('Você perdeu! Tente novamente.');
            resetGame();
        }
    });

    collectibles.forEach((collectible, index) => {
        const distX = ball.x - collectible.x;
        const distY = ball.y - collectible.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < ball.radius + collectible.radius) {
            collectibles.splice(index, 1);
            collected++;

            if (collected === level) {
                level++;
                if (level > 3) {
                    alert('Você venceu o jogo!');
                    level = 1;
                }
                resetGame();
            }
        }
    });
}

function resetGame() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    collected = 0;
    createEnemiesAndCollectibles();
}

function handleMotion(event) {
    if (!motionSupported) {
        motionSupported = true;
        alert('Movimento por sensores ativado!');
    }

    tilt.x = event.accelerationIncludingGravity.x || 0;
    tilt.y = -(event.accelerationIncludingGravity.y || 0);
}

function gameLoop() {
    clearCanvas();
    updateBallPosition();
    updateEnemies();
    checkCollisions();
    drawBall();
    drawEnemies();
    drawCollectibles();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

document.addEventListener('click', () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                } else {
                    alert('Permissão para sensores negada.');
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('devicemotion', handleMotion);
    }
});

if (/Mobi|Android/i.test(navigator.userAgent)) {
    alert('Toque na tela para ativar os sensores de movimento.');
}

createEnemiesAndCollectibles();
gameLoop();
