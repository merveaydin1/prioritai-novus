(function () {
  const config = window.PRIORITAI_NOVUS_CONFIG || {};
  const queueKey = "prioritai_novus_event_queue";

  function getAdapter() {
    if (window.Novus && typeof window.Novus.track === "function") {
      return { name: "Novus", track: (event, props) => window.Novus.track(event, props) };
    }
    if (window.novus && typeof window.novus.track === "function") {
      return { name: "novus", track: (event, props) => window.novus.track(event, props) };
    }
    if (window.pendo && typeof window.pendo.track === "function") {
      return { name: "pendo", track: (event, props) => window.pendo.track(event, props) };
    }
    if (window.Pendo && typeof window.Pendo.track === "function") {
      return { name: "Pendo", track: (event, props) => window.Pendo.track(event, props) };
    }
    return null;
  }

  function readQueue() {
    try {
      return JSON.parse(localStorage.getItem(queueKey) || "[]");
    } catch (_error) {
      return [];
    }
  }

  function writeQueue(queue) {
    try {
      localStorage.setItem(queueKey, JSON.stringify(queue.slice(-100)));
    } catch (_error) {
      // Storage may be unavailable in private mode. Ignore safely.
    }
  }

  function baseProps() {
    return {
      product: config.product || "PrioritAI",
      environment: config.environment || "development",
      userRole: config.userRole || "unknown",
      appUrl: config.appUrl || window.location.href,
      path: window.location.pathname,
      timestamp: new Date().toISOString()
    };
  }

  function track(eventName, properties) {
    const payload = Object.assign({}, baseProps(), properties || {});
    const adapter = getAdapter();

    if (adapter) {
      adapter.track(eventName, payload);
      return { sent: true, adapter: adapter.name, eventName, payload };
    }

    const queue = readQueue();
    queue.push({ eventName, payload });
    writeQueue(queue);
    if (config.environment !== "production") {
      console.info("[PrioritAI] Novus/Pendo SDK not detected; queued event locally:", eventName, payload);
    }
    return { sent: false, adapter: "local_queue", eventName, payload };
  }

  function flushQueuedEvents() {
    const adapter = getAdapter();
    if (!adapter) return;
    const queue = readQueue();
    queue.forEach((item) => adapter.track(item.eventName, item.payload));
    writeQueue([]);
  }

  window.prioritaiTrack = track;
  window.prioritaiFlushNovusQueue = flushQueuedEvents;

  document.addEventListener("DOMContentLoaded", function () {
    track("app_loaded", { viewport: `${window.innerWidth}x${window.innerHeight}` });
    document.querySelectorAll("[data-novus-event]").forEach((element) => {
      element.addEventListener("click", () => {
        track("ui_click", {
          eventKey: element.getAttribute("data-novus-event"),
          text: (element.textContent || "").trim().slice(0, 80)
        });
      });
    });
    setTimeout(flushQueuedEvents, 1200);
  });
})();
