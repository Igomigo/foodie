"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Sparkles } from "lucide-react";
import { assistantName } from "@/data/assistant";

type Position = { x: number; y: number };

export default function AssistantLauncher({ onOpen }: { onOpen: () => void }) {
  const bounds = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<Position | null>(null);
  const gesture = useRef<{
    pointerId: number;
    start: Position;
    origin: Position;
    moved: boolean;
  } | null>(null);
  const dragged = useRef(false);

  function keepInBounds(next: Position) {
    const area = bounds.current!;
    const target = button.current!;
    return {
      x: Math.max(0, Math.min(next.x, area.clientWidth - target.offsetWidth)),
      y: Math.max(0, Math.min(next.y, area.clientHeight - target.offsetHeight)),
    };
  }

  useEffect(() => {
    // Rotation and window resizing must never leave the launcher off-screen.
    const observer = new ResizeObserver(() => {
      setPosition((previous) => previous && keepInBounds(previous));
    });
    observer.observe(bounds.current!);
    observer.observe(button.current!);
    return () => observer.disconnect();
  }, []);

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    const area = bounds.current!.getBoundingClientRect();
    const target = event.currentTarget.getBoundingClientRect();
    const origin = { x: target.left - area.left, y: target.top - area.top };
    dragged.current = false;
    gesture.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.start.x;
    const dy = event.clientY - current.start.y;
    if (!current.moved && Math.hypot(dx, dy) < 6) return;
    current.moved = true;
    dragged.current = true;
    setPosition(
      keepInBounds({ x: current.origin.x + dx, y: current.origin.y + dy }),
    );
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (gesture.current?.pointerId !== event.pointerId) return;
    gesture.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={bounds}
      className="pointer-events-none fixed inset-x-3 top-[max(12px,env(safe-area-inset-top))] bottom-[calc(100px+env(safe-area-inset-bottom))] z-40 md:inset-x-5 md:bottom-5"
    >
      <button
        ref={button}
        type="button"
        title="Drag to move · Tap to ask Amaka"
        aria-describedby="assistant-move-hint"
        onPointerDown={startDrag}
        onPointerMove={move}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          gesture.current = null;
        }}
        onClick={(event) => {
          if (dragged.current && event.detail !== 0) {
            dragged.current = false;
            return;
          }
          onOpen();
        }}
        onKeyDown={(event) => {
          if (event.key === "Home") {
            event.preventDefault();
            setPosition(null);
            return;
          }
          const steps: Record<string, Position> = {
            ArrowLeft: { x: -24, y: 0 },
            ArrowRight: { x: 24, y: 0 },
            ArrowUp: { x: 0, y: -24 },
            ArrowDown: { x: 0, y: 24 },
          };
          const step = steps[event.key];
          if (!step) return;
          event.preventDefault();
          const area = bounds.current!.getBoundingClientRect();
          const target = event.currentTarget.getBoundingClientRect();
          setPosition(
            keepInBounds({
              x: target.left - area.left + step.x,
              y: target.top - area.top + step.y,
            }),
          );
        }}
        style={position ? { left: position.x, top: position.y } : undefined}
        className={`pointer-events-auto absolute ${position ? "" : "right-0 bottom-0"} flex min-h-13 max-w-full touch-none cursor-grab items-center gap-2.5 rounded-full border border-foodie-sage/20 bg-foodie-forest px-5 text-xs font-medium text-foodie-paper shadow-[0_8px_32px_#263c3130] transition-colors select-none hover:bg-foodie-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foodie-action active:cursor-grabbing`}
      >
        <Sparkles size={18} strokeWidth={1.5} aria-hidden="true" />
        Ask {assistantName}
        <span
          className="size-1.5 rounded-full bg-foodie-sage"
          aria-hidden="true"
        />
      </button>
      <span id="assistant-move-hint" className="sr-only">
        Drag to move. With the button focused, use arrow keys to move or Home to
        reset. Press Enter to open the chat.
      </span>
    </div>
  );
}
