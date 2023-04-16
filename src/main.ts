import { init, Sprite, GameLoop, initKeys, keyPressed } from 'kontra'

let { canvas, context } = init('canvas')

initKeys()

let sprites: Sprite[] = []

const createAsteroid = (x: number, y: number, radius: number) => {
    const asteroid = Sprite({
        type: 'asteroid',
        x,
        y,
        dx: Math.random() * 4 - 2,
        dy: Math.random() * 4 - 2,
        radius,
        render() {
            this.context.strokeStyle = '#000'
            this.context.beginPath()
            this.context.arc(0, 0, this.radius, 0, Math.PI * 2)
            this.context.stroke()
        },
    })

    return asteroid
}

for (let i = 0; i < 4; i++) {
    sprites.push(createAsteroid(100, 100, 30))
}

const ship = Sprite({
    x: 300,
    y: 300,
    radius: 6,
    dt: 0,
    render() {
        this.context.strokeStyle = '#000'
        this.context.beginPath()
        this.context.moveTo(-3, -5)
        this.context.lineTo(12, 0)
        this.context.lineTo(-3, 5)
        this.context.closePath()
        this.context.stroke()
    },
    update() {
        if (keyPressed('arrowleft')) {
            this.rotation -= 0.07
        } else if (keyPressed('arrowright')) {
            this.rotation += 0.07
        }
        const cos = Math.cos(this.rotation)
        const sin = Math.sin(this.rotation)
        if (keyPressed('arrowup')) {
            this.ddx = cos * 0.05
            this.ddy = sin * 0.05
        } else {
            this.ddx = 0
            this.ddy = 0
        }
        this.advance()
        if (this.velocity.length() > 5) {
            this.dx *= 0.95
            this.dy *= 0.95
        }
        this.dt += 1 / 60
        if (keyPressed('space') && this.dt > 0.25) {
            this.dt = 0

            const bullet = Sprite({
                color: '#000',
                x: this.x + cos * 12,
                y: this.y + sin * 12,
                dx: this.dx + cos * 5,
                dy: this.dy + sin * 5,
                ttl: 50,
                radius: 2,
                width: 2,
                height: 2,
            })
            sprites.push(bullet)
        }
    },
})

sprites.push(ship)

let loop = GameLoop({
    update: function () {
        sprites.forEach(sprite => {
            sprite.update()

            if (sprite.x < -sprite.radius) {
                sprite.x = canvas.width + sprite.radius
            }
            if (sprite.x > canvas.width + sprite.radius) {
                sprite.x = -sprite.radius
            }
            if (sprite.y < -sprite.radius) {
                sprite.y = canvas.height + sprite.radius
            }
            if (sprite.y > canvas.height + sprite.radius) {
                sprite.y = -sprite.radius
            }
        })
        for (let i = 0; i < sprites.length; i++) {
            if (sprites[i].type === 'asteroid') {
                for (let j = 0; j < sprites.length; j++) {
                    if (sprites[j].type !== 'asteroid') {
                        let asteroid = sprites[i]
                        let sprite = sprites[j]
                        let dx = asteroid.x - sprite.x
                        let dy = asteroid.y - sprite.y
                        if (
                            Math.hypot(dx, dy) <
                            asteroid.radius + sprite.radius
                        ) {
                            asteroid.ttl = 0
                            sprite.ttl = 0
                            if (asteroid.radius > 10) {
                                for (var x = 0; x < 3; x++) {
                                    sprites.push(
                                        createAsteroid(
                                            asteroid.x,
                                            asteroid.y,
                                            asteroid.radius / 2.5
                                        )
                                    )
                                }
                            }
                            break
                        }
                    }
                }
            }
        }
        sprites = sprites.filter(sprite => sprite.isAlive())
    },
    render: function () {
        sprites.forEach(sprite => {
            sprite.render()
        })
    },
})

loop.start()
