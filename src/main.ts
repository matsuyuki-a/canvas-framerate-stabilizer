import { FramerateStabilizer } from './FramerateStabilizer'
import type { TargetFps } from './FramerateStabilizer'
import { BouncingBallsDemo } from './demo/BouncingBallsDemo'
import { Overlay } from './ui/Overlay'

function main(): void {
  const INITIAL_FPS: TargetFps = 60

  const canvas = document.getElementById('canvas') as HTMLCanvasElement
  const demo = new BouncingBallsDemo(canvas)
  const overlay = new Overlay(INITIAL_FPS)

  const stabilizer = new FramerateStabilizer(
    {
      onRender: (deltaMs) => demo.render(deltaMs),
      onStats: (stats) => overlay.updateStats(stats),
    },
    INITIAL_FPS,
  )

  overlay.onFpsChanged((fps: TargetFps) => {
    stabilizer.setTargetFps(fps)
  })

  window.addEventListener('resize', () => {
    demo.resize()
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stabilizer.stop()
    } else {
      stabilizer.start()
    }
  })

  stabilizer.start()
}

main()
