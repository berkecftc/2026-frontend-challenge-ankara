# 🐾 Missing Podo — Investigation Dashboard

> Kayıp Podo'yu bulmak için birden fazla Jotform kaynağını çapraz referanslayan interaktif soruşturma panosu.

**Katılımcı:** Ahmet Berke Çiftçi

---

## 📖 Proje Açıklaması

**Missing Podo Investigation Dashboard**, Ankara'da kaybolan "Podo" isimli karakterin izini sürmek için tasarlanmış tek sayfalık (SPA) bir web uygulamasıdır. Uygulama, beş farklı Jotform formundan gelen verileri (check-in'ler, mesajlar, görgü tanıklıkları, kişisel notlar ve anonim ihbarlar) tek bir arayüzde birleştirir.

Kullanıcı, bu verileri arayüp filtreleyebilir, kayıtlar arasındaki bağlantıları keşfedebilir, kronolojik timeline üzerinde olayları takip edebilir ve harita görünümünde konumları görselleştirebilir. Ayrıca uygulama, şüpheli kişilerin puanlaması, Podo'nun iletişim ağı ve saatlik aktivite dağılımı gibi analitik özetler sunar.

### Öne Çıkan Özellikler

- **Çoklu Veri Kaynağı Entegrasyonu** — 5 farklı Jotform formundan veri çekme ve normalize etme
- **Fuzzy Arama** — Türkçe karakter duyarsız, Levenshtein mesafesi tabanlı yaklaşık eşleştirme
- **İnteraktif Harita** — Leaflet.js ile Ankara merkezli konum görselleştirmesi (dark tema)
- **Kronolojik Timeline** — Olayları günlere gruplayarak zaman çizelgesi görünümü
- **Şüpheli Puanlama Sistemi** — Kişilerin görünme sıklığı, görgü tanıklıkları ve ihbar güvenilirliğine göre skorlama
- **Bağlantı Ağı Analizi** — Podo ile doğrudan temas kuran kişilerin ağ haritası
- **Saatlik Aktivite Isı Haritası** — 24 saat üzerinden aktivite yoğunluğu
- **Kaynak Dağılımı Grafiği** — Veri türleri bazında yatay çubuk grafik
- **İlişkili Kayıt Bulma** — Seçili bir kaydın diğer kaynaklarla bağlantısını puanlama
- **LocalStorage Önbellekleme** — API kotasını korumak için TTL tabanlı cache
- **Responsive Tasarım** — 3 panelli masaüstü düzeni, dark tema, glassmorphism efektleri

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| UI Framework | React | 18.3 |
| Dil | TypeScript | 5.6 |
| Build Tool | Vite | 5.4 |
| Harita | Leaflet.js | 1.9 |
| Stil | Vanilla CSS (custom properties) | — |
| Font | Inter (Google Fonts) | 400–700 |
| API | Jotform REST API | v1 |

> **Not:** Tailwind, Redux, Axios gibi ek bağımlılıklar kullanılmamıştır. Proje minimal bağımlılık prensibine sadık kalır.

