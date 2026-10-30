# 🐧 Penguen Klavye Avcısı (Tux Typing Web)

Çocuklar ve klavyeye yeni başlayanlar için geliştirilmiş, klasik **Tux Typing (Fish Cascade / Balık Şelalesi)** oyununun modern, tarayıcı tabanlı **React + Vite** uyarlamasıdır.

---

## ✨ Özellikler

- **🐟 Orijinal Balık Şelalesi Mekaniği:** Yukarıdan düşen balıkların üzerindeki harflere klavyeden basıldığında en aşağıdaki eşleşen balığın harfi silinir ve penguen (Tux) koşarak balığı havada yakalar.
- **🇹🇷 Tam Türkçe Q Klavye Uyumluluğu:** `Ğ, Ü, Ş, İ, Ö, Ç` ve `I/İ` dönüşümleri eksiksiz desteklenir.
- **📚 4 Aşamalı Klavye Müfredatı:**
  1. **Temel Sıra (Başlangıç):** `A S D F G H J K L Ş İ`
  2. **Üst Sıra Harfleri:** `E R T Y U I O P Ğ Ü`
  3. **Alt Sıra Harfleri:** `Z C V B N M Ö Ç`
  4. **Tüm Harfler (Karışık):** Tüm Türkçe alfabe
- **⚡ 3 Zorluk Seviyesi & Dinamik Seviye Sistemi:**
  - **Kolay / Orta / Zor** başlangıç hızları.
  - Her seviye atlandığında **+1 Can (`🐟`)** ödülü ve dengeli düşüş hızı artışı.
- **⌨️ İnteraktif Sanal Klavye Rehberi:** Sıradaki en yakın balığın harfini klavye üzerinde turuncu ile vurgular (üst menüden açılıp kapatılabilir).
- **🔊 Sıfır Bağımlılıklı Ses Motoru:** Harici ses dosyasına ihtiyaç duymadan **Web Audio API** ile sentezlenen ses efektleri (varsayılan olarak sessiz başlar).
- **📊 Oyun Sonu Karnesi:** Toplam skor, yenen balık sayısı, doğruluk oranı (`%`), dakikadaki harf hızı (`DKS`) ve en yüksek kombo.

---

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js** (v18 veya üzeri önerilir)

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda `http://localhost:5173` adresini açın.

### 3. Canlıya Alma (Production Build)
```bash
npm run build
```
Derlenen statik dosyalar `dist/` klasörüne oluşturulur.

---

## 🌐 Web'de Yayınlama (Deploy)
Bu proje statik bir **Vite + React** uygulaması olduğu için **Vercel**, **Netlify**, **Cloudflare Pages** veya **GitHub Pages** üzerinde tamamen ücretsiz yayınlanabilir:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

