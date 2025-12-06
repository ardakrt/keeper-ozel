/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Ayarlar Dosyası (API Key'i burada saklayacağız)
const CONFIG_FILE = path.join(__dirname, '.logo_config.json');
const LOGO_DIR = path.join(__dirname, 'public', 'logos');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Varsayılan Markalar
const DEFAULT_BRANDS = [
    { name: 'garanti', domain: 'garantibbva.com.tr' },
    { name: 'ziraat', domain: 'ziraatbank.com.tr' },
    { name: 'akbank', domain: 'akbank.com' },
    { name: 'isbank', domain: 'isbank.com.tr' },
    { name: 'yapikredi', domain: 'yapikredi.com.tr' },
    { name: 'enpara', domain: 'enpara.com' },
    { name: 'papara', domain: 'papara.com' },
    { name: 'qnb', domain: 'qnbfinansbank.com' },
    { name: 'deniz', domain: 'denizbank.com' },
    { name: 'halk', domain: 'halkbank.com.tr' },
    { name: 'vakif', domain: 'vakifbank.com.tr' },
    { name: 'spotify', domain: 'spotify.com' },
    { name: 'netflix', domain: 'netflix.com' },
    { name: 'youtube', domain: 'youtube.com' },
    { name: 'discord', domain: 'discord.com' },
    { name: 'prime', domain: 'amazon.com' },
    { name: 'disney', domain: 'disneyplus.com' },
    { name: 'apple', domain: 'apple.com' },
    { name: 'gain', domain: 'gain.tv' },
    { name: 'exxen', domain: 'exxen.com' },
    { name: 'blutv', domain: 'blutv.com' },
    { name: 'mubi', domain: 'mubi.com' }
];

// Yardımcı Fonksiyonlar
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const getApiKey = async () => {
    if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        if (config.apiKey) return config.apiKey;
    }

    console.log('\n🔑 Brandfetch API Key gerekli.');
    const key = await question('👉 API Key girin: ');

    if (key.length < 5) {
        console.error('❌ Geçersiz API Key.');
        process.exit(1);
    }

    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ apiKey: key.trim() }));
    console.log('✅ API Key kaydedildi.\n');
    return key.trim();
};

const downloadLogo = (apiKey, brandName, domain) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.brandfetch.io',
            path: `/v2/brands/${domain}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    console.error(`❌ ${brandName} (${domain}) bulunamadı veya hata: ${res.statusCode}`);
                    resolve(false);
                    return;
                }

                try {
                    const json = JSON.parse(data);
                    const logos = json.logos || [];
                    let targetLogo = logos.find(l => l.type === 'logo' && l.formats.some(f => f.format === 'svg'));

                    if (!targetLogo) {
                        targetLogo = logos.find(l => l.type === 'icon' && l.formats.some(f => f.format === 'svg'));
                    }

                    if (targetLogo) {
                        const svgFormat = targetLogo.formats.find(f => f.format === 'svg');
                        const dest = path.join(LOGO_DIR, `${brandName}.svg`);
                        const file = fs.createWriteStream(dest);

                        https.get(svgFormat.src, (response) => {
                            response.pipe(file);
                            file.on('finish', () => {
                                file.close();
                                console.log(`✅ İndirildi: ${brandName}.svg (${domain})`);
                                resolve(true);
                            });
                        });
                    } else {
                        console.warn(`⚠️ ${brandName} için SVG bulunamadı.`);
                        resolve(false);
                    }
                } catch (e) {
                    console.error(`❌ Parse hatası: ${e.message}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ İstek hatası: ${e.message}`);
            resolve(false);
        });
        req.end();
    });
};

const main = async () => {
    // Klasörü hazırla
    if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

    const apiKey = await getApiKey();

    while (true) {
        console.log('\n-----------------------------------');
        console.log('1. Varsayılan listeyi indir (Bankalar, Spotify vb.)');
        console.log('2. Özel domain indir (Örn: superonline.com)');
        console.log('3. Çıkış');
        console.log('-----------------------------------');

        const choice = await question('Seçiminiz (1-3): ');

        if (choice === '1') {
            console.log('\n🚀 Varsayılan liste indiriliyor...');
            for (const brand of DEFAULT_BRANDS) {
                await downloadLogo(apiKey, brand.name, brand.domain);
                // Rate limit için kısa bekleme
                await new Promise(r => setTimeout(r, 200));
            }
        } else if (choice === '2') {
            const domain = await question('👉 Domain girin (örn: google.com): ');
            const name = await question('👉 Dosya adı ne olsun? (örn: google): ');
            if (domain && name) {
                await downloadLogo(apiKey, name, domain);
            } else {
                console.error('❌ Eksik bilgi.');
            }
        } else if (choice === '3') {
            console.log('Güle güle! 👋');
            process.exit(0);
        } else {
            console.log('❌ Geçersiz seçim.');
        }
    }
};

main();
