'use strict'

interface Player {
  y: number
  score: number
}

interface Game {
  canvas: HTMLCanvasElement
  player: Player
  oppenent: Player
  ball: {
    x: number
    y: number
    speed: {
      x: number
      y: number
    }
  }
}

const PLAYER_HEIGHT = 100
const PLAYER_WIDTH = 5
const BALL_DEFAULT_SPEEDX = 4
const BALL_DEFAULT_SPEEDY = 2
const Y_MARGIN = 30
const BALL_R = 5
const Y_PADDLE_COL = Y_MARGIN + PLAYER_WIDTH + BALL_R

class Player {
  constructor(canvas: HTMLCanvasElement) {
    this.y = canvas.height / 2 - PLAYER_HEIGHT / 2
    this.score = 0
  }
}

class Game {
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.player = new Player(canvas)
    this.oppenent = new Player(canvas)
    this.ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      speed: {
        x: BALL_DEFAULT_SPEEDX,
        y: BALL_DEFAULT_SPEEDY,
      },
    }
    this.canvas.addEventListener('mousemove', (e) => this.playerMove(e))
  }

  draw() {
    var context = this.canvas.getContext('2d') as CanvasRenderingContext2D
    // Draw field
    context.fillStyle = 'black'
    context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    // Draw middle line
    context.strokeStyle = 'white'
    context.beginPath()
    context.moveTo(this.canvas.width / 2, 0)
    context.lineTo(this.canvas.width / 2, this.canvas.height)
    context.stroke()
    // Draw players
    context.fillStyle = 'white'
    context.fillRect(Y_MARGIN, this.player.y, PLAYER_WIDTH, PLAYER_HEIGHT)
    context.fillRect(
      this.canvas.width - PLAYER_WIDTH - Y_MARGIN,
      this.oppenent.y,
      PLAYER_WIDTH,
      PLAYER_HEIGHT
    )
    // Draw ball
    context.beginPath()
    context.fillStyle = 'white'
    context.arc(this.ball.x, this.ball.y, BALL_R, 0, Math.PI * 2, false)
    context.fill()
  }

  changeDirection(playerY: number) {
    var impact = this.ball.y - playerY - PLAYER_HEIGHT / 2
    var ratio = 100 / (PLAYER_HEIGHT / 2)
    // Get a value between 0 and 10
    this.ball.speed.y = (impact * ratio) / 10
  }

  playerMove(e: MouseEvent) {
    let canvasLocation = this.canvas.getBoundingClientRect()
    let mouseLocation = e.clientY - canvasLocation.y
    if (mouseLocation < PLAYER_HEIGHT / 2) {
      this.player.y = 0
    } else if (mouseLocation > this.canvas.height - PLAYER_HEIGHT / 2) {
      this.player.y = this.canvas.height - PLAYER_HEIGHT
    } else {
      this.player.y = mouseLocation - PLAYER_HEIGHT / 2
    }
  }

  computerMove() {
    this.oppenent.y += this.ball.speed.y * 0.85
  }

  collide(player: Player) {
    if (this.ball.y >= player.y && this.ball.y <= player.y + PLAYER_HEIGHT) {
      // Increase speed and change direction
      this.ball.speed.x *= -1.1
      this.changeDirection(player.y)
    }
  }

  score(player: Player) {
    // Set ball and players to the center
    this.ball.x = this.canvas.width / 2
    this.ball.y = this.canvas.height / 2
    this.player.y = this.canvas.height / 2 - PLAYER_HEIGHT / 2
    this.oppenent.y = this.canvas.height / 2 - PLAYER_HEIGHT / 2

    // Reset speed
    this.ball.speed.x = BALL_DEFAULT_SPEEDX

    // Add point
    player.score++
  }

  ballMove() {
    // Wall collision
    if (this.ball.y > this.canvas.height || this.ball.y < 0) {
      this.ball.speed.y *= -1
    }
    // Player collision
    if (
      this.ball.x > this.canvas.width - Y_PADDLE_COL &&
      this.ball.x <= this.canvas.width - Y_PADDLE_COL + this.ball.speed.x
    ) {
      this.collide(this.oppenent)
    } else if (
      this.ball.x < Y_PADDLE_COL &&
      this.ball.x >= Y_PADDLE_COL + this.ball.speed.x
    ) {
      this.collide(this.player)
    }
    // Point scored
    if (this.ball.x >= this.canvas.width) {
      this.score(this.player)
    } else if (this.ball.x <= 0) {
      this.score(this.oppenent)
    }
    // Actual move
    this.ball.x += this.ball.speed.x
    this.ball.y += this.ball.speed.y
  }

  play() {
    this.draw()
    this.computerMove()
    this.ballMove()
    requestAnimationFrame(() => this.play())
  }
}

document.addEventListener('DOMContentLoaded', function () {
  let canvas = document.querySelector('canvas#canvas') as HTMLCanvasElement
  let game = new Game(canvas)

  game.draw()
  game.play()
})
