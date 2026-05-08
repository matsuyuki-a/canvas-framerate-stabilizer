import type { TargetFps, StabilizerStats } from '../FramerateStabilizer'

export class Overlay {
  private readonly hud: HTMLElement
  private readonly controls: HTMLElement
  private onFpsChange: (fps: TargetFps) => void = () => {}

  constructor(initialFps: TargetFps = 60) {
    this.hud = document.getElementById('hud')!
    this.controls = document.getElementById('controls')!
    this.buildControls(initialFps)
  }

  private buildControls(initialFps: TargetFps): void {
    const label = document.createElement('span')
    label.textContent = 'Target FPS:'

    const btn30 = this.makeButton('30 fps', 30)
    const btn60 = this.makeButton('60 fps', 60)

    if (initialFps === 60) btn60.classList.add('active')
    else btn30.classList.add('active')

    this.controls.append(label, btn30, btn60)
  }

  private makeButton(text: string, fps: TargetFps): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.textContent = text
    btn.dataset['fps'] = String(fps)
    btn.addEventListener('click', () => {
      this.controls.querySelectorAll('button').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      this.onFpsChange(fps)
    })
    return btn
  }

  onFpsChanged(callback: (fps: TargetFps) => void): void {
    this.onFpsChange = callback
  }

  updateStats(stats: StabilizerStats): void {
    this.hud.innerHTML = `
      <div>Monitor: <strong>${stats.displayHz} Hz</strong></div>
      <div>Target:&nbsp; <strong>${stats.targetFps} fps</strong></div>
      <div>Actual:&nbsp; <strong style="color:${this.fpsColor(stats.measuredFps, stats.targetFps)}">${stats.measuredFps} fps</strong></div>
    `
  }

  private fpsColor(measured: number, target: number): string {
    const ratio = measured / target
    if (ratio >= 0.95) return '#4dff91'
    if (ratio >= 0.80) return '#ffcc44'
    return '#ff5555'
  }
}
