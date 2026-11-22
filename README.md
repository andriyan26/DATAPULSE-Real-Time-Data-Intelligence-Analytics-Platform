# DATAPULSE — Platform Intelijensi & Analitik Data Real-Time

> **Ubah Data Langsung Menjadi Keputusan Pasti.**  
> *(Turn Live Data Into Clear Decisions)*

DATAPULSE adalah platform intelijensi dan analitik data tingkat *enterprise* yang dirancang untuk mengumpulkan, mengelola, memantau, dan menganalisis data bisnis lintas sumber secara *real-time*. Platform ini memadukan desain visual interaktif mutakhir, integrasi telemetri WebSocket berkecepatan tinggi, serta asisten kecerdasan buatan (*AI Data Analyst*) yang terhubung langsung ke basis data MySQL aktual dengan validasi deterministik.

---

## 📑 Daftar Isi
1. [Kepatuhan Konsep & Referensi Visual](#1-kepatuhan-konsep--referensi-visual)
2. [Alur Ekosistem & Siklus Hidup Data](#2-alur-ekosistem--siklus-hidup-data)
3. [Arsitektur & Tumpukan Teknologi](#3-arsitektur--tumpukan-teknologi)
4. [Hak Akses Berbasis Peran (RBAC)](#4-hak-akses-berbasis-peran-rbac)
5. [Panduan Instalasi & Menjalankan Aplikasi](#5-panduan-instalasi--menjalankan-aplikasi)
6. [Pengujian Otomatis (Automated Testing)](#6-pengujian-otomatis-automated-testing)
7. [Daftar Fitur & Modul Utama](#7-daftar-fitur--modul-utama)

---

## 1. Kepatuhan Konsep & Referensi Visual

Aplikasi ini dibangun berdasarkan acuan desain visual pada dua video referensi:

### A. Video 1 — `KONSEP LOGIN.mp4` (Formulir Login Interaktif Lampu Meja)
* **Lampu Meja 3D Interaktif**: Dilengkapi sakelar tali gantung (*pull-cord switch*) yang dapat ditarik untuk menyalakan/mematikan lampu.
* **Sorotan Cahaya Kerucut (*Conic Spotlight Beam*)**: Menyinari permukaan meja dan hanya memunculkan formulir login saat lampu dalam kondisi menyala (*ON*).
* **4 Pilihan Warna Aksen Ambient**: Neon Cyan (`ocean`), Warm Amber (`ember`), Electric Plum (`plum`), dan Forest Emerald (`forest`). Mengklik warna langsung mengubah pendaran lampu meja, tombol login, serta elemen fokus.
* **Kartu Login Minimalis**: Transisi halus tanpa pemisah yang kaku, mendukung toggle visibilitas kata sandi, serta tombol pintas kredensial demo untuk pengujian instan.

### B. Video 2 — `KONSEP FITUR.mp4` (Dasbor Modern & Animasi Mengalir)
* **Kanvas Dasbor Utuh & Mulus**: Tampilan menyeluruh tanpa batas pembungkus hitam yang memisahkan konten, menyatu dengan latar belakang bernuansa *organic wave pattern*.
* **Bilah Samping (Sidebar) Responsif**: Pengelompokan menu rapi (*Ikhtisar Utama*, *Manajemen Data*, *Operasional & Laporan*), badge indikator peran, serta laci geser (*mobile drawer*) untuk perangkat ponsel/tablet.
* **Bilah Navigasi Atas (Navbar)**: Pencarian global cepat (`⌘K` / `Ctrl+K`), indikator latensi koneksi langsung (*LIVE ~112ms*), pusat notifikasi sistem, toggle mode terang/gelap, dan menu peralihan peran instan (*Quick RBAC Switcher*).
* **Komponen Khas Dasbor**:
  * **4 Kartu Metrik Utama**: Metrik berhitung naik (*count-up*) secara halus dari 0 selama 1,2–1,5 detik dengan efek kartu terangkat (*elevation hover*).
  * **Capsule Bar Chart**: 7 pilar kapsul vertikal dengan variasi status (*solid*, *striped*, *outline*), dilengkapi *floating tooltip* rincian volume dan integritas.
  * **Kartu Pengingat Kritis (Reminders)**: Peringatan anomali darurat (*Check-in with Halcyon Labs*) dengan tombol aksi investigasi langsung.
  * **Pelacak Waktu Sesi (Time Tracker)**: Timer digital monospasial (`01:24:23`) dengan kontrol jeda (*pause*) dan resume yang tersinkronisasi via WebSocket.
  * **Pengukur Kualitas Radial (Radial Gauge)**: Cincin kemajuan sirkular memantau skor kesehatan dan integritas data (97.9%).
  * **Direktori Kolaborasi Tim**: Daftar anggota tim aktif beserta inisial avatar, departemen, dan peran hak akses.

---

## 2. Alur Ekosistem & Siklus Hidup Data

DATAPULSE mengadopsi 5 tahapan alur data *end-to-end* yang to the point dan terintegrasi:

```
[1. Ingesti Data] ──► [2. Mutu & Kualitas] ──► [3. Aliran Real-Time] ──► [4. Analitik & AI] ──► [5. Keputusan & Aksi]
  (MySQL, Stripe,       (Validasi Skema,        (Socket.IO Telemetri,    (Kueri Bebas SQLi,       (Resolusi Insiden,
   Kafka, CSV Batch)     Deteksi Anomali)        Latensi ~112ms)          Asisten AI Grounded)     Ekspor Laporan Aman)
```

---

## 3. Arsitektur & Tumpukan Teknologi

```
DATAPULSE/
├── client/                     # Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Layout, Navbar, Sidebar, FramedCanvas, Charts
│   │   ├── context/            # AuthContext, ThemeContext, SocketContext
│   │   ├── features/           # Dashboard, Live Monitoring, Analytics, AI, Datasets, dll.
│   │   ├── services/           # REST API client (Fetch wrapper)
│   │   ├── styles/             # Tailwind CSS & variabel tema
│   │   └── types/              # Deklarasi tipe TypeScript
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + TypeScript + Socket.IO)
│   ├── src/
│   │   ├── config/             # Konfigurasi environment & rahasia JWT
│   │   ├── database/           # MySQL pool, skrip migrasi, & seed data
│   │   ├── middleware/         # Autentikasi JWT, RBAC, error handling, audit trail
│   │   ├── modules/            # Modul logika bisnis (Auth, Dasbor, Analitik, AI, dll.)
│   │   ├── sockets/            # Socket.IO gateway & mesin simulasi telemetri
│   │   ├── __tests__/          # Rangkaian pengujian integrasi Vitest
│   │   └── index.ts            # Titik masuk server Express
│   └── package.json
│
├── docs/                       # Dokumentasi teknis & spesifikasi API
├── .env.example                # Templat konfigurasi lingkungan
├── .gitignore                  # Pengecualian berkas git
└── README.md                   # Dokumentasi resmi proyek
```

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Socket.IO Client.
* **Backend**: Node.js, Express, TypeScript, Socket.IO, MySQL2, Bcryptjs, JWT, Zod.
* **Basis Data**: MySQL 8.x (Port standar 3306), database `datapulse_db` dengan 18 tabel relasional.
* **Pengujian**: Vitest + Supertest (Pengujian unit & integrasi otomatis).

---

## 4. Hak Akses Berbasis Peran (RBAC)

Sistem menerapkan pembatasan hak akses nyata dan tegas untuk setiap peran:

| Peran Pengguna | Email Akun Demo | Kata Sandi | Batasan & Tanggung Jawab Operasional |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@datapulse.io` | `Admin123!` | **Akses Penuh**: Satu-satunya peran yang berwenang mengubah peran tim; mengelola konfigurasi sistem, impor CSV, pipeline, dan insiden. |
| **Data Analyst** | `analyst@datapulse.io` | `Analyst123!` | **Teknis Data**: Berwenang mengimpor berkas CSV, menjalankan pipeline manual, kueri semantik, dan konsultasi AI Data Analyst. |
| **Manager** | `manager@datapulse.io` | `Manager123!` | **Operasional & Insiden**: Memantau KPI bisnis, mengakui & menyelesaikan peringatan insiden (*Triage*), serta mengekspor laporan. |
| **Viewer** | `viewer@datapulse.io` | `Viewer123!` | **Hanya-Lihat (Read-Only)**: Seluruh tombol aksi mutatif dinonaktifkan dengan banner izin akses yang jelas. |

---

## 5. Panduan Instalasi & Menjalankan Aplikasi

### Prasyarat Sistem
1. Node.js v18.x atau lebih baru dan npm.
2. MySQL 8.x (dapat menggunakan Laragon, XAMPP, atau MySQL Server mandiri pada port 3306).

### Langkah 1: Kloning Repositori
```bash
git clone https://github.com/andriyan26/DATAPULSE-Real-Time-Data-Intelligence-Analytics-Platform.git
cd DATAPULSE-Real-Time-Data-Intelligence-Analytics-Platform
```

### Langkah 2: Setup Basis Data & Migrasi
Pastikan service MySQL aktif, buat basis data bernama `datapulse_db` (atau biarkan skrip migrasi membuatnya otomatis):
```bash
cd server
npm install

# Salin konfigurasi environment
copy .env.example .env   # (Windows PowerShell / CMD)

# Jalankan migrasi seluruh tabel
npx ts-node src/database/migrate.ts

# Jalankan penyemaian data awal (seed)
npx ts-node src/database/seed.ts
```

### Langkah 3: Menjalankan Server Backend
```bash
# Dari folder server:
npm run build
node dist/index.js
# atau mode development:
npm run dev
```
* Backend aktif di: `http://localhost:5000`
* REST API Base URL: `http://localhost:5000/api/v1`
* WebSocket Server: `ws://localhost:5000`

### Langkah 4: Menjalankan Klien Frontend
Buka jendela terminal baru:
```bash
cd client
npm install
npm run dev
```
* Buka peramban di: `http://localhost:5173`

---

## 6. Pengujian Otomatis (Automated Testing)

Aplikasi dilengkapi dengan rangkaian uji coba otomatis menggunakan **Vitest** dan **Supertest** untuk memastikan stabilitas API, autentikasi, dan sanitasi keamanan:

```bash
cd server
npm test
```

Cakupan pengujian yang diuji:
* `GET /api/v1/health` — Verifikasi status kesehatan server.
* `POST /api/v1/auth/login` — Autentikasi kredensial pengguna dan penolakan sandi tidak valid.
* `GET /api/v1/auth/me` — Integritas verifikasi token JWT dan profil peran.
* `GET /api/v1/dashboard/overview` — Agregasi metrik KPI dan data grafik kapsul.
* `POST /api/v1/analytics/query` — Validasi pencegahan SQL Injection pada kueri semantik.
* `POST /api/v1/reports/export` — Sanitasi proteksi terhadap celah CSV Formula Injection (`=`, `+`, `-`, `@`).

---

## 7. Daftar Fitur & Modul Utama

1. **Formulir Login Interaktif Lampu Meja**: Sakelar tali tarik interaktif yang menyalakan sorotan lampu kerucut untuk membuka form login dengan 4 palet aksen warna.
2. **Dasbor Utama (Dashboard Overview)**: Tampilan visual modern dengan kartu metrik hitung naik (*count-up* 1,2s), grafik kapsul harian, pengukur kualitas lingkaran, widget waktu berjalan, dan panduan alur ekosistem data.
3. **Pusat Pemantauan Langsung (Live Monitoring)**: Pemantauan aliran event WebSocket real-time dengan status latensi, tombol jeda/lanjut, dan inspektur payload JSON event.
4. **Eksplorasi Analitik (Analytics Explorer)**: Pembangun kueri agregasi semantik aman (Dimensi, Metrik, SUM/AVG/COUNT/MIN/MAX) dengan visualisasi batang/garis/donut/tabel serta jendela rincian data (*drill-down modal*).
5. **Analis Data AI (AI Data Analyst)**: Asisten cerdas berbasis bahasa alami yang mengeksekusi kueri terverifikasi langsung ke MySQL, merender diagram batang otomatis, dan menyediakan tombol salin kueri SQL.
6. **Kumpulan Data & Ingesti (Datasets & Ingestion)**: Katalog dataset enterprise, arsitektur skema kolom, serta pengunggah CSV interaktif dengan strategi penanganan duplikasi (*skip*, *overwrite*, *error*).
7. **Sumber Data & Pipeline (Data Sources & Pipelines)**: Registri konektor multi-sumber (MySQL, Stripe, Kafka, CSV) dengan riwayat eksekusi dan pemicu manual on-demand.
8. **Pusat Kualitas Data (Data Quality Center)**: Penilaian skor mutu otomatis (97.9%), verifikasi aturan kelulusan, dan tabel investigasi resolusi anomali.
9. **Peringatan & Insiden (Alerts & Incidents)**: Pengelolaan siklus hidup insiden lengkap (`TERBUKA` ➔ `DIAKUI` ➔ `DISELESAIKAN`) dengan penetapan batas evaluasi otomatis.
10. **Laporan & Ekspor Data (Reports & Exports)**: Pemfilteran data berdasarkan kategori dan wilayah serta unduh berkas CSV tersanitasi aman dari eksekusi formula berbahaya.
11. **Log Aktivitas & Audit Forensik (Activity & Audit Logs)**: Pencatatan jejak audit permanen mencakup stempel waktu, aktor pengguna, jenis aksi, alamat IP, dan rincian perubahan.
12. **Pengaturan Sistem (Settings)**: Penyesuaian tema warna aksen (Forest, Ocean, Plum, Ember), mode tema terang/gelap, preferensi awal minggu, profil pengguna, dan manajemen hak akses tim organisasi.

---

## 📄 Lisensi
Hak Cipta © 2026 DATAPULSE Team. Didistribusikan untuk keperluan pengembangan dan analitik enterprise.
