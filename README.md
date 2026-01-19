# ResponsiveDOMMover

> Medya sorgularına (media queries) dayalı gelişmiş responsive DOM manipülasyon kütüphanesi

## 📋 İçindekiler

1. [Giriş](#-giriş)
2. [Kurulum](#-kurulum)
3. [Hızlı Başlangıç](#-hızlı-başlangıç)
4. [Temel Kullanım](#-temel-kullanım)
5. [İleri Seviye Kullanım](#-ileri-seviye-kullanım)
6. [API Referansı](#-api-referansı)
7. [Olaylar (Events)](#-olaylar-events)
8. [Örnekler](#-örnekler)
9. [İpuçları ve Püf Noktaları](#-ipuçları-ve-püf-noktaları)
10. [Sık Sorulan Sorular](#-sık-sorulan-sorular)

---

## Giriş

ResponsiveDOMMover, web sitenizde ekran boyutuna göre HTML elementlerini otomatik olarak taşımanızı sağlayan bir JavaScript kütüphanesidir. 

### Neden ResponsiveDOMMover?

**Sorun:** Responsive tasarımlarda bazen elementlerin sadece CSS ile yeniden düzenlenmesi yeterli olmaz. Örneğin:
- Mobilde navigasyonu farklı bir yere taşımak
- Tablette sidebar'ı içeriğin altına almak
- Küçük ekranlarda widget'ları yeniden sıralamak

**Çözüm:** ResponsiveDOMMover bu işleri otomatik yapar!

### Özellikler

✨ **Medya Sorgusu Tabanlı** - Viewport breakpoint'lerine göre element taşıma  
🎯 **Öncelik Sistemi** - Hangi kuralın öncelikli olacağını siz belirlersiniz  
🎬 **Yumuşak Animasyonlar** - FLIP tekniği ile akıcı geçişler  
🔄 **Otomatik Geri Dönüş** - Medya sorgusu eşleşmeyince element eski yerine döner  
👀 **DOM İzleyici** - Dinamik eklenen elementleri de yakalar  
🎨 **Esnek Konumlandırma** - İlk, son, index veya selector ile konumlandırma  
🪝 **Zengin Hook'lar** - Her aşama için callback'ler  
📦 **Hafif** - Sadece ~8KB (minified)  
🔧 **Framework Bağımsız** - Vanilla JS, React, Vue vs. hepsiyle çalışır  
⚡ **Performans Optimize** - Throttle edilmiş değerlendirmeler ve verimli DOM işlemleri

---

## 📦 Kurulum

### CDN ile Kullanım (En Kolay)

HTML dosyanızın `</body>` etiketinden önce ekleyin:

```html
<script src="responsive-dom-mover.min.js"></script>
```

veya

```html
<script src="https://cdn.jsdelivr.net/npm/responsive-dom-mover@2.0.0/dist/responsive-dom-mover.min.js"></script>
```

### Manuel İndirme

1. `responsive-dom-mover.js` dosyasını indirin
2. Projenize ekleyin
3. HTML'de referans verin:

```html
<script src="js/responsive-dom-mover.min.js"></script>
---

## Hızlı Başlangıç

### Yöntem 1: JavaScript ile (Önerilen)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Örnek</title>
</head>
<body>
    <!-- Taşınacak element -->
    <nav class="main-nav">
        <a href="/">Ana Sayfa</a>
        <a href="/hakkimizda">Hakkımızda</a>
        <a href="/iletisim">İletişim</a>
    </nav>

    <!-- Mobil menü konteyneri -->
    <div id="mobile-menu"></div>

    <!-- Ana içerik -->
    <main>
        <h1>Hoş Geldiniz</h1>
    </main>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        // Kütüphaneyi başlat
        const mover = ResponsiveDOMMover.init([
            {
                media: '(max-width: 768px)',  // Mobil ekranlarda
                to: '#mobile-menu',            // Bu konteynere taşı
                items: [
                    {
                        selector: '.main-nav', // Bu elementi
                        position: 'first'      // İlk sıraya koy
                    }
                ]
            }
        ]);
    </script>
</body>
</html>
```

**Ne Olur?**
- Ekran 768px'den küçük olunca → `.main-nav` elementi `#mobile-menu` içine taşınır
- Ekran 768px'den büyük olunca → `.main-nav` otomatik olarak eski yerine döner

### Yöntem 2: HTML Data Attribute'leri ile (En Kolay)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Örnek</title>
</head>
<body>
    <!-- Taşınacak element - data attribute'leri ile -->
    <nav class="main-nav" 
         data-move-to="#mobile-menu"
         data-move-media="(max-width: 768px)"
         data-move-position="first">
        <a href="/">Ana Sayfa</a>
        <a href="/hakkimizda">Hakkımızda</a>
        <a href="/iletisim">İletişim</a>
    </nav>

    <!-- Hedef koneteyner -->
    <div id="mobile-menu"></div>

    <main>
        <h1>Hoş Geldiniz</h1>
    </main>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        // DOM'dan otomatik oku ve başlat
        ResponsiveDOMMover.fromDOM();
    </script>
</body>
</html>
```

**Avantajları:**
- HTML'de her şey açıkça görülür
- JavaScript kodu minimum
- Düzenlemesi kolay

---

## Temel Kullanım

### 1. Basit Element Taşıma

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-container',
        items: [
            { selector: '.sidebar' }
        ]
    }
]);
```

**Açıklama:**
- Ekran ≤ 768px olunca
- `.sidebar` elementini
- `.mobile-container` içine taşı

### 2. Birden Fazla Element Taşıma

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-layout',
        items: [
            { selector: '.header' },
            { selector: '.sidebar' },
            { selector: '.footer' }
        ]
    }
]);
```

**Açıklama:**
- Üç elementi birden taşır
- Hepsi `.mobile-layout` içine gider
- Sıraları items dizisindeki sırayla aynıdır

### 3. Pozisyon Belirleme

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '#container',
        items: [
            { selector: '.item1', position: 'first' },  // En başa
            { selector: '.item2', position: 'last' },   // En sona
            { selector: '.item3', position: 0 },        // İlk sıraya (index)
            { selector: '.item4', position: 2 }         // 3. sıraya (index)
        ]
    }
]);
```

**Position Değerleri:**
- `'first'` → Konteynerin en başına
- `'last'` → Konteynerin en sonuna
- `0, 1, 2...` → Index numarası (0'dan başlar)
- `'.selector'` → Belirli bir elementin önüne

### 4. Birden Fazla Breakpoint

```javascript
const mover = ResponsiveDOMMover.init([
    {
        // Mobil (0-768px)
        media: '(max-width: 768px)',
        to: '.mobile-container',
        items: [
            { selector: '.sidebar', position: 'first' }
        ]
    },
    {
        // Tablet (769-1024px)
        media: '(min-width: 769px) and (max-width: 1024px)',
        to: '.tablet-container',
        items: [
            { selector: '.sidebar', position: 'last' }
        ]
    }
]);
```

**Açıklama:**
- Mobilde: sidebar `.mobile-container` içinde en başta
- Tablette: sidebar `.tablet-container` içinde en sonda
- Masaüstünde: sidebar orijinal yerinde

### 5. Data Attribute ile Kullanım

```html
<!-- Basit kullanım -->
<div class="widget" 
     data-move-to=".sidebar"
     data-move-media="(min-width: 992px)">
    Widget İçeriği
</div>

<!-- Tüm özelliklerle -->
<div class="ad-banner"
     data-move-to="#mobile-footer"
     data-move-media="(max-width: 768px)"
     data-move-position="last"
     data-move-priority="10">
    Reklam Alanı
</div>

<script>
    // Tüm data attribute'leri oku ve başlat
    const mover = ResponsiveDOMMover.fromDOM();
</script>
```

**Data Attribute'leri:**
- `data-move-to` → Hedef selector (zorunlu)
- `data-move-media` → Media query (zorunlu)
- `data-move-position` → Pozisyon (opsiyonel, varsayılan: 'last')
- `data-move-priority` → Öncelik (opsiyonel, varsayılan: 0)
- `data-move-once` → Sadece bir kez taşı (opsiyonel, varsayılan: false)

---

## 🔥 İleri Seviye Kullanım

### 1. Öncelik Sistemi

Aynı element için birden fazla kural varsa, öncelik sistemi devreye girer:

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-menu',
        items: [
            { selector: '.nav', priority: 5 }  // Düşük öncelik
        ]
    },
    {
        media: '(max-width: 480px)',
        to: '.tiny-menu',
        items: [
            { selector: '.nav', priority: 10 }  // Yüksek öncelik - Bu kazanır!
        ]
    }
]);
```

**Nasıl Çalışır?**
- 480px'den küçük ekranlarda: İki kural da eşleşir ama priority 10 olanı kazanır
- `.nav` elementi `.tiny-menu` içine taşınır
- 480-768px arası: Sadece ilk kural eşleşir, `.nav` elementi `.mobile-menu` içine taşınır

**Kural:** Yüksek sayı = Yüksek öncelik

### 2. Animasyon Ayarları

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.container',
        items: [
            { selector: '.animated-box' }
        ]
    }
], {
    animations: true,                              // Animasyonları aç
    animationDuration: 500,                        // 500ms sürsün
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)' // Easing fonksiyonu
});
```

**Animasyon Türleri:**
- `ease` → Varsayılan
- `ease-in` → Yavaş başla
- `ease-out` → Yavaş bitir
- `ease-in-out` → İkisi de
- `linear` → Sabit hız
- `cubic-bezier(...)` → Özel easing

**Animasyonları Kapatma:**
```javascript
const mover = ResponsiveDOMMover.init([...], {
    animations: false  // Animasyon yok
});
```

### 3. Callback Fonksiyonlar (Hooks)

#### Element Bazında Callback'ler

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-container',
        items: [
            {
                selector: '.widget',
                onMove: ({ element, rule, item }) => {
                    // Element taşındığında çalışır
                    console.log('Widget taşındı!');
                    element.classList.add('mobile-style');
                    element.style.backgroundColor = 'lightblue';
                }
            }
        ]
    }
]);
```

#### Kural Bazında Callback'ler

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-container',
        items: [
            { selector: '.widget' }
        ],
        onEnter: ({ rule, mover }) => {
            // Medya sorgusu eşleştiğinde
            console.log('Mobil moda geçildi');
            document.body.classList.add('mobile-mode');
        },
        onLeave: ({ rule, mover }) => {
            // Medya sorgusu eşleşmediğinde
            console.log('Mobil moddan çıkıldı');
            document.body.classList.remove('mobile-mode');
        },
        onMove: ({ element, rule, item }) => {
            // Bu kuraldaki herhangi bir element taşındığında
            console.log('Bir element taşındı');
        }
    }
]);
```

#### Global Callback'ler

```javascript
const mover = ResponsiveDOMMover.init([...], {
    beforeMove: async ({ element, rule, item }) => {
        // Element taşınmadan ÖNCE
        console.log('Element taşınacak:', element);
        
        // Hazırlık işlemleri
        element.style.opacity = '0';
        
        // false döndürürseniz taşıma iptal olur
        return true;
    },
    afterMove: async ({ element, rule, item }) => {
        // Element taşındıktan SONRA
        console.log('Element taşındı:', element);
        
        // Temizlik işlemleri
        element.style.opacity = '1';
    },
    beforeRestore: async ({ element, data }) => {
        // Element geri dönmeden ÖNCE
        console.log('Element geri dönecek:', element);
        return true;
    },
    afterRestore: async ({ element, data }) => {
        // Element geri döndükten SONRA
        console.log('Element geri döndü:', element);
    }
});
```

### 4. Debug Modu

```javascript
const mover = ResponsiveDOMMover.init([...], {
    debug: true  // Console'da detaylı loglar gösterir
});

// Console çıktısı:
// [ResponsiveDOMMover] Initialized with 2 rules
// [ResponsiveDOMMover] Activating rule: (max-width: 768px)
// [ResponsiveDOMMover] Moved element: <nav class="main-nav">
```

### 5. Hata Yönetimi

```javascript
const mover = ResponsiveDOMMover.init([...], {
    errorHandler: (error) => {
        console.error('ResponsiveDOMMover Hatası:', error.message);
        console.error('Detay:', error.context);
        
        // Kendi hata takip sisteminize gönderin
        // sendToErrorTracker(error);
    }
});
```

### 6. Performans Ayarları

```javascript
const mover = ResponsiveDOMMover.init([...], {
    throttle: 200,      // DOM değişiklikleri 200ms throttle edilir
    observeDOM: true    // DOM değişikliklerini izle (varsayılan: true)
});

// Statik siteler için DOM izlemeyi kapatın
const mover = ResponsiveDOMMover.init([...], {
    observeDOM: false  // Performans artışı
});
```

### 7. Tek Seferlik Taşıma

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.welcome-modal',
        items: [
            {
                selector: '.welcome-message',
                once: true  // Sadece bir kez taşı, geri getirme
            }
        ]
    }
]);
```

**Kullanım Senaryosu:**
- Hoş geldin mesajı göster
- Modal içine taşı
- Kullanıcı kapattıktan sonra geri getirme

---

## 📖 API Referansı

### Static Metodlar

#### `ResponsiveDOMMover.init(rules, options)`

Yeni bir instance oluşturur.

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.container',
        items: [
            { selector: '.element' }
        ]
    }
], {
    debug: true,
    animations: true
});
```

