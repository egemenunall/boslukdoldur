# Test Rehberi - Boşluğu Doldur Oyunu

## 🧪 Manuel Test Senaryoları

### Test 1: Temel Oyun Akışı (2 Oyuncu)

1. **Tarayıcı 1** - İlk oyuncu:
   - `http://localhost:3000` adresine git
   - İsim gir: "Oyuncu 1"
   - "Yeni Oda Oluştur" butonuna tıkla
   - Oda kodunu kopyala

2. **Tarayıcı 2** (veya Incognito) - İkinci oyuncu:
   - `http://localhost:3000` adresine git
   - İsim gir: "Oyuncu 2"
   - Oda kodunu yapıştır
   - "Odaya Katıl" butonuna tıkla

3. **Tarayıcı 1** - Host:
   - İki oyuncu görünmeli
   - "Oyunu Başlat" butonuna tıkla

4. **Her iki tarayıcıda**:
   - Soru görünmeli
   - Timer başlamalı (30 saniye)
   - Boşluğa cevap yaz ve gönder
   - Diğer oyuncu bekleniyor mesajı

5. **Oylama Turu**:
   - 3 cevap görünmeli (2 oyuncu + 1 doğru)
   - Bir cevap seç ve gönder

6. **Skor Ekranı**:
   - Doğru cevap gösterilmeli
   - Puanlar güncellenmiş olmalı
   - Host "Sonraki Tur" butonunu görmeli

7. **Oyun Sonu**:
   - 10 tur sonra final sıralaması görünmeli
   - Kazanan taçlı olmalı

### Test 2: Mobil Uyumluluk

1. Tarayıcı geliştirici araçlarını aç (F12)
2. Device toolbar'ı aç (Ctrl+Shift+M)
3. iPhone SE veya benzeri cihaz seç
4. Temel oyun akışını tekrarla
5. Kontrol edilecekler:
   - Tüm butonlar tıklanabilir mi?
   - Yazılar okunabilir mi?
   - Input alanları kullanılabilir mi?
   - Timer görünüyor mu?

### Test 3: Edge Cases

#### Oyuncu Ayrılması
1. 3 oyuncuyla oyun başlat
2. Ortada bir oyuncu tarayıcısını kapat
3. Oyun devam etmeli
4. Diğer oyuncular etkilenmemeli

#### Host Ayrılması
1. 3 oyuncuyla oyun başlat
2. Host tarayıcısını kapat
3. Yeni host atanmalı
4. Oyun devam etmeli

#### Timer Bitimi
1. Oyun başlat
2. Cevap vermeden bekle
3. Timer bittiğinde otomatik geçiş yapmalı

#### Network Latency
1. Chrome DevTools → Network
2. Throttling'i "Slow 3G" yap
3. Oyunu test et
4. Reconnection denenmeli

### Test 4: Çok Oyunculu (5+ Oyuncu)

1. 5 farklı tarayıcı/sekme aç
2. Hepsi aynı odaya katılsın
3. Oyunu başlat
4. Kontrol et:
   - Tüm oyuncular görünüyor mu?
   - Cevaplar karışık sıralı mı?
   - Skorlar doğru hesaplanıyor mu?

### Test 5: Hatalı Girişler

1. **Boş İsimle Oda Oluştur**
   - Hata mesajı göstermeli

2. **Yanlış Oda Kodu**
   - "Oda bulunamadı" hatası

3. **Tek Oyuncuyla Başlatma**
   - "En az 2 oyuncu gerekli" mesajı

4. **Oyun Başladıktan Sonra Katılma**
   - "Oyun başlamış" hatası

## ✅ Başarı Kriterleri

- [ ] 2 oyuncuyla tam bir oyun bitirilebiliyor
- [ ] 5+ oyuncuyla oyun sorunsuz çalışıyor
- [ ] Mobil cihazlarda kullanılabilir
- [ ] Oyuncu ayrılması oyunu bozmuyor
- [ ] Timer doğru çalışıyor
- [ ] Skorlar doğru hesaplanıyor
- [ ] Tüm animasyonlar düzgün çalışıyor
- [ ] Hata mesajları doğru gösteriliyor
- [ ] Reconnection çalışıyor

## 🐛 Bilinen Sınırlamalar

1. **In-memory Storage**: Sunucu yeniden başladığında tüm odalar kaybolur
2. **Local Development**: localhost:3000'de çalışır, production'da URL güncellemesi gerekir
3. **Soru Sayısı**: 20 soru var, tümü kullanıldıysa oyun bitebilir

## 📝 Test Sonuçları

Test tarih/saati kaydı için:
```
Test Tarihi: ___________
Test Eden: ___________
Sonuç: [BAŞARILI / BAŞARISIZ]
Notlar: 
___________________________________________
___________________________________________
```