---

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x (veya yarn / pnpm)
- **Jotform API Key** — [Jotform API](https://api.jotform.com) üzerinden alınabilir

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/<kullanici-adi>/2026-frontend-challenge-ankara.git
cd 2026-frontend-challenge-ankara
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenini Ayarlayın

Proje kök dizininde `.env.example` dosyası bulunur. Bu dosyayı `.env.local` olarak kopyalayıp gerçek API anahtarınızı girin:

```bash
cp .env.example .env.local
```

`.env.local` dosyasını açın ve anahtarı güncelleyin:

```env
VITE_JOTFORM_API_KEY=gercek_api_anahtariniz
```

> **Önemli:** `.env.local` dosyası `.gitignore` tarafından takip edilmez, API anahtarınız repoya eklenmez.

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama varsayılan olarak **http://localhost:5173** adresinde çalışır.

### 5. Diğer Komutlar

| Komut | Açıklama |
|-------|----------|
| `npm run dev` | Geliştirme sunucusunu başlatır (HMR aktif) |
| `npm run build` | TypeScript derler ve production build oluşturur (`dist/` klasörüne) |
| `npm run preview` | Production build'i yerel sunucuda önizler |
| `npm run typecheck` | TypeScript tip kontrolü çalıştırır (emit yok) |

---

## 📁 Proje Yapısı

```
src/
├── main.tsx                    # React uygulamasının giriş noktası
├── App.tsx                     # Kök bileşen (DashboardPage'i render eder)
├── types.ts                    # Paylaşılan TypeScript tip tanımları
├── constants.ts                # Uygulama genelindeki sabitler
├── styles.css                  # Tüm stil tanımları (CSS custom properties + dark tema)
│
├── api/                        # Jotform API iletişim katmanı
│   ├── jotform.ts              # HTTP istemcisi, hata yönetimi, submission normalizasyonu
│   ├── forms.ts                # Form registry (form ID'leri ve API key okuma)
│   └── cache.ts                # LocalStorage tabanlı TTL cache
│
├── mappers/                    # Ham Jotform verisini Record tipine dönüştüren mapper'lar
│   ├── index.ts                # Mapper dispatch (sourceType → mapper fonksiyonu)
│   ├── fieldUtils.ts           # Alan adı fuzzy eşleştirme ve değer çıkarma
│   ├── normalizeCheckins.ts    # Check-in form mapper
│   ├── normalizeMessages.ts    # Mesaj form mapper
│   ├── normalizeSightings.ts   # Görgü tanıklığı form mapper
│   ├── normalizeNotes.ts       # Kişisel not form mapper
│   └── normalizeTips.ts        # Anonim ihbar form mapper
│
├── hooks/                      # React custom hook'ları
│   └── useInvestigationData.ts # Tüm kaynakları paralel yükler, hata/cache yönetimi
│
├── utils/                      # Saf yardımcı fonksiyonlar (side-effect yok)
│   ├── string.ts               # Temel metin normalizasyonu
│   ├── fuzzy.ts                # Levenshtein distance, fuzzy match, fuzzy gruplama
│   ├── filters.ts              # Arama sorgusu ve filtre uygulama
│   ├── linking.ts              # İlişkili kayıt bulma ve puanlama
│   ├── scoring.ts              # Şüpheli kişi skorlama, özet istatistikler, bağlantı ağı
│   ├── grouping.ts             # Kayıtları kişi/konum bazında fuzzy gruplama
│   ├── geocoding.ts            # Statik konum → koordinat sözlüğü (140+ lokasyon)
│   ├── timeline.ts             # Kronolojik gruplama ve event oluşturma
│   └── date.ts                 # Tarih formatlama ve karşılaştırma
│
├── components/                 # React UI bileşenleri
│   ├── SearchBar.tsx           # Arama çubuğu
│   ├── FilterPanel.tsx         # Kaynak tipi, kişi, konum ve güvenilirlik filtreleri
│   ├── RecordList.tsx          # Kayıt listesi (scroll sync destekli)
│   ├── RecordCard.tsx          # Tek bir kayıt kartı
│   ├── DetailPanel.tsx         # Seçili kaydın detay görünümü
│   ├── RelatedRecordsSection.tsx # İlişkili kayıtlar bölümü
│   ├── Timeline.tsx            # Kronolojik timeline wrapper
│   ├── TimelineEvent.tsx       # Tek bir timeline olayı kartı
│   ├── MapView.tsx             # Leaflet harita görünümü
│   ├── SummaryPanel.tsx        # Sağ panel: tüm analitik özet bileşenlerini birleştirir
│   ├── SuspicionSummary.tsx    # Şüpheli kişi sıralaması
│   ├── ConnectionWeb.tsx       # Podo iletişim ağı grafiği
│   ├── ActivityHeatmap.tsx     # 24 saatlik aktivite çubuk grafiği
│   ├── SourceBreakdown.tsx     # Kaynak tipi dağılım grafiği
│   ├── SourceBadge.tsx         # Kaynak tipi etiketi (renkli badge)
│   ├── Skeleton.tsx            # Yükleme yer tutucu animasyonları
│   ├── EmptyState.tsx          # Boş durum bileşeni
│   ├── ErrorState.tsx          # Hata durumu bileşeni
│   └── LoadingState.tsx        # Yükleniyor durumu bileşeni
│
└── pages/
    └── DashboardPage.tsx       # Ana sayfa: 3 panelli düzen, state yönetimi
```

---

## 🔄 Veri Akışı

Uygulama başlatıldığında veri akışı aşağıdaki sırayla gerçekleşir:

```
┌─────────────────────────────────────────────────────────────────┐
│                        useInvestigationData                     │
│                                                                 │
│   1. getAllFormConfigs() → 5 form konfigürasyonu                 │
│   2. Promise.allSettled → 5 paralel Jotform API çağrısı         │
│   3. Her yanıt için:                                            │
│      a. Cache kontrolü (LocalStorage, 30 dk TTL)                │
│      b. fetchFormSubmissions() → HTTP GET → JSON parse           │
│      c. normalizeSubmission() → ham veri → NormalizedSubmission  │
│      d. mapSubmissions() → NormalizedSubmission → Record         │
│   4. Tüm kayıtlar timestamp'e göre sıralanır                   │
│   5. Kısmi hatalar toplanır (partial failure desteği)            │
└─────────────────────────────────────────┬───────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DashboardPage                            │
│                                                                 │
│   State: query, filters, selectedId, centerTab, leftView        │
│                                                                 │
│   Derived (useMemo):                                            │
│     • visible = filterRecords(records, query, filters)          │
│     • selected = records.find(r => r.id === selectedId)         │
│     • related = getRelatedRecords(selected, records)            │
│     • summary = computeSuspicionSummary(records)                │
│                                                                 │
│   ┌──────────┐  ┌───────────────┐  ┌────────────────┐          │
│   │ Sol Panel │  │ Orta Panel    │  │ Sağ Panel      │          │
│   │          │  │               │  │                │          │
│   │ Search   │  │ Detail Panel  │  │ Last Trace     │          │
│   │ Filters  │  │   veya        │  │ Aliases        │          │
│   │ List/Map │  │ Timeline      │  │ Top Locations  │          │
│   │          │  │               │  │ Source Chart   │          │
│   │          │  │               │  │ Contact Web    │          │
│   │          │  │               │  │ Heatmap        │          │
│   │          │  │               │  │ Suspicion Rank │          │
│   └──────────┘  └───────────────┘  └────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Jotform Form Kaynakları

| Key | Form ID | Kaynak Tipi | Açıklama |
|-----|---------|-------------|----------|
| `checkins` | `261065067494966` | `checkin` | Kişilerin konum check-in'leri |
| `messages` | `261065765723966` | `message` | Kişiler arası mesajlaşmalar |
| `sightings` | `261065244786967` | `sighting` | Görgü tanıklıkları (Podo görüldü) |
| `personalNotes` | `261065509008958` | `note` | Kişisel soruşturma notları |
| `anonymousTips` | `261065875889981` | `tip` | Anonim ihbar bildirimleri |

Her form farklı alan adlarıyla doldurulmuş olabilir (Türkçe/İngilizce). `fieldUtils.ts` modülü, alan adlarını aday listesiyle fuzzy eşleştirerek doğru değeri çıkarır.

---

## 🧠 Teknik Detaylar

### Fuzzy Matching (Yaklaşık Eşleştirme)

Uygulama, Türkçe karakter normalizasyonu ve Levenshtein mesafesi tabanlı bir fuzzy matching sistemi içerir:

1. **Türkçe Normalizasyon** — `ç→c`, `ğ→g`, `ı→i`, `ö→o`, `ş→s`, `ü→u` dönüşümü
2. **Levenshtein Distance** — Wagner–Fischer algoritması (`O(m×n)` zaman, `O(min(m,n))` bellek)
3. **Eşik Değeri** — Varsayılan `0.3` (en fazla %30 düzenleme mesafesi)
4. **Fuzzy Gruplama** — Aynı kişinin farklı yazımlarını (`"Ayşe"` / `"ayse"` / `"Ayse"`) tek grup altında toplar

### Şüpheli Puanlama Sistemi

Her kişi için aşağıdaki formülle skor hesaplanır:

```
score = appearances × 1 + sightingCount × 2 + tipReliabilitySum × 3 + nearPodo × 2
```

| Faktör | Ağırlık | Açıklama |
|--------|---------|----------|
| `appearances` | ×1 | Tüm kayıtlardaki toplam görünme |
| `sightingCount` | ×2 | Görgü tanıklığı sayısı |
| `tipReliabilitySum` | ×3 | İhbar güvenilirlik toplamı (0-1 aralığı) |
| `nearPodo` | ×2 | Podo ile aynı kayıtta geçme sıklığı |

### İlişkili Kayıt Puanlama

Seçili bir kayıtla ilgili diğer kayıtlar arasındaki bağlantı puanı:

| Kural | Puan | Açıklama |
|-------|------|----------|
| Tam kişi eşleşmesi | +3 | `person` alanı birebir eşleşir |
| Fuzzy kişi eşleşmesi | +1.5 | Benzer isim (Levenshtein eşik içinde) |
| İlgili kişi eşleşmesi (tam) | +2 | `relatedPerson` birebir eşleşir |
| İlgili kişi fuzzy eşleşmesi | +1 | Benzer `relatedPerson` |
| Aynı konum | +2 | Konum alanı eşleşir |
| İçerikte isim geçmesi | +1 | `content` alanında kişi adı geçer |

### Geocoding (Konum Çözümleme)

API kotası kullanmamak için statik bir sözlük yaklaşımı benimsenmiştir. `geocoding.ts` dosyası **140+ konum** içerir:

- Jotform verisindeki 7 ana konum (tam eşleşme)
- Ankara ilçe ve semtleri (30+ giriş)
- Müzeler, parklar, AVM'ler, üniversiteler
- Büyük Türkiye şehirleri
- Genel kategoriler (park, cafe, okul vb.)

Eşleştirme üç aşamalıdır: tam eşleşme → Türkçe normalize eşleşme → alt-dizge eşleşmesi.

### Önbellekleme

- **Mekanizma:** LocalStorage
- **TTL:** 30 dakika (`DEFAULT_CACHE_TTL_MS`)
- **Key formatı:** `jotform:cache:<formId>:<limit>:<offset>`
- **Force Refresh:** Kullanıcı butonuyla cache temizlenip taze veri çekilebilir
- **Süresi dolan kayıtlar** otomatik olarak localStorage'dan silinir

### Hata Yönetimi

- **Partial Failure:** 5 kaynaktan bir kısmı başarısız olursa, başarılı olanlar gösterilir ve uyarı çubuğu (warning bar) ile başarısız kaynaklar bildirilir
- **Total Failure:** Tüm kaynaklar başarısız olursa, hata ekranı ve retry butonu gösterilir
- **AbortController:** Bileşen unmount olduğunda veya yeniden yükleme başladığında önceki istek iptal edilir
- **Özel Hata Sınıfı:** `JotformError` — HTTP hataları, ağ hataları ve JSON parse hataları için ayrı mesajlar

---

## 🎨 Arayüz Tasarımı

### Üç Panelli Düzen

| Panel | İçerik |
|-------|--------|
| **Sol** | Arama çubuğu, filtreler, kayıt listesi veya harita görünümü (toggle ile geçiş) |
| **Orta** | Detay paneli (seçili kaydın ayrıntıları + ilişkili kayıtlar) veya Timeline görünümü |
| **Sağ** | Özet: son iz, takma adlar, sık konumlar, kaynak dağılımı, bağlantı ağı, ısı haritası, şüpheli sıralaması |

### Görsel Özellikler

- **Dark Tema** — `#0d1015` arka plan, yüksek kontrastlı metin
- **Glassmorphism** — Panel arka planlarında `backdrop-filter: blur()` efekti
- **Renkli Kaynak Kodlaması:**
  - 🔵 Check-in: `#3b82f6`
  - 🟣 Message: `#a855f7`
  - 🟡 Sighting: `#f59e0b`
  - ⚫ Note: `#64748b`
  - 🔴 Tip: `#ef4444`
- **Skeleton Loading** — Veriler yüklenirken animasyonlu yer tutucu kartlar
- **Smooth Scroll** — Harita veya listeden bir kayıt seçildiğinde diğer panel senkron scroll

---

## 📋 Kullanım Senaryoları

### 1. Kayıtları Arama
Arama çubuğuna kişi adı, konum veya herhangi bir anahtar kelime yazın. Arama hem orijinal hem de Türkçe normalize edilmiş metinlerde çalışır.

### 2. Filtreleme
- **Kaynak Tipi:** İstediğiniz kaynak türlerini seçin/kaldırın (chip butonları)
- **Kişi:** Dropdown'dan belirli bir kişiyi seçin
- **Konum:** Dropdown'dan belirli bir konumu seçin
- **Güvenilirlik:** Slider ile minimum ihbar güvenilirlik eşiği belirleyin

### 3. Kayıt İnceleme
Listeden bir kayda tıklayın. Orta panelde detayları görüntülenir. Alt kısımda ilişkili kayıtlar ve bağlantı nedenleri listelenir.

### 4. Timeline ile Zaman Takibi
Orta paneldeki "Timeline" sekmesine geçerek olayları kronolojik sırada görüntüleyin. Filtre ile sadece Podo ile ilgili olayları görebilirsiniz.

### 5. Harita ile Konum Analizi
Sol paneldeki "Map" butonuna geçin. Kayıtlar Ankara haritası üzerinde renkli noktalar olarak görüntülenir. Bir noktaya tıklayarak detaylarını görebilirsiniz.

### 6. Özet Paneli ile Analiz
Sağ panelde otomatik oluşturulan analizleri inceleyin: son bilinen iz, en sık konumlar, şüpheli kişi sıralaması, Podo'nun iletişim ağı ve saatlik aktivite dağılımı.

---

## 🏗️ Build ve Deploy

### Production Build

```bash
npm run build
```

`dist/` klasöründe oluşan statik dosyalar herhangi bir web sunucusuna (Nginx, Apache, Vercel, Netlify, GitHub Pages vb.) deploy edilebilir.

### Tip Kontrolü

```bash
npm run typecheck
```

TypeScript strict mod aktiftir: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch` kuralları zorunludur.

---

## 📝 Lisans

Bu proje, Jotform Frontend Challenge Ankara 2026 kapsamında geliştirilmiştir.