#### `ResponsiveDOMMover.fromDOM(options)`

HTML data attribute'lerinden otomatik oluşturur.

```javascript
const mover = ResponsiveDOMMover.fromDOM({
    debug: true,
    animations: true
});
```

#### `ResponsiveDOMMover.uid(element)`

Element için benzersiz ID üretir veya alır.

```javascript
const element = document.querySelector('.my-element');
const id = ResponsiveDOMMover.uid(element);
console.log(id); // 'rdm-abc123xyz'
```

#### `ResponsiveDOMMover.isTouchDevice`

Cihazın dokunmatik olup olmadığını kontrol eder.

```javascript
if (ResponsiveDOMMover.isTouchDevice) {
    console.log('Bu bir dokunmatik cihaz');
} else {
    console.log('Bu bir masaüstü cihaz');
}
```

#### `ResponsiveDOMMover.viewport`

Mevcut viewport boyutlarını döner.

```javascript
const { width, height } = ResponsiveDOMMover.viewport;
console.log(`Ekran: ${width}x${height}`);
```

### Instance Metodları

#### `mover.addRule(rule)`

Çalışma zamanında yeni kural ekler.

```javascript
mover.addRule({
    media: '(min-width: 1200px)',
    to: '.desktop-sidebar',
    items: [
        { selector: '.widget' }
    ]
});
```

