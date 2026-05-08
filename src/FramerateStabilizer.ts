export type TargetFps = 30 | 60

export interface StabilizerStats {
  elapsedMs: number;
  targetFps: TargetFps
  measuredFps: number
  displayHz: number
}

export interface StabilizerCallbacks {
  onRender: (deltaMs: number) => void
  onStats: (stats: StabilizerStats) => void
}

export class FramerateStabilizer {
  private rafId: number = 0
  private targetFps: TargetFps
  private interval: number
  private accumulated: number = 0
  private lastTimestamp: number = -1

  private frameCount: number = 0
  private measureWindow: number = 0
  private measuredFps: number = 0

  private displayHz: number = 60
  private hzDetected: boolean = false
  private hzSamples: number[] = []

  constructor(
    private readonly callbacks: StabilizerCallbacks,
    initialFps: TargetFps = 60,
  ) {
    this.targetFps = initialFps
    this.interval = 1000 / initialFps
  }

  setTargetFps(fps: TargetFps): void {
    this.targetFps = fps
    this.interval = 1000 / fps
    this.accumulated = 0
  }

  start(): void {
    this.lastTimestamp = -1
    this.accumulated = 0
    this.rafId = requestAnimationFrame(this.tick)
  }

  stop(): void {
    cancelAnimationFrame(this.rafId)
  }

  private tick = (timestamp: number): void => {
    this.rafId = requestAnimationFrame(this.tick)

    if (this.lastTimestamp < 0) {
      this.lastTimestamp = timestamp
      return
    }

    const elapsed = timestamp - this.lastTimestamp
    this.lastTimestamp = timestamp

    if (!this.hzDetected) {
      this.hzSamples.push(elapsed)
      if (this.hzSamples.length >= 60) {
        this.displayHz = this.detectHz(this.hzSamples)
        this.hzDetected = true
      }
    }

    this.accumulated += elapsed

    if (this.accumulated >= this.interval) {
      this.accumulated -= this.interval
      // タブ復帰後の連続フレーム防止
      if (this.accumulated > this.interval * 2) {
        this.accumulated = 0
      }
      this.callbacks.onRender(this.interval)
      this.frameCount++
    }

    this.measureWindow += elapsed
    if (this.measureWindow >= 1000) {
      this.measuredFps = Math.round(this.frameCount / (this.measureWindow / 1000))
      this.frameCount = 0
      this.measureWindow = 0
      this.callbacks.onStats({
        targetFps: this.targetFps,
        measuredFps: this.measuredFps,
        displayHz: this.displayHz,
        elapsedMs: elapsed,
      })
    }
  }

  private detectHz(samples: number[]): number {
    const sorted = [...samples].sort()
    const median = sorted[Math.floor(sorted.length / 2)]
    return Math.round(1000000 / median) / 1000;
  }
}
