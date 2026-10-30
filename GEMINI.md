# Penguen Klavye Avcısı (Tux Typing Web - React + Vite)

Bu dosya, yapay zeka asistanının (Antigravity) proje yapısını tekrar tekrar taramadan doğrudan ilgili dosyaya/satıra müdahale edebilmesi ve **minimum token/kredi harcaması** için oluşturulmuş proje haritasıdır.

## 1. Teknoloji Yığını
- **Framework:** React 18 + Vite 5 (`package.json`, `vite.config.js`)
- **Render Motoru:** HTML5 2D Canvas (`requestAnimationFrame` 60 FPS oyun döngüsü)
- **Ses Motoru:** Web Audio API sentezleyici (harici `.mp3`/`.wav` dosyası gerektirmez)
- **Stil:** Saf CSS (`src/index.css`), değişken tabanlı koyu buzul teması

## 2. Dosya Haritası ve Sorumluluklar (Doğrudan Erişim Rehberi)

- `src/constants/gameConfig.js`
  - **Satır 1-39 (`LETTER_MODES`):** Ders aşamaları (`homeRow`, `topRow`, `bottomRow`, `allTurkish`). Yeni harf/kelime grupları buraya eklenir.
  - **Satır 40-77 (`DIFFICULTIES`):** `easy`, `medium`, `hard` hız (`baseSpeed`, `speedPerLevel` ~%15 artış), balık üretim aralığı (`spawnInterval`) ve can ayarları.
  - **Satır 79-95 (`KEYBOARD_ROWS`, `HOME_ROW_ANCHORS`, `FISH_PALETTES`):** Türkçe Q klavye dizilimi ve balık renk paletleri.
  - **Satır 97-son (`normalizeTurkishKey`):** Türkçe karakter (`i->İ`, `ı->I`, `ğ->Ğ`, `ü->Ü`, `ş->Ş`, `ö->Ö`, `ç->Ç`) dönüştürücüsü.

- `src/utils/sound.js`
  - `SoundManager` sınıfı ve `sound` tekil (singleton) nesnesi (varsayılan `muted = true` / ses kapalı başlar).
  - Metodlar: `playLetterClear()`, `playEatFish()`, `playWrongKey()`, `playMissSplash()`, `playLevelUp()`, `setMuted()`.

- `src/components/FishCascadeCanvas.jsx`
  - **Satır 1-135:** Bileşen prop'ları, dinamik boyutlu `worldRef` (`width`, `height`, `iceFloorY`), seviye atlama yüzen yazısı (`SEVİYE X! +1 CAN`) ve `spawnFish` fonksiyonu.
  - **Satır 136-205:** `spawnParticles` ve `keydown` klavye dinleyicisi (ekrandaki en alttaki eşleşen balığı bulup `cleared = true` yapar).
  - **Satır 206-313:** Responsive `ResizeObserver`, `requestAnimationFrame` ana döngüsü (seviye başına `-145ms` üretim süresi) ve Canvas JSX çıktısı.
  - **Satır 315-486 (`updateWorld`):** Kar yağışı, Tux hareketi, çözülen balıkların penguen ağzına süzülmesi, kaçan balık kontrolü.
  - **Satır 488-586 (`drawWorld`):** Responsive gökyüzü, buzdağları, buz zemini ve su dalgası çizimi.
  - **Satır 588-684 (`drawFish`):** Balık gövdesi, kuyruk animasyonu ve harf rozeti çizimi.
  - **Satır 686-son (`drawTux`):** Penguen (Tux) gövde, atkı, kanat, göz ifadeleri ve ağız açma animasyonu.

- `src/components/VirtualKeyboard.jsx`
  - Ekranın altındaki Türkçe Q sanal klavye rehberi. Sıradaki en yakın balığın harfini (`targetLetter`) turuncu ile vurgular.

- `src/App.jsx`
  - **Satır 1-109:** Oyun durumu (`menu`, `playing`, `paused`, `gameover`), skor/kombo ve seviye atlayınca `+1 Can` ödülü (`handleFishEaten`).
  - **Satır 110-195:** Üst HUD (Skor, Seviye çubuğu, Kombo, dinamik artabilen `🐟` Canlar, Ses ve Klavye butonları).
  - **Satır 196-son:** Ana menü, Tam Ekran Oyun alanı, Duraklatma ve Oyun Sonu Karnesi.

- `src/index.css`
  - **Satır 1-44:** Tam ekran (`100vh` / `1600px`) `.app-shell` ve `.main-stage` yerleşimi.
  - **Satır 45-380:** Üst HUD ve Ana Menü kart stilleri.
  - **Satır 381-son:** Esnek tam ekran Canvas (`.stage-container`, `.canvas-wrapper`), Modal ve Sanal Klavye stilleri.

## 3. Kredi / Token Tasarruf Kuralları
1. **Dizin Taraması Yapma:** Dosya ağacı yukarıda tam olarak listelenmiştir. `Get-ChildItem` veya `find` çalıştırma.
2. **Hedefli Okuma Yap:** Bir dosyayı düzenlemeden önce tamamını okumak yerine `read_file` aracında `StartLine` ve `EndLine` parametrelerini kullan.
3. **Doğrudan Düzenle:** Harf/hız ayarları için sadece `src/constants/gameConfig.js`, görsel/fizik için `src/components/FishCascadeCanvas.jsx`, menü/HUD için `src/App.jsx` dosyasını düzenle.
4. **GEMINI.md Güncelleme Zorunluluğu:** Kodda yeni bir özellik veya satır kayması olduğunda aynı tur içinde `GEMINI.md` dosyasını da güncelle.

