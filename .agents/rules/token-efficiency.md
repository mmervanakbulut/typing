---
trigger: always_on
description: Token ve kredi tasarrufu sağlayan proje kuralları ve mimari özeti
---

# Kredi ve Token Tasarrufu Kuralları

1. **Gereksiz Keşif Komutları Çalıştırma:** Projenin tüm dosya yapısı kök dizindeki `GEMINI.md` içinde belgelenmiştir. Yeni bir özellik eklerken veya hata düzeltirken tüm klasörü tarama.
2. **Satır Aralıklı Okuma (`StartLine` / `EndLine`):** Büyük dosyaları (`FishCascadeCanvas.jsx`, `App.jsx`, `index.css`) okurken yalnızca ilgili fonksiyonun bulunduğu satır aralığını oku.
3. **Minimum Araç Çağrısı:** Tek seferde yapılabilecek düzenlemeleri bölme; yanıtları kısa, net ve doğrudan sonuca yönelik tut.
4. **Otomatik GEMINI.md Güncellemesi:** Kod dosyalarında yapılan her değişiklikten sonra satır aralıkları veya özellikler değiştiyse aynı yanıt içinde `GEMINI.md` dosyasını da mutlaka güncelle.

