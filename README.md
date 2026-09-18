# BSCup Running Challenges

Dashboard lari Next.js App Router, TypeScript, dan React. Desain hitam/emas terinspirasi Bridgestone Cup BP 2026. Data bawaan: 215 aktivitas dari Excel 18 September 2026.

## Menjalankan

```sh
npm install
npm run dev
```

Buka http://localhost:3000. Produksi: `npm run build` menghasilkan website statis di folder `out`. Pemeriksaan TypeScript: `npm run check`.

## Clean architecture

- `src/domain`: entitas Run, kontrak repository, parser dan aturan pace.
- `src/application`: use case pengambilan data dan agregasi dashboard.
- `src/infrastructure`: repository Excel lokal menggunakan ExcelJS, satu-satunya layer yang mengakses filesystem.
- `src/presentation`: antarmuka React dan interaksi filter/pencarian/ekspor.
- `src/app`: composition root App Router, layout dan API `/api/runs`.

Domain tidak bergantung pada Next.js atau filesystem. Repository dapat diganti database tanpa mengubah tampilan dan aturan bisnis.

## Data dan perhitungan

Ganti `data/data lari-2026-9-18-9.xlsx` dengan workbook Excel. Worksheet pertama harus memiliki header `Name`, `Date`, `Distance`, `Unit`, dan `Duration` pada baris pertama; kolom boleh diurutkan ulang. Workbook dibaca saat build, lalu halaman dan `/api/runs` diekspor menjadi file statis. Duration mendukung waktu Excel, pecahan hari, atau teks `HH:mm:ss`. Date mendukung teks ISO (tanggal lokal dipertahankan) dan sel tanggal Excel. Pace dihitung dari durasi detik dibagi jarak, karena kolom Pace sumber tidak konsisten. Rata-rata pace menggunakan total durasi dibagi total jarak aktivitas dengan durasi valid. Aktivitas tanpa durasi masuk total jarak, tetapi tidak masuk perhitungan pace. Data merupakan snapshot lokal. Workbook tersimpan di luar folder public; API tetap menyajikan data aktivitas. Ekspor hasil filter tetap berupa CSV. Setiap push ke main menjalankan tes, build, dan deployment GitHub Pages. Jalankan `npm test` untuk verifikasi impor Excel dan perhitungan.

Filter tanggal dan pencarian berlaku untuk ringkasan, grafik, klasemen, aktivitas dan ekspor. Klasemen diurutkan menurut total jarak. Grafik menampilkan hari yang memiliki aktivitas. Font Google bersifat opsional dengan fallback font lokal.
