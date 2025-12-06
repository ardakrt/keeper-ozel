/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Ayarlar
const CONFIG_FILE = path.join(__dirname, '.logo_config.json');
const DUMP_FILE = path.join(__dirname, 'logos_dump.txt');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// İndirilecek Markalar
const BRANDS = [
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
    return key.trim();
};

const fetchSvgContent = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const processBrand = (apiKey, brand) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.brandfetch.io',
            path: `/v2/brands/${brand.domain}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', async () => {
                if (res.statusCode !== 200) {
                    console.error(`❌ ${brand.name}: API Hatası (${res.statusCode})`);
                    resolve(null);
                    return;
                }

                try {
                    const json = JSON.parse(data);
                    const logos = json.logos || [];
                    
                    // Öncelik: Logo (SVG) -> Icon (SVG)
                    let targetLogo = logos.find(l => l.type === 'logo' && l.formats.some(f => f.format === 'svg'));
                    if (!targetLogo) {
                        targetLogo = logos.find(l => l.type === 'icon' && l.formats.some(f => f.format === 'svg'));
                    }

                    if (targetLogo) {
                        const svgFormat = targetLogo.formats.find(f => f.format === 'svg');
                        const svgContent = await fetchSvgContent(svgFormat.src);
                        
                        // Basit temizlik (opsiyonel, burada sadece tek satır yapıyoruz)
                        const cleanSvg = svgContent.replace(/\r?\n|\r/g, '');
                        
                        console.log(`✅ ${brand.name}: SVG alındı`);
                        resolve(`--- ${brand.name} ---\n${cleanSvg}\n\n`);
                    } else {
                        console.warn(`⚠️ ${brand.name}: SVG bulunamadı`);
                        resolve(null);
                    }
                } catch (e) {
                    console.error(`❌ ${brand.name}: Parse hatası`);
                    resolve(null);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`❌ ${brand.name}: İstek hatası`);
            resolve(null);
        });
        req.end();
    });
};

const main = async () => {
    const apiKey = await getApiKey();
    
    // Dosyayı sıfırla
    fs.writeFileSync(DUMP_FILE, `SVG DUMP - ${new Date().toISOString()}\n\n`);

    console.log('🚀 SVG kodları çekiliyor...');

    for (const brand of BRANDS) {
        const content = await processBrand(apiKey, brand);
        if (content) {
            fs.appendFileSync(DUMP_FILE, content);
        }
        // Rate limit için bekle
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n✨ İşlem tamamlandı!`);
    console.log(`📄 SVG kodları şuraya kaydedildi: ${DUMP_FILE}`);
    console.log(`👉 Lütfen bu dosyanın içeriğini kopyalayıp bana atın.`);
    process.exit(0);
};

main();
