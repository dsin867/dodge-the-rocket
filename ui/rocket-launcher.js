class Rocket {
    constructor(onExplode) {
        this.element = document.createElement('div');
        this.element.className = 'rocket';
        this.element.textContent = '🚀';

        const randomLeft = Math.floor(Math.random() * 80) + 10;
        this.element.style.left = `${randomLeft}%`;

        document.body.appendChild(this.element);

        this.element.addEventListener('animationend', () => {
            this.element.remove();
        });

        this.element.addEventListener('mouseenter', () => {
            if (onExplode) {
                onExplode();
            }
        });
    }
}

class RocketLauncher {
    constructor(onGameOver) {
        this.onGameOver = onGameOver;
    }

    launchRocket() {
        new Rocket(this.onGameOver);
    }
}