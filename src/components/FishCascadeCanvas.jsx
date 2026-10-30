import React, { useEffect, useRef } from 'react';
import { FISH_PALETTES, normalizeTurkishKey } from '../constants/gameConfig';
import { sound } from '../utils/sound';

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 680;

export default function FishCascadeCanvas({
  gameState, // 'playing' | 'paused'
  letterPool,
  difficultyConfig,
  level,
  onFishEaten,
  onFishMissed,
  onWrongKey,
  onTargetLetterChange,
  onKeyPressVisual
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  // Mutable game world state inside ref for 60fps loop without React re-render overhead
  const worldRef = useRef({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    iceFloorY: DEFAULT_HEIGHT - 85,
    fishes: [],
    particles: [],
    floatingTexts: [],
    snowflakes: Array.from({ length: 65 }, () => ({
      x: Math.random() * DEFAULT_WIDTH,
      y: Math.random() * DEFAULT_HEIGHT,
      r: 1.5 + Math.random() * 2.5,
      speedY: 18 + Math.random() * 25,
      drift: (Math.random() - 0.5) * 15
    })),
    tux: {
      x: DEFAULT_WIDTH / 2,
      targetX: DEFAULT_WIDTH / 2,
      facing: 0, // -1 left, 0 front, 1 right
      mouthOpen: 0, // 0 to 1
      mood: 'idle', // 'idle' | 'happy' | 'sad' | 'eating'
      moodTimer: 0,
      waddlePhase: 0
    },
    lastSpawnTime: 0,
    nextFishId: 1,
    currentHighlightId: null,
    waveTime: 0
  });

  // Keep latest props accessible in event listeners and RAF loop
  const propsRef = useRef({
    gameState,
    letterPool,
    difficultyConfig,
    level,
    onFishEaten,
    onFishMissed,
    onWrongKey,
    onTargetLetterChange,
    onKeyPressVisual
  });

  useEffect(() => {
    propsRef.current = {
      gameState,
      letterPool,
      difficultyConfig,
      level,
      onFishEaten,
      onFishMissed,
      onWrongKey,
      onTargetLetterChange,
      onKeyPressVisual
    };
  });

  useEffect(() => {
    if (level > 1) {
      const world = worldRef.current;
      world.floatingTexts.push({
        x: world.tux.x,
        y: world.iceFloorY - 95,
        text: `SEVİYE ${level}! +1 CAN`,
        color: '#FFEAA7',
        alpha: 1.4,
        vy: -40
      });
    }
  }, [level]);
  // Helper: spawn a new falling fish
  const spawnFish = (world, now) => {
    const { letterPool, difficultyConfig, level } = propsRef.current;
    const activeUncleared = world.fishes.filter((f) => !f.cleared);
    if (activeUncleared.length >= difficultyConfig.maxActiveFish) return;

    // Prefer letters not currently on screen if possible, for clarity
    const activeLetters = new Set(activeUncleared.map((f) => f.letter));
    const available = letterPool.filter((l) => !activeLetters.has(l));
    const poolToUse = available.length > 0 ? available : letterPool;
    const letter = poolToUse[Math.floor(Math.random() * poolToUse.length)];

    // Pick X position avoiding overlap with recently spawned fish
    const margin = 95;
    const usableWidth = Math.max(200, world.width - margin * 2);
    let x = margin + Math.random() * usableWidth;
    for (let attempt = 0; attempt < 6; attempt++) {
      const candidate = margin + Math.random() * usableWidth;
      const tooClose = activeUncleared.some(
        (f) => f.y < 160 && Math.abs(f.x - candidate) < 95
      );
      if (!tooClose) {
        x = candidate;
        break;
      }
    }

    const palette = FISH_PALETTES[Math.floor(Math.random() * FISH_PALETTES.length)];
    const speed =
      difficultyConfig.baseSpeed +
      (level - 1) * difficultyConfig.speedPerLevel +
      (Math.random() * 14 - 7);

    world.fishes.push({
      id: world.nextFishId++,
      x,
      y: -45,
      vx: 0,
      speed,
      letter,
      palette,
      cleared: false,
      clearAnim: 0,
      wiggleOffset: Math.random() * Math.PI * 2
    });
    world.lastSpawnTime = now;
  };

  // Helper: create burst particles
  const spawnParticles = (world, x, y, color, count = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 60 + Math.random() * 140;
      world.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 30,
        r: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 0.45 + Math.random() * 0.25
      });
    }
  };

  // Keyboard listener for typing letters
  useEffect(() => {
    const handleKeyDown = (e) => {
      const { gameState, onWrongKey, onKeyPressVisual } = propsRef.current;
      if (gameState !== 'playing') return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;

      const typedChar = normalizeTurkishKey(e.key);
      if (!typedChar || !/^[A-ZÇĞİÖŞÜ]$/.test(typedChar)) return;

      e.preventDefault();
      const world = worldRef.current;

      // Find all uncleared fishes matching typedChar, pick the lowest one (largest Y)
      const matchingFishes = world.fishes
        .filter((f) => !f.cleared && f.letter === typedChar)
        .sort((a, b) => b.y - a.y);

      if (matchingFishes.length > 0) {
        const targetFish = matchingFishes[0];
        targetFish.cleared = true;
        targetFish.clearAnim = 1;

        sound.playLetterClear();
        spawnParticles(world, targetFish.x, targetFish.y, '#2ECC71', 16);

        if (onKeyPressVisual) {
          onKeyPressVisual(typedChar, true);
        }
      } else {
        // Wrong key pressed
        sound.playWrongKey();
        world.tux.mood = 'sad';
        world.tux.moodTimer = 0.45;
        if (onKeyPressVisual) {
          onKeyPressVisual(typedChar, false);
        }
        if (onWrongKey) {
          onWrongKey(typedChar);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Responsive Canvas ResizeObserver
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const newW = Math.max(640, Math.floor(rect.width));
      const newH = Math.max(420, Math.floor(rect.height));
      const world = worldRef.current;

      const prevW = world.width || newW;
      canvas.width = newW;
      canvas.height = newH;
      world.width = newW;
      world.height = newH;
      world.iceFloorY = newH - 85;

      // Proportionally adjust fish & Tux X positions when window resizes
      if (prevW > 0 && prevW !== newW) {
        const ratio = newW / prevW;
        world.tux.x = Math.min(newW - 60, Math.max(60, world.tux.x * ratio));
        world.tux.targetX = Math.min(newW - 60, Math.max(60, world.tux.targetX * ratio));
        for (const f of world.fishes) {
          f.x = Math.min(newW - 70, Math.max(70, f.x * ratio));
        }
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrapper);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Main 60fps Game Loop
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    // Spawn initial fish immediately
    const world = worldRef.current;
    if (world.fishes.length === 0) {
      spawnFish(world, lastTime);
    }

    const updateAndDraw = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const {
        gameState,
        difficultyConfig,
        level,
        onFishEaten,
        onFishMissed,
        onTargetLetterChange
      } = propsRef.current;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (gameState === 'playing') {
          const currentInterval = Math.max(
            difficultyConfig.minSpawnInterval,
            difficultyConfig.spawnInterval - (level - 1) * 145
          );
          const activeUncleared = world.fishes.filter((f) => !f.cleared);
          if (
            activeUncleared.length === 0 ||
            (now - world.lastSpawnTime >= currentInterval &&
              activeUncleared.length < difficultyConfig.maxActiveFish)
          ) {
            spawnFish(world, now);
          }

          updateWorld(world, dt, now, difficultyConfig, level, {
            onFishEaten,
            onFishMissed,
            onTargetLetterChange
          });
        }
        drawWorld(ctx, world);
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div ref={wrapperRef} className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={DEFAULT_WIDTH}
        height={DEFAULT_HEIGHT}
        className="game-canvas"
      />
    </div>
  );
}

function updateWorld(world, dt, now, difficultyConfig, level, callbacks) {
  world.waveTime += dt;
  const W = world.width;
  const H = world.height;
  const iceFloorY = world.iceFloorY;

  // Update snowflakes
  for (const flake of world.snowflakes) {
    flake.y += flake.speedY * dt;
    flake.x += flake.drift * dt;
    if (flake.y > H) {
      flake.y = -5;
      flake.x = Math.random() * W;
    }
    if (flake.x < 0) flake.x = W;
    if (flake.x > W) flake.x = 0;
  }

  // Determine lowest cleared fish for Tux to chase first
  const clearedFishes = world.fishes
    .filter((f) => f.cleared)
    .sort((a, b) => b.y - a.y);

  // Determine lowest uncleared fish for target hint & idle tracking
  const unclearedFishes = world.fishes
    .filter((f) => !f.cleared)
    .sort((a, b) => b.y - a.y);

  const lowestUncleared = unclearedFishes[0] || null;
  const newHighlightLetter = lowestUncleared ? lowestUncleared.letter : null;
  if (world.currentHighlightLetter !== newHighlightLetter) {
    world.currentHighlightLetter = newHighlightLetter;
    if (callbacks.onTargetLetterChange) {
      callbacks.onTargetLetterChange(newHighlightLetter);
    }
  }
  world.currentHighlightId = lowestUncleared ? lowestUncleared.id : null;

  // Update Tux movement
  const tux = world.tux;
  if (clearedFishes.length > 0) {
    tux.targetX = clearedFishes[0].x;
    tux.mouthOpen = Math.min(1, tux.mouthOpen + dt * 7);
  } else {
    tux.mouthOpen = Math.max(0, tux.mouthOpen - dt * 5);
    if (lowestUncleared) {
      // Gently drift toward lowest falling fish in anticipation
      tux.targetX =
        tux.x + (lowestUncleared.x - tux.x) * Math.min(1, dt * 1.6);
    }
  }

  const dx = tux.targetX - tux.x;
  const maxTuxSpeed = clearedFishes.length > 0 ? 640 : 190;
  if (Math.abs(dx) > 3) {
    const step = Math.sign(dx) * Math.min(Math.abs(dx), maxTuxSpeed * dt);
    tux.x += step;
    tux.facing = Math.sign(dx);
    tux.waddlePhase += dt * (clearedFishes.length > 0 ? 18 : 9);
  } else {
    tux.facing = 0;
    tux.waddlePhase *= 0.85;
  }

  if (tux.moodTimer > 0) {
    tux.moodTimer -= dt;
    if (tux.moodTimer <= 0) {
      tux.mood = 'idle';
    }
  }

  // Update Fishes
  const remainingFishes = [];
  for (const fish of world.fishes) {
    fish.wiggleOffset += dt * (fish.cleared ? 14 : 6);

    if (fish.cleared) {
      // Cleared fish dives swiftly into Tux's mouth!
      const diveSpeed = Math.max(fish.speed * 2.6, 360);
      fish.y += diveSpeed * dt;

      // Homing towards Tux's mouth X as it gets close so fast typists never miss a cleared fish
      const mouthY = iceFloorY - 58;
      const distY = Math.max(10, mouthY - fish.y);
      const homingFactor = Math.min(1, (dt * 420) / distY);
      fish.x += (tux.x - fish.x) * homingFactor;

      if (fish.y >= mouthY) {
        // Tux eats the fish!
        sound.playEatFish();
        tux.mood = 'happy';
        tux.moodTimer = 0.5;
        tux.mouthOpen = 0.2;

        // Floating score text
        world.floatingTexts.push({
          x: tux.x,
          y: mouthY - 15,
          text: '+10',
          color: '#2ECC71',
          alpha: 1,
          vy: -55
        });

        if (callbacks.onFishEaten) {
          callbacks.onFishEaten(fish.letter);
        }
        continue; // remove fish
      }
    } else {
      // Normal falling fish
      fish.y += fish.speed * dt;

      if (fish.y >= iceFloorY - 12) {
        // Missed fish! Hits the icy water
        sound.playMissSplash();
        tux.mood = 'sad';
        tux.moodTimer = 0.65;

        // Water splash particles
        for (let i = 0; i < 12; i++) {
          const angle = -Math.PI * 0.15 - Math.random() * Math.PI * 0.7;
          const speed = 70 + Math.random() * 110;
          world.particles.push({
            x: fish.x,
            y: iceFloorY - 5,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 3 + Math.random() * 3.5,
            color: '#74B9FF',
            alpha: 1,
            life: 0.45
          });
        }

        world.floatingTexts.push({
          x: fish.x,
          y: iceFloorY - 24,
          text: 'KAÇTI!',
          color: '#FF6B6B',
          alpha: 1,
          vy: -45
        });

        if (callbacks.onFishMissed) {
          callbacks.onFishMissed(fish.letter);
        }
        continue; // remove fish
      }
    }

    remainingFishes.push(fish);
  }
  world.fishes = remainingFishes;

  // Update Particles
  world.particles = world.particles.filter((p) => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 240 * dt; // gravity
    p.life -= dt;
    p.alpha = Math.max(0, p.life * 2);
    return p.life > 0;
  });

  // Update Floating Texts
  world.floatingTexts = world.floatingTexts.filter((ft) => {
    ft.y += ft.vy * dt;
    ft.alpha -= dt * 1.25;
    return ft.alpha > 0;
  });
}

function drawWorld(ctx, world) {
  const W = world.width;
  const H = world.height;
  const iceFloorY = world.iceFloorY;

  ctx.clearRect(0, 0, W, H);

  // 1. Arctic Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, iceFloorY);
  skyGrad.addColorStop(0, '#0F2A4A');
  skyGrad.addColorStop(0.55, '#1B4F72');
  skyGrad.addColorStop(1, '#488FB8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, iceFloorY);

  // 2. Distant Glaciers / Icebergs (scaled to W)
  ctx.fillStyle = 'rgba(214, 234, 248, 0.22)';
  ctx.beginPath();
  ctx.moveTo(0, iceFloorY);
  ctx.lineTo(W * 0.09, iceFloorY - 140);
  ctx.lineTo(W * 0.20, iceFloorY - 60);
  ctx.lineTo(W * 0.32, iceFloorY - 170);
  ctx.lineTo(W * 0.46, iceFloorY);
  ctx.fill();

  ctx.fillStyle = 'rgba(235, 245, 251, 0.18)';
  ctx.beginPath();
  ctx.moveTo(W * 0.54, iceFloorY);
  ctx.lineTo(W * 0.68, iceFloorY - 150);
  ctx.lineTo(W * 0.79, iceFloorY - 75);
  ctx.lineTo(W * 0.90, iceFloorY - 160);
  ctx.lineTo(W, iceFloorY);
  ctx.fill();

  // 3. Snowflakes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (const flake of world.snowflakes) {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Ice Platform & Ocean Water at the Bottom
  // Ice Shelf
  const iceGrad = ctx.createLinearGradient(0, iceFloorY - 14, 0, H);
  iceGrad.addColorStop(0, '#EBF5FB');
  iceGrad.addColorStop(0.25, '#D6EAF8');
  iceGrad.addColorStop(0.3, '#1B6CA8');
  iceGrad.addColorStop(1, '#0A3D62');
  ctx.fillStyle = iceGrad;
  ctx.fillRect(0, iceFloorY - 10, W, H - iceFloorY + 10);

  // Snow cap wave along the ice edge
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, iceFloorY - 10);
  for (let x = 0; x <= W + 60; x += 60) {
    const waveY = iceFloorY - 10 + Math.sin(x * 0.03 + world.waveTime * 2) * 3;
    ctx.lineTo(x, waveY);
  }
  ctx.lineTo(W, iceFloorY + 8);
  ctx.lineTo(0, iceFloorY + 8);
  ctx.closePath();
  ctx.fill();

  // 5. Draw Tux the Penguin
  drawTux(ctx, world.tux, world.waveTime, iceFloorY);

  // 6. Draw Falling Fishes
  for (const fish of world.fishes) {
    const isHighlighted = fish.id === world.currentHighlightId && !fish.cleared;
    drawFish(ctx, fish, isHighlighted);
  }

  // 7. Draw Particles
  for (const p of world.particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 8. Draw Floating Texts
  for (const ft of world.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.font = '800 22px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#0F2A4A';
    ctx.lineWidth = 4;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

function drawFish(ctx, fish, isHighlighted) {
  ctx.save();
  const wiggle = Math.sin(fish.wiggleOffset) * (fish.cleared ? 5 : 3);
  ctx.translate(fish.x + wiggle, fish.y);

  // Target glow ring around the lowest active fish
  if (isHighlighted) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 234, 167, 0.85)';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(0, 4, 44, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Fish oriented head-down toward the ice/penguin
  // Tail fin at top (y = -32)
  const tailSwing = Math.sin(fish.wiggleOffset * 1.5) * 6;
  ctx.fillStyle = fish.palette.fin;
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(-16 + tailSwing, -38);
  ctx.lineTo(0, -31);
  ctx.lineTo(16 + tailSwing, -38);
  ctx.closePath();
  ctx.fill();

  // Side fins
  ctx.beginPath();
  ctx.ellipse(-22, -2, 10, 5, -0.5, 0, Math.PI * 2);
  ctx.ellipse(22, -2, 10, 5, 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Fish Main Body
  ctx.fillStyle = fish.palette.body;
  ctx.beginPath();
  ctx.ellipse(0, 4, 24, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(15, 42, 74, 0.45)';
  ctx.stroke();

  // Subtle Belly Highlight
  ctx.fillStyle = fish.palette.belly;
  ctx.beginPath();
  ctx.ellipse(0, 6, 17, 21, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fish Eyes (near bottom since facing down)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-10, 22, 4.5, 0, Math.PI * 2);
  ctx.arc(10, 22, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1E272E';
  ctx.beginPath();
  ctx.arc(-10, 23.5, 2.3, 0, Math.PI * 2);
  ctx.arc(10, 23.5, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // Letter Badge (Only shown if NOT cleared yet!)
  if (!fish.cleared) {
    // High-contrast circular badge on fish center
    ctx.fillStyle = isHighlighted ? '#FFF9DB' : '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = isHighlighted ? 3 : 2;
    ctx.strokeStyle = isHighlighted ? '#F39C12' : '#1B4F72';
    ctx.stroke();

    // Letter Text
    ctx.fillStyle = '#0F2A4A';
    ctx.font = '800 22px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fish.letter, 0, 1.5);
  } else {
    // Checkmark / Delicious sparkle on cleared fish
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-1, 4);
    ctx.lineTo(6, -4);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTux(ctx, tux, waveTime, iceFloorY) {
  ctx.save();
  const baseY = iceFloorY - 8;
  const waddleRot = Math.sin(tux.waddlePhase) * 0.08;
  const happyBounce =
    tux.mood === 'happy' ? Math.abs(Math.sin(waveTime * 18)) * -10 : 0;

  ctx.translate(tux.x, baseY + happyBounce);
  ctx.rotate(waddleRot);

  // Shadow on ice
  ctx.fillStyle = 'rgba(15, 42, 74, 0.22)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Orange Feet
  const leftFootY = Math.sin(tux.waddlePhase) * 3;
  const rightFootY = -Math.sin(tux.waddlePhase) * 3;
  ctx.fillStyle = '#F39C12';
  ctx.beginPath();
  ctx.ellipse(-15, 0 + leftFootY, 12, 6, -0.2, 0, Math.PI * 2);
  ctx.ellipse(15, 0 + rightFootY, 12, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Flippers / Wings
  const wingFlap =
    tux.mouthOpen > 0.2 || tux.mood === 'happy'
      ? Math.sin(waveTime * 20) * 0.35 + 0.4
      : 0.15;
  ctx.fillStyle = '#1E272E';
  ctx.save();
  ctx.translate(-28, -36);
  ctx.rotate(wingFlap);
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 22, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(28, -36);
  ctx.rotate(-wingFlap);
  ctx.beginPath();
  ctx.ellipse(0, 10, 8, 22, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Black Outer Body
  ctx.fillStyle = '#1E272E';
  ctx.beginPath();
  ctx.ellipse(0, -34, 30, 35, 0, 0, Math.PI * 2);
  ctx.fill();

  // White Belly
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(0, -30, 21, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red Cozy Winter Scarf
  ctx.fillStyle = '#E74C3C';
  ctx.beginPath();
  ctx.roundRect(-24, -54, 48, 10, 5);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(8, -48, 9, 18, 4);
  ctx.fill();

  // Head
  ctx.fillStyle = '#1E272E';
  ctx.beginPath();
  ctx.arc(0, -66, 22, 0, Math.PI * 2);
  ctx.fill();

  // White Cheek Patch
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-7, -65, 8, 0, Math.PI * 2);
  ctx.arc(7, -65, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#1E272E';
  if (tux.mood === 'sad') {
    // Sad slanted eyes
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1E272E';
    ctx.beginPath();
    ctx.moveTo(-11, -67);
    ctx.lineTo(-5, -65);
    ctx.moveTo(11, -67);
    ctx.lineTo(5, -65);
    ctx.stroke();
  } else if (tux.mood === 'happy') {
    // Happy ^ ^ eyes
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#1E272E';
    ctx.beginPath();
    ctx.arc(-8, -65, 4, Math.PI, 0);
    ctx.moveTo(4, -65);
    ctx.arc(8, -65, 4, Math.PI, 0);
    ctx.stroke();
  } else {
    // Normal bright eyes looking slightly up at the fishes
    const eyeShiftX = tux.facing * 2;
    ctx.beginPath();
    ctx.arc(-8 + eyeShiftX, -67, 3.8, 0, Math.PI * 2);
    ctx.arc(8 + eyeShiftX, -67, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-9 + eyeShiftX, -68.5, 1.4, 0, Math.PI * 2);
    ctx.arc(7 + eyeShiftX, -68.5, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Beak / Mouth (Opens wide upwards when catching a cleared fish!)
  if (tux.mouthOpen > 0.15) {
    const openRadius = 6 + tux.mouthOpen * 9;
    // Outer orange beak open upward
    ctx.fillStyle = '#F39C12';
    ctx.beginPath();
    ctx.ellipse(0, -60, 12, openRadius + 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inside mouth
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.ellipse(0, -60, 8.5, openRadius, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Closed cute triangular beak
    ctx.fillStyle = '#F39C12';
    ctx.beginPath();
    ctx.moveTo(-8, -60);
    ctx.lineTo(8, -60);
    ctx.lineTo(0, -52);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
