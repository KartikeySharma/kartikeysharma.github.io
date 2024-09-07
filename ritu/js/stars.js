const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;     
    init()
});

// Heart shape object (fixed orientation)
function Heart(x, y, size, color) {
    this.x = x
    this.y = y
    this.size = size
    this.color = color
    this.velocity = {
        x: (Math.random() - 0.5) * 4, // Reduced velocity for smoother movement
        y: 3
    }
    this.friction = 0.8
    this.gravity = 1
}

Heart.prototype.draw = function() {
    c.save()
    c.beginPath()
    // Drawing a heart shape using fixed Bezier curves (no rotation)
    c.moveTo(this.x, this.y)
    c.bezierCurveTo(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size)
    c.bezierCurveTo(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y)
    c.fillStyle = this.color
    c.shadowColor = '#000080' // Light pink shadow
    c.shadowBlur = 20
    c.fill()
    c.closePath()
    c.restore()
}

Heart.prototype.update = function() {
    this.draw()

    // When heart hits bottom of screen
    if (this.y + this.size + this.velocity.y > canvas.height - groundHeight) {
        this.velocity.y = -this.velocity.y * this.friction
        this.shatter()
    } else {
        this.velocity.y += this.gravity
    }

    // Hits side of screen
    if (this.x + this.size + this.velocity.x > canvas.width || this.x - this.size <= 0) {
        this.velocity.x = -this.velocity.x * this.friction
        this.shatter()
    }

    this.x += this.velocity.x
    this.y += this.velocity.y
}

Heart.prototype.shatter = function(){
    this.size -= 3
    for (let i = 0; i < 8; i++) {
        miniHearts.push(new MiniHeart(this.x, this.y, 2))
    }
}

// Rose shape object (abstract white roses as clusters of circles)
function Rose(x, y, size) {
    this.x = x
    this.y = y
    this.size = size
    this.opacity = Math.random() * 0.6 + 0.4 // Varying opacity for a soft effect
}

Rose.prototype.draw = function() {
    c.save()
    c.beginPath()
    // Drawing a cluster of circles to simulate an abstract rose
    for (let i = 0; i < 5; i++) {
        const offsetX = (Math.random() - 0.5) * this.size
        const offsetY = (Math.random() - 0.5) * this.size
        c.arc(this.x + offsetX, this.y + offsetY, this.size / 3, 0, Math.PI * 2, false)
    }
    c.fillStyle = `rgba(255, 255, 255, ${this.opacity})` // White color with varying opacity
    c.shadowColor = 'rgba(255, 255, 255, 0.7)' // Soft glow effect
    c.shadowBlur = 10
    c.fill()
    c.closePath()
    c.restore()
}

function MiniHeart(x, y, size, color) {
    Heart.call(this, x, y, size, color)
    this.velocity = {
        x: (Math.random() - 0.5) * 6, // Reduced velocity for smoother mini heart movement
        y: (Math.random() - 0.5) * 6 
    }
    this.friction = 0.8
    this.gravity = 0.1
    this.ttl = 100
    this.opacity = 1
}

MiniHeart.prototype.draw = function() {
    c.save()
    c.beginPath()
    c.moveTo(this.x, this.y)
    c.bezierCurveTo(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size)
    c.bezierCurveTo(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y)
    c.fillStyle = `rgba(255,209,220, ${this.opacity})` // Light pink hearts
    c.shadowColor = '#000080'
    c.shadowBlur = 20
    c.fill()
    c.closePath()
    c.restore()
}

MiniHeart.prototype.update = function() {
    this.draw()

    if (this.y + this.size + this.velocity.y > canvas.height - groundHeight) {
        this.velocity.y = -this.velocity.y * this.friction
    } else {
        this.velocity.y += this.gravity
    }

    this.x += this.velocity.x
    this.y += this.velocity.y
    this.ttl -= 1
    this.opacity -= 0.0001 * this.ttl
}

// Custom soothing navy blue background
const backgroundGradient = c.createLinearGradient(0, 0, canvas.width, canvas.height)
backgroundGradient.addColorStop(0, '#1A43BF') // Navy blue
backgroundGradient.addColorStop(1, '#0A2472') // Deep blue gradient

let hearts
let miniHearts
let roses
let backgroundHearts
let ticker = 0
let randomSpawnRate = 75
const groundHeight = 0.09 * canvas.height
let inf = 1e9

function init() {
    hearts = []
    miniHearts = []
    roses = []
    backgroundHearts = []
   
    for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 5
        backgroundHearts.push(new Heart(x, y, size, 'white'))
    }

    // Add small white rose shapes
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 10 + 5
        roses.push(new Rose(x, y, size))
    }
}

function animate() {
    c.clearRect(0, 0, 0, canvas.height)
    c.fillStyle = backgroundGradient
    c.fillRect(0, 0, canvas.width, canvas.height)

    backgroundHearts.forEach(backgroundHeart => {
        backgroundHeart.draw()
    })

    roses.forEach(rose => {
        rose.draw()
    })

    hearts.forEach((heart, index) => {
        heart.update();
        if (heart.size == 0) {
            hearts.splice(index, 1)
        }
    });

    miniHearts.forEach((miniHeart, index) => {
        miniHeart.update();
        if (miniHeart.ttl == 0) {
            miniHearts.splice(index, 1)
        }
    });

    ticker++
    if (ticker >= inf) {
        ticker = 0
    }
    if (ticker % randomSpawnRate == 0) {
        const size = 12
        const x = Math.max(size, Math.random() * canvas.width - size)
        hearts.push(new Heart(x, -100, size, '#FFD1DC')) // Light pink hearts
        randomSpawnRate = Math.floor(Math.random() * (200 - 125 + 1) + 125)
    }

    requestAnimationFrame(animate)
}

init()
animate()
