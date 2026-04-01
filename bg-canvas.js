/**
 * Arxa plan: requestAnimationFrame ilə hərəkətli rənglər (icazə tələb etmir).
 * prefers-reduced-motion: statik bir çəkiliş.
 */
(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d", { alpha: false });
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var rafId = 0;
  var t0 = performance.now();

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawBlob(cx, cy, r, stops) {
    var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    for (var i = 0; i < stops.length; i++) {
      g.addColorStop(stops[i][0], stops[i][1]);
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  function frame(time) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var t = (time - t0) * 0.001;

    ctx.fillStyle = "#07060d";
    ctx.fillRect(0, 0, w, h);

    var s1 = 0.12 + 0.08 * Math.sin(t * 0.35);
    var c1 = 0.18 + 0.1 * Math.cos(t * 0.28);
    var x1 = w * (0.25 + 0.2 * s1);
    var y1 = h * (0.15 + 0.12 * c1);
    var r1 = Math.max(w, h) * (0.42 + 0.06 * Math.sin(t * 0.4));
    drawBlob(x1, y1, r1, [
      [0, "rgba(34, 211, 238, 0.42)"],
      [0.45, "rgba(34, 211, 238, 0.12)"],
      [1, "rgba(7, 6, 13, 0)"]
    ]);

    var x2 = w * (0.78 + 0.12 * Math.cos(t * 0.22));
    var y2 = h * (0.55 + 0.15 * Math.sin(t * 0.31));
    var r2 = Math.max(w, h) * (0.38 + 0.05 * Math.cos(t * 0.25));
    drawBlob(x2, y2, r2, [
      [0, "rgba(255, 45, 85, 0.36)"],
      [0.5, "rgba(196, 30, 58, 0.1)"],
      [1, "rgba(7, 6, 13, 0)"]
    ]);

    var x3 = w * (0.5 + 0.18 * Math.sin(t * 0.18 + 1));
    var y3 = h * (0.85 + 0.08 * Math.cos(t * 0.2));
    var r3 = Math.max(w, h) * (0.5 + 0.08 * Math.sin(t * 0.15));
    drawBlob(x3, y3, r3, [
      [0, "rgba(139, 92, 246, 0.28)"],
      [0.55, "rgba(167, 139, 250, 0.08)"],
      [1, "rgba(7, 6, 13, 0)"]
    ]);

    var hx = 0.5 + 0.25 * Math.sin(t * 0.12);
    var hy = 0.4 + 0.2 * Math.cos(t * 0.14);
    drawBlob(w * hx, h * hy, Math.max(w, h) * 0.55, [
      [0, "rgba(34, 211, 238, 0.12)"],
      [0.6, "rgba(7, 6, 13, 0)"],
      [1, "rgba(7, 6, 13, 0)"]
    ]);

    rafId = requestAnimationFrame(frame);
  }

  function drawStatic() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    ctx.fillStyle = "#07060d";
    ctx.fillRect(0, 0, w, h);
    drawBlob(w * 0.3, h * 0.25, Math.max(w, h) * 0.45, [
      [0, "rgba(34, 211, 238, 0.22)"],
      [1, "rgba(7, 6, 13, 0)"]
    ]);
    drawBlob(w * 0.75, h * 0.6, Math.max(w, h) * 0.4, [
      [0, "rgba(255, 45, 85, 0.18)"],
      [1, "rgba(7, 6, 13, 0)"]
    ]);
  }

  function start() {
    cancelAnimationFrame(rafId);
    resize();
    if (reduceMotion.matches) {
      drawStatic();
      return;
    }
    t0 = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () {
    resize();
    if (reduceMotion.matches) drawStatic();
  });

  function onReduceMotionChange() {
    start();
  }
  if (reduceMotion.addEventListener) {
    reduceMotion.addEventListener("change", onReduceMotionChange);
  } else if (reduceMotion.addListener) {
    reduceMotion.addListener(onReduceMotionChange);
  }

  start();
})();
