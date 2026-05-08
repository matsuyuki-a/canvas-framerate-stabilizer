interface Particle {
  angle: number
  radius: number
  speed: number
  size: number
  hue: number
}

export class BouncingBallsDemo {
  private readonly ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private polygonAngle: number = 0
  private readonly PARTICLE_COUNT = 80

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')
    this.ctx = ctx
    this.resize()
    this.initParticles()
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
  }

  private initParticles(): void {
    this.particles = Array.from({ length: this.PARTICLE_COUNT }, (_, i) => ({
      angle: (i / this.PARTICLE_COUNT) * Math.PI * 2,
      radius: 60 + Math.random() * 220,
      speed: (0.5 + Math.random() * 1.5) * (Math.random() < 0.5 ? 1 : -1),
      size: 2 + Math.random() * 5,
      hue: Math.random() * 360,
    }))
  }

  render(deltaMs: number): void {
    const { ctx, canvas } = this
    const dpr = window.devicePixelRatio || 1
    const W = canvas.width / dpr
    const H = canvas.height / dpr
    const cx = W / 2
    const cy = H / 2
    const dt = deltaMs / 1000

    // フェードクリア：モーションブレアでフレームレート差を視覚化
    ctx.fillStyle = 'rgba(15, 15, 19, 0.40)'
    ctx.fillRect(0, 0, W, H)

    for (const p of this.particles) {
      p.angle += p.speed * dt
      const x = cx + Math.cos(p.angle) * p.radius
      const y = cy + Math.sin(p.angle) * p.radius

      ctx.beginPath()
      ctx.arc(x, y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${p.hue}, 80%, 65%)`
      ctx.fill()
    }

    // 中心の回転六角形：フレーム間の角度ステップでガクつきを確認できる
    this.polygonAngle += 30 * dt

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((this.polygonAngle * Math.PI) / 180)

    const sides = 6
    const polyRadius = 50
    ctx.beginPath()
    for (let i = 0; i <= sides; i++) {
      const a = (i / sides) * Math.PI * 2
      const x = Math.cos(a) * polyRadius
      const y = Math.sin(a) * polyRadius
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()
  }
}