#### `mover.removeRule(rule)`

Mevcut kuralı kaldırır.

```javascript
const myRule = { /* ... */ };
mover.addRule(myRule);

// Daha sonra
mover.removeRule(myRule);
```

#### `mover.pause()`

Tüm hareketleri durdurur.

```javascript
mover.pause();
console.log('Mover duraklatıldı');
```

#### `mover.resume()`

Duraklatılmış hareketleri devam ettirir.

```javascript
mover.resume();
console.log('Mover devam ediyor');
```

#### `mover.refresh()`

Tüm kuralları yeniden değerlendirir.

```javascript
// Sayfa değişiklikleri sonrası zorla yenile
mover.refresh();
```

#### `mover.snapshot()`

Taşınmış elementlerin anlık görüntüsünü alır.

```javascript
const snapshot = mover.snapshot();
console.log('Taşınmış element sayısı:', snapshot.size);

snapshot.forEach((data, element) => {
    console.log('Element:', element);
    console.log('Orijinal yer:', data.parent);
    console.log('Öncelik:', data.priority);
});
```

#### `mover.getStats()`

İstatistikleri döner.

```javascript
const stats = mover.getStats();
console.log('Toplam kural:', stats.rulesCount);
console.log('Aktif kural:', stats.activeRulesCount);
console.log('Taşınmış element:', stats.movedElementsCount);
console.log('Viewport genişlik:', stats.viewport.width);
console.log('Başlatıldı mı?', stats.initialized);
console.log('Yok edildi mi?', stats.destroyed);
```

