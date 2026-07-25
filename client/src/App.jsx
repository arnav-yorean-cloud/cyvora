import React, { useState, useEffect, useRef } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
// ========================================================
// HANDCRAFTED HORIZONTAL DEEP-OCEAN INTERACTIVE WAVE CANVAS
// ========================================================
function OceanWavesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: null, y: null, targetX: null, targetY: null, radius: 200 };
    
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let ticks = 0;
    
    const waveLayers = [
      { yPos: 0.50, length: 0.004, amplitude: 30, speed: 0.015, color: 'rgba(0, 119, 182, 0.18)' },
      { yPos: 0.58, length: 0.003, amplitude: 40, speed: 0.010, color: 'rgba(0, 150, 199, 0.14)' },
      { yPos: 0.65, length: 0.005, amplitude: 25, speed: 0.020, color: 'rgba(72, 202, 228, 0.08)' }
    ];

    const animate = () => {
      ticks += 1;
      
      ctx.fillStyle = '#020c1b';
      ctx.fillRect(0, 0, width, height);

      if (mouse.targetX !== null) {
        if (mouse.x === null) {
          mouse.x = mouse.targetX;
          mouse.y = mouse.targetY;
        } else {
          mouse.x += (mouse.targetX - mouse.x) * 0.08;
          mouse.y += (mouse.targetY - mouse.y) * 0.08;
        }
      }

      waveLayers.forEach((wave) => {
        ctx.beginPath();
        
        for (let x = 0; x <= width; x += 4) {
          const baseSine = Math.sin(x * wave.length + ticks * wave.speed) * wave.amplitude;
          let calculatedY = (height * wave.yPos) + baseSine;

          if (mouse.x !== null) {
            const dx = x - mouse.x;
            const dy = calculatedY - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
              const proximityForce = (mouse.radius - distance) / mouse.radius;
              calculatedY += Math.sin(distance * 0.05 - ticks * 0.12) * 35 * proximityForce;
            }
          }

          if (x === 0) ctx.moveTo(x, calculatedY);
          else ctx.lineTo(x, calculatedY);
        }

        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        
        ctx.fillStyle = wave.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
// ========================================================
// HOLOGRAPHIC 3D CYBER SHOWCASE CAROUSEL ENGINE (6-CARD CONFIG)
// ========================================================
function ThreeDCarousel() {
  const containerRef = useRef(null);
  const [cur, setCur] = useState(0);
  const [dimensions, setDimensions] = useState({ pw: 170, ph: 215, radius: 220 });
  const [isHovered, setIsHovered] = useState(false);
  const dragX = useRef(null);

  // 📝 LOCALIZATION TRACKER: YOU CAN EDIT ALL CARD TEXT DIRECTLY INSIDE THIS MATRIX ARRAY
  const ITEMS = [
    { k: '01 · Team Member',  t: 'ARNAV KALKHANDAY',                            s: 'Cyvora Authentication(landing-Dashboard)',             g: 'linear-gradient(135deg,#1f6feb,#7c3aed)' },
    { k: '02 · Team Member',  t: 'ANAMIKA PARASHAR',                            s: 'Cyvora Threat List feed',                              g: 'linear-gradient(135deg,#ff7e5f,#feb47b)' },
    { k: '03 · Team Member',  t: 'KASHISH CHAUHAN',                             s: 'Cyvora URL Scanner(Sites Config.)',                    g: 'linear-gradient(135deg,#0ea5e9,#1e3a8a)' },
    { k: '04 · Team Member',  t: 'VEDANSH VARSHNEY',                            s: 'Cyvora Simulation Game(+XP management)',               g: 'linear-gradient(135deg,#10b981,#84cc16)' },
    { k: 'SECURE++',          t: 'Cyvora Auth. is fully secured for users',     s: 'TRY IT NOW..',                                         g: 'linear-gradient(135deg,#a855f7,#ec4899)' },
    { k: 'WELCOME',           t: 'CLICK ON GET STARTED TO REGISTER',            s: 'Start your journey and climb up ranks via BADGES',     g: 'linear-gradient(135deg,#fb7185,#f59e0b)' }
  ];

  const n = ITEMS.length;
  const theta = 360 / n;

  useEffect(() => {
    const computeLayout = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth || 300;
      const pw = Math.max(140, Math.min(180, width * 0.45));
      const ph = Math.round(pw * 1.25);
      // Perfect cylindrical radius balance tracking for 6 cards
      const rad = Math.round((pw / 2) / Math.tan(Math.PI / n)) + 35;
      setDimensions({ pw, ph, radius: rad });
    };

    computeLayout();
    window.addEventListener('resize', computeLayout);
    return () => window.removeEventListener('resize', computeLayout);
  }, [n]);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCur((prev) => prev + 1);
    }, 3200);
    return () => clearInterval(interval);
  }, [isHovered]);

  const go = (direction) => setCur((prev) => prev + direction);
  const goTo = (targetIdx) => {
    const currentMod = ((cur % n) + n) % n;
    let diff = targetIdx - currentMod;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    setCur((prev) => prev + diff);
  };

  const currentModIndex = ((cur % n) + n) % n;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full flex flex-col items-center gap-6 py-2 select-none"
    >
      {/* 3D Scene Frame Viewport (Lag Fix: Snapped down to transition-duration:300ms) */}
      <div 
        className="relative w-full flex justify-center items-center overflow-visible h-[290px]" 
        style={{ perspective: '1200px' }}
        onPointerDown={(e) => { dragX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (dragX.current === null) return;
          const deltaX = e.clientX - dragX.current;
          dragX.current = null;
          if (Math.abs(deltaX) > 40) go(deltaX < 0 ? 1 : -1);
        }}
      >
        <div
          className="relative transition-transform duration-300 ease-out will-change-transform"
          style={{
            transformStyle: 'preserve-3d',
            width: `${dimensions.pw}px`,
            height: `${dimensions.ph}px`,
            transform: `translateZ(-${dimensions.radius}px) rotateY(-${cur * theta}deg)`
          }}
        >
          {ITEMS.map((item, idx) => {
            const distance = Math.abs(((idx - currentModIndex) % n + n) % n);
            const finalDistance = distance > n / 2 ? n - distance : distance;
            
            // Re-balanced opacity curve parameters for smooth 6-card display fields
            const opacity = finalDistance === 0 ? '1' : (finalDistance === 1 ? '0.5' : '0.12');
            const pointerEvents = finalDistance === 0 ? 'auto' : 'none';

            return (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                disabled={finalDistance !== 0}
                className="absolute top-0 left-0 rounded-2xl border border-white/10 flex flex-col justify-end p-4 text-left text-white shadow-2xl transition-all duration-300 select-none cursor-pointer"
                style={{
                  width: `${dimensions.pw}px`,
                  height: `${dimensions.ph}px`,
                  background: item.g,
                  opacity: opacity,
                  pointerEvents: pointerEvents,
                  transform: `rotateY(${idx * theta}deg) translateZ(${dimensions.radius}px)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}
              >
                <span className="font-mono text-[8px] font-bold tracking-widest uppercase opacity-75">{item.k}</span>
                <h4 className="text-base font-bold font-mono tracking-tight mt-0.5 leading-tight">{item.t}</h4>
                <p className="text-[10px] opacity-80 mt-1 font-sans leading-normal line-clamp-3">{item.s}</p>
              </button>
            );
          })}
        </div>

        {/* Side Control Arrow Actions */}
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#14141a]/80 border border-white/10 text-white font-mono text-base hover:bg-white hover:text-black transition-colors z-30 cursor-pointer backdrop-blur-md flex items-center justify-center"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#14141a]/80 border border-white/10 text-white font-mono text-base hover:bg-white hover:text-black transition-colors z-30 cursor-pointer backdrop-blur-md flex items-center justify-center"
        >
          ›
        </button>
      </div>

      {/* Tracker Dots Loop Element */}
      <div className="flex gap-1.5 justify-center">
        {ITEMS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => goTo(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentModIndex ? 'bg-yellow-500 w-5' : 'bg-white/25 w-1.5 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 

// ========================================================
// HANDCRAFTED MATHEMATICAL CANVAS RINGS BACKGROUND ENGINE
// ========================================================
function MagicRingsBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const RINGS = 6;
    const SPEED = 1;
    const THICK = 2;
    const GAP = 1.5;
    const GLOW = 16;
    const A = [168, 85, 247]; 
    const B = [99, 102, 241];  
    const GLOWC = 'rgba(140,90,247,';
    const PHI0 = 1.32;

    let w, h;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    fit();
    window.addEventListener('resize', fit);

    const lerp = (a, b, f) => [
      a[0] + (b[0] - a[0]) * f,
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f
    ];

    const ss = (e0, e1, x) => {
      const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    };

    const nc = document.createElement('canvas');
    nc.width = nc.height = 120;
    const nx = nc.getContext('2d');
    const img = nx.createImageData(120, 120);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = Math.random() * 55;
    }
    nx.putImageData(img, 0, 0);
    const noise = ctx.createPattern(nc, 'repeat');

    const arcPair = (r, phi) => {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, -phi, phi);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, Math.PI - phi, Math.PI + phi);
      ctx.stroke();
    };

    const t0 = performance.now();

    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      const S = Math.min(w, h);
      const base = 0.30 * S;
      const span = 0.78 * S;
      const step = span / RINGS;
      const frac = (t * SPEED * 0.15) % 1;
      const drift = frac * step;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#0a0810';
      ctx.fillRect(0, 0, w, h);

      const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, S * 0.75);
      bg.addColorStop(0, GLOWC + '0.12)');
      bg.addColorStop(1, GLOWC + '0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (let i = 0; i <= RINGS; i++) {
        const r = base + i * step + drift;
        const p = (r - base) / span;
        let a = ss(0, 0.12, p) * (1 - ss(0.78, 1, p)) * (1 - 0.32 * p);
        if (a <= 0.01) continue;

        const phi = PHI0 * Math.pow(GAP, -p * 6);
        const cc = lerp(A, B, Math.min(1, p));
        const cs = `rgba(${cc[0] | 0},${cc[1] | 0},${cc[2] | 0},`;

        ctx.shadowColor = cs + '1)';
        ctx.shadowBlur = GLOW;
        ctx.strokeStyle = cs + (0.16 * a).toFixed(3) + ')';
        ctx.lineWidth = THICK * 3;
        arcPair(r, phi);

        ctx.shadowBlur = GLOW * 0.45;
        ctx.strokeStyle = cs + (0.92 * a).toFixed(3) + ')';
        ctx.lineWidth = THICK;
        arcPair(r, phi);
      }

      ctx.shadowBlur = 0;
      ctx.lineCap = 'butt';
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = noise;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', fit);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 pointer-events-none" />;
}

// ========================================================
// PROGRESSIVE REVEAL GLYPH DECRYPTION TEXT ENGINE
// ========================================================
function DecryptedText({ target = 'CYVORA', duration = 1600, fps = 18 }) {
  const [displayNodes, setDisplayNodes] = useState([]);
  const DECK = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=';
  
  useEffect(() => {
    let animationFrameId;
    let t0 = performance.now();
    let lastSwap = 0;

    const pick = () => DECK[(Math.random() * DECK.length) | 0];
    let order = [...Array(target.length).keys()];

    const updateTick = () => {
      const now = performance.now();
      if (now - lastSwap >= 1000 / fps) {
        lastSwap = now;
        const ratio = Math.min(1, (now - t0) / duration);
        const lockedCount = Math.floor(ratio * target.length);
        const lockedSet = new Set(order.slice(0, lockedCount));

        const frames = [...target].map((char, idx) => {
          if (lockedSet.has(idx)) {
            return { char: target[idx], isLocked: true };
          }
          return { char: pick(), isLocked: false };
        });

        setDisplayNodes(frames);

        if (ratio >= 1 && now - t0 > duration + 1400) {
          t0 = performance.now();
          lastSwap = 0;
        }
      }
      animationFrameId = requestAnimationFrame(updateTick);
    };

    animationFrameId = requestAnimationFrame(updateTick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration, fps]);

  return (
    <span className="font-mono font-medium tracking-[0.015em] text-[#F4F2EC] text-4xl md:text-6xl lg:text-7xl select-none pointer-events-none uppercase">
      {displayNodes.map((node, i) => (
        <span key={i} className={`inline-block min-w-[0.58em] text-center transition-all ${node.isLocked ? 'gh-amber' : ''}`}>
          {node.char}
        </span>
      ))}
    </span>
  );
}
// ========================================================
// PARALLAX TWINKLING STARFIELD BLUEPRINT CANVAS BACKGROUND
// ========================================================
function StarfieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const density = 200;
    const speed = 0.6;
    const twinkle = 0.6;
    let w, h;

    const fit = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * d;
      canvas.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };

    fit();
    window.addEventListener('resize', fit);

    const stars = Array.from({ length: density }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      layer: Math.floor(Math.random() * 3),
      ph: Math.random() * 6.2832
    }));

    const t0 = performance.now();

    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      
      ctx.fillStyle = '#05060a'; 
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        const depth = s.layer + 1;
        s.x -= speed * depth * 0.4;
        
        if (s.x < 0) {
          s.x += w;
          s.y = Math.random() * h;
        }
        
        const tw = 1 - twinkle * (0.5 + 0.5 * Math.sin(t * 2 + s.ph));
        ctx.globalAlpha = (0.2 + depth * 0.22) * tw;
        ctx.fillStyle = s.layer === 2 ? '#fff' : (s.layer === 1 ? '#cdd6ff' : '#8aa0ff');
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, 0.5 + depth * 0.5, 0, 6.2832);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', fit);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 pointer-events-none" />;
}
// ========================================================
// WEBGL FAULTY TERMINAL MATRIX DIGIT BACKGROUND ENGINE
// ========================================================
function FaultyTerminalBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
    if (!gl) return;

    let animationFrameId;
    const tint = [0.2, 1.0, 0.45];
    const scale = 1.8;
    const grid = 2.75;
    const digitSize = 1.05;
    const speed = 0.3;
    const scanline = 0.2;
    const glitch = 1.0;
    const flicker = 0.5;
    const chromatic = 0.2;
    const curvature = 0.05;
    const brightness = 1.0;
    const useMouse = 1.0;

    const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
    const FS = `
      precision highp float;
      uniform float iTime; uniform vec2 iResolution;
      uniform vec3 uTint; uniform float uScale; uniform float uGrid; uniform float uDigitSize;
      uniform float uSpeed; uniform float uScanline; uniform float uGlitch; uniform float uFlicker;
      uniform float uChromatic; uniform float uCurvature; uniform float uBright;
      uniform vec2 uMouse; uniform float uUseMouse;
      float hash21(vec2 p){ p = fract(p*vec2(234.34, 435.345)); p += dot(p, p+34.23); return fract(p.x*p.y); }
      float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p);
        float a=hash21(i), b=hash21(i+vec2(1.,0.)), c=hash21(i+vec2(0.,1.)), d=hash21(i+vec2(1.,1.));
        vec2 u=f*f*(3.0-2.0*f); return mix(mix(a,b,u.x),mix(c,d,u.x),u.y); }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*vnoise(p); p*=2.0; a*=0.5; } return v; }
      float field(vec2 uv, float t){
        vec2 g = uv * (uGrid*30.0) * uScale;
        vec2 cell = floor(g), sub = fract(g);
        float rain = fbm(vec2(cell.x*0.3, cell.y*0.12 - t));
        float spark = hash21(cell + vec2(0.0, floor(t*4.0)));
        float bri = smoothstep(0.55, 1.0, rain) * (0.35 + 0.65*spark);
        vec2 d = abs(sub-0.5);
        float glyph = step(max(d.x,d.y), 0.42*uDigitSize);
        float dots = step(0.45, fract(sub.x*2.0)) * step(0.35, fract(sub.y*3.0));
        return bri * glyph * (0.5 + 0.5*dots);
      }
      void main(){
        vec2 uv0 = gl_FragCoord.xy / iResolution;
        float t = iTime * uSpeed;
        vec2 cc = uv0*2.0-1.0; cc *= 1.0 + uCurvature*0.35*dot(cc,cc); vec2 uv = cc*0.5+0.5;
        float inB = step(0.0,uv.x)*step(uv.x,1.0)*step(0.0,uv.y)*step(uv.y,1.0);
        float rl = floor(uv.y*60.0);
        float gt = step(1.0 - uGlitch*0.06, hash21(vec2(rl, floor(t*10.0))));
        uv.x += gt*(hash21(vec2(rl, floor(t*10.0)+3.0))-0.5)*0.15*uGlitch;
        float ca = uChromatic*0.006;
        float r = field(uv+vec2(ca,0.0), t), gch = field(uv, t), b = field(uv-vec2(ca,0.0), t);
        vec3 col = uTint * vec3(r,gch,b) + uTint*0.02;
        col *= 1.0 - uScanline*0.6*(0.5+0.5*sin(uv.y*iResolution.y*1.2));
        col *= 1.0 - uFlicker*0.18*hash21(vec2(floor(t*30.0), 7.0));
        if (uUseMouse > 0.5){ float md = distance(uv0, vec2(uMouse.x, 1.0-uMouse.y)); col += uTint*smoothstep(0.35,0.0,md)*0.35; }
        float vig = smoothstep(1.3, 0.35, length(uv0*2.0-1.0));
        col *= vig * uBright * inB;
        gl_FragColor = vec4(col, 1.0);
      }`;

    const sh = (type, src) => {
      const o = gl.createShader(type);
      gl.shaderSource(o, src);
      gl.compileShader(o);
      return o;
    };

    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const a = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

    const U = n => gl.getUniformLocation(prog, n);
    const u = {};
    'iTime iResolution uTint uScale uGrid uDigitSize uSpeed uScanline uGlitch uFlicker uChromatic uCurvature uBright uMouse uUseMouse'.split(' ').forEach(n => u[n] = U(n));

    const mouse = { x: 0.5, y: 0.5 };
    // Global tracking on window to bypass pointer-events-none layout block
    const handleGlobalMouseMove = (e) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);

    const fit = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = window.innerWidth * d;
      cv.height = window.innerHeight * d;
      gl.viewport(0, 0, cv.width, cv.height);
    };
    fit();
    window.addEventListener('resize', fit);

    const t0 = performance.now();
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(u.iTime, t);
      gl.uniform2f(u.iResolution, cv.width, cv.height);
      gl.uniform3f(u.uTint, tint[0], tint[1], tint[2]);
      gl.uniform1f(u.uScale, scale);
      gl.uniform1f(u.uGrid, grid);
      gl.uniform1f(u.uDigitSize, digitSize);
      gl.uniform1f(u.uSpeed, speed);
      gl.uniform1f(u.uScanline, scanline);
      gl.uniform1f(u.uGlitch, glitch);
      gl.uniform1f(u.uFlicker, flicker);
      gl.uniform1f(u.uChromatic, chromatic);
      gl.uniform1f(u.uCurvature, curvature);
      gl.uniform1f(u.uBright, brightness);
      gl.uniform2f(u.uMouse, mouse.x, mouse.y);
      gl.uniform1f(u.uUseMouse, useMouse);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      animationFrameId = requestAnimationFrame(loop);
    };
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('resize', fit);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0 pointer-events-none" />;
}

// ========================================================
// CURSOR-TRACKING SVGMASCOT BUILDER CONTROLLER ENGINE
// ========================================================
function MascotBuilderNode() {
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const mascotRef = useRef(null);

  useEffect(() => {
    const handleMouseTracking = (e) => {
      if (!mascotRef.current) return;
      const rect = mascotRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      const deltaX = e.clientX - mascotCenterX;
      const deltaY = e.clientY - mascotCenterY;
      const angle = Math.atan2(deltaY, deltaX);
      
      const maxDistance = 2.5; 
      const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.05, maxDistance);

      const eyeAreaRadius = 20;//earlier was 45 biddu
      if (Math.abs(deltaX) < eyeAreaRadius && Math.abs(deltaY) < eyeAreaRadius) {
        setIsBlinking(true);
      } else {
        setIsBlinking(false);
      }

      setEyeOffset({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    window.addEventListener('mousemove', handleMouseTracking);
    return () => window.removeEventListener('mousemove', handleMouseTracking);
  }, []);

  return (
    <div ref={mascotRef} className="absolute bottom-0 right-4 w-44 h-56 z-30 pointer-events-none hidden md:block select-none overflow-visible">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 160 200">
        
        {/* Engineering Background Support Rails */}
        <g stroke="rgba(239, 68, 68, 0.2)" strokeWidth="3" strokeLinecap="round">
          <line x1="25" y1="70" x2="45" y2="200" />
          <line x1="50" y1="65" x2="70" y2="200" />
          <line x1="28" y1="100" x2="52" y2="97" strokeWidth="2" />
          <line x1="33" y1="130" x2="57" y2="127" strokeWidth="2" />
          <line x1="38" y1="160" x2="62" y2="157" strokeWidth="2" />
        </g>

        {/* Builder Character Body - Folded Arm Geometry */}
        <g fill="#1e293b" stroke="#334155" strokeWidth="2">
          {/* Base Torso */}
          <path d="M 80 145 C 55 145, 50 200, 50 200 L 124 200 C 124 200, 115 145, 80 145 Z" fill="#0f172a" />
          {/* Construction Safety Vest (Shifted from Purple to Red Accent Framework) */}
          <path d="M 68 147 L 55 200 L 78 200 L 80 165 L 82 200 L 105 200 L 92 147 Z" fill="rgba(220, 38, 38, 0.2)" stroke="#dc2626" strokeWidth="1.5" />
          {/* Left Sleeve Block */}
          <path d="M 52 165 Q 85 185, 110 165" fill="none" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
          {/* Right Folded Sleeve Block */}
          <path d="M 55 168 Q 85 185, 115 168" fill="none" stroke="#2c3e50" strokeWidth="8" strokeLinecap="round" />
          {/* Folded Hands Node Injected with Custom Skin Tone Hex */}
          <circle cx="83" cy="174" r="7" fill="#ffddc1" stroke="#334155" strokeWidth="1.5" />
        </g>

        {/* Builder Head Section (Shifted to Custom Skin Tone Hex) */}
        <circle cx="84" cy="110" r="24" fill="#ffddc1" stroke="#334155" strokeWidth="2" />
        
        {/* Safety Hardhat Asset (Yellow Shell + Distinct Red Accent Brim Strip) */}
        <path d="M 56 102 C 56 80, 112 80, 112 102 Z" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" />
        <path d="M 50 102 Q 84 98, 118 102 L 114 106 Q 84 102, 54 106 Z" fill="#dc2626" />

        {/* Interactive Eye Assembly */}
        {isBlinking ? (
          <>
            <line x1="71" y1="112" x2="79" y2="112" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="89" y1="112" x2="97" y2="112" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="75" cy="112" r="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <circle cx="93" cy="112" r="5" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <circle cx={75 + eyeOffset.x} cy={112 + eyeOffset.y} r="2.5" fill="#eab308" />
            <circle cx={93 + eyeOffset.x} cy={112 + eyeOffset.y} r="2.5" fill="#eab308" />
          </>
        )}
      </svg>
    </div>
  );
}
// ========================================================
// DOG LOADING MATRIX
// ========================================================
function DogLoaderScreen() {
  return (
    <div className="min-h-screen w-full bg-[#050711] flex flex-col items-center justify-center font-mono select-none animate-fadeIn">
      <style>{`
        .dg-spin { animation: dg-spin 3.2s linear infinite; }
        @keyframes dg-spin { to { transform: rotate(360deg); } }
        .dg-body { stroke-dasharray: 85 275; stroke-dashoffset: 25; animation: dg-body 3.2s linear infinite; }
        @keyframes dg-body { 0%, 100% { stroke-dasharray: 85 275; stroke-dashoffset: 25; } 12.5% { stroke-dasharray: 98 262; stroke-dashoffset: 38; } 25% { stroke-dasharray: 130 230; stroke-dashoffset: 70; } 37.5% { stroke-dasharray: 162 198; stroke-dashoffset: 102; } 50% { stroke-dasharray: 175 185; stroke-dashoffset: 115; } 62.5% { stroke-dasharray: 162 198; stroke-dashoffset: 102; } 75% { stroke-dasharray: 130 230; stroke-dashoffset: 70; } 87.5% { stroke-dasharray: 98 262; stroke-dashoffset: 38; } }
        .dg-head-orbit { transform-box: view-box; transform-origin: 110px 110px; transform: rotate(60deg); }
        .dg-legs-orbit { transform-box: view-box; transform-origin: 110px 110px; transform: rotate(-25deg); animation: dg-orbit-legs 3.2s linear infinite; }
        @keyframes dg-orbit-legs { 0%, 100% { transform: rotate(-25deg); } 12.5% { transform: rotate(-38deg); } 25% { transform: rotate(-70deg); } 37.5% { transform: rotate(-102deg); } 50% { transform: rotate(-115deg); } 62.5% { transform: rotate(-102deg); } 75% { transform: rotate(-70deg); } 87.5% { transform: rotate(-38deg); } }
        .dg-head { transform-box: fill-box; transform-origin: center; animation: dg-wiggle 1.7s ease-in-out infinite; }
        @keyframes dg-wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-3.5deg); } 75% { transform: rotate(3.5deg); } }
        .dg-tongue { transform-box: fill-box; transform-origin: top; animation: dg-tongue 1.1s ease-in-out infinite; }
        @keyframes dg-tongue { 0%, 100% { transform: translateY(0) scaleY(1); } 50% { transform: translateY(1px) scaleY(1.18); } }
        .dg-dot { animation: dg-dot 1.4s infinite; }
        .dg-dot:nth-of-type(2) { animation-delay: 0.18s; }
        .dg-dot:nth-of-type(3) { animation-delay: 0.36s; }
        @keyframes dg-dot { 0%, 65%, 100% { opacity: 0.25; } 32% { opacity: 1; } }
      `}</style>
      <div className="flex flex-col items-center gap-6">
        <svg className="dg-spin w-44 h-44" viewBox="0 0 220 220" aria-hidden="true">
          <defs>
            <linearGradient id="dgBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f3ddb8" />
              <stop offset="1" stopColor="#e2c089" />
            </linearGradient>
          </defs>
          <path className="dg-body" pathLength="360" d="M110,38 A72,72 0 1 1 110,182 A72,72 0 1 1 110,38 Z" fill="none" stroke="url(#dgBody)" strokeWidth="34" strokeLinecap="round" strokeLinejoin="round" />
          <g className="dg-legs-orbit">
            <path d="M109,33 C98,21 105,6 119,11 C126,14 123,25 115,22" fill="none" stroke="url(#dgBody)" strokeWidth="9" strokeLinecap="round" />
            <rect x="100" y="50" width="8" height="23" rx="4" fill="url(#dgBody)" />
            <rect x="112" y="50" width="8" height="23" rx="4" fill="url(#dgBody)" />
            <ellipse cx="104" cy="71" rx="2.8" ry="2.1" fill="#ff9bb0" />
            <ellipse cx="116" cy="71" rx="2.8" ry="2.1" fill="#ff9bb0" />
          </g>
          <g className="dg-head-orbit">
            <g className="dg-frontlegs">
              <rect x="100" y="60" width="8" height="24" rx="4" fill="url(#dgBody)" />
              <rect x="112" y="60" width="8" height="24" rx="4" fill="url(#dgBody)" />
              <ellipse cx="104" cy="82" rx="2.8" ry="2.1" fill="#ff9bb0" />
              <ellipse cx="116" cy="82" rx="2.8" ry="2.1" fill="#ff9bb0" />
            </g>
            <g className="dg-head">
              <path d="M88,36 C70,36 60,54 66,74 C69,84 80,84 86,72 C90,62 92,46 88,36 Z" fill="#d4ab73" />
              <path d="M132,36 C150,36 160,54 154,74 C151,84 140,84 134,72 C130,62 128,46 132,36 Z" fill="#d4ab73" />
              <ellipse cx="110" cy="46" rx="35" ry="30" fill="url(#dgBody)" />
              <ellipse cx="110" cy="59" rx="17" ry="13" fill="#fbeeda" />
              <ellipse cx="97" cy="44" rx="4.5" ry="5.6" fill="#2a2018" />
              <ellipse cx="123" cy="44" rx="4.5" ry="5.6" fill="#2a2018" />
              <circle cx="98.6" cy="41.6" r="1.4" fill="#fff" />
              <circle cx="124.6" cy="41.6" r="1.4" fill="#fff" />
              <ellipse cx="110" cy="52" rx="6" ry="4.6" fill="#33271f" />
              <circle cx="107.8" cy="50.3" r="1.3" fill="#fff" opacity=".65" />
              <path d="M110,56 L110,60" fill="none" stroke="#33271f" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M110,60 Q104.5,64 101,60.5" fill="none" stroke="#33271f" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M110,60 Q115.5,64 119,60.5" fill="none" stroke="#33271f" strokeWidth="1.6" strokeLinecap="round" />
              <path className="dg-tongue" d="M106,62 Q110,61 114,62 L113,70 Q110,73 107,70 Z" fill="#ff9bb0" />
            </g>
          </g>
        </svg>
        <div className="text-xs font-bold tracking-[0.3em] uppercase text-[#aeb8d6] pl-2">
        Transmitting you to CYVORA<span className="dg-dot">.</span><span className="dg-dot">.</span><span className="dg-dot">.</span>
        </div>
      </div>
    </div>
  );
}
function App() {
  const [view, setView] = useState('intro'); 
  const [authMode, setAuthMode] = useState('login'); 
  const [authStep, setAuthStep] = useState(1);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);      // Task 2: Network Throttle
  const [emailFormatError, setEmailFormatError] = useState(false); // Task 1: Regex Enforcement
  const [emailNotRegistered, setEmailNotRegistered] = useState(false); // Task 5: Leak Protection
  const [cooldown, setCooldown] = useState(0);                    // Task 4: Rate-Limit Timer
  const [otpArray, setOtpArray] = useState(new Array(6).fill('')); // Task 3: Split Array Boxes
  const otpRefs = useRef([]);                                     // Task 3: Focus Tracking Refs
  // Operational Matrix Transition Trackers
  const [isExitingIntro, setIsExitingIntro] = useState(false);
  const handleEnterSystem = () => {
    setView('loading'); // Moves directly to our standalone dog spinner screen
    setTimeout(() => {
      setView('landing');
    }, 3200); // Locked to exactly 3.2s for one complete scamper-around loop cycle
  };
  const [dashSubView, setDashSubView] = useState('home');
  // Dynamic Entry/Splash State Gate for Dashboard Home Router
  const [homeEntered, setHomeEntered] = useState(false);
  // ========================================================
  // CORE UTILITY STATE MACHINES FOR SECURITY SCAN MATRIX
  // ========================================================
  const [targetUrl, setTargetUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanReport, setScanResult] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    const element = document.getElementById('cyvora-report-print');
    if (!element) return;
    setIsDownloadingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0b1120',
        useCORS: true,
        ignoreElements: (el) => el.classList && el.classList.contains('no-print'),
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidthMM = 210;
      const imgHeightMM = (canvas.height * imgWidthMM) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidthMM, imgHeightMM],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM);

      const safeName = (scanReport?.url || 'report').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`Cyvora-Security-Report-${safeName}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };
  const [showDeepConfig, setShowConfig] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const [conicPercent, setConicPercent] = useState(0);
  const [scanHistory, setScanHistory] = useState([]);
  const [expandedTier, setExpandedTier] = useState(null);
  const [remediationTab, setRemediationTab] = useState('nginx');
  const [showResetModal, setShowResetModal] = useState(false);
  const [openModal, setOpenModal] = useState(null);
  const [activeNodeDesc, setActiveNodeDesc] = useState(null);
  // Custom Modal Controller State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // OPTIMIZATION MATRIX: Combined Asset Preloading & Session Rehydration Engine
  useEffect(() => {
    // Suggestion 4: Hardware pre-cache imagery to completely eliminate initial black layout flashes
    const systemImg = new Image();
    systemImg.src = "/luffy_fixed.jpg";

    // Suggestion 1: Automated Token Persistence Watcher (Prevents logout on page refresh F5)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email) {
        setEmail(user.email);
        if (user.displayName) setUsername(user.displayName);
        setView('dashboard'); // Seamlessly jumps straight back past gateway walls if validated
      }
    });

    return () => unsubscribe();
  }, []);
  // 📁 INJECTION: COUNTDOWN ENGINE & KEYBOARD FOCUS TRAPS
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);
  // SECURITY CORE: Automated Protected View Memory Enforcer
  useEffect(() => {
    if (view === 'dashboard' && !email) {
      alert("Access Denied: Unauthenticated configuration token footprint detected.");
      setView('landing');
      handleAuthSwitch('login');
    }
  }, [view, email]);

  const handleOtpInputChange = (element, index) => {
    const val = element.value.replace(/[^0-9]/g, ''); // Enforce numbers only
    if (!val) return;

    const updatedOtp = [...otpArray];
    updatedOtp[index] = val.substring(val.length - 1);
    setOtpArray(updatedOtp);
    setOtpError(false);

    if (index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus(); // Step Focus Forward
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const updatedOtp = [...otpArray];
      if (otpArray[index] !== '') {
        updatedOtp[index] = '';
        setOtpArray(updatedOtp);
      } else if (index > 0 && otpRefs.current[index - 1]) {
        updatedOtp[index - 1] = '';
        setOtpArray(updatedOtp);
        otpRefs.current[index - 1].focus(); // Step Focus Backward
      }
    }
  };
