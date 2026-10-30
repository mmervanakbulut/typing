import React, { useState, useCallback, useRef } from 'react';
import { LETTER_MODES, DIFFICULTIES } from './constants/gameConfig';
import FishCascadeCanvas from './components/FishCascadeCanvas';
import VirtualKeyboard from './components/VirtualKeyboard';
import { sound } from './utils/sound';

export default function App() {
  const [screen, setScreen] = useState('menu'); // 'menu' | 'playing' | 'paused' | 'gameover'
  const [selectedMode, setSelectedMode] = useState('homeRow');
  const [selectedDiff, setSelectedDiff] = useState('easy');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [muted, setMuted] = useState(true);

  // Gameplay stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(DIFFICULTIES.easy.lives);
  const [level, setLevel] = useState(1);
  const [fishEatenCount, setFishEatenCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [targetLetter, setTargetLetter] = useState(null);
  const [lastPressed, setLastPressed] = useState(null);
  const [gameKey, setGameKey] = useState(1);

  const startTimeRef = useRef(Date.now());
  const pressTimeoutRef = useRef(null);

  const modeConfig = LETTER_MODES[selectedMode];
  const diffConfig = DIFFICULTIES[selectedDiff];

  const startGame = () => {
    sound.init();
    setScore(0);
    setLives(diffConfig.lives);
    setLevel(1);
    setFishEatenCount(0);
    setCombo(0);
    setMaxCombo(0);
    setWrongCount(0);
    setTargetLetter(null);
    setLastPressed(null);
    startTimeRef.current = Date.now();
    setGameKey((prev) => prev + 1);
    setScreen('playing');
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
  };

  const handleKeyPressVisual = useCallback((char, correct) => {
    setLastPressed({ char, correct, ts: Date.now() });
    if (pressTimeoutRef.current) clearTimeout(pressTimeoutRef.current);
    pressTimeoutRef.current = setTimeout(() => {
      setLastPressed(null);
    }, 240);
  }, []);

  const handleFishEaten = useCallback(() => {
    setCombo((prevCombo) => {
      const nextCombo = prevCombo + 1;
      setMaxCombo((prevMax) => Math.max(prevMax, nextCombo));
      const bonus = Math.min(5, Math.floor(nextCombo / 5));
      setScore((prevScore) => prevScore + 10 + bonus * 2);
      return nextCombo;
    });

    setFishEatenCount((prev) => {
      const nextCount = prev + 1;
      const neededPerLevel = diffConfig.fishPerLevel;
      if (nextCount % neededPerLevel === 0) {
        sound.playLevelUp();
        setLevel((lvl) => lvl + 1);
        setLives((prevLives) => prevLives + 1);
      }
      return nextCount;
    });
  }, [diffConfig.fishPerLevel]);

  const handleFishMissed = useCallback(() => {
    setCombo(0);
    setLives((prevLives) => {
      const nextLives = prevLives - 1;
      if (nextLives <= 0) {
        setScreen('gameover');
      }
      return Math.max(0, nextLives);
    });
  }, []);

  const handleWrongKey = useCallback(() => {
    setCombo(0);
    setWrongCount((prev) => prev + 1);
  }, []);

  // Calculate accuracy & CPM for Game Over screen
  const totalAttempts = fishEatenCount + wrongCount;
  const accuracy =
    totalAttempts > 0 ? Math.round((fishEatenCount / totalAttempts) * 100) : 100;
  const elapsedMinutes = Math.max(0.15, (Date.now() - startTimeRef.current) / 60000);
  const cpm = Math.round(fishEatenCount / elapsedMinutes);

  const levelProgress =
    ((fishEatenCount % diffConfig.fishPerLevel) / diffConfig.fishPerLevel) * 100;

  return (
    <div className="app-shell">
      {/* Top Header / HUD */}
      <header className="top-hud">
        <div className="brand-block" onClick={() => setScreen('menu')} role="button" tabIndex={0}>
          <span className="brand-icon">🐧</span>
          <div>
            <h1 className="brand-title">Penguen Klavye Avcısı</h1>
            <span className="brand-sub">Tux Typing • Balık Şelalesi</span>
          </div>
        </div>

        {screen !== 'menu' && (
          <div className="hud-stats">
            <div className="stat-pill">
              <span className="stat-label">SEVİYE {level}</span>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>

            <div className="stat-pill">
              <span className="stat-label">SKOR</span>
              <span className="stat-value score-text">{score}</span>
            </div>

            <div className="stat-pill">
              <span className="stat-label">KOMBO</span>
              <span className="stat-value combo-text">x{combo}</span>
            </div>

            <div className="stat-pill lives-pill" title="Kalan Can">
              {Array.from({ length: Math.max(diffConfig.lives, lives) }).map(
                (_, idx) => (
                  <span
                    key={idx}
                    className={`life-fish ${idx < lives ? 'alive' : 'lost'}`}
                  >
                    🐟
                  </span>
                )
              )}
            </div>
          </div>
        )}

        <div className="hud-actions">
          <button
            type="button"
            className={`icon-btn ${showKeyboard ? 'active' : ''}`}
            onClick={() => setShowKeyboard((v) => !v)}
            title="Sanal Klavye Rehberini Göster/Gizle"
          >
            ⌨️
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleMute}
            title={muted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
          {screen === 'playing' && (
            <button
              type="button"
              className="action-btn secondary"
              onClick={() => setScreen('paused')}
            >
              ⏸ Duraklat
            </button>
          )}
          {screen !== 'menu' && (
            <button
              type="button"
              className="action-btn ghost"
              onClick={() => setScreen('menu')}
            >
              Ana Menü
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-stage">
        {screen === 'menu' ? (
          <div className="menu-card">
            <div className="menu-hero">
              <div className="hero-penguin">🐧🐟</div>
              <h2>Tux Acıktı! Balıkları Yakalamaya Hazır Mısın?</h2>
              <p>
                Yukarıdan düşen balıkların üzerindeki <strong>harflere</strong> klavyeden
                bas! Harfi silinen balığı penguenimiz koşarak havada kapacak.
              </p>
            </div>

            <div className="menu-section">
              <h3>1. Harf Grubu Seçin (Ders Aşaması)</h3>
              <div className="mode-grid">
                {Object.values(LETTER_MODES).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={`mode-card ${
                      selectedMode === mode.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedMode(mode.id)}
                  >
                    <div className="mode-card-top">
                      <span className="mode-badge">{mode.badge}</span>
                      {selectedMode === mode.id && (
                        <span className="mode-check">✓</span>
                      )}
                    </div>
                    <h4>{mode.title}</h4>
                    <div className="mode-letters">{mode.subtitle}</div>
                    <p>{mode.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-section">
              <h3>2. Zorluk Seviyesi Seçin</h3>
              <div className="diff-row">
                {Object.values(DIFFICULTIES).map((diff) => (
                  <button
                    key={diff.id}
                    type="button"
                    className={`diff-btn ${
                      selectedDiff === diff.id ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedDiff(diff.id)}
                  >
                    <strong>{diff.label}</strong>
                    <span>{diff.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="start-game-btn" onClick={startGame}>
              🚀 Oyunu Başlat
            </button>
          </div>
        ) : (
          <div className="game-layout">
            <div className="stage-container">
              <FishCascadeCanvas
                key={gameKey}
                gameState={screen === 'playing' ? 'playing' : 'paused'}
                letterPool={modeConfig.letters}
                difficultyConfig={diffConfig}
                level={level}
                onFishEaten={handleFishEaten}
                onFishMissed={handleFishMissed}
                onWrongKey={handleWrongKey}
                onTargetLetterChange={setTargetLetter}
                onKeyPressVisual={handleKeyPressVisual}
              />

              {/* Pause Overlay */}
              {screen === 'paused' && (
                <div className="overlay-backdrop">
                  <div className="modal-box">
                    <h2>⏸ Oyun Duraklatıldı</h2>
                    <p>Penguenimiz buzun üzerinde seni bekliyor!</p>
                    <div className="modal-actions">
                      <button
                        type="button"
                        className="start-game-btn"
                        onClick={() => setScreen('playing')}
                      >
                        ▶ Devam Et
                      </button>
                      <button
                        type="button"
                        className="action-btn secondary"
                        onClick={startGame}
                      >
                        🔄 Yeniden Başlat
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Game Over Overlay */}
              {screen === 'gameover' && (
                <div className="overlay-backdrop">
                  <div className="modal-box gameover-box">
                    <div className="modal-emoji">🐧🎉</div>
                    <h2>Oyun Bitti! Karnemiz Hazır</h2>
                    <p className="modal-subtitle">
                      {modeConfig.title} • {diffConfig.label} Mod
                    </p>

                    <div className="report-grid">
                      <div className="report-item">
                        <span>Toplam Skor</span>
                        <strong>{score}</strong>
                      </div>
                      <div className="report-item">
                        <span>Yenen Balık</span>
                        <strong>{fishEatenCount} 🐟</strong>
                      </div>
                      <div className="report-item">
                        <span>Doğruluk Oranı</span>
                        <strong>%{accuracy}</strong>
                      </div>
                      <div className="report-item">
                        <span>Hız (Harf/Dk)</span>
                        <strong>{cpm} DKS</strong>
                      </div>
                      <div className="report-item">
                        <span>Ulaşılan Seviye</span>
                        <strong>Seviye {level}</strong>
                      </div>
                      <div className="report-item">
                        <span>En Yüksek Kombo</span>
                        <strong>x{maxCombo}</strong>
                      </div>
                    </div>

                    <div className="modal-actions">
                      <button
                        type="button"
                        className="start-game-btn"
                        onClick={startGame}
                      >
                        🔄 Tekrar Oyna
                      </button>
                      <button
                        type="button"
                        className="action-btn secondary"
                        onClick={() => setScreen('menu')}
                      >
                        🏠 Ders Seçimine Dön
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showKeyboard && (
              <VirtualKeyboard
                targetLetter={targetLetter}
                lastPressed={lastPressed}
                activePoolLetters={modeConfig.letters}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