#### `mover.isMoved(element)`

Elementin taşınıp taşınmadığını kontrol eder.

```javascript
const isMoved = mover.isMoved('.sidebar');
if (isMoved) {
    console.log('Sidebar taşınmış durumda');
} else {
    console.log('Sidebar orijinal yerinde');
}

// Element referansı ile de kullanılabilir
const element = document.querySelector('.sidebar');
const moved = mover.isMoved(element);
```

#### `mover.getElementData(element)`

Taşınmış elementin meta verilerini döner.

```javascript
const data = mover.getElementData('.sidebar');
if (data) {
    console.log('Orijinal parent:', data.parent);
    console.log('Placeholder:', data.placeholder);
    console.log('Öncelik:', data.priority);
    console.log('Tek seferlik mi?', data.once);
    console.log('Taşınma zamanı:', new Date(data.movedAt));
}
```

#### `mover.restore(element)`

Belirli bir elementi orijinal yerine geri döndürür.

```javascript
// Selector ile
await mover.restore('.sidebar');

// Element referansı ile
const element = document.querySelector('.sidebar');
await mover.restore(element);

console.log('Element geri döndürüldü');
```

#### `mover.restoreAll()`

Tüm taşınmış elementleri geri döndürür.

```javascript
await mover.restoreAll();
console.log('Tüm elementler geri döndürüldü');
```

#### `mover.destroy()`

Instance'ı yok eder ve temizlik yapar.

```javascript
mover.destroy();
console.log('Mover yok edildi');

// Artık kullanılamaz
```

---

## 🎪 Olaylar (Events)

Tüm olaylar `document` üzerinde tetiklenir ve `rdm:` öneki ile başlar.

### Olay Listesi

| Olay | Detay | Açıklama |
|------|-------|----------|
| `rdm:init` | `{ rules, mover }` | Kütüphane başlatıldı |
| `rdm:enter` | `{ rule, mover }` | Kural aktif oldu |
| `rdm:leave` | `{ rule, mover }` | Kural pasif oldu |
| `rdm:move` | `{ element, rule, item, mover }` | Element taşındı |
| `rdm:restore` | `{ element, data, mover }` | Element geri döndü |
| `rdm:error` | `{ message, error, context, mover }` | Hata oluştu |
| `rdm:ruleAdded` | `{ rule, mover }` | Kural eklendi |
| `rdm:ruleRemoved` | `{ rule, mover }` | Kural kaldırıldı |
| `rdm:paused` | `{ mover }` | Duraklatıldı |
| `rdm:resumed` | `{ mover }` | Devam ettirildi |
| `rdm:refreshed` | `{ mover }` | Yenilendi |
| `rdm:destroyed` | `{ mover }` | Yok edildi |

### Olay Dinleme Örnekleri

#### Basit Olay Dinleme

```javascript
document.addEventListener('rdm:move', (e) => {
    console.log('Element taşındı:', e.detail.element);
});

document.addEventListener('rdm:restore', (e) => {
    console.log('Element geri döndü:', e.detail.element);
});
```

#### Kural Değişikliklerini İzleme

```javascript
document.addEventListener('rdm:enter', (e) => {
    console.log('Medya sorgusu aktif:', e.detail.rule.media);
    
    // Örnek: Body'ye class ekle
    document.body.classList.add('mobile-layout');
});

document.addEventListener('rdm:leave', (e) => {
    console.log('Medya sorgusu pasif:', e.detail.rule.media);
    
    // Örnek: Body'den class kaldır
    document.body.classList.remove('mobile-layout');
});
```

#### Hata Yönetimi

```javascript
document.addEventListener('rdm:error', (e) => {
    console.error('Hata:', e.detail.message);
    console.error('Detay:', e.detail.error);
    
    // Kullanıcıya bildirim göster
    alert('Bir hata oluştu: ' + e.detail.message);
});
```

#### Analytics Entegrasyonu

```javascript
document.addEventListener('rdm:move', (e) => {
    // Google Analytics'e gönder
    if (typeof gtag !== 'undefined') {
        gtag('event', 'element_moved', {
            'element_selector': e.detail.item.selector,
            'media_query': e.detail.rule.media
        });
    }
});
```

#### Tüm Olayları İzleme

```javascript
const events = [
    'init', 'enter', 'leave', 'move', 'restore', 
    'error', 'ruleAdded', 'ruleRemoved', 
    'paused', 'resumed', 'refreshed', 'destroyed'
];

events.forEach(eventName => {
    document.addEventListener(`rdm:${eventName}`, (e) => {
        console.log(`[${eventName}]`, e.detail);
    });
});
```

---

## 💡 Örnekler

