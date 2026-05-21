import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Form from './Form';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useInView } from '../../hooks/useInView';

// ─── Realistic Blood Bottle Canvas Component ───────────────────────────────
function BloodBottleCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 370, H = 520;

    // Layout constants
    const bottleX = W / 2;
    const bottleY = 160;
    const bottleW = 122;
    const bottleH = 220;
    const neckW = 28;
    const neckH = 50;
    const neckY = bottleY - neckH;
    const tubeBotY = neckY - 2;
    const tubeTopY = 10;
    const tubeCX = bottleX;

    // State
    const drops = [];
    let fillPct = 0;
    let filling = true;
    let drainTimer = 0;
    const FILL_SPEED = 0.0012;
    const DRAIN_SPEED = 0.008;
    const PAUSE_FRAMES = 90;
    let dropTimer = 0;
    const DROP_INTERVAL = 42;
    const MAX_DROPS = 4;

    function getSurfaceY() {
      return bottleY + bottleH - fillPct * bottleH;
    }

    // Drop class
    class Drop {
      constructor() {
        this.x = tubeCX + (Math.random() - 0.5) * 3;
        this.y = tubeBotY + 2;
        this.vy = 0.6 + Math.random() * 0.5;
        this.r = 5 + Math.random() * 3;
        this.alive = true;
        this.splashing = false;
        this.splashT = 0;
        this.opacity = 1;
        this.trail = [];
      }

      update() {
        if (this.splashing) {
          this.splashT += 0.12;
          this.opacity = Math.max(0, 1 - this.splashT / 1.2);
          if (this.splashT > 1.2) this.alive = false;
          return;
        }
        this.vy += 0.38;
        this.x += (Math.random() - 0.5) * 0.3;
        this.trail.push({ x: this.x, y: this.y, r: this.r * 0.5 });
        if (this.trail.length > 6) this.trail.shift();
        this.y += this.vy;
        const surfaceY = getSurfaceY();
        if (this.y + this.r >= surfaceY) {
          this.y = surfaceY - this.r * 0.3;
          this.splashing = true;
          this.splashT = 0;
        }
      }

      draw() {
        if (this.splashing) {
          for (let i = 0; i < 3; i++) {
            const t = this.splashT - i * 0.18;
            if (t < 0) continue;
            const rr = t * 18 * (1 + i * 0.4);
            const a = Math.max(0, (1 - t) * 0.6 * this.opacity);
            ctx.save();
            ctx.globalAlpha = a;
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 1.5 - i * 0.4;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, rr, rr * 0.28, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          return;
        }
        // Trail
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const a = (i / this.trail.length) * 0.35;
          ctx.save();
          ctx.globalAlpha = a;
          ctx.fillStyle = '#c0392b';
          ctx.beginPath();
          ctx.ellipse(t.x, t.y, t.r * 0.5, t.r * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
        // Teardrop body
        const x = this.x, y = this.y, r = this.r;
        const stretch = Math.min(this.vy / 8, 1.4);
        ctx.save();
        ctx.globalAlpha = this.opacity;
        const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r * 1.2);
        grad.addColorStop(0, '#ff8080');
        grad.addColorStop(0.4, '#e74c3c');
        grad.addColorStop(1, '#7b0000');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, 1 + stretch * 0.5);
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.restore();
        ctx.moveTo(x - r * 0.4, y - r * 0.6);
        ctx.quadraticCurveTo(x, y - r * (1.6 + stretch * 1.2), x + r * 0.4, y - r * 0.6);
        ctx.fill();
        // Shine
        ctx.globalAlpha = this.opacity * 0.6;
        ctx.fillStyle = 'rgba(255,200,200,0.7)';
        ctx.beginPath();
        ctx.ellipse(x - r * 0.28, y - r * 0.3, r * 0.22, r * 0.32, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function bottlePath() {
      const bx = bottleX, by = bottleY, bw = bottleW, bh = bottleH;
      const nx = bottleX, ny = neckY, nw = neckW, nh = neckH;
      ctx.beginPath();
      ctx.moveTo(nx - nw / 2, ny);
      ctx.lineTo(nx - nw / 2, ny + nh);
      ctx.bezierCurveTo(nx - nw / 2, ny + nh + 20, nx - bw / 2, ny + nh + 30, nx - bw / 2, ny + nh + 40);
      ctx.lineTo(nx - bw / 2, by + bh - 10);
      ctx.quadraticCurveTo(nx - bw / 2, by + bh, nx, by + bh);
      ctx.quadraticCurveTo(nx + bw / 2, by + bh, nx + bw / 2, by + bh - 10);
      ctx.lineTo(nx + bw / 2, ny + nh + 40);
      ctx.bezierCurveTo(nx + bw / 2, ny + nh + 30, nx + nw / 2, ny + nh + 20, nx + nw / 2, ny + nh);
      ctx.lineTo(nx + nw / 2, ny);
      ctx.closePath();
    }

    function drawStand() {
      ctx.save();
      ctx.strokeStyle = '#aab4bc';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bottleX + 10, tubeTopY - 5);
      ctx.lineTo(bottleX + 10, H - 30);
      ctx.stroke();
      ctx.strokeStyle = '#8898a4';
      ctx.lineWidth = 4;
      for (let i = -2; i <= 2; i += 1) {
        if (i === 0) continue;
        ctx.beginPath();
        ctx.moveTo(bottleX + 10, H - 30);
        ctx.lineTo(bottleX + 10 + i * 38, H - 10);
        ctx.stroke();
      }
      ctx.strokeStyle = '#aab4bc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bottleX + 10, tubeTopY + 5);
      ctx.bezierCurveTo(bottleX + 10, tubeTopY - 12, bottleX - 5, tubeTopY - 14, bottleX - 5, tubeTopY);
      ctx.stroke();
      ctx.restore();
    }

    function drawTube() {
      const tx = tubeCX, tw = 14, r = tw / 2;
      const tg = ctx.createLinearGradient(tx - tw, 0, tx + tw, 0);
      tg.addColorStop(0, '#c0c8d0');
      tg.addColorStop(0.35, '#f0f4f8');
      tg.addColorStop(0.65, '#dde4ea');
      tg.addColorStop(1, '#8898a8');
      ctx.fillStyle = tg;
      ctx.strokeStyle = 'rgba(130,160,190,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(tx - r, tubeTopY);
      ctx.lineTo(tx - r, tubeBotY);
      ctx.arc(tx, tubeBotY, r, Math.PI, 0);
      ctx.lineTo(tx + r, tubeTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Flowing blood inside tube
      const now = performance.now() / 1000;
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx - r + 3, tubeTopY, tw - 6, tubeBotY - tubeTopY + r);
      ctx.clip();
      const stripeH = 18;
      const offset = (now * 60) % stripeH;
      for (let sy = tubeTopY - stripeH + offset; sy < tubeBotY + r; sy += stripeH) {
        const sg = ctx.createLinearGradient(0, sy, 0, sy + stripeH);
        sg.addColorStop(0, '#7b0000');
        sg.addColorStop(0.5, '#c0392b');
        sg.addColorStop(1, '#7b0000');
        ctx.fillStyle = sg;
        ctx.fillRect(tx - r + 3, sy, tw - 6, stripeH);
      }
      ctx.fillStyle = 'rgba(255,200,200,0.18)';
      ctx.fillRect(tx - r + 3, tubeTopY, 3, tubeBotY - tubeTopY);
      ctx.restore();

      // Nozzle tip
      ctx.fillStyle = '#8898a8';
      ctx.strokeStyle = 'rgba(130,160,190,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(tx - r - 2, tubeBotY - 4);
      ctx.lineTo(tx + r + 2, tubeBotY - 4);
      ctx.lineTo(tx + r, tubeBotY + 6);
      ctx.lineTo(tx - r, tubeBotY + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function drawBottle() {
      const now = performance.now() / 1000;

      // Blood fill
      if (fillPct > 0) {
        ctx.save();
        bottlePath();
        ctx.clip();
        const surfaceY = getSurfaceY();
        const liquidH = fillPct * bottleH;
        const lg = ctx.createLinearGradient(bottleX, surfaceY, bottleX, bottleY + bottleH);
        lg.addColorStop(0, '#c0392b');
        lg.addColorStop(0.4, '#8b0000');
        lg.addColorStop(1, '#4a0000');
        ctx.fillStyle = lg;
        ctx.fillRect(bottleX - bottleW / 2 - 2, surfaceY, bottleW + 4, liquidH + 10);

        // Wave surface
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        const wAmp = 3.5, wFreq = 0.09;
        ctx.moveTo(bottleX - bottleW / 2 - 2, surfaceY + 8);
        for (let wx = bottleX - bottleW / 2 - 2; wx <= bottleX + bottleW / 2 + 2; wx += 3) {
          const wy = surfaceY
            + Math.sin((wx - bottleX) * wFreq + now * 2.5) * wAmp
            + Math.sin((wx - bottleX) * wFreq * 1.7 + now * 1.8) * wAmp * 0.5;
          ctx.lineTo(wx, wy);
        }
        ctx.lineTo(bottleX + bottleW / 2 + 2, surfaceY + 8);
        ctx.lineTo(bottleX + bottleW / 2 + 2, surfaceY);
        for (let wx = bottleX + bottleW / 2 + 2; wx >= bottleX - bottleW / 2 - 2; wx -= 3) {
          const wy = surfaceY + Math.sin((wx - bottleX) * wFreq + now * 2.5) * wAmp * 0.7;
          ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.fill();

        // Shimmer
        ctx.fillStyle = 'rgba(255,80,80,0.08)';
        ctx.fillRect(bottleX - bottleW / 2, surfaceY, bottleW * 0.35, liquidH);
        ctx.restore();
      }

      // Glass walls
      bottlePath();
      ctx.strokeStyle = 'rgba(160,210,245,0.75)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glass shine streaks
      ctx.save();
      bottlePath();
      ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.moveTo(bottleX - bottleW / 2 + 6, neckY + neckH + 10);
      ctx.bezierCurveTo(
        bottleX - bottleW / 2 + 10, neckY + neckH + 40,
        bottleX - bottleW / 2 + 12, bottleY + bottleH - 60,
        bottleX - bottleW / 2 + 8, bottleY + bottleH - 20
      );
      ctx.lineTo(bottleX - bottleW / 2 + 18, bottleY + bottleH - 20);
      ctx.bezierCurveTo(
        bottleX - bottleW / 2 + 22, bottleY + bottleH - 60,
        bottleX - bottleW / 2 + 20, neckY + neckH + 40,
        bottleX - bottleW / 2 + 18, neckY + neckH + 10
      );
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.rect(bottleX - neckW / 2 + 2, neckY, 5, neckH);
      ctx.fill();
      ctx.restore();
    }

    function drawLabel() {
      const lx = bottleX - 38, ly = bottleY + 70, lw = 76, lh = 64;
      ctx.save();
      ctx.fillStyle = 'rgba(255,252,248,0.92)';
      ctx.strokeStyle = 'rgba(200,160,160,0.5)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(lx, ly, lw, lh, 4);
      else ctx.rect(lx, ly, lw, lh);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c0392b';
      ctx.fillRect(lx + lw / 2 - 2, ly + 10, 4, 16);
      ctx.fillRect(lx + lw / 2 - 8, ly + 16, 16, 4);

      ctx.fillStyle = '#8b0000';
      ctx.font = '700 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BLOOD', lx + lw / 2, ly + 45);
      ctx.restore();
    }

    function drawFillPercent() {
      ctx.save();
      ctx.fillStyle = 'rgba(140,40,40,0.85)';
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(fillPct * 100)}%`, bottleX + bottleW / 2 + 28, bottleY + bottleH - 8);
      ctx.restore();
    }

    function update() {
      dropTimer++;
      if (filling) {
        fillPct = Math.min(1, fillPct + FILL_SPEED);
        if (dropTimer % DROP_INTERVAL === 0 && drops.length < MAX_DROPS) {
          drops.push(new Drop());
        }
        if (fillPct >= 1) {
          filling = false;
          drainTimer = PAUSE_FRAMES;
        }
      } else {
        if (drainTimer > 0) {
          drainTimer--;
        } else {
          fillPct = Math.max(0, fillPct - DRAIN_SPEED);
          if (fillPct <= 0) {
            filling = true;
            drops.length = 0;
            dropTimer = 0;
          }
        }
      }
      for (let i = drops.length - 1; i >= 0; i--) {
        drops[i].update();
        if (!drops[i].alive) drops.splice(i, 1);
      }
    }

    function render() {
      ctx.clearRect(0, 0, W, H);
      drawStand();
      drawTube();
      drawBottle();
      drawLabel();
      drawFillPercent();
      for (const d of drops) d.draw();
    }

    function loop() {
      update();
      render();
      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={370}
      height={520}
      style={{ display: 'block' }}
    />
  );
}

// ─── Main Blood Component ───────────────────────────────────────────────────
function Blood() {
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  const [stepsRef, stepsInView] = useInView();
  const [benefitsRef, benefitsInView] = useInView();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowForm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleForm = () => setShowForm(!showForm);

  const steps = [
    { step: 1, title: 'Register',        description: 'Create your account on HealthHub for blood services',    icon: '📝' },
    { step: 2, title: 'Select Donor',    description: 'Click Donate and choose who you want to help',            icon: '🔍' },
    { step: 3, title: 'Connect',         description: 'Contact the user for details and coordination',           icon: '💬' },
    { step: 4, title: 'Donate',          description: 'Complete the blood donation process safely',              icon: '❤️' },
    { step: 5, title: 'Request Support', description: 'Request blood - your request reaches all users',          icon: '🆘' },
  ];

  return (
    <div className="bg-white min-h-screen">

      {/* ── Hero Section ── */}
      <div className='relative flex flex-col lg:flex-row items-center justify-between w-full px-6 lg:px-16 py-20 rounded-3xl shadow-xl overflow-hidden bg-gradient-to-r from-red-100 via-pink-100 to-red-50 m-6'>

        {/* Background blobs */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>

        {/* Left — text */}
        <div className='max-w-xl z-10'>
          <h2 className='inline-block bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm mb-4 shadow'>
            SAVE LIVES TODAY
          </h2>

          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight bg-gradient-to-r from-red-600 to-pink-500 text-transparent bg-clip-text animate-pulse'>
            Blood <br /> Donation
          </h1>

          <p className='text-lg text-gray-700 mt-6 leading-relaxed'>
            Share the gift of life. Connect with those in need and make a real difference today.
          </p>

          <div className='flex items-center gap-4 mt-8 flex-wrap'>
            <button
              onClick={toggleForm}
              className='px-8 py-3 rounded-full text-white bg-gradient-to-r from-red-600 to-pink-600 shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300 font-semibold'
            >
              Request Blood
            </button>

            <Link
              to='/blood-req'
              className='px-8 py-3 rounded-full text-white bg-gradient-to-r from-pink-600 to-red-600 shadow-lg hover:scale-110 hover:shadow-2xl transition duration-300 font-semibold'
            >
              View Requests
            </Link>
          </div>
        </div>

        {/* Right — Realistic blood bottle canvas */}
        <div className='group mt-10 lg:mt-0 relative z-10 flex items-center justify-center rounded-[2rem] border border-red-100/70 bg-gradient-to-br from-red-50/90 via-rose-50/80 to-white/85 px-4 py-3 shadow-[0_20px_50px_-25px_rgba(220,38,38,0.45)] transition duration-300 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-red-100/95 hover:via-rose-50/90 hover:to-white/90 hover:shadow-[0_30px_70px_-25px_rgba(236,72,153,0.5)]'>
          <BloodBottleCanvas />
        </div>

        {/* Form overlay */}
        {showForm && (
          <div ref={formRef}>
            <Form onClose={() => setShowForm(false)} />
          </div>
        )}
      </div>

      {/* ── Process Steps Section ── */}
      <section ref={stepsRef} className='w-full px-6 lg:px-16 mt-24 relative'>
        <h1
          className={`text-4xl font-bold text-center mb-16 bg-gradient-to-r from-red-600 to-pink-600 text-transparent bg-clip-text transition-all duration-700 ${
            stepsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          How Blood Donation Works
        </h1>

        <div className='relative'>
          {/* Connecting line */}
          <div
            className={`hidden lg:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-red-300 to-pink-300 transition-all duration-700 ${
              stepsInView ? 'opacity-100 delay-[1100ms]' : 'opacity-0'
            }`}
          ></div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative'>
            {steps.map((item, index) => (
              <div
                key={index}
                className={`relative group transition-all duration-1000 ease-out ${
                  stepsInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                }`}
                style={{ transitionDelay: stepsInView ? `${index * 250}ms` : '0ms' }}
              >
                <div className='absolute -inset-0.5 bg-gradient-to-r from-red-400 to-pink-400 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300'></div>

                <div className='relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 h-full flex flex-col items-center text-center'>
                  <div className='mb-4 relative'>
                    <div className='w-20 h-20 rounded-full bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition duration-300'>
                      {item.icon}
                    </div>
                    <div className='absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg'>
                      {item.step}
                    </div>
                  </div>
                  <h3 className='text-xl font-bold text-gray-800 mb-2'>{item.title}</h3>
                  <p className='text-gray-600 text-sm leading-relaxed flex-grow'>{item.description}</p>
                  <div className='mt-4 flex items-center gap-2 text-red-600 font-semibold'>
                    <CheckCircleIcon className='text-lg' />
                    <span>Next Step</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statistics / Why Donate Section ── */}
      <section ref={benefitsRef} className='w-full px-6 lg:px-16 mt-24 mb-20 relative'>
        <div className='relative flex flex-col items-center text-center backdrop-blur-lg bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-16 shadow-xl border border-red-100/50'>

          <div className="absolute inset-0">
            <div className='absolute top-0 right-0 w-96 h-96 bg-red-300 opacity-10 rounded-full blur-3xl'></div>
          </div>

          <div className='relative z-10'>
            <h2
              className={`text-4xl font-bold mb-12 bg-gradient-to-r from-red-600 to-pink-600 text-transparent bg-clip-text transition-all duration-700 ${
                benefitsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              Why Donate Blood?
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {[
                { icon: '🩸', color: 'red',  title: 'Save Lives',        text: 'One donation can save up to 3 lives and help countless patients in need.',                  delay: '0ms'   },
                { icon: '❤️', color: 'pink', title: 'Health Benefits',   text: 'Regular blood donation can improve your cardiovascular health and wellness.',              delay: '250ms' },
                { icon: '🤝', color: 'red',  title: 'Community Driven',  text: "Be part of a caring community making real impact on people's lives.",                       delay: '500ms' },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl border border-${card.color}-100 hover:-translate-y-2 transition-all duration-1000 ease-out ${
                    benefitsInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'
                  }`}
                  style={{ transitionDelay: benefitsInView ? card.delay : '0ms' }}
                >
                  <div className='text-5xl mb-4'>{card.icon}</div>
                  <h3 className={`text-xl font-bold text-${card.color}-600 mb-2`}>{card.title}</h3>
                  <p className='text-gray-700'>{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white text-center py-8">
        <p className='text-lg mb-2'>
          Contact Us: <span className='font-semibold text-red-400'>Healthhub@gmail.com</span>
        </p>
        <p className='text-sm text-gray-400'>Together, we save lives. Thank you for your generosity!</p>
      </footer>
    </div>
  );
}

export default Blood;
