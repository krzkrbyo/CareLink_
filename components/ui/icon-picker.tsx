"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ICON_OPTIONS_BY_CONTEXT,
  resolveCareIcon,
  type CareIconContext,
  type CareIconKey,
} from "@/lib/icons/registry";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: CareIconKey;
  onChange: (value: CareIconKey) => void;
  context: CareIconContext;
  compact?: boolean;
  className?: string;
}

const GAP_PX = 8;
const VIEWPORT_PADDING_PX = 12;

export function IconPicker({
  value,
  onChange,
  context,
  compact = false,
  className,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const options = ICON_OPTIONS_BY_CONTEXT[context];
  const SelectedIcon = resolveCareIcon(value, options[0]);

  useLayoutEffect(() => {
    if (!open) {
      setPopupPos(null);
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      const popup = popupRef.current;
      if (!button || !popup) return;

      const buttonRect = button.getBoundingClientRect();
      const popupWidth = popup.offsetWidth;
      const popupHeight = popup.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = buttonRect.left - popupWidth - GAP_PX;
      let top = buttonRect.top;

      if (left < VIEWPORT_PADDING_PX) {
        left = buttonRect.right + GAP_PX;
      }

      if (left + popupWidth > viewportWidth - VIEWPORT_PADDING_PX) {
        left = viewportWidth - VIEWPORT_PADDING_PX - popupWidth;
      }
      if (left < VIEWPORT_PADDING_PX) {
        left = VIEWPORT_PADDING_PX;
      }

      if (top + popupHeight > viewportHeight - VIEWPORT_PADDING_PX) {
        top = viewportHeight - VIEWPORT_PADDING_PX - popupHeight;
      }
      if (top < VIEWPORT_PADDING_PX) {
        top = VIEWPORT_PADDING_PX;
      }

      setPopupPos({ top, left });
    }

    updatePosition();
    const frame = requestAnimationFrame(updatePosition);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !popupRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function selectIcon(key: CareIconKey) {
    onChange(key);
    setOpen(false);
  }

  const popup =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={popupRef}
        role="dialog"
        aria-label="Elegir ícono"
        style={{
          position: "fixed",
          top: popupPos?.top ?? -9999,
          left: popupPos?.left ?? -9999,
          visibility: popupPos ? "visible" : "hidden",
        }}
        className="z-50 w-[min(calc(100vw-2rem),16rem)] rounded-2xl border-2 border-care-secondary/50 bg-white p-3 shadow-xl"
      >
        <div className="grid grid-cols-6 gap-1.5">
          {options.map((key) => {
            const Icon = resolveCareIcon(key, options[0]);
            const selected = value === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectIcon(key)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border-2 transition-colors",
                  selected
                    ? "border-care-accent-dark bg-care-accent-dark text-white"
                    : "border-care-secondary/50 bg-white text-care-muted hover:border-care-accent hover:bg-care-primary"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div ref={rootRef} className={cn("relative shrink-0", className)}>
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((current) => !current)}
          className={cn(
            "flex items-center justify-center rounded-xl border-2 border-care-secondary bg-white text-care-accent-darker shadow-sm transition-all",
            "hover:border-care-accent hover:bg-care-primary focus:border-care-accent focus:outline-none focus:ring-4 focus:ring-care-accent/20",
            open && "border-care-accent ring-4 ring-care-accent/20",
            compact
              ? "h-[54px] w-[54px]"
              : "gap-3 rounded-2xl border-care-secondary/50 bg-care-primary/40 px-4 py-3"
          )}
          aria-label="Elegir ícono"
          aria-expanded={open}
        >
          <SelectedIcon className={cn(compact ? "h-6 w-6" : "h-5 w-5")} />
          {!compact && (
            <span className="text-sm font-medium text-care-muted">Clic para elegir ícono</span>
          )}
        </button>
      </div>
      {popup}
    </>
  );
}
