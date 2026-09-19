# Website Kanomas Tasikmalaya (Replikasi Lengkap)

Website ini merupakan replikasi identik dan fungsional dari website [www.kanomastasikmalaya.com](https://www.kanomastasikmalaya.com).

## Struktur Proyek

```
Kanomas/
├── .htaccess               # Konfigurasi Apache/LiteSpeed (Hostinger redirect & cache)
├── assets/
│   ├── index-DJdMnS2K.css  # Core Tailwind CSS
│   ├── marketing-4.0.css   # Theme styling & high-contrast adjustments
│   ├── marketing-4.0.js    # Interactive engine, promo slider, video control
│   ├── logo-kanomas.png    # Brand logo
│   ├── logo-kanomas.ico    # Favicon
│   ├── thawaf-optimized.webm # Optimized Ka'bah video background
│   ├── Thawaf.mp4          # Fallback Ka'bah video background
│   ├── thawaf-poster.jpg   # Poster fallback
│   └── flyers/             # Promo flyers & package images
├── data/
│   └── api_backup.json     # Paket data umrah live API snapshot
├── index.html              # Landing page utama
├── package.json            # Script development lokal
├── run-server.bat          # Launcher 1-klik lokal server Windows
├── server.js               # Local development server (HTTP 206 video-safe)
└── README.md               # Dokumentasi
```

## Cara Menjalankan Website

### Menggunakan Node.js
Pastikan Node.js sudah terinstal di komputer Anda, lalu jalankan salah satu perintah berikut di terminal:

```bash
npm start
```
atau
```bash
node server.js
```

Buka browser Anda di alamat:
👉 **[http://localhost:8080](http://localhost:8080)** *(otomatis berpindah ke port berikutnya jika port sedang digunakan)*

### Membuka Langsung atau Menggunakan Web Server Lain
Karena file ini merupakan build statis standar, Anda juga dapat menyajikannya menggunakan Apache, Nginx, Live Server di VSCode, atau host statis (Vercel, Netlify, GitHub Pages) secara langsung dengan menempatkan isi folder ini sebagai `public_html` atau root directory.
