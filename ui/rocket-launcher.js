class Rocket {
    constructor(onExplode, onDodged) {
        this.element = document.createElement('div');
        this.element.className = 'rocket';
        
        // Only rocket emojis - facing upward with increased speed
        this.element.textContent = '🚀';
        this.element.style.color = '#ff6b6b';
        this.element.classList.add('rocket-type-1');
        
        // Faster speed for rockets (3-6 seconds instead of 8-10)
        const duration = 3 + Math.random() * 3;
        this.element.style.setProperty('--duration', `${duration}s`);

        // Spawn with slight bias towards left side, middle, and right side zones
        const wallOffset = 58;
        const rocketSize = 50;
        const playAreaWidth = window.innerWidth - 2 * wallOffset;
        const sideZone = Math.floor(playAreaWidth * 0.2);
        const middleZone = Math.floor(playAreaWidth * 0.2);
        const middleStart = wallOffset + Math.floor((playAreaWidth - middleZone) / 2);
        let randomLeft;
        const roll = Math.random();
        if (roll < 0.2) {
            // Left side zone
            randomLeft = wallOffset + Math.floor(Math.random() * sideZone);
        } else if (roll < 0.4) {
            // Right side zone
            randomLeft = wallOffset + playAreaWidth - rocketSize - Math.floor(Math.random() * sideZone);
        } else if (roll < 0.6) {
            // Middle zone
            randomLeft = middleStart + Math.floor(Math.random() * (middleZone - rocketSize));
        } else {
            // Fully random across play area
            randomLeft = wallOffset + Math.floor(Math.random() * (playAreaWidth - rocketSize));
        }
        this.element.style.left = `${randomLeft}px`;

        document.body.appendChild(this.element);
        this.dodged = false;

        // Remove rocket when animation ends and count as dodged if not hit
        this.element.addEventListener('animationend', () => {
            if (!this.dodged && onDodged) {
                this.dodged = true;
                onDodged();
            }
            this.element.remove();
        });

        // Game over on collision with rocket
        this.element.addEventListener('mouseenter', () => {
            if (onExplode) {
                onExplode();
            }
        });

        // Enhanced collision detection for rockets
        this.checkCollision = () => {
            if (!this.element.parentNode) return;
            
            const rect = this.element.getBoundingClientRect();
            const mouseTrailCanvas = document.getElementById('mouseTrailCanvas');
            if (!mouseTrailCanvas) return;
            
            const canvasRect = mouseTrailCanvas.getBoundingClientRect();
            
            // Get current mouse position from the canvas tracking
            const mousePos = window.currentMousePosition || { x: 0, y: 0 };
            
            const rocketCenterX = rect.left + rect.width / 2 - canvasRect.left;
            const rocketCenterY = rect.top + rect.height / 2 - canvasRect.top;
            
            const distance = Math.sqrt(
                Math.pow(mousePos.x - rocketCenterX, 2) + 
                Math.pow(mousePos.y - rocketCenterY, 2)
            );
            
            // Collision threshold for rockets
            if (distance < 30 && onExplode) {
                onExplode();
            }
        };

        this.collisionInterval = setInterval(this.checkCollision, 50);
        
        this.element.addEventListener('animationend', () => {
            clearInterval(this.collisionInterval);
        });
    }
}

