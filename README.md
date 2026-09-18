# Website Kanomas Tasikmalaya (Replikasi Lengkap)

Website ini merupakan replikasi identik dan fungsional dari website [www.kanomastasikmalaya.com](https://www.kanomastasikmalaya.com).

## Struktur Proyek

```
Kanomas/
├── assets/
│   ├── index-CCO2MJMX.js      # Production bundle JavaScript aplikasi
│   ├── index-DJdMnS2K.css      # Production stylesheet CSS (Tailwind)
│   └── logo-kanomas.ico        # Icon Kanomas
├── data/
│   └── api_backup.json         # Snapshot lengkap data live API
├── index.html                  # Halaman web utama
├── package.json                # Skrip Node.js
├── server.js                   # Web server lokal mandiri (Zero-Dependency)
└── README.md                   # Dokumentasi
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
