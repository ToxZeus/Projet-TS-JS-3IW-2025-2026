export type ToastType = "success" | "warning" | "error";

type ToastManager = {
  show: (message: string, type: ToastType) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
};

const toastTypeStyles: Record<ToastType, string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  warning: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  error: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
};

export function createToastManager(container: HTMLElement): ToastManager {
  const activeToasts: HTMLElement[] = [];
  const MAX_VISIBLE_TOASTS = 4;
  let lastToastSignature = "";
  let lastToastAtMs = 0;

  const animateQueueReflow = (elements: HTMLElement[]): void => {
    const before = new Map<HTMLElement, DOMRect>();
    elements.forEach((element) => {
      before.set(element, element.getBoundingClientRect());
    });

    requestAnimationFrame(() => {
      elements.forEach((element) => {
        const previous = before.get(element);
        if (!previous) {
          return;
        }
        const next = element.getBoundingClientRect();
        const deltaY = previous.top - next.top;
        if (Math.abs(deltaY) < 1) {
          return;
        }
        element.animate(
          [{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }],
          { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
        );
      });
    });
  };

  const show = (message: string, type: ToastType): void => {
    const now = Date.now();
    const signature = `${type}:${message}`;
    if (signature === lastToastSignature && now - lastToastAtMs < 1500) {
      return;
    }
    lastToastSignature = signature;
    lastToastAtMs = now;

    if (activeToasts.length >= MAX_VISIBLE_TOASTS) {
      const oldest = activeToasts.shift();
      oldest?.remove();
    }

    const toast = document.createElement("div");
    toast.className = [
      "pointer-events-auto min-w-[260px] max-w-[360px] rounded-lg border px-3 py-2 text-sm shadow-lg",
      "opacity-0 translate-y-2 scale-[0.98] transition-all duration-200",
      toastTypeStyles[type]
    ].join(" ");
    toast.textContent = message;
    const animatedElements = [...activeToasts, toast];
    container.appendChild(toast);
    activeToasts.push(toast);
    animateQueueReflow(animatedElements);

    requestAnimationFrame(() => {
      toast.classList.remove("opacity-0", "translate-y-2", "scale-[0.98]");
    });

    let isClosed = false;
    const close = () => {
      if (isClosed) {
        return;
      }
      isClosed = true;
      const index = activeToasts.indexOf(toast);
      if (index >= 0) {
        activeToasts.splice(index, 1);
      }
      const remaining = [...activeToasts];
      toast.classList.add("opacity-0", "-translate-y-1", "scale-[0.98]");
      setTimeout(() => {
        toast.remove();
        animateQueueReflow(remaining);
      }, 200);
    };

    setTimeout(close, 3200);
    toast.onclick = close;
  };

  return {
    show,
    success: (message: string) => show(message, "success"),
    warning: (message: string) => show(message, "warning"),
    error: (message: string) => show(message, "error")
  };
}