class Collectible {
    constructor(onCollected) {
        this.element = document.createElement('div');
        this.element.className = 'collectible';
        
        // Various collectible emojis (not rockets)
        const collectibleEmojis = ['🍎', '🍊', '🍇', '🍓', '🥇', '💎', '🌟', '🎁'];
        const randomEmoji = collectibleEmojis[Math.floor(Math.random() * collectibleEmojis.length)];
        
        this.element.textContent = randomEmoji;
        this.element.style.color = '#4ecdc4';
        
        // Slower speed for collectibles (6-10 seconds)
        const duration = 6 + Math.random() * 4;
        this.element.style.setProperty('--duration', `${duration}s`);

        // Spawn across the full play area (wall-to-wall), using px to avoid safe zones near walls
        const wallOffset = 58;
        const collectibleSize = 35;
        const playAreaWidth = window.innerWidth - 2 * wallOffset;
        const randomLeft = wallOffset + Math.floor(Math.random() * (playAreaWidth - collectibleSize));
        this.element.style.left = `${randomLeft}px`;

        document.body.appendChild(this.element);
        this.collected = false;

        // Remove collectible when animation ends
        this.element.addEventListener('animationend', () => {
            this.element.remove();
        });

        // Collect on mouse hover
        this.element.addEventListener('mouseenter', () => {
            if (!this.collected && onCollected) {
                this.collected = true;
                onCollected();
                this.element.remove();
            }
        });

        // Enhanced collision detection for collectibles
        this.checkCollision = () => {
            if (!this.element.parentNode || this.collected) return;
            
            const rect = this.element.getBoundingClientRect();
            const mouseTrailCanvas = document.getElementById('mouseTrailCanvas');
            if (!mouseTrailCanvas) return;
            
            const canvasRect = mouseTrailCanvas.getBoundingClientRect();
            
            // Get current mouse position from the canvas tracking
            const mousePos = window.currentMousePosition || { x: 0, y: 0 };
            
            const centerX = rect.left + rect.width / 2 - canvasRect.left;
            const centerY = rect.top + rect.height / 2 - canvasRect.top;
            
            const distance = Math.sqrt(
                Math.pow(mousePos.x - centerX, 2) + 
                Math.pow(mousePos.y - centerY, 2)
            );
            
            // Collection threshold
            if (distance < 25 && !this.collected && onCollected) {
                this.collected = true;
                onCollected();
                this.element.remove();
            }
        };

        this.collisionInterval = setInterval(this.checkCollision, 50);
        
        this.element.addEventListener('animationend', () => {
            clearInterval(this.collisionInterval);
        });
    }
}

class RocketLauncher {
    constructor(onGameOver, onRocketDodged, onCollectibleCollected) {
        this.onGameOver = onGameOver;
        this.onRocketDodged = onRocketDodged;
        this.onCollectibleCollected = onCollectibleCollected;
        this.launchedRockets = [];
        this.launchedCollectibles = [];
    }

    launchRocket() {
        // Increased rocket spawning with more frequent bursts
        const burstCount = Math.random() < 0.4 ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1; // 1-4 rockets per launch
        
        for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
                const rocket = new Rocket(this.onGameOver, this.onRocketDodged);
                this.launchedRockets.push(rocket);
            }, i * 100); // Reduced delay between burst rockets for tighter spacing
        }
        
        this.cleanupOldObjects();
    }

    launchCollectible() {
        const collectible = new Collectible(this.onCollectibleCollected);
        this.launchedCollectibles.push(collectible);
        this.cleanupOldObjects();
    }

    cleanupOldObjects() {
        // Clean up old rockets from memory
        this.launchedRockets = this.launchedRockets.filter(rocket => 
            rocket.element && rocket.element.parentNode
        );
        
        this.launchedCollectibles = this.launchedCollectibles.filter(collectible => 
            collectible.element && collectible.element.parentNode
        );
    }

    clearAllObjects() {
        // Clear rockets
        this.launchedRockets.forEach(rocket => {
            if (rocket.element && rocket.element.parentNode) {
                rocket.element.remove();
            }
            if (rocket.collisionInterval) {
                clearInterval(rocket.collisionInterval);
            }
        });
        this.launchedRockets = [];
        
        // Clear collectibles
        this.launchedCollectibles.forEach(collectible => {
            if (collectible.element && collectible.element.parentNode) {
                collectible.element.remove();
            }
            if (collectible.collisionInterval) {
                clearInterval(collectible.collisionInterval);
            }
        });
        this.launchedCollectibles = [];
        
        // Also clear any remaining objects from DOM
        document.querySelectorAll('.rocket').forEach(r => r.remove());
        document.querySelectorAll('.collectible').forEach(c => c.remove());
    }
}