import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

import DrawboardManager, { DrawMode } from './drawboard'

const DEFAULT_MODE = DrawMode.PEN
const DEFAULT_COLOR = '#FF0000'
const DEFAULT_BRUSH_WIDTH = 4

export interface DrawboardHandlers {
  draw: (data: any) => void;
}
interface DrawboardProps {
  onDraw: (data: any) => void;
}

const Drawboard = forwardRef<DrawboardHandlers, DrawboardProps>(({ onDraw }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawboardRef = useRef<any | null>(null)

  useImperativeHandle(ref, () => {
    return {
      draw(data: any) {
        if (!drawboardRef.current) return
        drawboardRef.current.draw_state(data)
      }
    }
  }, []);

  useEffect(() => {
    if (drawboardRef.current) return
    if (!canvasRef.current || !containerRef.current) {
      console.error('canvas not found!');
      return;
    }

    canvasRef.current.width = containerRef.current.clientWidth
    canvasRef.current.height = containerRef.current.clientHeight

    drawboardRef.current = new DrawboardManager({
      canvas: canvasRef.current,
      brush_color: DEFAULT_COLOR,
      brush_width: DEFAULT_BRUSH_WIDTH,
      mode: DEFAULT_MODE,
      on_draw: onDraw,
    });
  }, [canvasRef.current, onDraw])

  return (
    <div ref={containerRef} className="flex-1 w-full h-full">
      <canvas style={{height: 'calc(100vh - 40px)', width: '100%'}} ref={canvasRef} />
    </div>
  )
})

export default React.memo(Drawboard)
