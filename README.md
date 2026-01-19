# 📚 ResponsiveDOMMover v3.0 - Komple Kullanım Kılavuzu

## 🎯 İçindekiler

1. [Temel Kullanımlar](#1-temel-kullanımlar)
2. [Gelişmiş Özellikler](#2-gelişmiş-özellikler)
3. [Grup İşlemleri](#3-grup-i̇şlemleri)
4. [Swap ve Exchange](#4-swap-ve-exchange)
5. [Koşullu Taşıma](#5-koşullu-taşıma)
6. [Clone Mode](#6-clone-mode)
7. [Breakpoint Yönetimi](#7-breakpoint-yönetimi)
8. [Animasyon ve Transform](#8-animasyon-ve-transform)
9. [Event Yönetimi](#9-event-yönetimi)
10. [State ve Persistence](#10-state-ve-persistence)
11. [API Metodları](#11-api-metodları)
12. [Gerçek Dünya Örnekleri](#12-gerçek-dünya-örnekleri)

---

## 1. Temel Kullanımlar

### 1.1 HTML Data Attribute ile Basit Taşıma

```html
<!-- En basit kullanım -->
<div data-move-to="#mobile-menu" 
     data-move-media="(max-width: 768px)">
    Navigasyon
</div>

<div id="mobile-menu"></div>

<script>
ResponsiveDOMMover.fromDOM();
</script>
```

### 1.2 JavaScript API ile Taşıma

```javascript
const mover = ResponsiveDOMMover.init([
    {
        media: '(max-width: 768px)',
        to: '#mobile-container',
        items: [
            { 
                selector: '.sidebar',
                position: 'first',
                priority: 10
            }
        ]
    }
]);
```

### 1.3 Pozisyon Belirleme

```html
<!-- İlk sıraya -->
<div data-move-to="#target" data-move-position="first">İlk</div>

<!-- Son sıraya -->
<div data-move-to="#target" data-move-position="last">Son</div>

<!-- Index ile -->
<div data-move-to="#target" data-move-position="2">3. sıra (index 2)</div>

<!-- Selector ile (önüne ekle) -->
<div data-move-to="#target" data-move-position=".reference-element">Referans önüne</div>
```

### 1.4 Öncelik Sistemi

```html
<!-- Yüksek öncelik (10) -->
<div data-move-to="#target" data-move-priority="10">Yüksek öncelikli</div>

<!-- Düşük öncelik (5) -->
<div data-move-to="#target" data-move-priority="5">Düşük öncelikli</div>

<!-- Aynı element için birden fazla kural varsa, yüksek öncelikli kazanır -->
```

### 1.5 Once (Tek Seferlik Taşıma)

```html
<!-- Sadece bir kez taşı, bir daha geri getirme -->
<div data-move-to="#target" 
     data-move-media="(max-width: 768px)"
     data-move-once="true">
    Bir kez taşı
</div>
```

---

## 2. Gelişmiş Özellikler

### 2.1 data-move-init (Alpine.js Tarzı)

```html
<!-- Global fonksiyon -->
<div data-move-init="myConfig">Widget</div>

<script>
window.myConfig = function() {
    return {
        to: '#target',
        media: '(max-width: 768px)',
        position: 'first',
        priority: 10
    };
};

ResponsiveDOMMover.fromDOM();
</script>
```

```html
<!-- Global obje -->
<script>
window.widgetSettings = {
    to: '#mobile-area',
    media: '(max-width: 768px)',
    position: 'last'
};
</script>

<div data-move-init="widgetSettings">Widget</div>
```

```html
<!-- Inline fonksiyon -->
<div data-move-init="() => ({ to: '#target', media: '(max-width: 768px)' })">
    Widget
</div>
```

### 2.2 Fallback Hedefler (Multiple Targets)

```html
<!-- İlk bulduğu hedefe taşı -->
<div data-move-fallback="#primary, #secondary, #tertiary" 
     data-move-media="(max-width: 768px)">
    Esnek Widget
</div>

<!-- JavaScript ile -->
<script>
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#target1, #target2, #target3',
    items: [{ selector: '.widget' }]
}]);
</script>
```

### 2.3 Delay (Geciktirme)

```html
<!-- 2 saniye gecikme -->
<div data-move-to="#target" 
     data-move-delay="2000"
     data-move-media="(max-width: 768px)">
    Gecikmeli widget
</div>

<!-- Cascade efekti için -->
<div data-move-to="#target" data-move-delay="0">Widget 1</div>
<div data-move-to="#target" data-move-delay="200">Widget 2</div>
<div data-move-to="#target" data-move-delay="400">Widget 3</div>
```

### 2.4 CSS Class Triggers

```html
<!-- Taşınca/dönerken class ekle -->
<div data-move-to="#target" 
     data-move-media="(max-width: 768px)"
     data-move-classes='{"onMove":["moved","mobile-active"],"onRestore":["restored","desktop-active"]}'>
    Widget
</div>

<style>
.moved {
    background: #e8f5e9;
    border: 2px solid #4caf50;
}

.mobile-active {
    font-size: 14px;
}

.restored {
    background: #fff3e0;
}
</style>
```

### 2.5 Intersection Observer (Lazy Move)

```html
<!-- Element görünür olunca taşı -->
<div data-move-to="#target" 
     data-move-media="(max-width: 768px)"
     data-move-intersect="true">
    Lazy Widget
</div>

<script>
ResponsiveDOMMover.fromDOM({
    intersectionObserver: true  // Aktifleştir
});
</script>
```

---

## 3. Grup İşlemleri

### 3.1 HTML ile Grup Taşıma

```html
<!-- Grup elementleri -->
<div data-move-group="products" data-move-group-order="1">Ürün 1</div>
<div data-move-group="products" data-move-group-order="2">Ürün 2</div>
<div data-move-group="products" data-move-group-order="3">Ürün 3</div>
<div data-move-group="products" data-move-group-order="4">Ürün 4</div>

<div id="product-slider"></div>

<script>
ResponsiveDOMMover.fromDOM({
    groups: {
        'products': {
            media: '(max-width: 768px)',
            to: '#product-slider',
            keepOrder: true  // Sırayı koru
        }
    }
});
</script>
```

### 3.2 JavaScript ile Grup Tanımlama

```javascript
// Manuel grup tanımla
mover.defineGroup('navigation', [
    '.nav-item-1',
    '.nav-item-2',
    '.nav-item-3'
]);

// Grubu taşı
mover.moveGroup('navigation', '#mobile-menu');

// Grubu geri getir
mover.restoreGroup('navigation');
```

### 3.3 Wrapper Container ile Grup

```javascript
ResponsiveDOMMover.fromDOM({
    groups: {
        'widgets': {
            media: '(max-width: 768px)',
            to: '#mobile-area',
            keepOrder: true,
            wrapInContainer: true,         // Wrapper oluştur
            containerClass: 'widget-group', // Wrapper class'ı
            animateAsOne: true              // Tek element gibi animasyon
        }
    }
});
```

### 3.4 Grup Callback'leri

```javascript
ResponsiveDOMMover.fromDOM({
    groups: {
        'products': {
            media: '(max-width: 768px)',
            to: '#slider',
            onGroupMove: ({ elements, groupId }) => {
                console.log(`${elements.length} ürün taşındı`);
                // Custom animasyon ekle
                elements.forEach(el => {
                    el.classList.add('group-moved');
                });
            }
        }
    }
});
```

---

## 4. Swap ve Exchange

### 4.1 Basit Swap

```html
<!-- A ile B yer değiştirir -->
<div id="sidebar" data-move-swap="#main-content" data-move-media="(max-width: 768px)">
    Sidebar
</div>

<div id="main-content">
    Ana İçerik
</div>
```

### 4.2 Manuel Swap

```javascript
// Programatik swap
mover.swap('#element-1', '#element-2');

// Event ile dinle
document.addEventListener('rdm:swap', (e) => {
    console.log('Swapped:', e.detail.element1, e.detail.element2);
});

document.addEventListener('rdm:swapRestore', (e) => {
    console.log('Swap restored');
});
```

### 4.3 Koşullu Swap

```javascript
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    items: [{
        selector: '#box-a',
        swap: '#box-b',
        condition: () => window.isTabletMode
    }]
}], {
    conditionalRules: true
});
```

---

## 5. Koşullu Taşıma

### 5.1 Global Değişken Kontrolü

```html
<div data-move-to="#premium-section" 
     data-move-media="(max-width: 768px)"
     data-move-condition="window.isPremiumUser">
    Premium İçerik
</div>

<script>
window.isPremiumUser = true;

ResponsiveDOMMover.fromDOM({
    conditionalRules: true  // Aktifleştir
});
</script>
```

### 5.2 Fonksiyon ile Koşul

```javascript
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#target',
    items: [{
        selector: '.widget',
        condition: () => {
            // Kullanıcı giriş yapmış mı?
            return localStorage.getItem('isLoggedIn') === 'true';
        }
    }]
}], {
    conditionalRules: true
});
```

### 5.3 String Condition

```html
<div data-move-condition="document.body.classList.contains('dark-mode')">
    Dark Mode Widget
</div>
```

### 5.4 Kompleks Koşullar

```javascript
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#target',
    items: [{
        selector: '.widget',
        condition: () => {
            const user = JSON.parse(localStorage.getItem('user'));
            const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6;
            
            return user?.isPremium && !isWeekend;
        }
    }]
}], {
    conditionalRules: true
});
```

---

## 6. Clone Mode

### 6.1 Element Kopyalama

```html
<!-- Orijinal yerinde kal, kopya mobilde görünsün -->
<div data-move-to="#mobile-area" 
     data-move-clone="true"
     data-move-media="(max-width: 768px)">
    Bu hem masaüstünde hem mobilde
</div>

<script>
ResponsiveDOMMover.fromDOM({
    cloneMode: true  // Global aktifleştir
});
</script>
```

### 6.2 Clone Event

```javascript
document.addEventListener('rdm:clone', (e) => {
    console.log('Original:', e.detail.original);
    console.log('Clone:', e.detail.clone);
    
    // Clone'a özel ID ver
    e.detail.clone.id = e.detail.original.id + '-clone';
});
```

### 6.3 Selective Clone

```javascript
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#mobile-menu',
    items: [
        { selector: '.nav', clone: true },      // Bu clone
        { selector: '.search', clone: false }   // Bu taşınsın
    ]
}], {
    cloneMode: true
});
```

---

## 7. Breakpoint Yönetimi

### 7.1 Hazır Breakpoint'ler

```javascript
// Varsayılan breakpoint'ler
ResponsiveDOMMover.breakpoints = {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 991px)',
    desktop: '(min-width: 992px)',
    wide: '(min-width: 1200px)',
    portrait: '(orientation: portrait)',
    landscape: '(orientation: landscape)'
};
```

```html
<!-- Breakpoint ismi ile kullan -->
<div data-move-breakpoint="mobile" data-move-to="#mobile-container">
    Mobil Widget
</div>

<div data-move-breakpoint="tablet" data-move-to="#tablet-container">
    Tablet Widget
</div>
```

### 7.2 Özel Breakpoint Ekleme

```javascript
// Kendi breakpoint'lerini ekle
ResponsiveDOMMover.breakpoints.mobile_small = '(max-width: 480px)';
ResponsiveDOMMover.breakpoints.retina = '(-webkit-min-device-pixel-ratio: 2)';
ResponsiveDOMMover.breakpoints.dark_mode = '(prefers-color-scheme: dark)';

// Kullan
<div data-move-breakpoint="mobile_small" data-move-to="#tiny-screen">
    Çok küçük ekran
</div>
```

### 7.3 Birden Fazla Breakpoint

```html
<!-- Farklı breakpoint'lerde farklı hedefler -->
<div class="widget" 
     data-move-to="#mobile-area" 
     data-move-breakpoint="mobile">
    Mobil
</div>

<div class="widget" 
     data-move-to="#tablet-area" 
     data-move-breakpoint="tablet">
    Tablet
</div>

<div class="widget" 
     data-move-to="#desktop-area" 
     data-move-breakpoint="desktop">
    Desktop
</div>
```

---

## 8. Animasyon ve Transform

### 8.1 Animasyon Ayarları

```javascript
ResponsiveDOMMover.fromDOM({
    animations: true,              // Animasyon aç/kapa
    animationDuration: 400,        // ms
    animationEasing: 'ease-in-out' // CSS easing
});
```

### 8.2 Custom Easing

```javascript
ResponsiveDOMMover.fromDOM({
    animations: true,
    animationDuration: 600,
    animationEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' // Bounce
});
```

### 8.3 Element Transform

```javascript
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#mobile-area',
    items: [{
        selector: '.widget',
        transform: (element) => {
            // Element taşınırken transform et
            element.style.fontSize = '14px';
            element.style.padding = '10px';
            element.style.maxWidth = '100%';
            element.classList.add('mobile-view');
            element.classList.remove('desktop-view');
        }
    }]
}]);
```

### 8.4 Global Transform Hooks

```javascript
ResponsiveDOMMover.fromDOM({
    beforeMove: ({ element, rule, item }) => {
        element.classList.add('moving');
        return true; // false dönerse taşıma iptal
    },
    afterMove: ({ element, rule, item }) => {
        element.classList.remove('moving');
        element.classList.add('moved');
    },
    beforeRestore: ({ element, data }) => {
        element.classList.add('restoring');
        return true;
    },
    afterRestore: ({ element, data }) => {
        element.classList.remove('restoring');
        element.classList.add('restored');
    }
});
```

---

## 9. Event Yönetimi

### 9.1 Tüm Event'ler

```javascript
// Init
document.addEventListener('rdm:init', (e) => {
    console.log('Initialized:', e.detail.rules);
});

// Rule aktivasyon
document.addEventListener('rdm:enter', (e) => {
    console.log('Rule entered:', e.detail.rule.media);
});

document.addEventListener('rdm:leave', (e) => {
    console.log('Rule left:', e.detail.rule.media);
});

// Element hareketleri
document.addEventListener('rdm:move', (e) => {
    console.log('Element moved:', e.detail.element);
});

document.addEventListener('rdm:restore', (e) => {
    console.log('Element restored:', e.detail.element);
});

// Swap
document.addEventListener('rdm:swap', (e) => {
    console.log('Swapped:', e.detail.element1, e.detail.element2);
});

document.addEventListener('rdm:swapRestore', (e) => {
    console.log('Swap restored');
});

// Clone
document.addEventListener('rdm:clone', (e) => {
    console.log('Cloned:', e.detail.original, e.detail.clone);
});

// Grup
document.addEventListener('rdm:groupMove', (e) => {
    console.log('Group moved:', e.detail.groupName);
});

document.addEventListener('rdm:groupRestore', (e) => {
    console.log('Group restored:', e.detail.groupId);
});

// Kural değişiklikleri
document.addEventListener('rdm:ruleAdded', (e) => {
    console.log('Rule added');
});

document.addEventListener('rdm:ruleRemoved', (e) => {
    console.log('Rule removed');
});

// Kontrol
document.addEventListener('rdm:paused', () => {
    console.log('Paused');
});

document.addEventListener('rdm:resumed', () => {
    console.log('Resumed');
});

document.addEventListener('rdm:refreshed', () => {
    console.log('Refreshed');
});

document.addEventListener('rdm:destroyed', () => {
    console.log('Destroyed');
});

// Hata
document.addEventListener('rdm:error', (e) => {
    console.error('Error:', e.detail.message);
});
```

### 9.2 Event Delegation

```javascript
const mover = ResponsiveDOMMover.fromDOM();

// Tüm .widget elementleri için tek listener
mover.on('move', '.widget', (e) => {
    console.log('Widget moved:', e.detail.element);
});

// Tüm .card elementleri için
mover.on('restore', '.card', (e) => {
    console.log('Card restored:', e.detail.element);
});

// Birden fazla selector
mover.on('move', '.widget, .card, .item', (e) => {
    console.log('Element moved');
});

// Herhangi bir element
mover.on('move', '*', (e) => {
    console.log('Something moved');
});
```

### 9.3 Rule-Level Callbacks

```javascript
ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#target',
    onEnter: ({ rule, mover }) => {
        console.log('Rule activated');
    },
    onLeave: ({ rule, mover }) => {
        console.log('Rule deactivated');
    },
    onMove: ({ element, rule, item }) => {
        console.log('Element moved in this rule');
    },
    items: [{
        selector: '.widget',
        onMove: ({ element, rule, item }) => {
            console.log('This specific item moved');
        }
    }]
}]);
```

---

## 10. State ve Persistence

### 10.1 State Kaydetme

```javascript
const mover = ResponsiveDOMMover.fromDOM({
    statePersistence: true,
    storageKey: 'my-app-state'  // Opsiyonel, varsayılan: 'rdm-state'
});

// State otomatik kaydedilir ve yüklenir
```

### 10.2 Manuel State Yönetimi

```javascript
// State'i temizle
mover.clearState();

// State kontrolü
const state = localStorage.getItem('rdm-state');
if (state) {
    console.log('Saved state:', JSON.parse(state));
}
```

### 10.3 History Tracking

```javascript
// Tüm işlem geçmişi
const history = mover.getHistory();
console.log(history);
// [
//   { action: 'move', element, from, to, timestamp },
//   { action: 'restore', element, from, to, timestamp }
// ]

// History temizle
mover.clearHistory();
```

---

## 11. API Metodları

### 11.1 Başlatma

```javascript
// HTML'den otomatik
const mover = ResponsiveDOMMover.fromDOM(options);

// Manuel rule'lar ile
const mover = ResponsiveDOMMover.init(rules, options);
```

### 11.2 Kural Yönetimi

```javascript
// Kural ekle
mover.addRule({
    media: '(max-width: 768px)',
    to: '#target',
    items: [{ selector: '.widget' }]
});

// Kural kaldır
mover.removeRule(rule);
```

### 11.3 Kontrol Metodları

```javascript
// Durdur
mover.pause();

// Devam et
mover.resume();

// Yenile (tüm kuralları yeniden değerlendir)
mover.refresh();

// Tek elementi geri getir
mover.restore('.widget');

// Tüm elementleri geri getir
mover.restoreAll();

// Yok et
mover.destroy();
```

### 11.4 Bilgi Alma

```javascript
// İstatistikler
const stats = mover.getStats();
console.log(stats);
// {
//   rulesCount: 5,
//   activeRulesCount: 2,
//   movedElementsCount: 8,
//   groupsCount: 2,
//   clonesCount: 3,
//   historyLength: 15,
//   initialized: true,
//   destroyed: false,
//   viewport: { width: 1920, height: 1080 }
// }

// Element taşınmış mı?
const isMoved = mover.isMoved('.widget');

// Element data'sı
const data = mover.getElementData('.widget');

// Snapshot
const snapshot = mover.snapshot();
```

### 11.5 Static Metodlar

```javascript
// Unique ID ver
ResponsiveDOMMover.uid(element);

// Touch device mi?
if (ResponsiveDOMMover.isTouchDevice) {
    console.log('Touch device');
}

// Viewport bilgisi
const viewport = ResponsiveDOMMover.viewport;
console.log(viewport.width, viewport.height);
```

---

## 12. Gerçek Dünya Örnekleri

### 12.1 E-Ticaret Ürün Sayfası

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .product-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 768px) {
            .product-carousel { display: flex; overflow-x: auto; }
        }
    </style>
</head>
<body>
    <!-- Masaüstü: Grid -->
    <div class="product-grid">
        <div class="product" data-move-group="products" data-move-group-order="1">
            <img src="product1.jpg">
            <h3>Ürün 1</h3>
            <p>₺299</p>
        </div>
        <div class="product" data-move-group="products" data-move-group-order="2">
            <img src="product2.jpg">
            <h3>Ürün 2</h3>
            <p>₺399</p>
        </div>
        <div class="product" data-move-group="products" data-move-group-order="3">
            <img src="product3.jpg">
            <h3>Ürün 3</h3>
            <p>₺499</p>
        </div>
        <div class="product" data-move-group="products" data-move-group-order="4">
            <img src="product4.jpg">
            <h3>Ürün 4</h3>
            <p>₺599</p>
        </div>
    </div>

    <!-- Mobil: Carousel -->
    <div class="product-carousel"></div>

    <script src="responsive-dom-mover.js"></script>
    <script>
        ResponsiveDOMMover.fromDOM({
            animations: true,
            groups: {
                'products': {
                    media: '(max-width: 768px)',
                    to: '.product-carousel',
                    keepOrder: true
                }
            }
        });
    </script>
</body>
</html>
```

### 12.2 Blog/Haber Sitesi

```html
<main class="blog-layout">
    <!-- Ana içerik -->
    <article class="main-article">
        <h1>Başlık</h1>
        <p>İçerik...</p>
    </article>

    <!-- Sidebar -->
    <aside class="sidebar" 
           data-move-to=".main-article"
           data-move-media="(max-width: 992px)"
           data-move-position="last"
           data-move-classes='{"onMove":["sidebar-mobile"],"onRestore":["sidebar-desktop"]}'>
        
        <!-- Newsletter -->
        <div class="widget newsletter">
            <h3>Newsletter</h3>
            <form>...</form>
        </div>

        <!-- Popüler yazılar -->
        <div class="widget popular-posts"
             data-move-to="#mobile-widgets"
             data-move-media="(max-width: 768px)"
             data-move-priority="10">
            <h3>Popüler Yazılar</h3>
            <ul>...</ul>
        </div>

        <!-- Kategoriler -->
        <div class="widget categories"
             data-move-to="#mobile-widgets"
             data-move-media="(max-width: 768px)"
             data-move-priority="5">
            <h3>Kategoriler</h3>
            <ul>...</ul>
        </div>
    </aside>
</main>

<div id="mobile-widgets"></div>

<script>
ResponsiveDOMMover.fromDOM({
    animations: true,
    animationDuration: 400
});
</script>
```

### 12.3 Dashboard

```html
<!-- Masaüstü: 3 sütun -->
<div class="dashboard">
    <div class="col-1">
        <div class="widget stats" data-move-group="analytics" data-move-group-order="1">
            İstatistikler
        </div>
    </div>
    
    <div class="col-2">
        <div class="widget chart" data-move-group="analytics" data-move-group-order="2">
            Grafik
        </div>
    </div>
    
    <div class="col-3">
        <div class="widget table" data-move-group="analytics" data-move-group-order="3">
            Tablo
        </div>
    </div>
</div>

<!-- Tablet: Tab sistemi -->
<div class="tabs">
    <button data-tab="analytics">Analytics</button>
    <button data-tab="reports">Reports</button>
    
    <div class="tab-content" id="analytics-tab"></div>
    <div class="tab-content" id="reports-tab"></div>
</div>

<script>
ResponsiveDOMMover.fromDOM({
    groups: {
        'analytics': {
            media: '(min-width: 768px) and (max-width: 991px)',
            to: '#analytics-tab',
            keepOrder: true,
            wrapInContainer: true,
            containerClass: 'analytics-container'
        }
    }
});
</script>
```

### 12.4 Premium İçerik Sistemi

```javascript
// Kullanıcı durumuna göre içerik göster
window.userStatus = {
    isPremium: true,
    credits: 100
};

ResponsiveDOMMover.fromDOM({
    conditionalRules: true
});
```

```html
<!-- Premium kullanıcılar için -->
<div data-move-to="#premium-section"
     data-move-media="(max-width: 768px)"
     data-move-condition="window.userStatus.isPremium">
    Premium İçerik
</div>

<!-- Yeterli kredisi olanlara -->
<div data-move-to="#bonus-section"
     data-move-media="(max-width: 768px)"
     data-move-condition="window.userStatus.credits > 50">
    Bonus İçerik
</div>
```

### 12.5 Multi-Language Site

```javascript
// Dil değişiminde layout değişir
window.currentLang = 'tr';

ResponsiveDOMMover.init([{
    media: '(max-width: 768px)',
    to: '#mobile-menu',
    items: [{
        selector: '.nav',
        condition: () => window.currentLang === 'tr',
        transform: (el) => {
            el.style.direction = 'ltr';
        }
    }]
}], {
    conditionalRules: true
});

// Dil değiştir
function changeLanguage(lang) {
    window.currentLang = lang;
    mover.refresh(); // Yeniden değerlendir
}
```

### 12.6 Loading States

```javascript
const mover = ResponsiveDOMMover.fromDOM({
    beforeMove: ({ element }) => {
        element.classList.add('loading');
        return true;
    },
    afterMove: ({ element }) => {
        setTimeout(() => {
            element.classList.remove('loading');
            element.classList.add('loaded');
        }, 300);
    }
});
```

```css
.loading {
    opacity: 0.5;
    pointer-events: none;
}

.loaded {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

### 12.7 Form Wizard (Adım adım)

```html
<!-- Masaüstü: Tek sayfada -->
<form class="checkout-form">
    <section class="form-section" data-move-group="billing">
        <h2>Fatura Bilgileri</h2>
        <input name="billing-name">
        <input name="billing-address">
    </section>
    
    <section class="form-section" data-move-group="shipping">
        <h2>Kargo Bilgileri</h2>
        <input name="shipping-name">
        <input name="shipping-address">
    </section>
    
    <section class="form-section" data-move-group="payment">
        <h2>Ödeme</h2>
        <input name="card-number">
    </section>
</form>

<!-- Mobil: Wizard -->
<div class="wizard">
    <div class="step" id="step-1"></div>
    <div class="step" id="step-2"></div>
    <div class="step" id="step-3"></div>
    <button onclick="nextStep()">İleri</button>
</div>

<script>
let currentStep = 1;

ResponsiveDOMMover.fromDOM({
    groups: {
        'billing': {
            media: '(max-width: 768px)',
            to: '#step-1',
            keepOrder: true
        },
        'shipping': {
            media: '(max-width: 768px)',
            to: '#step-2',
            keepOrder: true
        },
        'payment': {
            media: '(max-width: 768px)',
            to: '#step-3',
            keepOrder: true
        }
    }
});

function nextStep() {
    document.querySelector(`#step-${currentStep}`).style.display = 'none';
    currentStep++;
    document.querySelector(`#step-${currentStep}`).style.display = 'block';
}
</script>
```

### 12.8 Auto-Initialize ile Hızlı Kurulum

```html
<!DOCTYPE html>
<html>
<head>
    <title>Quick Setup</title>
</head>
<body>
    <nav data-move-to="#mobile-menu" data-move-breakpoint="mobile">
        Navigasyon
    </nav>
    
    <div id="mobile-menu"></div>

    <!-- Auto-initialize -->
    <script src="responsive-dom-mover.js" 
            data-auto-init="true" 
            data-debug="true">
    </script>
</body>
</html>
```

---

## 🎓 İpuçları ve Best Practices

### ✅ Yapılması Gerekenler

1. **Sadece gerekli özellikleri aç**
   ```javascript
   ResponsiveDOMMover.fromDOM({
       conditionalRules: true  // Sadece bunu kullanıyorsan
   });
   ```

2. **Grup taşıma kullan**
   ```javascript
   // ✅ İyi - Performanslı
   <div data-move-group="items">
   
   // ❌ Kötü - Her biri ayrı rule
   <div data-move-to="#target">
   ```

3. **Event delegation kullan**
   ```javascript
   // ✅ İyi - Tek listener
   mover.on('move', '.widget', handler);
   
   // ❌ Kötü - Çoklu listener
   document.querySelectorAll('.widget').forEach(...)
   ```

4. **Clone'u dikkatli kullan**
   ```javascript
   // Clone sadece gerçekten gerektiğinde
   // Normal taşıma daha performanslı
   ```

### ❌ Yapılmaması Gerekenler

1. **Her özelliği açma**
2. **Gereksiz clone kullanımı**
3. **Çok fazla priority seviyesi**
4. **Her element için ayrı event listener**

---

## 📊 Performans Tablosu

| Özellik | Performans Etkisi | Tavsiye |
|---------|-------------------|---------|
| Basit Taşıma | ⚡ Çok Hızlı | Her zaman kullan |
| Grup Taşıma | ⚡ Hızlı | Tercih et |
| Animasyon | 🟡 Orta | Gerektiğinde |
| Clone Mode | 🟠 Yavaş | Dikkatli kullan |
| Intersection Observer | ⚡ Hızlı | Lazy loading için harika |
| State Persistence | 🟡 Orta | Gerektiğinde |

---

## 🎯 Özet

ResponsiveDOMMover v3.0 ile şunları yapabilirsin:

✅ Basit element taşıma  
✅ Grup taşıma (order korunur)  
✅ Element swap/exchange  
✅ Koşullu taşıma  
✅ Element klonlama  
✅ Breakpoint yönetimi  
✅ Custom transformasyon  
✅ Lazy loading (Intersection Observer)  
✅ State persistence  
✅ CSS class triggers  
✅ Multiple target fallback  
✅ Event delegation  
✅ Auto-initialize  
✅ Delay support  
✅ History tracking  

**Ve hepsi geriye uyumlu! 🎉**