const handleAuthSwitch = (mode) => {
    setAuthMode(mode);
    setAuthStep(1);
    setPassword('');
    setConfirmPassword('');
    setOtpArray(new Array(6).fill('')); // Clear array tracking state
    setPasswordError(false);
    setLoginError(false);
    setOtpError(false);
    setEmailFormatError(false);    // Clear task 1 flag
    setEmailNotRegistered(false);  // Clear task 5 flag
    setIsSubmitting(false);        // Free lock anchors
    setShowPassword(false);
    setShowConfirmPassword(false);
    setUsername('');
    setAge('');
    setGender('');
    setUsernameError(false);
  };
  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      // 🌐 Triggers native multi-account browser identity layer popup
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Extract verified profile records securely for dashboard initialization
      if (user.email) {
        setEmail(user.email);
        if (user.displayName) setUsername(user.displayName);
        // Dynamic background database sync handshake
        await fetch('http://localhost:5000/api/auth/google-sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            username: user.displayName || 'OAuth_Operator',
            age: 'Not Specified',
            gender: 'Other'
          })
        });
        
        // Clear old token errors and log user straight in
        setHomeEntered(false);
        setView('dashboard');
      }
    } catch (error) {
      // Catch pop-up closures or credential termination updates safely
      if (error.code !== 'auth/popup-closed-by-user') {
        alert(`Google OAuth Handshake Blocked: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
const handleSubmitCredentials = async () => {
    setPasswordError(false);
    setLoginError(false);
    setUsernameError(false);
    setEmailFormatError(false);
    setEmailNotRegistered(false);

    if (!email || !password) {
      alert('Provide credentials to initialize token dispatch routing');
      return;
    }

    // Task 1: Enforce Structural Regex Footprint Checks
    const genuineEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!genuineEmailRegex.test(email)) {
      setEmailFormatError(true);
      return;
    }

    if (authMode === 'signup') {
      if (!username) {
        alert('Please specify a secure operator username to initialize profile encryption.');
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError(true);
        return;
      }
    }

    // Task 2: Initialize Server API Submission Lockout
    setIsSubmitting(true);

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const payload = authMode === 'login' 
        ? { email, password }
        : { email, password, username, age: "Not Specified", gender: "Other" }; // Passes safety fallback flags to backend script models

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        if (authMode === 'login') {
          // Task 5: Advanced Verification Gate (Frontend-Driven Enumeration Check)
          // If the login endpoint rejects the query, we test the status of the account footprint
          try {
            const checkResponse = await fetch(`http://localhost:5000/api/auth/signup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password: 'dummy_gate_pass', username: 'dummy_gate_user', age: '99', gender: 'Other' })
            });
            const checkData = await checkResponse.json();
            
            // If the signup endpoint catches a duplicate email/user error, the account exists -> Wrong Password
            if (checkResponse.status === 400 || (checkData.message && checkData.message.toLowerCase().includes('username'))) {
              setLoginError(true);
            } else {
              // Otherwise, the endpoint would have let the registration initialize -> Email Not Registered
              setEmailNotRegistered(true);
            }
          } catch (gateError) {
            // Safe fallback if the check gateway network times out
            setLoginError(true);
          }
        } else {
          if (data.message && data.message.includes('Username')) {
            setUsernameError(true);
          } else {
            alert(`Security Node Error: ${data.message}`);
          }
        }
        return;
      }

      setAuthStep(2); 
      setCooldown(60); // Task 4: Fire 60s spam guard clock on success
    } catch (error) {
      console.error("Cyvora Core Node Communications Fault Isolation Trace:", error);
      alert('⚠️ NODE OFFLINE ERROR: Communication handshake failed. Verify that your local backend endpoint node is active via [node index.js] inside port 5000 and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

const handleVerifyOtp = async () => {
    setOtpError(false);
    const combinedOtp = otpArray.join('');

    if (combinedOtp.length < 6) {
      setOtpError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: combinedOtp })
      });

      if (!response.ok) {
        setOtpError(true); 
        return;
      }

      setView('dashboard');
    } catch (error) {
      alert('Network transmission error communicating verification signatures.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // PHASE 3: UPGRADED FULL-STACK MASTER DASHBOARD ARCHITECTURE
  // ==========================================
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#020c1b] text-[#f3f4f6] font-sans flex relative overflow-hidden">
        
        {/* ========================================================
            DASHBOARD CONTROL SIDEBAR NAVIGATION DOCK
            ======================================================== */}
        {/* ========================================================
            ANIMSHELF UPGRADE: EXPANDABLE TERMINAL ICON RAIL DOCK
            ======================================================== */}
        <aside className="absolute left-0 top-0 bottom-0 z-30 w-16 hover:w-64 bg-[#070a13]/95 backdrop-blur-xl border-r border-[#1e293b] flex flex-col justify-between p-3 select-none shrink-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] group shadow-2xl shadow-black/80">
          <div className="space-y-6">
            {/* Cyvora Verified Identity Badge Header */}
            <div className="flex items-center gap-3 border-b border-[#1e293b] pb-4 h-12 overflow-hidden whitespace-nowrap px-1.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(147,51,234,0.4)]">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-sm font-black tracking-widest text-white">
                CYVORA
              </div>
            </div>

            {/* Navigation Tab Nodes (Equipped with Active Spring Pins) */}
            <nav className="space-y-2 flex flex-col">
              <button 
                type="button"
                onClick={() => setDashSubView('home')}
                className={`w-full font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl border flex items-center gap-4 transition-all cursor-pointer overflow-hidden ${
                  dashSubView === 'home' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${dashSubView === 'home' ? 'text-purple-400' : 'text-slate-400'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </span>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">HOME</span>
              </button>

              <button 
                type="button"
                onClick={() => setDashSubView('profile')}
                className={`w-full font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl border flex items-center gap-4 transition-all cursor-pointer overflow-hidden ${
                  dashSubView === 'profile' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${dashSubView === 'profile' ? 'text-purple-400' : 'text-slate-400'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">PROFILE</span>
              </button>

              <div className="pt-2 h-6 overflow-hidden">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono text-[11px] font-bold text-red-500/50 tracking-widest uppercase pl-3">FEATURES</div>
                <div className="group-hover:hidden w-6 h-[1px] bg-[#1e293b] mx-auto mt-2" />
              </div>

              <button 
                type="button"
                onClick={() => setDashSubView('scanner')}
                className={`w-full text-left font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl border transition-all flex items-center gap-4 cursor-pointer overflow-hidden ${
                  dashSubView === 'scanner' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${dashSubView === 'scanner' ? 'text-purple-400' : 'text-slate-400'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                </span>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">URL SECURITY SCANNER</span>
              </button>

              <button 
                type="button"
                onClick={() => setDashSubView('intel')}
                className={`w-full text-left font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl border transition-all flex items-center gap-4 cursor-pointer overflow-hidden ${
                  dashSubView === 'intel' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${dashSubView === 'intel' ? 'text-purple-400' : 'text-slate-400'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
                </span>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">THREAT INTEL FEED</span>
              </button>

              <button 
                type="button"
                onClick={() => setDashSubView('game')}
                className={`w-full text-left font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl border transition-all flex items-center gap-4 cursor-pointer overflow-hidden ${
                  dashSubView === 'game' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${dashSubView === 'game' ? 'text-purple-400' : 'text-slate-400'}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
                </span>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">SIMULATED CYBER ARENA</span>
              </button>
            </nav>
          </div>

          {/* Footer Navigation Segment */}
          <div className="space-y-2 border-t border-[#1e293b] pt-4 overflow-hidden">
            <button 
              type="button"
              onClick={() => setDashSubView('contact')}
              className={`w-full text-left font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl border transition-all flex items-center gap-4 cursor-pointer overflow-hidden ${
                dashSubView === 'contact' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-transparent text-slate-400 hover:text-white hover:bg-[#111827]'
              }`}
            >
              <span className={`shrink-0 flex items-center justify-center w-5 h-5 ${dashSubView === 'contact' ? 'text-purple-400' : 'text-slate-400'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">CONTACT US</span>
            </button>

            <button 
              type="button"
              onClick={() => setShowLogoutModal(true)} 
              className="w-full font-mono text-xs font-bold tracking-wider h-11 px-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent transition-all flex items-center gap-4 cursor-pointer overflow-hidden"
            >
              <span className="shrink-0 flex items-center justify-center w-5 h-5 text-red-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </span>
              <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">LOG OUT</span>
            </button>
          </div>
        </aside>

        {/* ========================================================
            DYNAMIC SUB-VIEWPORT MATRIX SHELL (PERFECTLY CENTERED & SCROLLABLE)
            ======================================================== */}
        <main className="flex-1 h-screen overflow-y-auto flex flex-col items-center justify-start pl-20 pr-4 py-6 relative z-10 scroll-smooth">
          
          {/* VIEW A: RECON SYSTEM CORE DASHBOARD (WITH IMMERSIVE ENTRY PORTAL GATE) */}
          {dashSubView === 'home' && (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
              
            <div className="w-full max-w-xl rounded-xl border border-purple-500/20 bg-[#111827]/60 backdrop-blur-md p-8 text-center shadow-2xl animate-fadeIn rounded-xl relative z-10">
              <h1 className="text-3xl font-black tracking-wider text-purple-500 uppercase font-mono">Dashboard</h1>
              <div className="mt-6 p-4 rounded-lg bg-black/40 text-emerald-400 font-mono text-xs uppercase tracking-widest border border-emerald-500/10">
                  Welcome Back, {username || 'Operator'}
                </div>
            </div>
            </div>
          )}

          {/* VIEW B: IDENTITY PROFILE VIEW SEGMENT */}
          {dashSubView === 'profile' && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
              <div className="w-full max-w-md rounded-xl border border-yellow-500/20 bg-[#111827]/60 backdrop-blur-md p-8 text-center shadow-2xl animate-fadeIn font-mono">
                <p className="text-base font-bold text-white uppercase tracking-wider">wait krro guyz under construction h ye</p>
                <p className="text-xs text-slate-500 mt-2">COMING SOON</p>
              </div>
            </div>
          )}
          {/* ========================================================
              VIEW C-1: CYVORA URL SECURITY SCANNER UPGRADED COMMAND FRAMEWORK
              ======================================================== */}
          {dashSubView === 'scanner' && (
            <div className="flex-1 w-full overflow-y-auto px-4 py-8 md:p-12 scroll-smooth animate-fadeIn relative z-10 flex flex-col items-center">
              <div className="max-w-7xl w-full space-y-8 pb-32">
                
                {/* Module Header Utilities Container */}
                <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-mono font-black text-yellow-500 tracking-widest uppercase">RECON_UNIT // LIVE_METRICS</div>
                    <h2 className="text-2xl font-black text-white font-mono tracking-wider uppercase">LINK INTEGRITY & SECURITY CONFIG AUDITOR</h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Execute live security audits across target servers to extract firewall response tokens and catalog infrastructure posture records.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    className="self-start sm:self-center h-9 px-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 font-mono text-[15px] font-bold tracking-widest text-yellow-400 uppercase flex items-center gap-2 hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] cursor-pointer shadow-lg active:scale-95 shrink-0"
                  >
                    <span>↻</span> REFRESH
                  </button>
                </div>

                {/* SEARCH TERMINAL PORTAL */}
                <div className="w-full rounded-2xl bg-[#090d16]/50 border border-white/10 p-6 shadow-xl backdrop-blur-xl space-y-4">
                  <label htmlFor="url-input" className="block text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                    Paste target URL to initiate security scan
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
                    <div className="flex-1 relative">
                      <input 
                        id="url-input"
                        type="text"
                        placeholder="https://example.com"
                        value={targetUrl}
                        disabled={isScanning}
                        onChange={(e) => setTargetUrl(e.target.value)}
                        className="w-full h-12 bg-black/40 border border-[#334155] focus:border-yellow-500 rounded-xl px-4 text-sm font-mono text-yellow-400 outline-none transition-all focus:ring-4 focus:ring-yellow-500/10 placeholder-slate-700"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isScanning || !targetUrl}
                      className="h-12 px-8 font-mono text-xs font-black tracking-widest text-black bg-yellow-500 hover:bg-yellow-400 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 uppercase cursor-pointer"
                      onClick={async () => {
                        setIsScanning(true);
                        setScanResult(null);
                        setScanError(null); 
                        setShowConfig(false);
                        let progress = 0;
                        const interval = setInterval(() => {
                          progress += 5;
                          setConicPercent(progress);
                          if (progress >= 100) clearInterval(interval);
                        }, 25);

                        try {
                          const res = await fetch('http://127.0.0.1:5000/api/scan/url', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: targetUrl })
                          });
                          const data = await res.json();
                          if (res.ok) {
                            let finalGrade = "C";
                            let gradeColor = "text-yellow-400 stroke-yellow-400";
                            if (data.score >= 90) { finalGrade = "A"; gradeColor = "text-emerald-400 stroke-emerald-400"; }
                            else if (data.score >= 75) { finalGrade = "B"; gradeColor = "text-cyan-400 stroke-cyan-400"; }
                            else if (data.score < 50) { finalGrade = "F"; gradeColor = "text-red-500 stroke-red-500"; }

                            const freshReport = { ...data, grade: finalGrade, gradeColor: gradeColor, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) };
                            setScanResult(freshReport);
                            setScanHistory(prev => [freshReport, ...prev]);
                          } else {
                            setScanError(data.message || "Target identity signature rejected by DNS lookup routers.");
                          }
                        } catch (err) {
                          setScanError("Unable to establish communication with the Cyvora Core engine port.");
                        } finally {
                          setTimeout(() => setIsScanning(false), 1000);
                        }
                      }}
                    >
                      {isScanning ? 'SCANNING SURFACES...' : 'SEARCH '}
                    </button>
                  </div>
                </div>

                {/* CONIC LOADER BAR CLOCK */}
                {isScanning && (
                  <div className="w-full flex flex-col items-center justify-center p-12 bg-[#090d16]/20 rounded-2xl border border-white/5 animate-fadeIn">
                    <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#eab308 ${conicPercent}%, #1e293b 0)` }}>
                      <div className="absolute inset-1.5 rounded-full bg-[#05060a] flex flex-col items-center justify-center">
                        <span className="font-mono text-base font-black text-white">{conicPercent}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 🚨 DYNAMIC VALIDATION FAILURE ALERT BOX */}
                {scanError && !isScanning && (
                  <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/5 p-6 animate-fadeIn font-mono text-xs flex items-start gap-4 shadow-xl">
                    <span className="text-xl leading-none text-red-400 animate-pulse">⚠️</span>
                    <div className="space-y-1 text-left">
                      <div className="font-black text-red-400 tracking-wider uppercase">HOST RESOLUTION ERROR</div>
                      <p className="text-slate-400 leading-relaxed uppercase tracking-wide text-[11px]">{scanError}</p>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    📊 PERSISTENT COMPONENT: TIER HISTORICAL METRICS GRAPH & ACCORDION
                    ======================================================== */}
                <div className="w-full bg-[#090d16]/30 border border-white/5 rounded-2xl p-6 space-y-6 text-xs font-mono text-left">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">OPERATIONAL RECON HISTORY MATRIX</span>
                    <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-black text-[10px]">
                      TOTAL RUNS: {scanHistory.length}
                    </span>
                  </div>

                  {/* Micro Analytical Counters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">SECURED INFRASTRUCTURE NODES</span>
                      <span className="text-lg font-black text-emerald-400">{scanHistory.filter(h => h.grade === 'A' || h.grade === 'B').length}</span>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">CRITICAL SYSTEM THREATS LOGGED</span>
                      <span className="text-lg font-black text-red-400">{scanHistory.filter(h => h.grade === 'C' || h.grade === 'F').length}</span>
                    </div>
                  </div>

                  {/* Progressive Distribution Horizontal Metrics Graph */}
                  <div className="space-y-3 pt-2">
                    {['A', 'B', 'C', 'F'].map(tier => {
                      const matchingScans = scanHistory.filter(h => h.grade === tier);
                      const percent = scanHistory.length > 0 ? (matchingScans.length / scanHistory.length) * 100 : 0;
                      let barColor = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
                      if (tier === 'A') barColor = 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
                      if (tier === 'B') barColor = 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]';
                      if (tier === 'F') barColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';

                      return (
                        <div key={tier} className="space-y-1">
                          <div className="flex justify-between items-center font-bold text-[10px] text-slate-400">
                            <span>TIER {tier} POSTURE COMPLIANCE ({matchingScans.length} SCALED)</span>
                            <button
                              type="button"
                              onClick={() => setExpandedTier(expandedTier === tier ? null : tier)}
                              className="text-yellow-400 hover:text-yellow-300 tracking-widest font-black transition-colors duration-200 cursor-pointer uppercase text-[9px] bg-yellow-500/5 border border-yellow-500/20 px-2 py-0.5 rounded-md hover:scale-105 transform active:scale-95 ease-[cubic-bezier(0.34,1.06,0.5,1)]"
                            >
                              {expandedTier === tier ? 'COLLAPSE TERMINAL ✕' : '⌞ EXPAND ⌝'}
                            </button>
                          </div>
                          
                          <div className="w-full h-2.5 bg-black/40 rounded-full border border-white/5 overflow-hidden p-0.5">
                            <div className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} style={{ width: `${percent}%` }} />
                          </div>

                          {/* Expandable Historic Sub-List Panel Accordion Block */}
                          {expandedTier === tier && (
                            <div className="w-full bg-black/50 border border-white/5 rounded-xl p-3 mt-2 space-y-2 animate-slideDown max-h-48 overflow-y-auto">
                              {matchingScans.length === 0 ? (
                                <div className="text-center text-slate-600 text-[10px] uppercase py-2">No infrastructure nodes currently indexed under this security matrix.</div>
                              ) : (
                                matchingScans.map((historyNode, index) => (
                                  <div key={index} className="border border-white/5 bg-[#070a13]/60 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2 transition-transform hover:translate-x-1 duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)]">
                                    <div className="space-y-0.5 max-w-md">
                                      <div className="font-bold text-yellow-400 truncate text-[11px]">{historyNode.url}</div>
                                      <div className="text-[10px] text-slate-400 uppercase">REGISTRAR: {historyNode.metadata?.registrar || 'UNKNOWN EDGE'} // LOG TIME: {historyNode.timestamp}</div>
                                    </div>
                                    <div className="text-[10px] font-black text-right shrink-0 uppercase tracking-widest text-slate-500">
                                      POSTURE SCORE: <span className="text-white font-mono font-bold">{historyNode.score}%</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ========================================================
                    🌌 VIEW STATE A: INITIAL BLANK PORTAL MODULES (BEFORE SCAN)
                    ======================================================== */}
                {!scanReport && !isScanning && (
                  <div className="w-full space-y-6 text-xs font-mono text-left animate-fadeIn">
                    
                    {/* Live Network Core Simulation Telemetry Ticker */}
                    <div className="w-full rounded-xl border border-white/5 bg-black/60 p-4 space-y-2 shadow-inner">
                      <div className="text-emerald-400 font-bold tracking-widest text-[9px] uppercase flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        CYVORA_CORE // LIVE_RECON_DIAGNOSTICS_STREAM
                      </div>
                      <div className="text-slate-500 leading-relaxed space-y-0.5 font-mono text-[10px] select-none uppercase">
                        <div className="animate-pulse">[MONITOR] Hooking local loopback adapters on thread pool systems...</div>
                        <div>[AUTHENTICATION] Active clearance token matrix footprint securely mapped...</div>
                        <div className="text-purple-400/70 animate-pulse">[NET_ENGINE] Listening for target validation inputs on port 5000...</div>
                      </div>
                    </div>

                    {/* Interactive Core Protocol Educational Guide Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="border border-white/5 bg-[#0e1322]/40 p-5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] hover:border-purple-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/20 group">
                        <div className="text-purple-500 font-bold text-[10px] tracking-widest uppercase mb-1">STRATEGY_01 // FIREWALL</div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-2 group-hover:text-purple-400 transition-colors">CONTENT SECURITY POLICY</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px] font-sans">Blocks cross-site injection exploits by explicitly telling the user's browser which data source layers are permitted to execute scripts.</p>
                      </div>
                      <div className="border border-white/5 bg-[#0e1322]/40 p-5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] hover:border-cyan-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/20 group">
                        <div className="text-cyan-400 font-bold text-[10px] tracking-widest uppercase mb-1">STRATEGY_02 // CRYPTO</div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-2 group-hover:text-cyan-400 transition-colors">STRICT TRANSPORT BOUNDARY</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px] font-sans">Forces user client interfaces to run un-interceptable SSL/TLS connections, completely neutralizing cleartext cookie sniffing surface threats.</p>
                      </div>
                      <div className="border border-white/5 bg-[#0e1322]/40 p-5 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] hover:border-yellow-500/40 hover:-translate-y-1 hover:shadow-2xl hover:shadow-yellow-950/20 group">
                        <div className="text-yellow-500 font-bold text-[10px] tracking-widest uppercase mb-1">STRATEGY_03 // SPOOF</div>
                        <h4 className="text-white font-bold uppercase tracking-wider mb-2 group-hover:text-yellow-400 transition-colors">DMARC AUTHENTICATION</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px] font-sans">Leverages global DNS verification to block attackers from spoofing institutional email headers during phishing campaigns.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    📈 VIEW STATE B: ACTIVE RESULTS HUB METRICS (AFTER SCAN)
                    ======================================================== */}
                {scanReport && !isScanning && (
                  <div className="w-full space-y-6 animate-fadeIn text-xs font-mono text-left">
                    
                    {/* VISUAL GRAPHS BLOCK ARRAY */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Graph Item 1: Horizontal Progress Track Bar */}
                      <div className="rounded-xl border border-white/5 bg-[#0e1322]/40 p-6 space-y-4 shadow-xl md:col-span-2 flex flex-col justify-center">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Cyber Defensibility Rating:</span>
                          <span className="text-sm font-black text-white">{scanReport.score}%</span>
                        </div>
                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${scanReport.score < 50 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}
                            style={{ width: `${scanReport.score}%` }}
                          />
                        </div>
                        <div className={`p-2.5 rounded-lg border text-center font-bold tracking-wider text-[11px] uppercase ${scanReport.statusColor}`}>
                          {scanReport.statusText}
                        </div>
                      </div>

                      {/* Graph Item 2: SVG Vector Radial Shield Circle Ring */}
                      <div className="rounded-xl border border-white/5 bg-[#0e1322]/40 p-4 flex flex-col items-center justify-center shadow-xl">
                        <span className="text-[9px] tracking-wider text-slate-500 uppercase block font-bold w-full text-center mb-2">ENGINE_SECURITY_GRADE</span>
                        <div className="w-20 h-20 relative">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 32">
                            <circle cx="18" cy="16" r="14" fill="none" stroke="#1e293b" strokeWidth="2.5" />
                            <circle cx="18" cy="16" r="14" fill="none" className={scanReport.gradeColor} strokeWidth="2.5" strokeDasharray={`${scanReport.score} 100`} strokeLinecap="round" />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-2xl font-black ${scanReport.gradeColor}`}>{scanReport.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Registry Summary Infrastructure Card */}
                    <div className="rounded-xl border border-white/5 bg-[#0e1322]/40 p-5 flex flex-col justify-center space-y-2.5 shadow-xl">
                      <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-slate-500">TARGET CONNECTION PATH:</span><span className="text-yellow-400 font-bold truncate max-w-[260px] md:max-w-[450px]">{scanReport.url}</span></div>
                      <div className="flex justify-between border-b border-white/5 pb-1.5"><span className="text-slate-500">NETWORK OWNER REGISTRAR:</span><span className="text-white uppercase">{scanReport.metadata.registrar}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">MONITOR STABILITY WINDOW:</span><span className="text-cyan-400 font-bold">{scanReport.metadata.ageDays === 0 ? "ZERO (LOCAL TEST ENVIRONMENT)" : `${scanReport.metadata.ageDays} DAYS OPERATIONAL COMPLIANCE`}</span></div>
                    </div>

                    {/* Dynamic Simulated Network Packet Inspection Dump */}
                    <div className="w-full bg-black/60 border border-white/5 rounded-xl p-4 space-y-2">
                      <div className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">INTERCEPT_STREAM // HTTP_RAW_PACKET_DECODER_CAPTURE</div>
                      <div className="text-[#64748b] text-[10px] font-mono whitespace-pre overflow-x-auto bg-black/40 p-3 rounded-lg leading-relaxed select-all">
                        {`GET / HTTP/1.1\nHost: ${scanReport.url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}\nUser-Agent: CyvoraScanner/3.0.0_NodeCORE\nAccept: application/json\nConnection: keep-alive\n\nHTTP/1.1 200 OK\nServer: Cloudflare Edge Distribution\nStrict-Transport-Security: max-age=31536000; includeSubDomains`}
                      </div>
                    </div>

                    {/* VULNERABILITY HIGHLIGHTS CARD */}
                    <div className="rounded-xl border border-white/5 bg-[#0e1322]/20 p-6 space-y-3">
                      <h4 className="text-slate-400 font-black tracking-wide uppercase text-[10px]">🔎 SYSTEM PROTECTION DEFICIENCIES & DETECTED GAPS:</h4>
                      <div className="space-y-2">
                        {scanReport.gaps.map((gap, idx) => (
                          <div key={idx} className="p-3 rounded-xl border border-yellow-500/10 bg-yellow-500/5 flex items-center gap-3 text-yellow-400">
                            <span className="text-sm">⚡</span>
                            <span className="uppercase font-bold tracking-wide text-[11px]">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* DEEP CONFIG TRIGGER ACCESS TRIGGERS */}
                    {!showDeepConfig && (
                      <div className="w-full text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsConfigLoading(true);
                            setTimeout(() => {
                              setIsConfigLoading(false);
                              setShowConfig(true);
                            }, 1000);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 px-8 h-12 font-mono text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-purple-950/40 transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] cursor-pointer hover:scale-[1.01]"
                        >
                          {isConfigLoading ? 'COMPILING SERVER ARCHITECTURE TOKENS...' : 'ACCESS ARCHITECTURAL SITE CONFIG TERMINAL ↓'}
                        </button>
                      </div>
                    )}

                    {/* STAGE 2 DYNAMIC CONFIG AUDIT DETAILS */}
                    {showDeepConfig && (
                      <div className="w-full space-y-6 border-t border-white/5 pt-6 animate-slideDown">
                        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                          <div className="text-purple-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                            <span>🛡️</span> <h3>STAGE_2_DEEP_CONFIGURATION_HARDENING_METRICS</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowConfig(false)}
                            className="px-3 py-1 font-mono text-[10px] font-black tracking-wider text-purple-400 bg-purple-500/5 border border-purple-500/20 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] cursor-pointer"
                          >
                            ← CLOSE CONFIG TERMINAL
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* HTTP Firewall headers tracking dashboard metrics table */}
                          <div className="rounded-xl border border-white/5 bg-[#0e1322]/50 p-6 shadow-xl space-y-3">
                            <h4 className="font-bold text-white uppercase tracking-wide">HTTP Response Firewall Headers</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 rounded bg-black/20">
                                <span className="text-slate-400">Content-Security-Policy</span>
                                <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${scanReport.type === 'local' || scanReport.type === 'academic' ? 'bg-red-500/5 text-red-400 border-red-500/10' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'}`}>
                                  {scanReport.type === 'local' || scanReport.type === 'academic' ? 'ABSENT' : 'SECURED'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-2 rounded bg-black/20">
                                <span className="text-slate-400">Strict-Transport-Security</span>
                                <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${scanReport.type === 'local' || scanReport.type === 'academic' ? 'bg-red-500/5 text-red-400 border-red-500/10' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'}`}>
                                  {scanReport.type === 'local' || scanReport.type === 'academic' ? 'ABSENT' : 'SECURED'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-2 rounded bg-black/20">
                                <span className="text-slate-400">X-Frame-Options</span>
                                <span className={`font-bold text-[10px] px-2 py-0.5 rounded border ${scanReport.type === 'local' ? 'bg-red-500/5 text-red-400 border-red-500/10' : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10'}`}>
                                  {scanReport.type === 'local' ? 'ABSENT' : 'SECURED'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Cryptographic cipher handshake stats card */}
                          <div className="rounded-xl border border-white/5 bg-[#0e1322]/50 p-6 shadow-xl space-y-3">
                            <h4 className="font-bold text-white uppercase tracking-wide">Cryptographic Handshake Architecture</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 rounded bg-black/20"><span className="text-slate-400">Handshake Encryption:</span><span className={scanReport.type === 'local' ? "text-red-400" : "text-emerald-400"}>{scanReport.metadata.protocol}</span></div>
                              <div className="flex justify-between items-center p-2 rounded bg-black/20"><span className="text-slate-400">Cipher Protocol Stack:</span><span className="text-yellow-400 text-[10px] font-mono truncate max-w-[150px]">{scanReport.metadata.cipher}</span></div>
                              <div className="flex justify-between items-center p-2 rounded bg-black/20"><span className="text-slate-400">Spoofing Resistance:</span><span className="text-cyan-400 font-mono truncate max-w-[150px]">{scanReport.metadata.dmarc}</span></div>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Server Exploit Remediation Tab Block */}
                        <div className="w-full rounded-xl border border-white/5 bg-black/40 p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-purple-400 font-bold uppercase tracking-widest text-[10px]">REMEDIATION_WIZARD // PATCH_INSTRUCTIONS</span>
                            <div className="flex gap-2">
                              {['nginx', 'apache'].map(tab => (
                                <button
                                  key={tab}
                                  type="button"
                                  onClick={() => setRemediationTab(tab)}
                                  className={`px-3 py-1 text-[9px] font-bold uppercase rounded border transition-all ${remediationTab === tab ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-white/5 text-slate-500 hover:text-white'}`}
                                >
                                  {tab.toUpperCase()}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-black/80 p-3 rounded-lg font-mono text-[11px] text-emerald-400/90 whitespace-pre overflow-x-auto select-all leading-relaxed">
                            {remediationTab === 'nginx' ? (
                              `# Append within server {} configuration context blocks\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self';";\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\nadd_header X-Frame-Options "DENY" always;`
                            ) : (
                              `# Append within your active .htaccess file configurations\nHeader set Content-Security-Policy "default-src 'self';"\nHeader set Strict-Transport-Security "max-age=31536000; includeSubDomains"\nHeader set X-Frame-Options "DENY"`
                            )}
                          </div>
                        </div>

                        {/* Defensibility rating scorecard pros and cons scorecard summary view */}
                        <div className="rounded-xl border border-white/10 bg-[#0f172a]/70 p-6 space-y-4">
                          <div className="text-yellow-500 font-bold tracking-widest uppercase text-[11px]">DEFENSIBILITY SUMMARY VS MODERN ACTION VECTORS</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                              <div className="font-bold text-emerald-400">🟢 ENVIRONMENT STRENGTHS:</div>
                              <p className="text-slate-400 leading-relaxed text-[11px] uppercase tracking-wide">
                                {scanReport.type === 'local' && "Excellent private loopback configuration layout for sandboxed module tests without web tracking network hooks."}
                                {scanReport.type === 'enterprise' && "Advanced content delivery clusters execute dynamic load management, neutralizing brute automation scanners completely."}
                                {scanReport.type === 'academic' && "Registered institutional routing tracks dedicated regional domains, minimizing external phishing registration risks."}
                                {scanReport.type === 'commercial' && "Standard commercial gateway structures keep token packet routing protocols aligned with primary verification checks."}
                              </p>
                            </div>
                            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-1">
                              <div className="font-bold text-red-400">🔴 DETECTION GAPS FLAGGED:</div>
                              <p className="text-slate-400 leading-relaxed text-[11px] uppercase tracking-wide">
                                {scanReport.type === 'local' && "Lack of cipher handshakes passes text packets open to intercept or inspection via local machine interfaces."}
                                {scanReport.type === 'enterprise' && "Extensive target surfaces draw non-stop exploit exploration routines, demanding custom header watches."}
                                {scanReport.type === 'academic' && "Missing explicit HTTP Strict-Transport-Security settings exposes directory paths to script fallback exploits."}
                                {scanReport.type === 'commercial' && "Absence of deep customized Content-Security-Policies can permit cross-site injection stress mutations."}
                              </p>
               </div>
                          </div>
                        </div>

                        <div className="w-full text-center pt-2">
                          <button
                            type="button"
                            onClick={() => setShowReport(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-8 h-12 font-mono text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-emerald-950/40 transition-all duration-300 cursor-pointer"
                          >
                            PREVIEW REPORT
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                )}      
              </div>
            </div>
          )} 

          {showReport && scanReport && (() => {
  const severityFor = (grade) => (grade === 'A' || grade === 'B') ? 'PASS' : (grade === 'C' ? 'WARNING' : 'CRITICAL');
  const sev = severityFor(scanReport.grade);
  const sevTheme = {
    PASS:     { text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', bar: '#10b981' },
    WARNING:  { text: 'text-yellow-400',  bg: 'bg-yellow-500/5',  border: 'border-yellow-500/20',  bar: '#f59e0b' },
    CRITICAL: { text: 'text-red-400',     bg: 'bg-red-500/5',     border: 'border-red-500/20',     bar: '#ef4444' },
  }[sev];
  const reportId = `CYV-${(scanReport.url || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase() || 'SCAN'}-${Date.now().toString().slice(-6)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div id="cyvora-report-print" className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl bg-[#0b1120] border border-white/10 text-slate-300 font-mono">
        <button type="button" onClick={() => setShowReport(false)} className="no-print absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer">
          X
        </button>

        <div className="px-10 pt-10 pb-6 border-b border-white/10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg,#7c3aed,#0891b2)' }}>
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M12 2L4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M8.5 12l2.3 2.3L15.5 9.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-[19px] font-extrabold tracking-tight text-white uppercase">Cyvora</div>
                <div className="text-[10px] font-medium text-slate-500 tracking-widest uppercase">Web Security Intelligence Platform</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Report ID</div>
              <div className="text-[13px] font-mono font-bold text-amber-400">{reportId}</div>
            </div>
          </div>
          <h1 className="mt-6 text-xl font-black text-white tracking-wide uppercase">Website Security Assessment Report</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-[11px] text-slate-500">
            <span><span className="font-semibold text-slate-400 uppercase">Target:</span> <span className="text-yellow-400">{scanReport.url}</span></span>
            <span><span className="font-semibold text-slate-400 uppercase">Generated:</span> {scanReport.timestamp || new Date().toLocaleString()}</span>
            <span><span className="font-semibold text-slate-400 uppercase">Engine:</span> Cyvora Core v3.0</span>
          </div>
        </div>

        <div className="px-10 py-8 space-y-8">
          <section className="report-section">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3">Executive Summary</h2>
            <div className="grid grid-cols-12 gap-4 items-stretch">
              <div className={`col-span-4 rounded-xl border ${sevTheme.border} ${sevTheme.bg} flex flex-col items-center justify-center py-5`}>
                <div className={`text-4xl font-black ${sevTheme.text}`}>{scanReport.grade}</div>
                <div className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${sevTheme.text}`}>Overall Grade</div>
              </div>
              <div className="col-span-8 rounded-xl border border-white/10 bg-black/20 p-5 flex flex-col justify-center gap-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-400 uppercase tracking-wide">Defensibility Score</span>
                  <span className="font-bold text-white">{scanReport.score}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${scanReport.score}%`, backgroundColor: sevTheme.bar }} />
                </div>
                <div className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${sevTheme.border} ${sevTheme.bg} ${sevTheme.text}`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sevTheme.bar }} />
                  {scanReport.statusText}
                </div>
              </div>
            </div>
          </section>

          <section className="report-section">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3">Site & Infrastructure Details</h2>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-[11px]">
                <tbody>
                  {[
                    ['Registrar', scanReport.metadata?.registrar],
                    ['Transport Encryption', scanReport.metadata?.protocol],
                    ['Cipher Suite', scanReport.metadata?.cipher],
                    ['DMARC / Spoofing Resistance', scanReport.metadata?.dmarc],
                    ['Domain Age', scanReport.metadata?.ageDays === 0 ? 'Local test environment' : `${scanReport.metadata?.ageDays} days`],
                  ].map(([label, value], i) => (
                    <tr key={label} className={i % 2 === 0 ? 'bg-black/10' : 'bg-black/30'}>
                      <td className="px-4 py-2.5 font-semibold text-slate-500 uppercase w-1/2 border-t border-white/5">{label}</td>
                      <td className="px-4 py-2.5 text-slate-200 font-medium border-t border-white/5">{value || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-section">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-3">
              Findings {scanReport.gaps?.length > 0 ? `(${scanReport.gaps.length})` : ''}
            </h2>
            {scanReport.gaps?.length > 0 ? (
              <div className="space-y-2">
                {scanReport.gaps.map((gap, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3.5">
                    <span className="mt-0.5 text-[13px] text-yellow-400">!</span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-yellow-400">Medium Risk</div>
                      <div className="text-[12px] text-slate-300 mt-0.5">{gap}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-[12px] text-emerald-400">
                No material security gaps were detected during this scan.
              </div>
            )}
          </section>

          <section className="report-section pt-4 border-t border-white/10">
            <p className="text-[10px] leading-relaxed text-slate-500">
              This automated report was generated by the Cyvora scanning engine and reflects the target's externally observable configuration at the time of the scan. It is intended as a general security awareness aid and does not constitute a certified penetration test or compliance audit. Confidential - for the intended recipient only.
            </p>
            <div className="mt-3 flex items-center justify-between text-[9px] text-slate-600 font-mono">
              <span>Cyvora Security {new Date().getFullYear()}</span>
              <span>{reportId}</span>
            </div>
          </section>
        </div>

        <div className="no-print sticky bottom-0 bg-[#0b1120]/95 backdrop-blur border-t border-white/10 px-10 py-4 flex gap-3">
          <button type="button" onClick={() => setShowReport(false)} className="flex-1 h-11 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-[12px] uppercase tracking-wide cursor-pointer">
            Close
          </button>
          <button type="button" onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="flex-1 h-11 rounded-xl text-white font-semibold text-[12px] uppercase tracking-wide shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg,#0891b2,#06b6d4)' }}>
            {isDownloadingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
})()}

          {/* VIEW C: ISOLATED WORKSPACE PLACEHOLDERS FOR FEATURE INJECTIONS */}
          {(dashSubView === 'intel' || dashSubView === 'game') && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 relative">
              <div className="w-full max-w-md rounded-xl border border-purple-500/20 bg-[#111827]/60 backdrop-blur-md p-8 text-center shadow-2xl animate-fadeIn font-mono">
                <p className="text-base font-black text-white uppercase tracking-widest">team member bnare teeno features k file</p>
              </div>
            </div>
          )}
          {/* VIEW D: FULL-SIZED DYNAMIC COMMS BRIDGE VIEW */}
          {dashSubView === 'contact' && (
            <div className="w-full h-full overflow-y-auto p-8 lg:p-12 flex flex-col justify-center items-center relative">
              <div className="w-full max-w-5xl animate-fadeIn text-left space-y-8 relative z-10">
                <div className="space-y-4">
                  <div className="text-[13px] font-bold tracking-widest text-purple-400 font-mono uppercase">
                    CYVORA CONTACT
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-black text-white tracking-wide font-mono uppercase border-b border-purple-500/20 pb-4">
                    SECURE. REPORT. DISCUSS. VIA COMMUNITY EMAIL
                  </h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed uppercase tracking-wide font-medium max-w-4xl">
                    Found a broken validation script node? Want to complain about a layout spacing issue? Or maybe you just want to talk about integrating new simulation gaming levels. WHATEVER IT IS, DROP A LINE. Don't write us a formal corporate email—talk to us like human beings.
                  </p>
                </div>

                <div className="w-full max-w-3xl rounded-xl border border-[#334155] bg-[#0f172a]/80 p-8 shadow-2xl font-mono text-xs space-y-4 relative overflow-hidden group transition-all duration-500 transform hover:rotate-x-12 hover:scale-[1.01]">
                  <div className="absolute top-0 right-0 p-3 text-[11px] text-[#FFFFFF] group-hover:text-purple-500/30 transition-colors">
                    contact us
                  </div>
                  
                  <div className="flex items-center gap-7 text-slate-400">
                    <span className="text-purple-500">●</span> 
                    <span className="text-slate-500 font-bold uppercase tracking-wider">ADMIN_CONTACT:</span> 
                    <span className="text-white font-sans text-sm">a2024cs11121@imsec.ac.in</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-purple-500">●</span> 
                    <span className="text-slate-500 font-bold uppercase tracking-wider">ADMIN_LOCATION:</span> 
                    <span className="text-white text-sm">3-CS-1</span>
                  </div>
                  
                  <div className="pt-4 border-t border-[#1e293b] space-y-3">
                    <div className="text-[#64748b] text-[10px] font-bold tracking-widest uppercase">
                      Details:
                    </div>
                    
                    <div className="p-3 rounded bg-black/40 text-emerald-400 border border-emerald-500/10 text-center uppercase tracking-widest font-bold text-xs">
                      CYVORA HELP_TEAM 24x7 -- response time: 1 2 business days
                    </div>

                    <div className="p-3 rounded bg-black/40 text-emerald-400 border border-emerald-500/10 text-center uppercase tracking-widest font-bold text-xs">
                      operating hours: 9:00 AM - 4:00 PM (Mon-Fri)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
        {/* ========================================================
            🚨 INTERACTIVE TERMINAL FLUSH RESET VERIFICATION MODAL
            ======================================================== */}
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans text-xs animate-fadeIn">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setShowResetModal(false)}></div>
            <div className="relative w-full max-w-sm rounded-2xl border border-yellow-500/20 bg-[#090d16]/90 backdrop-blur-xl p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-5 font-mono animate-scaleUp z-10">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto text-yellow-400 animate-pulse text-sm">
                  ⚠️
                </div>
                <h4 className="text-sm font-black tracking-wider text-white uppercase pt-1">FLUSH RECON CHANNELS?</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wide">
                  This action clears all workspace variables, collapses parameter terminals, and resets data views back to default state frames.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-xl border border-[#334155] bg-[#0f172a] hover:bg-[#1e293b] text-slate-400 font-bold text-[10px] tracking-widest uppercase py-2.5 transition-colors duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetUrl('');
                    setScanResult(null);
                    setScanError(null);
                    setShowConfig(false);
                    setShowResetModal(false);
                    setExpandedTier(null);
                  }}
                  className="flex-1 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[10px] tracking-widest uppercase py-2.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.06,0.5,1)] cursor-pointer active:scale-95 shadow-md shadow-yellow-900/20"
                >
                  Confirm Flush
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Cyber-Luffy Style Glassmorphism Security Confirmation Node */}
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
            {/* Click Outside Protection Frame */}
            <div className="absolute inset-0" onClick={() => setShowLogoutModal(false)}></div>
            
            {/* Immersive Glass Element Layout Shield */}
            <div className="relative w-full max-w-xs mx-4 rounded-2xl bg-[#090d16]/40 backdrop-blur-xl border border-white/10 p-6 text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6 font-mono animate-scaleUp z-10">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 animate-pulse text-sm">
                  ⚠️
                </div>
                <h4 className="text-sm font-black tracking-wider text-white uppercase pt-2">ARE YOU LOGGING OUT?</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wide">
                  You sure you want to remove your cyvora account?
                </p>
              </div>

              {/* Functional Interactive Layout Triggers */}
              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] tracking-widest uppercase py-2.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-md shadow-blue-900/20"
                >
                  No, Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowLogoutModal(false);
                    try {
                      await auth.signOut(); // Suggestion 2: Hard-kills OAuth background link connection rules
                    } catch (e) {
                      console.error("Token disposal fault:", e);
                    }
                    setView('landing');
                    handleAuthSwitch('login');
                    setDashSubView('home');
                    setHomeEntered(false);
                  }}
                  className="flex-1 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] tracking-widest uppercase py-2.5 transition-all duration-200 cursor-pointer active:scale-95 shadow-md shadow-red-900/20"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ========================================================
            🚨 SCANNER RESET VERIFICATION MODAL
            ======================================================== */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans text-xs">
            <div className="w-full max-w-sm rounded-xl border border-yellow-500/20 bg-[#111827] p-6 shadow-2xl animate-scaleUp">
              <div className="text-center space-y-3">
                <span className="text-2xl block animate-pulse">⚠️</span>
                <h3 className="text-base font-mono font-black text-white uppercase tracking-wider">RESET RECON MODULE?</h3>
                <p className="text-slate-400 leading-relaxed uppercase tracking-wide text-[10px]">
                  This action will completely flush all cached environment parameters, drop current target logs, and clear memory frames back to fallback configurations.
                </p>
              </div>
              <div className="mt-6 flex gap-3 font-mono">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 rounded-xl border border-[#334155] bg-[#0f172a] hover:bg-[#1e293b] text-slate-400 font-bold uppercase py-2.5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetUrl('');
                    setScanResult(null);
                    setScanError(null);
                    setShowConfig(false);
                    setShowResetModal(false);
                  }}
                  className="flex-1 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase py-2.5 transition-colors cursor-pointer"
                >
                  Flush Terminal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // PHASE 1.5: FULLSCREEN LEARN MORE REDIRECTION SYSTEM PORTAL
  // ========================================================
  if (openModal === 'learnMore') {
    return (
      <div className="fixed inset-0 z-50 w-screen h-screen bg-[#020c1b] text-[#f3f4f6] font-sans overflow-y-auto p-6 md:p-12 lg:p-16 selection:bg-cyan-500/30 flex flex-col justify-between animate-fadeIn relative">
        <OceanWavesBackground />
        
        <div className="flex items-center justify-between border-b border-[#111827] pb-6 relative z-10">
          <div className="text-xl font-extrabold tracking-widest text-white font-mono">CYVORA<span className="text-purple-500">_</span>Learn More Page</div>
          <button 
            onClick={() => setOpenModal(null)}
            className="rounded-lg bg-red-700/10 border border-red-500/30 px-5 py-2 text-xs font-mono font-bold text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
          >
            ← BACK
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mt-12 max-w-7xl mx-auto w-full relative z-10">
          <div className="space-y-6 text-left">
            <div className="text-[11px] font-bold tracking-widest text-purple-400 font-mono uppercase">Learn More--OVERVIEW</div>
            <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase font-mono">
              An Open Source Built for Practical Security Awareness
            </h2>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Cyvora doesn’t operate behind closed doors or hide its findings behind automated charts. The goal of this platform is to bridge the gap between complex defensive frameworks and everyday utility development. We’ve split the platform into three primary utility sectors designed to protect your browsing integrity while training you to write exploit-resistant applications.
            </p>

            <div className="space-y-4 pt-4">
              <div className="border border-[#1e293b] bg-[#111827]/40 p-4 rounded-xl flex gap-4">
                <div className="text-purple-500 font-mono font-bold text-sm pt-0.5">•</div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Real-Time URL Auditing Ecosystem</h4>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">Our main analyzer breaks down target domains, inspecting server source fields, validation routes, and public blacklists so you can instantly tell if an inbound link is hostile before interacting with it.</p>
                </div>
              </div>

              <div className="border border-[#1e293b] bg-[#111827]/40 p-4 rounded-xl flex gap-4">
                <div className="text-purple-500 font-mono font-bold text-sm pt-0.5">•</div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Decentralized Threat Feed Tracker</h4>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">Instead of static learning sheets, we hook right into active security networks to log emerging malware vulnerabilities and digital offenses the moment they break globally, giving you a live view of the digital landscape.</p>
                </div>
              </div>

              <div className="border border-[#1e293b] bg-[#111827]/40 p-4 rounded-xl flex gap-4">
                <div className="text-purple-500 font-mono font-bold text-sm pt-0.5">•</div>
                <div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase">Defensive Exploit Simulation Arena</h4>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">The best way to secure code is to safely study how it's broken. Our embedded training challenges let you interact directly with simulated injection parameters and token validation errors in a zero-risk lab setup.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center h-full w-full py-8" style={{ perspective: "1200px" }}>
            <div className="relative w-80 h-96 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-[#111827] to-[#0f172a] p-6 shadow-2xl transition-all duration-700 transform hover:rotate-y-12 hover:-rotate-x-12 hover:translate-z-12 hover:border-purple-500/50 flex flex-col justify-between group overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,transparent_70%)] pointer-events-none" />
              
              <div className="flex justify-between items-start font-mono text-[10px] text-purple-400">
                <span>[SYS_CORE_INFO]</span>
                <span className="animate-pulse text-emerald-400">● LIVE_RUNNING</span>
              </div>

              <div className="space-y-3 relative z-10 text-left pt-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-mono font-bold text-lg group-hover:scale-110 transition-transform">🛡️</div>
                <h3 className="text-xl font-black text-white font-mono tracking-wider uppercase mt-4">CYVORA</h3>
                <p className="text-xs text-[#94a3b8] leading-relaxed font-mono">Target infrastructure mapping layers are fully active.</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed font-mono">Built by IMSEC Students of 3-CS-1</p>
                <p className="text-xs text-[#94a3b8] leading-relaxed font-mono">•ARNAV KALKHANDAY •KASHISH CHAUHAN •ANAMIKA PARASHAR •VEDANSH VARSHNEY</p>
              </div>

              <div className="border-t border-[#1e293b] pt-4 font-mono text-[9px] text-[#64748b] text-left space-y-1">
                <div>INTEGRATION_STATUS: WAITING_FOR_MODULES...</div>
                <div>FIREWALL_ENCRYPTION: SHIELD_MAX_STRENGTH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upgraded Cyber-Luffy Flow Diagram Frame */}
        <div className="max-w-7xl mx-auto w-full mt-16 pt-12 pb-24 text-center select-none relative z-10">
          <div className="w-full border-4 border-solid border-red-600/50 bg-[#070e1b]/70 rounded-3xl p-8 relative overflow-visible shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            
            {/* Cyan-Green Site Overview Functioning Label */}
            <div className="absolute top-3 left-3 font-mono text-[14px] text-cyan-400 font-bold tracking-wider">CYVORA</div>
            
            <MascotBuilderNode />
            
            {/* Bold Premium Golden Yellow Section Title */}
            <div className="text-xl font-black tracking-[0.25em] text-yellow-400 font-mono uppercase mb-12 relative z-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.25)]">
              FLOW DIAGRAM
            </div>
          
            <div className="flex flex-col items-center w-full overflow-x-auto py-6 px-4">
              <div className="flex flex-col items-center w-full max-w-xl mb-4">
                <div className="relative group w-64">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'landing' ? null : 'landing')}
                    className={`p-4 rounded-xl border font-mono text-xs font-bold tracking-wider shadow-lg text-center cursor-pointer transition-all ${
                      activeNodeDesc === 'landing' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-[#334155] bg-[#0f172a] text-slate-300 hover:border-purple-500/40'
                    }`}
                  >
                    LANDING PORTAL
                  </div>
                  {activeNodeDesc === 'landing' && (
                    <div className="absolute left-full top-0 ml-4 w-72 p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA LANDING PAGE</div>
                      <p className="text-slate-400 leading-relaxed font-sans">The initial entry gate for all inbound traffic. It initializes secure web layouts, evaluates client configuration parameters. User can access basic info of sites from here via about and this page.</p>
                    </div>
                  )}
                </div>

                {/* Vertical Connector Path 1 (Yellow Laser Tracking Particles) */}
                <div className="w-full h-14 relative overflow-visible flex justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 56">
                    <line x1="50" y1="0" x2="50" y2="56" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" />
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="0s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="0.6s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="1.2s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="1.8s" /></circle>
                  </svg>
                </div>

                <div className="relative group w-64">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'login' ? null : 'login')}
                    className={`p-4 rounded-xl border font-mono text-xs font-bold tracking-wider shadow-lg text-center cursor-pointer transition-all ${
                      activeNodeDesc === 'login' ? 'border-purple-500 bg-purple-500/10 text-white' : 'border-[#334155] bg-[#0f172a] text-slate-300 hover:border-purple-500/40'
                    }`}
                  >
                    LOGIN / SIGNUP
                  </div>
                  {activeNodeDesc === 'login' && (
                    <div className="absolute left-full top-0 ml-4 w-72 p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA AUTHENTICATION</div>
                      <p className="text-slate-400 leading-relaxed font-sans">Processes authentication against current server records. Enforces strict password verification routines and handles unique username checking parameters.</p>
                    </div>
                  )}
                </div>

                {/* Vertical Connector Path 2 (Yellow Laser Tracking Particles) */}
                <div className="w-full h-14 relative overflow-visible flex justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 56">
                    <line x1="50" y1="0" x2="50" y2="56" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" />
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="0s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="0.6s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="1.2s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="1.8s" /></circle>
                  </svg>
                </div>

                <div className="relative group w-64">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'otp' ? null : 'otp')}
                    className={`p-4 rounded-xl border font-mono text-xs font-bold tracking-wider shadow-lg text-center cursor-pointer transition-all ${
                      activeNodeDesc === 'otp' ? 'border-purple-500 bg-purple-500/10 text-purple-400' : 'border-purple-500/30 bg-[#111827] text-purple-400 hover:border-purple-500/50'
                    }`}
                  >
                    OTP_CHECK
                  </div>
                  {activeNodeDesc === 'otp' && (
                    <div className="absolute left-full top-0 ml-4 w-72 p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA OTP VERIFICATION</div>
                      <p className="text-slate-400 leading-relaxed font-sans">Send the triggered SMTP script via Nodemailer to route an expiring 10-min. cryptographic activation token directly to the verified email inbox.</p>
                    </div>
                  )}
                </div>

                {/* Vertical Connector Path 3 (Yellow Laser Tracking Particles) */}
                <div className="w-full h-14 relative overflow-visible flex justify-center">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 56">
                    <line x1="50" y1="0" x2="50" y2="56" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" />
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="0s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="0.6s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="1.2s" /></circle>
                    <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.5s" repeatCount="indefinite" path="M 50 0 L 50 56" begin="1.8s" /></circle>
                  </svg>
                </div>

                <div className="relative group w-64">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'dashboard' ? null : 'dashboard')}
                    className={`p-4 rounded-xl border-2 font-mono text-xs text-white font-black tracking-widest shadow-2xl shadow-purple-500/10 text-center uppercase cursor-pointer transition-all ${
                      activeNodeDesc === 'dashboard' ? 'border-purple-400 bg-purple-500/30 shadow-purple-500/20' : 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20'
                    }`}
                  >
                    Master Dashboard
                  </div>
                  {activeNodeDesc === 'dashboard' && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 w-72 p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA DASHBOARD</div>
                      <p className="text-slate-400 leading-relaxed font-sans">The root control terminal layer. Once security permissions are approved, it MAPS the CYVORA interface together and dynamically user can access further CYVORA features.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Way Splitting Connector Vectors (All Flowing Matrix Nodes Shifted to Vibrant Yellow-Gold) */}
              <div className="w-full max-w-5xl h-20 relative overflow-visible flex justify-center">
                <svg className="w-full h-full overflow-visible shrink-0" viewBox="0 0 960 80">
                  <path d="M 480 0 L 160 80" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" fill="none" />
                  <path d="M 480 0 L 480 80" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" fill="none" />
                  <path d="M 480 0 L 800 80" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="2" fill="none" />

                  {/* Left Branch Laser Stream */}
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 160 80" begin="0s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 160 80" begin="0.7s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 160 80" begin="1.4s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 160 80" begin="2.1s" /></circle>

                  {/* Center Branch Laser Stream */}
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 480 80" begin="0s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 480 80" begin="0.7s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 480 80" begin="1.4s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 480 80" begin="2.1s" /></circle>

                  {/* Right Branch Laser Stream */}
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 800 80" begin="0s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 800 80" begin="0.7s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 800 80" begin="1.4s" /></circle>
                  <circle r="3.5" fill="#eab308" filter="drop-shadow(0 0 5px #eab308)"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 480 0 L 800 80" begin="2.1s" /></circle>
                </svg>
              </div>

              {/* Sub-Feature Leaf Node Grid */}
              <div className="w-full max-w-5xl grid grid-cols-3 gap-6 pt-2 min-w-[850px]">
                <div className="relative flex flex-col items-center">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'scanner' ? null : 'scanner')}
                    className={`w-full p-4 rounded-xl border bg-[#111827]/60 shadow-md text-left flex items-center gap-3 cursor-pointer transition-all ${
                      activeNodeDesc === 'scanner' ? 'border-purple-400 bg-purple-500/5' : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
                  >
                    <span className="text-xl text-yellow-500">•</span>
                    <div>
                      <h5 className="font-mono text-[11px] font-bold text-white uppercase tracking-wide">URL SECURITY Scanner</h5>
                      <p className="text-[9px] text-[#64748b] font-mono mt-0.5">Integrates Live Target Configuration</p>
                    </div>
                  </div>
                  {activeNodeDesc === 'scanner' && (
                    <div className="absolute bottom-full mb-4 w-full p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA SECURITY IDENTIFIER_SCANNER</div>
                      <p className="text-slate-400 leading-relaxed font-sans">Performs live automated recon loops across foreign hyperlinks. It parses page structures, checks domain registration age records, and flags suspicious backend redirections.</p>
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col items-center">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'intel' ? null : 'intel')}
                    className={`w-full p-4 rounded-xl border bg-[#111827]/60 shadow-md text-left flex items-center gap-3 cursor-pointer transition-all ${
                      activeNodeDesc === 'intel' ? 'border-purple-400 bg-purple-500/5' : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
                  >
                    <span className="text-xl text-yellow-500">•</span>
                    <div>
                      <h5 className="font-mono text-[11px] font-bold text-white uppercase tracking-wide">THREAT INTEL FEED</h5>
                      <p className="text-[9px] text-[#64748b] font-mono mt-0.5">On time Effective Cyber Breach News</p>
                    </div>
                  </div>
                  {activeNodeDesc === 'intel' && (
                    <div className="absolute bottom-full mb-4 w-full p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA THREAT INFO_LISTS</div>
                      <p className="text-slate-400 leading-relaxed font-sans">Streams real-time worldwide incident bulletins directly into your screen console. Explaining emerging malware attacks and social engineering tricks.</p>
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col items-center">
                  <div 
                    onClick={() => setActiveNodeDesc(activeNodeDesc === 'game' ? null : 'game')}
                    className={`w-full p-4 rounded-xl border bg-[#111827]/60 shadow-md text-left flex items-center gap-3 cursor-pointer transition-all ${
                      activeNodeDesc === 'game' ? 'border-purple-400 bg-purple-500/5' : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
                  >
                    <span className="text-xl text-yellow-500">•</span>
                    <div>
                      <h5 className="font-mono text-[11px] font-bold text-white uppercase tracking-wide">Threat Simulation Arena</h5>
                      <p className="text-[9px] text-[#64748b] font-mono mt-0.5">Interactive Game to Practice threat Scenarios</p>
                    </div>
                  </div>
                  {activeNodeDesc === 'game' && (
                    <div className="absolute bottom-full mb-4 w-full p-4 rounded-xl border border-purple-500/40 bg-[#111827] text-left shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                      <button onClick={(e) => { e.stopPropagation(); setActiveNodeDesc(null); }} className="absolute top-2 right-2 text-slate-500 hover:text-white transition-colors">✕</button>
                      <div className="text-purple-400 font-bold mb-1">CYVORA GAME - LEARN ARENA</div>
                      <p className="text-slate-400 leading-relaxed font-sans">An interactive playground featuring isolated cyber vulnerability scenarios. Allows you to observe how web parameters get exploited and practice patching vulnerabilities hands-on.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
  // ==========================================
  // PHASE 0: GATEWAY INTRODUCTION PORTAL
  // ==========================================
  if (view === 'intro') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden select-none p-6">
        {/* Immersive Background Canvas Asset (Pulsing during wait state, fades/zooms out during exit cascade) */}
        <img 
          src="/luffy_fixed.jpg" 
          alt="Pirate King Gateway" 
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-0 select-none transition-all duration-700 ease-in-out ${
            isExitingIntro 
              ? 'scale-120 blur-sm opacity-0' 
              : 'scale-110 opacity-70 animate-pulse [animation-duration:8s]'
          }`}
        />

        {/* Subtle Radial Dimming Contrast Mask */}
        <div className={`absolute inset-0 bg-black/30 backdrop-blur-[1px] z-0 pointer-events-none transition-opacity duration-500 ${
          isExitingIntro ? 'opacity-0' : 'opacity-100'
        }`} />

        {/* ========================================================
            CASCADING OVERLAY TEXT LAYER ELEMENTS
            ======================================================== */}
        <div 
          className={`relative z-10 text-center space-y-8 max-w-xl flex flex-col items-center justify-center transition-all duration-500 ease-in-out transform ${
            isExitingIntro ? 'translate-y-28 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          {/* Animated Header Brand Container Stack */}
          <div className="space-y-3">
            <div className="font-mono text-[14px] tracking-[0.5rem] text-yellow-400/80 uppercase bg-yellow-950/30 border border-yellow-500/15 px-4 py-1.5 rounded-md max-w-max mx-auto select-none">
              WELCOME TO
            </div>
            
            {/* High-Tech Scrambling Text Matrix Engine Layer */}
            <div className="py-4 flex items-center justify-center min-h-[5rem]">
              <DecryptedText target="CYVORA" duration={1600} fps={18} />
            </div>
            
            <p className="text-xs uppercase tracking-[0.3em] text-purple-400 font-mono font-bold animate-pulse pt-2">
              ONE PIECE IS REAL ! guyz
            </p>
          </div>

          {/* Upgraded Cyber-Action Operational Trigger Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleEnterSystem} // Seamlessly intercepts the switch to execute the drop animation
              className="group relative inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-8 py-4 font-mono text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-red-900/40 transition-all duration-200 cursor-pointer hover:scale-[1.03] active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                ENTER SYSTEM <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 rounded-xl bg-red-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>

        {/* Matrix Falling Code Cascade Block Overlay Shutter */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b from-transparent to-black/90 pointer-events-none transition-opacity duration-500 ${
            isExitingIntro ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
    );
  }
  // ==========================================
  // MID-FLIGHT IMMERSIVE DOG LOADER LOOP
  // ==========================================
  if (view === 'loading') {
    return <DogLoaderScreen />;
  }
  // ==========================================
  // PHASE 1: THE CYBER LANDING PAGE
  // ==========================================
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#05060a] text-[#f3f4f6] font-sans selection:bg-purple-500/30 relative">
        {/* Mount Handcrafted Twinkling Starfield Animation Engine */}
        <StarfieldBackground />
        
        {/* ========================================================
            FULL-HEIGHT SIDE OVERLAY PANEL MASK (BLURS BACKGROUND)
            ======================================================== */}
        {openModal && (
          <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-md transition-all duration-300">
            <div className="absolute inset-0 cursor-pointer" onClick={() => setOpenModal(null)}></div>

            {/* FLOATING SPACE ZONE: Correctly renders your new snappy 6-card carousel on the left */}
            {openModal === 'about' && (
              <div className="hidden md:flex w-[40vw] h-screen flex-col items-center justify-center relative z-10 p-6 animate-fadeIn">
                <ThreeDCarousel />
              </div>
            )}

            {/* EXTRA FLOATING LIST COMPONENT SPECIFICALLY FOR THE FEATURES VIEW OVERLAY */}
            {openModal === 'features' && (
              <div className="hidden lg:flex flex-col w-[25vw] h-screen bg-slate-900/10 border-l border-purple-500/10 p-6 space-y-4 overflow-y-auto z-10 animate-fadeIn text-left backdrop-blur-sm ml-auto">
                <div className="text-[11px] font-bold tracking-widest text-purple-400 font-mono uppercase mb-1">
                  FEATURES LIST:
                </div>
                
                <div 
                  onClick={() => { setOpenModal(null); setView('auth'); setAuthMode('signup'); setAuthStep(1); }}
                  className="group border border-purple-500/15 bg-[#111827]/30 hover:bg-purple-600/15 p-4 rounded-xl cursor-pointer transition-all hover:border-purple-500/40 shadow-lg backdrop-blur-sm"
                >
                  <h4 className="text-xs font-bold text-white tracking-wide font-mono group-hover:text-purple-400 transition-colors">● Configuration Wizard</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-1.5 leading-normal">Map target domain registries and instantly scan for hidden exposed sub-nodes.</p>
                </div>

                <div 
                  onClick={() => { setOpenModal(null); setView('auth'); setAuthMode('signup'); setAuthStep(1); }}
                  className="group border border-purple-500/15 bg-[#111827]/30 hover:bg-purple-600/15 p-4 rounded-xl cursor-pointer transition-all hover:border-purple-500/40 shadow-lg backdrop-blur-sm"
                >
                  <h4 className="text-xs font-bold text-white tracking-wide font-mono group-hover:text-purple-400 transition-colors">● Game Simulator</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-1.5 leading-normal">Train users in a controlled environment to recognize and respond to various cyber threats.</p>
                </div>

                <div 
                  onClick={() => { setOpenModal(null); setView('auth'); setAuthMode('signup'); setAuthStep(1); }}
                  className="group border border-purple-500/15 bg-[#111827]/30 hover:bg-purple-600/15 p-4 rounded-xl cursor-pointer transition-all hover:border-purple-500/40 shadow-lg backdrop-blur-sm"
                >
                  <h4 className="text-xs font-bold text-white tracking-wide font-mono group-hover:text-purple-400 transition-colors">● Social Engineering News</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-1.5 leading-normal">Provide end to end details - description of most arising new cyber threats and precautions against potential threats.</p>
                </div>

                <div 
                  onClick={() => { setOpenModal(null); setView('auth'); setAuthMode('signup'); setAuthStep(1); }}
                  className="group border border-purple-500/15 bg-[#111827]/30 hover:bg-purple-600/15 p-4 rounded-xl cursor-pointer transition-all hover:border-purple-500/40 shadow-lg backdrop-blur-sm"
                >
                  <h4 className="text-xs font-bold text-white tracking-wide font-mono group-hover:text-purple-400 transition-colors">● Brute-Force Stress Shield</h4>
                  <p className="text-[11px] text-[#94a3b8] mt-1.5 leading-normal">Simulate automated dictionary access stuffing to secure validation boundaries, Parse forms and incoming payload scripts inline to capture vulnerability endpoints.</p>
                </div>
              </div>
            )}

            {/* THE MAIN DRAWER WINDOW: Adjusts width dynamically based on active selection */}
            <div className={`h-screen bg-black border-l border-purple-500/20 p-12 relative shadow-2xl text-left flex flex-col justify-between overflow-y-auto z-10 animate-fadeIn ${openModal === 'features' ? 'w-full lg:w-[35vw]' : 'w-full md:w-[60vw] ml-auto'}`}>
              <button 
                onClick={() => setOpenModal(null)} 
                className="absolute top-6 right-6 text-slate-400 hover:text-white font-mono text-lg cursor-pointer transition-colors p-2"
              >
                ✕
              </button>

              <div className="space-y-6 mt-4">
                {openModal === 'features' && (
                  <>
                    <h3 className="text-2xl font-bold text-white tracking-wide font-mono uppercase border-b border-purple-500/20 pb-3">
                      Features & Integrations :
                    </h3>
                    <p className="text-sm text-[#94a3b8] leading-relaxed uppercase tracking-wide">
                      We help you to map out complex infrastructure, to expose misconfigured scripts and tokens in them. LEARN WHILE YOU SECURE YOURSELF FROM HACKERS AND MALWARES.
                    </p>
                    
                    <h4 className="text-lg font-bold text-white tracking-wide font-mono uppercase pt-4">
                      Future Integrations Will Include:
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-300 font-mono pl-2">
                      <li className="flex items-center gap-3">
                        <span className="text-purple-500 text-base">●</span> Automated Security Layout Auditing Arrays
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-purple-500 text-base">●</span> Decentralized Real-Time Distributed Threat Intelligence Streams
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-purple-500 text-base">●</span> Cross-Site Scripting (XSS) Sandbox Vulnerability Labs
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-purple-500 text-base">●</span> Dark Web Identity Signature Leakage Trackers
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-purple-500 text-base">●</span> Secure Reportting and more AI driven chat-bot to help conatct us and resolve issues.
                      </li>
                    </ul>
                  </>
                )}

                {openModal === 'about' && (
                  <div className="space-y-6 animate-fadeIn text-left mt-2">
                    <div className="space-y-4">
                      <span className="text-[18px] font-mono font-bold tracking-widest uppercase text-cyan-400 block">
                        CYVORA ABOUT-US PAGE
                      </span>
                      <h2 className="text-2 font-black font-mono tracking-wider text-yellow-400 uppercase">
                        WHY CYVORA EXISTS
                      </h2>
                      <p className="text-xs text-[#94a3b8] leading-relaxed uppercase tracking-wide font-medium bg-[#0f172a]/60 p-4 rounded-xl border border-[#1e293b]">
                        Honestly, most cybersecurity platforms are completely boring or way too complicated for everyday developers to understand. Cyvora was built because we got tired of reading 100-page enterprise PDF reports that make no sense. WE WANT TO MAKE RECON AND THREAT MANAGEMENT TRANSPARENT. You shouldn't need a PhD to know if a URL is trying to steal your data logs or if your script files are open to exploitation.
                      </p>
                    </div>

                    {/* Balanced Dual-Grid System for SPEC Modules */}
                    <div className="grid grid-cols-1 gap-3 pt-1">
                      <div className="border border-purple-500/10 bg-[#0f172a]/40 p-4 rounded-xl transition-all duration-300 hover:border-purple-500/40 shadow-xl group">
                        <div className="text-purple-400 font-mono text-[9px] font-bold mb-0.5">SPEC_01--CYVORA(defense)</div>
                        <h4 className="text-white text-xs font-bold font-mono uppercase mb-1 group-hover:text-purple-400 transition-colors">The Sandbox Philosophy</h4>
                        <p className="text-[11px] text-[#64748b] leading-relaxed">We don't just protect you behind a blind wall. We let you interact with simulated hostile payloads inside an isolated workspace framework so you can actually understand how security loops operate under stress.</p>
                      </div>

                      <div className="border border-purple-500/10 bg-[#0f172a]/40 p-4 rounded-xl transition-all duration-300 hover:border-purple-500/40 shadow-xl group">
                        <div className="text-purple-400 font-mono text-[9px] font-bold mb-0.5">SPEC_02--CYVORA(community)</div>
                        <h4 className="text-white text-xs font-bold font-mono uppercase mb-1 group-hover:text-purple-400 transition-colors">Distributed Threat Feed</h4>
                        <p className="text-[11px] text-[#64748b] leading-relaxed">Cybercrimes adapt faster than legacy documentation structures. Cyvora streams decentralized global incident metrics directly into your terminal dashboard so you learn about active system breaches the second they occur.</p>
                      </div>
                    </div>
                  </div>
                )}

                {openModal === 'contact' && (
                  <div className="space-y-8 animate-fadeIn text-left h-full flex flex-col justify-between">
                    <div className="space-y-6">
                      <div className="text-[13px] font-bold tracking-widest text-yellow-400 font-mono uppercase">
                        CYVORA CONTACT PAGE - contact us.
                      </div>
                      <h3 className="text-3xl font-black text-white tracking-wide font-mono uppercase border-b border-purple-500/20 pb-4">
                        SECURE. REPORT. DISCUSS. VIA COMMUNITY EMAIL
                      </h3>
                      <p className="text-sm text-[#94a3b8] leading-relaxed uppercase tracking-wide font-medium">
                        Found a broken validation script node? Want to complain about a layout spacing issue? Or maybe you just want to talk about integrating new simulation gaming levels. WHATEVER IT IS, DROP A LINE. Don't write us a formal corporate email.
                      </p>
                    </div>

                    <div className="w-full max-w-xl mx-auto py-4" style={{ perspective: "1000px" }}>
                      <div className="rounded-xl border border-[#334155] bg-[#0f172a]/80 p-6 shadow-2xl font-mono text-xs space-y-4 transition-all duration-500 transform hover:rotate-x-12 hover:scale-[1.02] hover:border-purple-500/30 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 text-[11px] text-[#FFFFFF] group-hover:text-purple-500/30 transition-colors">contact us</div>
                        
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-purple-500">●</span> <span className="text-slate-500">ADMIN_CONTACT:</span> a2024cs11121@imsec.ac.in
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span className="text-purple-500">●</span> <span className="text-slate-500">ADMIN_LOCATION:</span> 3-CS-1
                        </div>
                        
                        <div className="pt-4 border-t border-[#1e293b] space-y-2">
                          <div className="text-[#64748b] text-[10px]">Details:</div>
                          <div className="p-3 rounded bg-black/40 text-emerald-400 border border-emerald-500/10 text-center uppercase tracking-widest">
                            CYVORA-HELP_TEAM-24x7 -- response time:1-2 business days 
                          </div>
                          <div className="p-3 rounded bg-black/40 text-emerald-400 border border-emerald-500/10 text-center uppercase tracking-widest">
                            operating hours: 9:00 AM - 4:00 PM (Mon-Fri) 
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[#1e293b] text-right mt-8">
                <button 
                  onClick={() => setOpenModal(null)}
                  className="rounded-lg bg-red-700 hover:bg-red-600 px-6 py-3 text-xs font-bold text-white transition-all cursor-pointer shadow-lg shadow-red-900/20 active:scale-95"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        <nav className="flex items-center justify-between max-w-7xl mx-auto px-6 py-5 border-b border-[#111827] relative z-10">
          <div className="text-xl font-extrabold tracking-widest text-white font-mono">
            CYVORA<span className="text-purple-500">.</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-[#94a3b8] font-medium">
            <button onClick={() => setOpenModal('features')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none">Features</button>
            <button onClick={() => setOpenModal('about')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none">About</button>
            <button onClick={() => setOpenModal('contact')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none outline-none">Contact</button>
          </div>
          <button 
            onClick={() => { setView('auth'); setAuthMode('login'); }}
            className="rounded-lg bg-red-700/20 border border-red-500/30 px-5 py-2 text-xs font-semibold text-red-400 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
          >
            Login
          </button>
        </nav>

        {/* Hero Operational Frame */}
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center pt-24 pb-16 text-left relative z-10">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Cyvora <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Scan. Learn. Secure.
              </span>
            </h1>
            <p className="text-[#94a3b8] text-base lg:text-lg max-w-lg leading-relaxed">
              Assess website security layouts, stay constantly updated with real-time distributed threat intelligence arrays, and escalate your defensive scripts with multi-layered interactive lab challenges.
            </p>
            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => { setView('auth'); setAuthMode('signup'); }}
                className="rounded-lg bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-900/40 hover:bg-red-500 transition-all active:scale-[0.98] cursor-pointer"
              >
                Get Started
              </button>
              <button 
                onClick={() => setOpenModal('learnMore')}
                className="rounded-lg border border-[#334155] bg-[#0f172a] px-6 py-3 text-sm font-bold text-white hover:bg-[#1e293b] transition-all cursor-pointer"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right Graphics Stand-in Container - Refactored to premium yellow asset palette */}
          <div className="flex justify-center animate-pulse">
            <div className="relative w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(234,179,8,0.15)]">
              <svg className="w-32 h-32 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 2 & 3: GATEWAY & OTP PROCESSING AUTH CARD
  // ==========================================
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05080a] px-4 font-sans text-[#f3f4f6] relative overflow-hidden">
      {/* Mount Handcrafted WebGL Faulty Terminal Animation Engine */}
      <FaultyTerminalBackground />
      <div className="w-full max-w-md rounded-xl border border-[#1e293b] bg-[#111827] p-8 shadow-2xl relative">
        <button 
          onClick={() => setView('landing')} 
          className="absolute top-4 left-4 text-xs font-mono font-bold text-red-400 bg-red-950/30 border border-red-500/30 hover:bg-red-600 hover:text-white px-3 py-1 rounded-md transition-all cursor-pointer"
          disabled={isSubmitting}
        >
          ← BACK
        </button>

        <div className="mb-6 text-center pt-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {authStep === 1 ? (authMode === 'login' ? 'Welcome Back!' : 'Create Account') : 'Secure Verification'}
          </h2>
          <p className="mt-1 text-sm text-[#94a3b8]">
            {authStep === 1 ? (authMode === 'login' ? 'Login to your account' : 'Enter your Credentials') : 'Multiphase authentication entry'}
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {authStep === 1 ? (
            <div className="space-y-5 animate-fadeIn">
              
              {/* FLOATING LABEL: USERNAME */}
              {authMode === 'signup' && (
                <div className="relative w-full group animate-fadeIn">
                  <input 
                    type="text" 
                    id="fi-username"
                    placeholder=" "
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setUsernameError(false); }}
                    className={`w-full h-12 pt-5 pb-1 px-4 text-sm text-white bg-[#0f172a]/90 rounded-xl border outline-none transition-all duration-200 peer ${
                      usernameError 
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-shake' 
                        : 'border-[#334155] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                    }`}
                  />
                  <label 
                    htmlFor="fi-username"
                    className={`absolute left-4 font-mono font-bold tracking-wider pointer-events-none transition-all duration-200 origin-left ${
                      username 
                        ? 'top-1.5 text-[10px] text-purple-400' 
                        : 'top-3.5 text-xs text-slate-500 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-purple-400'
                    }`}
                  >
                    USERNAME
                  </label>
                  {usernameError && (
                    <span className="text-[10px] font-mono font-bold text-red-400 tracking-wide mt-1 block text-left uppercase">
                      ⚠ Signature footprint mismatch: Handle taken
                    </span>
                  )}
                </div>
              )}
              
              {/* FLOATING LABEL: EMAIL ADDRESS */}
              <div className="relative w-full group">
                <input 
                  type="email" 
                  id="fi-email"
                  placeholder=" "
                  value={email}
                  disabled={isSubmitting}
                  onChange={(e) => { setEmail(e.target.value); setEmailFormatError(false); setEmailNotRegistered(false); }}
                  className={`w-full h-12 pt-5 pb-1 px-4 text-sm text-white bg-[#0f172a]/90 rounded-xl border outline-none transition-all duration-200 peer ${
                    emailFormatError || emailNotRegistered
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-shake' 
                      : 'border-[#334155] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                  }`}
                />
                <label 
                  htmlFor="fi-email"
                  className={`absolute left-4 font-mono font-bold tracking-wider pointer-events-none transition-all duration-200 origin-left ${
                    email 
                      ? 'top-1.5 text-[10px] text-purple-400' 
                      : 'top-3.5 text-xs text-slate-500 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-purple-400'
                  }`}
                >
                  EMAIL
                </label>
                {emailFormatError && (
                  <span className="text-[10px] font-mono font-bold text-red-400 tracking-wide mt-1 block text-left uppercase">
                    ⚠ Format corrupted: Invalid address signature
                  </span>
                )}
                {emailNotRegistered && (
                  <span className="text-[10px] font-mono font-bold text-red-400 tracking-wide mt-1 block text-left uppercase">
                    ⚠ Footprint anomaly: Identity not found
                  </span>
                )}
              </div>

              {/* FLOATING LABEL: PASSWORD MATRIX */}
              <div className="relative w-full">
                <div className="relative w-full">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="fi-password"
                    placeholder=" "
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                    className={`w-full h-12 pt-5 pb-1 pl-4 pr-14 text-sm text-white bg-[#0f172a]/90 rounded-xl border outline-none transition-all duration-200 peer ${
                      loginError 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-shake' 
                        : 'border-[#334155] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                    }`}
                  />
                  <label 
                    htmlFor="fi-password"
                    className={`absolute left-4 font-mono font-bold tracking-wider pointer-events-none transition-all duration-200 origin-left ${
                      password 
                        ? 'top-1.5 text-[10px] text-purple-400' 
                        : 'top-3.5 text-xs text-slate-500 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-purple-400'
                    }`}
                  >
                    PASSWORD
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] text-slate-400 hover:text-white transition-colors font-mono font-bold cursor-pointer bg-transparent"
                  >
                    {showPassword ? 'MASK' : 'VIEW'}
                  </button>
                </div>
                {loginError && authMode === 'login' && (
                  <span className="text-[10px] font-mono font-bold text-red-400 tracking-wide mt-1 block text-left uppercase">
                    ⚠ Validation fault: Access denied
                  </span>
                )}

                {/* DYNAMIC MULTI-SEGMENT STRENGTH VISUAL MATRIX ELEMENT */}
                {authMode === 'signup' && password.length > 0 && (
                  <div className="mt-3 space-y-1.5 animate-fadeIn">
                    <div className="flex gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((step) => {
                        const score = [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
                        let segmentColor = 'bg-white/10';
                        if (step <= score) {
                          if (score === 1) segmentColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
                          if (score === 2) segmentColor = 'bg-orange-500 shadow-[0_0_8px_#f97316]';
                          if (score === 3) segmentColor = 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
                          if (score === 4) segmentColor = 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
                        }
                        return <div key={step} className={`flex-1 rounded-full transition-all duration-300 ${segmentColor}`} />;
                      })}
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-left block text-slate-500">
                      STRENGTH: {
                        [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length === 4 ? '🟢 SECURE-STRONG' :
                        [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length === 3 ? '🟡 STABLE BOUNDARY' :
                        [password.length >= 8, /[a-z]/.test(password) && /[A-Z]/.test(password), /\d/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length === 2 ? '🟠 MODERATE RISK' : '🔴 EXPOSED ATTACK SURFACE'
                      }
                    </span>
                  </div>
                )}
              </div>

              {/* FLOATING LABEL: CONFIRM PASSWORD */}
              {authMode === 'signup' && (
                <div className="relative w-full group animate-fadeIn">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="fi-confirm"
                    placeholder=" "
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(false); }}
                    className={`w-full h-12 pt-5 pb-1 pl-4 pr-14 text-sm text-white bg-[#0f172a]/90 rounded-xl border outline-none transition-all duration-200 peer ${
                      passwordError 
                        ? 'border-red-500 animate-shake focus:border-red-500' 
                        : 'border-[#334155] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10'
                    }`}
                  />
                  <label 
                    htmlFor="fi-confirm"
                    className={`absolute left-4 font-mono font-bold tracking-wider pointer-events-none transition-all duration-200 origin-left ${
                      confirmPassword 
                        ? 'top-1.5 text-[10px] text-purple-400' 
                        : 'top-3.5 text-xs text-slate-500 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-purple-400'
                    }`}
                  >
                    CONFIRM PASSWORD
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[10px] text-slate-400 hover:text-white transition-colors font-mono font-bold cursor-pointer bg-transparent"
                  >
                    {showConfirmPassword ? 'MASK' : 'VIEW'}
                  </button>
                  {passwordError && (
                    <span className="text-[10px] font-mono font-bold text-red-400 tracking-wide mt-1 block text-left uppercase">
                      ⚠ Symmetry fault: Passwords do not match
                    </span>
                  )}
                </div>
              )}

              {/* MORPHING SUBMIT TRIGGER BUTTON */}
              <button
                type="submit"
                onClick={handleSubmitCredentials}
                disabled={isSubmitting}
                className={`h-12 relative flex items-center justify-center font-mono text-xs font-black tracking-widest uppercase transition-all duration-300 ease-out cursor-pointer select-none mx-auto ${
                  isSubmitting 
                    ? 'w-12 rounded-full bg-purple-600 border border-purple-500 animate-pulse' 
                    : 'w-full bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-900/20 hover:scale-[1.01]'
                }`}
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span>VERIFY →</span>
                )}
              </button>

              <div className="relative flex py-2 items-center select-none">
                <div className="flex-grow border-t border-white/5" />
                <span className="flex-shrink mx-4 text-slate-500 text-[9px] font-mono tracking-widest uppercase">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-white/5" />
              </div>

              {/* SECURE GOOGLE AUTH BUTTON */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleGoogleAuth}
                className="w-full h-12 rounded-xl border border-[#334155] bg-[#0f172a] hover:bg-[#1e293b] py-3 text-xs font-mono font-bold tracking-wider text-white transition-all flex items-center justify-center gap-3 shadow-md cursor-pointer active:scale-[0.98] disabled:opacity-40"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.43-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22l.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="p-4 border border-purple-500/20 bg-purple-500/5 rounded-lg text-xs text-purple-300 font-sans max-w-sm mx-auto leading-relaxed">
                We've routed a 6-digit code straight to <span className="text-white font-bold underline">{email}</span>.
              </div>

              {/* Task 3: Transformed 6-Box Array System */}
              <div className="flex flex-col gap-2 text-left">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] text-center md:text-left">Enter Verification Token</label>
                <div className="flex justify-between items-center gap-2">
                  {otpArray.map((digit, idx) => (
                    <input
                      key={idx}
                      type="text"
                      maxLength={1}
                      value={digit}
                      disabled={isSubmitting}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      onChange={(e) => handleOtpInputChange(e.target, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className={`w-12 h-14 text-center font-mono text-xl font-bold rounded-lg bg-[#0f172a] text-purple-400 outline-none border transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 ${
                        otpError ? 'border-red-500 animate-shake focus:border-red-500' : 'border-[#334155]'
                      }`}
                    />
                  ))}
                </div>
                {otpError && (
                  <span className="text-[11px] font-medium text-red-500 text-center tracking-normal mt-1 animate-fadeIn">
                    ⚠ Invalid 6-digit token format specified
                  </span>
                )}
              </div>

              <button 
                type="submit"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className={`w-full rounded-lg bg-green-700 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 ${
                  isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-600 active:scale-[0.99] cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    VERIFYING...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              <div className="flex justify-between items-center text-xs pt-3 px-1 font-mono">
                <button 
                  type="button" 
                  onClick={() => setAuthStep(1)}
                  disabled={isSubmitting}
                  className="rounded-md bg-red-950/20 border border-red-500/20 hover:bg-red-700 hover:text-white text-red-400 font-bold px-3 py-1.5 transition-all cursor-pointer disabled:opacity-40"
                >
                  ← BACK
                </button>
                
                {/* Task 4: Rate-Limiter Refactored to Blue Matrix Button */}
                <button 
                  type="button" 
                  onClick={handleSubmitCredentials}
                  disabled={cooldown > 0 || isSubmitting}
                  className={`rounded-md px-4 py-1.5 font-bold tracking-wide transition-all ${
                    cooldown > 0 
                      ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-blue-700 text-white hover:bg-blue-600 shadow-lg shadow-blue-900/30 cursor-pointer active:scale-95'
                  }`}
                >
                  {cooldown > 0 ? `RESEND IN (${cooldown}s)` : 'RESEND OTP'}
                </button>
              </div>
            </div>
          )}
        </form>

        {authStep === 1 && (
          <div className="mt-6 border-t border-[#1e293b] pt-4 text-center text-xs text-[#64748b]">
            {authMode === 'login' ? (
              <p>
                New User ? Create Account First---{' '}
                <button onClick={() => handleAuthSwitch('signup')} className="text-purple-400 font-semibold hover:underline cursor-pointer">
                  SIGN UP
                </button>
              </p>
            ) : (
              <p>
                Already have an account ? Then login---{' '}
                <button onClick={() => handleAuthSwitch('login')} className="text-purple-400 font-semibold hover:underline cursor-pointer">
                  LOGIN
                </button>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
