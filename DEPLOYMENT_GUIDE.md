# Keeper Yayına Alma Rehberi (Deployment Guide)

Projeniz **Next.js SSR (Server Side Rendering)** kullandığı için, Node.js destekleyen bir sunucuda barınmalıdır.

Hedef Domain: `keeper.ardakaratas.com.tr`

---

## Seçenek 1: Vercel (Önerilen - En Kolay) 🚀
Next.js'in yaratıcısı Vercel, bu tür projeler için en optimize platformdur.

1.  **Vercel Hesabı:** [vercel.com](https://vercel.com) adresinden hesabınıza giriş yapın.
2.  **Projeyi Bağla:** "Add New > Project" diyerek GitHub/GitLab deponuzu seçin.
3.  **Environment Variables:** `Settings > Environment Variables` kısmına `.env.local` dosyanızdaki tüm anahtarları ekleyin.
    *   `NEXT_PUBLIC_SITE_URL` değerini `https://keeper.ardakaratas.com.tr` yapın.
4.  **Domain Ekleme:**
    *   Vercel projesinde `Settings > Domains` sekmesine gidin.
    *   `keeper.ardakaratas.com.tr` alan adını ekleyin.
5.  **DNS Ayarı (Hosting Panelinizden):**
    *   Alan adınızın (ardakaratas.com.tr) DNS yönetim paneline gidin.
    *   Yeni bir **CNAME** kaydı oluşturun:
        *   **Host/Name:** `keeper`
        *   **Value/Target:** `cname.vercel-dns.com`
    *   *Not:* Eğer CNAME desteklenmiyorsa A kaydı olarak `76.76.21.21` IP adresini kullanabilirsiniz.

---

## Seçenek 2: Kendi Sunucunuz (VPS / Ubuntu) 🐧
Eğer DigitalOcean, Hetzner veya kendi Linux sunucunuz varsa.

### 1. Gereksinimler
Sunucuda şunlar kurulu olmalıdır:
*   Node.js 18+ (`node -v` ile kontrol edin)
*   Nginx (Reverse Proxy için)
*   PM2 (Uygulamayı ayakta tutmak için)

### 2. Kurulum
Projeyi sunucuya çekin ve kurun:
```bash
git clone <repo-url> /var/www/keeper
cd /var/www/keeper
npm install
npm run build
```

### 3. Uygulamayı Başlatma (PM2)
```bash
# Uygulamayı 3000 portunda başlat
pm2 start npm --name "keeper" -- start
pm2 save
```

### 4. Nginx Konfigürasyonu
`/etc/nginx/sites-available/keeper` dosyasını oluşturun:

```nginx
server {
    server_name keeper.ardakaratas.com.tr;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktif edin ve Nginx'i yeniden başlatın:
```bash
ln -s /etc/nginx/sites-available/keeper /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 5. SSL Sertifikası (HTTPS)
```bash
certbot --nginx -d keeper.ardakaratas.com.tr
```

---

## Seçenek 3: cPanel Hosting (Node.js Destekli) 🌐
Eğer hosting firmanız cPanel üzerinde "Setup Node.js App" özelliği sunuyorsa:

1.  **Node.js App Oluştur:** cPanel'den "Setup Node.js App" menüsüne girin.
2.  **Application Root:** `/home/kullanici/keeper` gibi bir klasör belirtin.
3.  **Application URL:** `keeper.ardakaratas.com.tr` (Subdomaini önceden oluşturun).
4.  **Startup File:** `node_modules/next/dist/bin/next` (Burası bazen karmaşıktır, genelde `server.js` oluşturup içine next start komutunu require etmek gerekebilir).
    *   *Alternatif:* Custom startup file `server.js`:
        ```javascript
        const { createServer } = require('http')
        const { parse } = require('url')
        const next = require('next')
        
        const dev = process.env.NODE_ENV !== 'production'
        const hostname = 'localhost'
        const port = 3000
        const app = next({ dev, hostname, port })
        const handle = app.getRequestHandler()
        
        app.prepare().then(() => {
          createServer(async (req, res) => {
            try {
              const parsedUrl = parse(req.url, true)
              await handle(req, res, parsedUrl)
            } catch (err) {
              console.error('Error occurred handling', req.url, err)
              res.statusCode = 500
              res.end('internal server error')
            }
          }).listen(port, (err) => {
            if (err) throw err
            console.log(`> Ready on http://${hostname}:${port}`)
          })
        })
        ```
5.  **Dosyaları Yükle:** Yerelde `npm run build` aldığınız dosyaları (`.next`, `public`, `package.json`, `.env.local` vb.) dosya yöneticisi ile yükleyin.
6.  **Bağımlılıkları Kur:** Panelden `Run NPM Install` butonuna basın.

⚠️ **Uyarı:** cPanel kurulumları Next.js için bazen sorunlu olabilir. Vercel veya VPS en sağlıklı yöntemdir.
