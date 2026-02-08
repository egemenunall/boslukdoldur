# 🚀 Hızlı Başlangıç

## Oyunu 3 Adımda Başlat

### 1. Sunucuyu Çalıştır

```bash
cd /Users/egemen/Desktop/hsdnetwork
npm run dev
```

Çıktıda şunu görmelisin:
```
> Ready on http://localhost:3000
```

### 2. Tarayıcıda Aç

```
http://localhost:3000
```

### 3. Oyuna Başla

#### Birinci Oyuncu (Host):
1. İsmini yaz
2. "Yeni Oda Oluştur" butonuna tıkla
3. Oda kodunu kopyala (örn: ABC123)
4. Diğer oyuncuları bekle

#### İkinci Oyuncu:
1. `http://localhost:3000` adresine git
2. İsmini yaz
3. Oda kodunu yapıştır
4. "Odaya Katıl" butonuna tıkla

#### Oyunu Başlat:
1. Host "Oyunu Başlat" butonuna tıklar
2. Oyun başlar! 🎉

## 📱 Mobil Test

Aynı ağdaki telefondan:
```
http://[bilgisayarın-ip-adresi]:3000
```

IP adresini bulmak için:
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

## 🎮 Oyun Kuralları

1. **Cevap Ver** (30 saniye)
   - Boşluklu cümleye cevap yaz
   - Yaratıcı ol!

2. **Oyla** (20 saniye)
   - Hangisi doğru cevap?
   - Seç ve gönder

3. **Puanlan**
   - Doğru seçtiysen: +2 puan
   - Başkaları seninkini seçtiyse: +1 puan

4. **Kazan!**
   - 10 tur sonra en yüksek puan kazanır

## 🛠️ Sorun Giderme

### Sunucu Başlamıyor
```bash
# Port 3000 kullanımda olabilir, işlemi bul ve sonlandır
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Socket Bağlanamıyor
- `lib/socket.ts` dosyasında URL'yi kontrol et
- Firewall ayarlarını kontrol et

### Sayfa Yüklenmiyor
```bash
# node_modules'u sil ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 📞 Yardım

- `README.md` - Detaylı dökümantasyon
- `TEST_GUIDE.md` - Test senaryoları
- `PROJECT_SUMMARY.md` - Proje özeti

---

**İyi oyunlar! 🎉**
