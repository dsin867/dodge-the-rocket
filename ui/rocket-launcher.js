class Rocket {
    constructor(onExplode, onDodged) {
        this.element = document.createElement('div');
        this.element.className = 'rocket';
        
        // Only rocket emojis - facing upward with increased speed
        this.element.textContent = '🚀';
        this.element.style.color = '#ff6b6b';
        this.element.classList.add('rocket-type-1');
        
        // Speed scaled by difficulty multiplier (easy=slow, hard=fast)
        const speedMult = window.rocketSpeedMultiplier || 1.0;
        const duration = (3 + Math.random() * 3) * speedMult;
        this.element.style.setProperty('--duration', `${duration}s`);

        // Spawn logic: equal 25% split — cursor-targeted, left edge, right edge, fully random
        const wallOffset = 58;
        const rocketSize = 50;
        const halfRocket = Math.floor(rocketSize / 2);
        const playAreaWidth = window.innerWidth - 2 * wallOffset;
        const sideZone = Math.floor(playAreaWidth * 0.2);
        let randomLeft;
        const roll = Math.random();
        if (roll < 0.25) {
            // Target current cursor X — counters camping at any position
            const cursorX = window.currentMousePosition
                ? window.currentMousePosition.x + wallOffset
                : wallOffset + playAreaWidth / 2;
            const jitter = Math.floor((Math.random() - 0.5) * 20);
            randomLeft = Math.max(wallOffset - halfRocket,
                Math.min(window.innerWidth - wallOffset - halfRocket,
                    cursorX - halfRocket + jitter));
        } else if (roll < 0.5) {
            // Left edge zone
            randomLeft = wallOffset - halfRocket + Math.floor(Math.random() * sideZone);
        } else if (roll < 0.75) {
            // Right edge zone
            randomLeft = window.innerWidth - wallOffset - halfRocket - Math.floor(Math.random() * sideZone);
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

        // Game over on collision with rocket — interval only, mouseenter is too inaccurate
        // for rotated emoji elements (fires on full transparent bounding box)

        // Accurate collision detection using a tight circle around the rocket center
        this.checkCollision = () => {
            if (!this.element.parentNode) return;
            
            const rect = this.element.getBoundingClientRect();
            const mouseTrailCanvas = document.getElementById('mouseTrailCanvas');
            if (!mouseTrailCanvas) return;
            
            const canvasRect = mouseTrailCanvas.getBoundingClientRect();
            const mousePos = window.currentMousePosition || { x: 0, y: 0 };
            
            // Convert canvas-relative mouse coords back to screen coords
            const screenMouseX = mousePos.x + canvasRect.left;
            const screenMouseY = mousePos.y + canvasRect.top;

            const rocketCenterX = rect.left + rect.width / 2;
            const rocketCenterY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(screenMouseX - rocketCenterX, 2) + 
                Math.pow(screenMouseY - rocketCenterY, 2)
            );
            
            // 26px — covers the rocket body without firing on transparent corners
            if (distance < 26 && onExplode) {
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