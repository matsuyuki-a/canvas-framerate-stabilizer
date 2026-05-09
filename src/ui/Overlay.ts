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
    label.textContent = 'Target FPS:';
    const targetFpsList = [7, 30, 50, 60, 100, 120] as const;
    const buttonElements = targetFpsList.map(item => {
      const buttonElm = this.makeButton(`${item} fps`, item)
      if (item === initialFps) {
        buttonElm.classList.add("active")
      }
      return buttonElm;
    });

    this.controls.append(label, ...buttonElements)
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
      <div>Elapsed: <strong>${Math.round(stats.elapsedMs * 1000) / 1000} ms/raf</strong></div>
      <div>Monitor: <strong>${stats.displayHz} Hz</strong></div>
      <div>Target: <strong>${stats.targetFps} fps</strong></div>
      <div>Actual: <strong style="color:${this.fpsColor(stats.measuredFps, stats.targetFps)}">${stats.measuredFps} fps</strong></div>
    `
  }

  private fpsColor(measured: number, target: number): string {
    const ratio = measured / target
    if (ratio >= 0.95) return '#4dff91'
    if (ratio >= 0.80) return '#ffcc44'
    return '#ff5555'
  }
}