### Örnek 1: Responsive Navigasyon Menüsü

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Menü</title>
    <style>
        /* Masaüstü stili */
        .desktop-header {
            background: #333;
            padding: 20px;
        }
        
        .main-nav {
            display: flex;
            gap: 20px;
        }
        
        .main-nav a {
            color: white;
            text-decoration: none;
        }
        
        /* Mobil menü */
        .mobile-menu {
            display: none;
            background: #222;
            padding: 20px;
        }
        
        @media (max-width: 768px) {
            .mobile-menu {
                display: block;
            }
            
            .main-nav {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <header class="desktop-header">
        <nav class="main-nav">
            <a href="/">Ana Sayfa</a>
            <a href="/urunler">Ürünler</a>
            <a href="/hakkimizda">Hakkımızda</a>
            <a href="/iletisim">İletişim</a>
        </nav>
    </header>

    <div class="mobile-menu"></div>

    <main>
        <h1>Hoş Geldiniz</h1>
        <p>Pencereyi küçültüp büyülterek menünün nasıl taşındığını görün.</p>
    </main>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        const mover = ResponsiveDOMMover.init([
            {
                media: '(max-width: 768px)',
                to: '.mobile-menu',
                items: [
                    {
                        selector: '.main-nav',
                        position: 'first',
                        onMove: ({ element }) => {
                            element.style.backgroundColor = '#222';
                            console.log('Menü mobile taşındı');
                        }
                    }
                ],
                onEnter: () => {
                    console.log('Mobil mod aktif');
                },
                onLeave: () => {
                    console.log('Masaüstü mod aktif');
                }
            }
        ], {
            debug: true,
            animations: true,
            animationDuration: 300
        });
    </script>
</body>
</html>
```

### Örnek 2: E-Ticaret Ürün Sayfası

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ürün Sayfası</title>
    <style>
        .product-page {
            display: flex;
            gap: 20px;
            padding: 20px;
        }
        
        .product-images {
            flex: 1;
        }
        
        .product-info {
            flex: 1;
        }
        
        .product-reviews {
            margin-top: 40px;
        }
        
        @media (max-width: 768px) {
            .product-page {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="product-page">
        <div class="product-images">
            <img src="urun.jpg" alt="Ürün" style="width: 100%;">
        </div>
        
        <div class="product-info">
            <h1>Harika Ürün</h1>
            <p class="price">₺299,90</p>
            <button>Sepete Ekle</button>
        </div>
    </div>
    
    <div class="product-reviews">
        <h2>Müşteri Yorumları</h2>
        <p>Bu ürün hakkında henüz yorum yapılmamış.</p>
    </div>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        // Mobilde önce resim, sonra bilgi, sonra yorumlar
        ResponsiveDOMMover.init([
            {
                media: '(max-width: 768px)',
                to: 'body',
                items: [
                    { selector: '.product-images', position: 0 },
                    { selector: '.product-info', position: 1 },
                    { selector: '.product-reviews', position: 2 }
                ]
            }
        ], {
            animations: true,
            animationDuration: 400
        });
    </script>
</body>
</html>
```

### Örnek 3: Dashboard Widget'ları

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <style>
        .dashboard {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            padding: 20px;
        }
        
        .widget {
            background: white;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 8px;
        }
        
        .mobile-dashboard {
            display: none;
        }
        
        @media (max-width: 992px) {
            .dashboard {
                display: none;
            }
            
            .mobile-dashboard {
                display: block;
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="widget stats">
            <h3>İstatistikler</h3>
            <p>Toplam Kullanıcı: 1.234</p>
        </div>
        
        <div class="widget chart">
            <h3>Grafik</h3>
            <p>[Grafik Alanı]</p>
        </div>
        
        <div class="widget activity">
            <h3>Son Aktiviteler</h3>
            <p>Kullanıcı giriş yaptı...</p>
        </div>
    </div>

    <div class="mobile-dashboard"></div>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        ResponsiveDOMMover.init([
            {
                media: '(max-width: 992px)',
                to: '.mobile-dashboard',
                items: [
                    { selector: '.stats', position: 0, priority: 10 },
                    { selector: '.chart', position: 1, priority: 9 },
                    { selector: '.activity', position: 2, priority: 8 }
                ],
                onEnter: () => {
                    console.log('Mobil dashboard aktif');
                    document.body.classList.add('mobile-view');
                },
                onLeave: () => {
                    console.log('Masaüstü dashboard aktif');
                    document.body.classList.remove('mobile-view');
                }
            }
        ], {
            debug: true,
            animations: true
        });
    </script>
</body>
</html>
```

### Örnek 4: Blog Sidebar

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog</title>
    <style>
        .blog-layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 20px;
            padding: 20px;
        }
        
        @media (max-width: 992px) {
            .blog-layout {
                grid-template-columns: 1fr;
            }
        }
        
        .sidebar {
            background: #f5f5f5;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="blog-layout">
        <main class="content">
            <article>
                <h1>Blog Yazısı Başlığı</h1>
                <p>Blog yazısı içeriği...</p>
            </article>
        </main>
        
        <aside class="sidebar">
            <h3>Son Yazılar</h3>
            <ul>
                <li>Yazı 1</li>
                <li>Yazı 2</li>
                <li>Yazı 3</li>
            </ul>
        </aside>
    </div>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        // Tablet ve mobilde sidebar içeriğin altına taşınsın
        ResponsiveDOMMover.init([
            {
                media: '(max-width: 992px)',
                to: '.content',
                items: [
                    { 
                        selector: '.sidebar', 
                        position: 'last',
                        onMove: ({ element }) => {
                            element.style.marginTop = '40px';
                        }
                    }
                ]
            }
        ]);
    </script>
</body>
</html>
```

### Örnek 5: Filtreler ve Liste

```html
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ürün Listesi</title>
    <style>
        .shop-layout {
            display: flex;
            gap: 20px;
            padding: 20px;
        }
        
        .filters {
            width: 250px;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .products {
            flex: 1;
        }
        
        .filter-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }
        
        .filter-modal-content {
            background: white;
            margin: 50px auto;
            padding: 20px;
            max-width: 500px;
        }
        
        .filter-modal.active {
            display: block;
        }
        
        .filter-toggle {
            display: none;
            margin-bottom: 20px;
        }
        
        @media (max-width: 992px) {
            .shop-layout {
                flex-direction: column;
            }
            
            .filters {
                width: 100%;
            }
            
            .filter-toggle {
                display: block;
            }
        }
    </style>
</head>
<body>
    <button class="filter-toggle" onclick="toggleFilters()">🔍 Filtreleri Göster</button>
    
    <div class="shop-layout">
        <aside class="filters">
            <h3>Filtreler</h3>
            <label>
                <input type="checkbox"> Stokta var
            </label>
            <label>
                <input type="checkbox"> İndirimli
            </label>
        </aside>
        
        <main class="products">
            <h2>Ürünler</h2>
            <div class="product-grid">
                <!-- Ürünler -->
            </div>
        </main>
    </div>
    
    <div class="filter-modal" id="filterModal">
        <div class="filter-modal-content">
            <button onclick="toggleFilters()">Kapat</button>
            <div id="filter-container"></div>
        </div>
    </div>

    <script src="responsive-dom-mover.min.js"></script>
    <script>
        ResponsiveDOMMover.init([
            {
                media: '(max-width: 992px)',
                to: '#filter-container',
                items: [
                    { selector: '.filters' }
                ]
            }
        ]);
        
        function toggleFilters() {
            document.getElementById('filterModal').classList.toggle('active');
        }
    </script>
</body>
</html>
```

### Örnek 6: Kompleks Öncelik Senaryosu

```javascript
// Çok farklı breakpoint'lerde farklı yerlere taşıma
const mover = ResponsiveDOMMover.init([
    {
        // Çok küçük ekranlar (< 480px)
        media: '(max-width: 480px)',
        to: '.tiny-screen-layout',
        items: [
            { selector: '.adaptive-widget', priority: 10 }
        ]
    },
    {
        // Küçük ekranlar (480-768px)
        media: '(min-width: 481px) and (max-width: 768px)',
        to: '.small-screen-layout',
        items: [
            { selector: '.adaptive-widget', priority: 8 }
        ]
    },
    {
        // Orta ekranlar (768-992px)
        media: '(min-width: 769px) and (max-width: 992px)',
        to: '.medium-screen-layout',
        items: [
            { selector: '.adaptive-widget', priority: 5 }
        ]
    }
], {
    debug: true,
    beforeMove: ({ element, rule }) => {
        console.log(`Widget taşınıyor: ${rule.to}`);
        return true;
    }
});
```

### Örnek 7: Dinamik Kural Ekleme

```javascript
const mover = ResponsiveDOMMover.init([], { debug: true });

// Kullanıcı ayarlarına göre kural ekle
function applyUserPreferences(preferences) {
    if (preferences.compactMode) {
        mover.addRule({
            media: '(max-width: 1200px)',
            to: '.compact-container',
            items: [
                { selector: '.widget-1' },
                { selector: '.widget-2' },
                { selector: '.widget-3' }
            ]
        });
    }
    
    if (preferences.hideAds) {
        // Reklamları gizle veya taşı
        mover.addRule({
            media: '(max-width: 768px)',
            to: '.hidden-ads',
            items: [
                { selector: '.ad-banner', once: true }
            ]
        });
    }
}

// Sayfa yüklendiğinde
const userPrefs = JSON.parse(localStorage.getItem('userPreferences')) || {};
applyUserPreferences(userPrefs);
```

---

## 🎓 İpuçları ve Püf Noktaları

### 1. CSS ile Koordinasyon

```css
/* Hedef konteyner başlangıçta gizli olabilir */
.mobile-menu {
    display: none;
}

@media (max-width: 768px) {
    .mobile-menu {
        display: block;
    }
}
```

```javascript
// JavaScript ile senkronize olun
ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',  // CSS ile aynı breakpoint
        to: '.mobile-menu',
        items: [{ selector: '.nav' }]
    }
]);
```

### 2. Position Stratejisi

```javascript
// Birden fazla element taşırken sıralama önemli
ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-container',
        items: [
            { selector: '.header', position: 0 },    // En üstte
            { selector: '.nav', position: 1 },       // Ortada
            { selector: '.sidebar', position: 2 }    // En altta
        ]
    }
]);
```

### 3. Performans İçin Best Practices

```javascript
// ✅ İyi - Spesifik selector
{ selector: '#main-nav' }
{ selector: '.product-sidebar' }

// ❌ Kötü - Çok genel selector
{ selector: 'div' }
{ selector: '.item' }  // Sayfada 50 tane .item varsa problem

// ✅ İyi - Statik siteler için DOM izlemeyi kapat
ResponsiveDOMMover.init([...], {
    observeDOM: false  // Performans artışı
});

// ✅ İyi - Throttle değerini ayarla
ResponsiveDOMMover.init([...], {
    throttle: 200  // Çok hızlı değişimlerde 200ms bekle
});
```

### 4. Debugging

```javascript
// Debug modunu aç
const mover = ResponsiveDOMMover.init([...], {
    debug: true
});

// İstatistikleri kontrol et
console.log(mover.getStats());

// Snapshot al
const snapshot = mover.snapshot();
snapshot.forEach((data, element) => {
    console.log('Taşınmış element:', element);
    console.log('Detaylar:', data);
});

// Element durumunu kontrol et
if (mover.isMoved('.sidebar')) {
    console.log('Sidebar taşınmış');
}
```

### 5. Memory Leak'leri Önleme

```javascript
// Single Page Application (SPA) kullanıyorsanız
let mover = null;

function initPage() {
    // Yeni mover oluştur
    mover = ResponsiveDOMMover.init([...]);
}

function destroyPage() {
    // Temizle
    if (mover) {
        mover.destroy();
        mover = null;
    }
}

// Route değişiminde
router.on('change', () => {
    destroyPage();
    initPage();
});
```

### 6. Animasyon İpuçları

```javascript
// Hızlı cihazlar için uzun animasyon
const isFastDevice = window.devicePixelRatio > 1;

ResponsiveDOMMover.init([...], {
    animations: true,
    animationDuration: isFastDevice ? 400 : 200,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)'
});

// Veya tamamen kapat (daha performanslı)
ResponsiveDOMMover.init([...], {
    animations: false
});
```

### 7. Media Query İpuçları

```javascript
// Yaygın breakpoint'ler
const breakpoints = {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 991px)',
    desktop: '(min-width: 992px)',
    widescreen: '(min-width: 1200px)',
    
    // Özel durumlar
    landscape: '(orientation: landscape)',
    portrait: '(orientation: portrait)',
    retina: '(-webkit-min-device-pixel-ratio: 2)'
};

ResponsiveDOMMover.init([
    {
        media: breakpoints.mobile,
        to: '.mobile-layout',
        items: [...]
    },
    {
        media: breakpoints.tablet,
        to: '.tablet-layout',
        items: [...]
    }
]);
```

### 8. Test Etme

```javascript
// Viewport boyutunu konsol'da test et
console.log(ResponsiveDOMMover.viewport);

// Manuel resize simülasyonu
window.dispatchEvent(new Event('resize'));

// Zorla refresh
mover.refresh();

// Tüm olayları logla
['init', 'enter', 'leave', 'move', 'restore'].forEach(event => {
    document.addEventListener(`rdm:${event}`, (e) => {
        console.log(`Event: ${event}`, e.detail);
    });
});
```

---

## Sık Sorulan Sorular

### S1: Aynı elementi birden fazla kuralla taşıyabilir miyim?

**C:** Evet! Öncelik sistemi hangi kuralın kazanacağını belirler:

```javascript
ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-menu',
        items: [
            { selector: '.nav', priority: 5 }
        ]
    },
    {
        media: '(max-width: 480px)',
        to: '.tiny-menu',
        items: [
            { selector: '.nav', priority: 10 }  // Bu kazanır
        ]
    }
]);
```

### S2: Element bulunamazsa ne olur?

**C:** İşlem atlanır ve hata loglanır/dispatch edilir:

```javascript
ResponsiveDOMMover.init([...], {
    errorHandler: (error) => {
        console.log('Element bulunamadı:', error.context);
    }
});

// Veya event ile dinle
document.addEventListener('rdm:error', (e) => {
    console.log('Hata:', e.detail.message);
});
```

### S3: Dinamik eklenen elementlerle çalışır mı?

**C:** Evet! `observeDOM: true` (varsayılan) olduğunda otomatik çalışır:

```javascript
const mover = ResponsiveDOMMover.init([...], {
    observeDOM: true  // Varsayılan zaten true
});

// Daha sonra DOM'a element ekle
const newElement = document.createElement('div');
newElement.className = 'nav';
document.body.appendChild(newElement);

// ResponsiveDOMMover otomatik algılar ve taşır
```

### S4: Animasyonları nasıl özelleştiririm?

**C:** Animasyon ayarlarını değiştirin veya kendi animasyonunuzu yazın:

```javascript
// Built-in animasyon ayarları
ResponsiveDOMMover.init([...], {
    animations: true,
    animationDuration: 500,
    animationEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
});

// Veya kendi animasyonunuzu yazın
ResponsiveDOMMover.init([...], {
    animations: false,  // Built-in'i kapat
    beforeMove: async ({ element }) => {
        element.style.opacity = '0';
    },
    afterMove: async ({ element }) => {
        await element.animate([
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'scale(1)' }
        ], { duration: 400 }).finished;
    }
});
```

### S5: CSS Grid/Flexbox ile çalışır mı?

**C:** Evet, her layout sistemiyle çalışır:

```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
    .grid-container {
        grid-template-columns: 1fr;
    }
}
```

```javascript
ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.mobile-grid',
        items: [
            { selector: '.grid-item-1', position: 0 },
            { selector: '.grid-item-2', position: 1 }
        ]
    }
]);
```

### S6: React/Vue/Angular ile kullanabilir miyim?

**C:** Kesinlikle! Framework bağımsız çalışır:

```javascript
// React örneği
import { useEffect, useRef } from 'react';
import ResponsiveDOMMover from 'responsive-dom-mover';

function MyComponent() {
    const moverRef = useRef(null);
    
    useEffect(() => {
        moverRef.current = ResponsiveDOMMover.init([...]);
        
        return () => {
            moverRef.current?.destroy();
        };
    }, []);
    
    return <div>...</div>;
}
```

### S7: Performans nasıl?

**C:** Çok iyi! Fakat optimize edebilirsiniz:

```javascript
// Statik siteler için
ResponsiveDOMMover.init([...], {
    observeDOM: false,  // DOM izleme kapalı
    throttle: 200       // 200ms throttle
});

// Animasyonları kapat
ResponsiveDOMMover.init([...], {
    animations: false
});
```

### S8: Tek seferlik taşıma nasıl yapılır?

**C:** `once: true` kullanın:

```javascript
ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.welcome-screen',
        items: [
            {
                selector: '.welcome-message',
                once: true  // Sadece bir kez taşı
            }
        ]
    }
]);
```

### S9: Multiple instance oluşturabilir miyim?

**C:** Evet, ama genelde gerek yok:

```javascript
// Farklı bölümler için farklı instance'lar
const headerMover = ResponsiveDOMMover.init([...]);
const sidebarMover = ResponsiveDOMMover.init([...]);
const footerMover = ResponsiveDOMMover.init([...]);

// Temizlik
headerMover.destroy();
sidebarMover.destroy();
footerMover.destroy();
```

### S10: Hangi tarayıcıları destekler?

**C:** Modern tarayıcılar:
- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 15+
- Opera 38+

Internet Explorer desteklenmez (ES6+ kullanır).

---

## Bonus: Gerçek Dünya Örnekleri

### Senaryo 1: E-Ticaret Sitesi

```javascript
// Mobilde önce ürün resmi, sonra detaylar
const shopMover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '.product-mobile-layout',
        items: [
            { selector: '.product-gallery', position: 0 },
            { selector: '.product-title', position: 1 },
            { selector: '.product-price', position: 2 },
            { selector: '.product-description', position: 3 },
            { selector: '.product-add-to-cart', position: 4 },
            { selector: '.product-reviews', position: 5 }
        ],
        onEnter: () => {
            // Mobil için özel ayarlar
            document.body.classList.add('shop-mobile');
            
            // Analytics
            gtag('event', 'mobile_view', { page: 'product' });
        }
    }
], {
    animations: true,
    animationDuration: 300,
    beforeMove: ({ element }) => {
        // Scroll pozisyonunu kaydet
        element.dataset.scrollY = window.scrollY;
    },
    afterMove: ({ element }) => {
        // Scroll pozisyonunu geri yükle
        if (element.dataset.scrollY) {
            window.scrollTo(0, parseInt(element.dataset.scrollY));
        }
    }
});
```

### Senaryo 2: Haber Sitesi

```javascript
// Farklı ekran boyutlarında farklı layout'lar
const newsMover = ResponsiveDOMMover.init([
    {
        // Mobil: Tek sütun
        media: '(max-width: 767px)',
        to: '.mobile-news-feed',
        items: [
            { selector: '.breaking-news', position: 0, priority: 10 },
            { selector: '.top-stories', position: 1, priority: 9 },
            { selector: '.trending', position: 2, priority: 8 },
            { selector: '.categories', position: 3, priority: 7 }
        ]
    },
    {
        // Tablet: İki sütun
        media: '(min-width: 768px) and (max-width: 991px)',
        to: '.tablet-news-grid',
        items: [
            { selector: '.breaking-news', position: 0, priority: 5 },
            { selector: '.top-stories', position: 1, priority: 5 }
        ]
    }
], {
    debug: false,
    animations: true,
    animationEasing: 'ease-out'
});

// Kategori değiştiğinde refresh
document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', () => {
        setTimeout(() => newsMover.refresh(), 100);
    });
});
```

### Senaryo 3: Admin Paneli

```javascript
// Responsive admin dashboard
const dashboardMover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 1200px)',
        to: '.dashboard-mobile',
        items: [
            { selector: '.stats-overview', position: 0 },
            { selector: '.quick-actions', position: 1 },
            { selector: '.recent-activity', position: 2 },
            { selector: '.analytics-chart', position: 3 }
        ],
        onEnter: () => {
            // Sidebar'ı otomatik kapat
            document.querySelector('.admin-sidebar').classList.add('collapsed');
            
            // Kullanıcı tercihini kaydet
            localStorage.setItem('dashboardView', 'mobile');
        },
        onLeave: () => {
            // Sidebar'ı aç
            document.querySelector('.admin-sidebar').classList.remove('collapsed');
            
            localStorage.setItem('dashboardView', 'desktop');
        }
    }
], {
    animations: true,
    animationDuration: 250,
    errorHandler: (error) => {
        // Hataları logla
        console.error('Dashboard Mover Error:', error);
        
        // Admin'e bildirim göster
        showAdminNotification('Layout hatası', 'error');
    }
});

// Kullanıcı widget ekleyince refresh
document.addEventListener('widget-added', () => {
    dashboardMover.refresh();
});
```

---

### Katkıda Bulunma
Pull Request'ler hoş karşılanır!

---

##  Teşekkürler

ResponsiveDOMMover'ı kullandığınız için teşekkürler! 

Beğendiyseniz ⭐ vermeyi unutmayın!

---

**Son Güncelleme:** 19 Ocak 2026 
**Versiyon:** 2.0.0  
**Yazar:** GRIX
