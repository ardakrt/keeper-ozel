# Modern Supabase E-posta Şablonları

Aşağıdaki HTML kodlarını Supabase panelinizde **Authentication -> Email Templates** bölümündeki ilgili alanlara kopyalayıp yapıştırabilirsiniz.

---

## 1. Magic Link (Giriş Doğrulama / OTP)
**Önemli:** 2FA ve Giriş doğrulaması için kullanılan ana şablondur. `{{ .Token }}` içerir.

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doğrulama Kodu</title>
  <style>
    /* Reset & Base */
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f5; padding-bottom: 40px; }
    .main { margin: 0 auto; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-top: 40px; }
    
    /* Header */
    .header { background-color: #18181b; padding: 32px; text-align: center; }
    .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; margin: 0; }
    .logo-dot { color: #10b981; }
    
    /* Content */
    .content { padding: 40px 32px; text-align: center; }
    .title { color: #18181b; font-size: 20px; font-weight: 700; margin: 0 0 16px; }
    .text { color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }
    
    /* OTP Box */
    .otp-container { background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; margin: 32px 0; }
    .otp-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #71717a; margin-bottom: 12px; }
    .otp-code { font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: #18181b; letter-spacing: 6px; display: block; }
    
    /* Footer */
    .footer { background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 24px; text-align: center; }
    .footer-text { color: #a1a1aa; font-size: 12px; margin: 0; line-height: 1.5; }
    
    /* Utilities */
    .highlight { color: #18181b; font-weight: 600; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <!-- Header -->
      <div class="header">
        <h1 class="logo-text">Keeper<span class="logo-dot">.</span></h1>
      </div>

      <!-- Body -->
      <div class="content">
        <h2 class="title">Giriş Doğrulaması</h2>
        <p class="text">
          Hesabınıza yeni bir cihazdan erişim sağlanmaya çalışılıyor. 
          Güvenliğiniz için aşağıdaki kodu kullanın.
        </p>

        <!-- OTP Code -->
        <div class="otp-container">
          <span class="otp-label">DOĞRULAMA KODUNUZ</span>
          <span class="otp-code">{{ .Token }}</span>
        </div>

        <p class="text" style="font-size: 13px; color: #71717a;">
          Bu kod <strong>10 dakika</strong> geçerlidir. <br>
          Kodu kimseyle paylaşmayın.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p class="footer-text">
          Bu işlem sizin tarafınızdan yapılmadıysa,<br>
          lütfen hemen şifrenizi değiştirin.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 2. Confirm Signup (Kayıt Onayı)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Hesabınızı Onaylayın</title>
  <style>
    /* Reset & Base (Same styles) */
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #f4f4f5; padding-bottom: 40px; }
    .main { margin: 40px auto; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background-color: #18181b; padding: 32px; text-align: center; }
    .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .logo-dot { color: #10b981; }
    .content { padding: 40px 32px; text-align: center; }
    .title { color: #18181b; font-size: 22px; font-weight: 700; margin-bottom: 16px; }
    .text { color: #52525b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
    
    /* Button */
    .btn { display: inline-block; background-color: #10b981; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; transition: background-color 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
    .btn:hover { background-color: #059669; }
    
    .footer { background-color: #fafafa; border-top: 1px solid #f4f4f5; padding: 24px; text-align: center; }
    .footer-text { color: #a1a1aa; font-size: 12px; }
    .link { color: #10b981; word-break: break-all; font-size: 12px; margin-top: 10px; display: block; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1 class="logo-text">Keeper<span class="logo-dot">.</span></h1>
      </div>
      <div class="content">
        <h2 class="title">Aramıza Hoş Geldiniz!</h2>
        <p class="text">
          Keeper hesabınız oluşturuldu. Verilerinizi güvenle saklamaya başlamadan önce 
          lütfen e-posta adresinizi doğrulayın.
        </p>
        
        <a href="{{ .ConfirmationURL }}" class="btn">Hesabımı Onayla</a>

        <p class="text" style="margin-top: 32px; font-size: 13px; color: #71717a;">
          Veya aşağıdaki bağlantıyı tarayıcınıza yapıştırın: <br>
          <span class="link">{{ .ConfirmationURL }}</span>
        </p>
      </div>
      <div class="footer">
        <p class="footer-text">Keeper - Güvenli Kişisel Veri Yönetimi</p>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 3. Reset Password (Şifre Sıfırlama)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Şifre Sıfırlama</title>
  <style>
    /* Base styles similar to above */
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: sans-serif; }
    .main { margin: 40px auto; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background-color: #18181b; padding: 32px; text-align: center; }
    .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; }
    .logo-dot { color: #f43f5e; } /* Red accent for warning/reset */
    .content { padding: 40px 32px; text-align: center; }
    .title { color: #18181b; font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .text { color: #52525b; font-size: 15px; line-height: 1.6; margin-bottom: 32px; }
    
    .btn { display: inline-block; background-color: #f43f5e; color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; box-shadow: 0 4px 12px rgba(244, 63, 94, 0.2); }
    
    .footer { background-color: #fafafa; padding: 24px; text-align: center; font-size: 12px; color: #a1a1aa; }
  </style>
</head>
<body>
  <div style="background-color: #f4f4f5; padding-bottom: 40px; width: 100%;">
    <div class="main">
      <div class="header">
        <h1 class="logo-text">Keeper<span class="logo-dot">.</span></h1>
      </div>
      <div class="content">
        <h2 class="title">Şifre Sıfırlama Talebi</h2>
        <p class="text">
          Hesabınız için bir şifre sıfırlama talebi aldık. 
          Şifrenizi yenilemek için aşağıdaki butona tıklayın.
        </p>
        
        <a href="{{ .ConfirmationURL }}" class="btn">Şifremi Sıfırla</a>

        <p class="text" style="margin-top: 24px; font-size: 13px; color: #71717a;">
          Bu talebi siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </p>
      </div>
      <div class="footer">
        Link 1 saat geçerlidir.
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 4. Invite User (Kullanıcı Daveti)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Davet</title>
  <style>
    body { margin: 0; background-color: #f4f4f5; font-family: sans-serif; }
    .main { margin: 40px auto; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background-color: #18181b; padding: 32px; text-align: center; }
    .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; }
    .logo-dot { color: #3b82f6; } /* Blue accent for invite */
    .content { padding: 40px 32px; text-align: center; }
    .btn { background-color: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
  </style>
</head>
<body>
  <div style="padding-bottom: 40px; background-color: #f4f4f5;">
    <div class="main">
      <div class="header">
        <h1 class="logo-text">Keeper<span class="logo-dot">.</span></h1>
      </div>
      <div class="content">
        <h2 style="margin-bottom: 16px; color: #18181b;">Davetiyeniz Var!</h2>
        <p style="margin-bottom: 32px; color: #52525b; line-height: 1.6;">
          Keeper üzerindeki bir projeye katılmanız için davet edildiniz.
        </p>
        <a href="{{ .ConfirmationURL }}" class="btn">Daveti Kabul Et</a>
      </div>
    </div>
  </div>
</body>
</html>
```

---

## 5. Change Email (E-posta Değişimi)

```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>E-posta Değişimi</title>
  <style>
    body { margin: 0; background-color: #f4f4f5; font-family: sans-serif; }
    .main { margin: 40px auto; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { background-color: #18181b; padding: 32px; text-align: center; }
    .logo-text { color: #ffffff; font-size: 24px; font-weight: 700; }
    .logo-dot { color: #8b5cf6; } /* Purple accent */
    .content { padding: 40px 32px; text-align: center; }
    .btn { background-color: #8b5cf6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; }
  </style>
</head>
<body>
  <div style="padding-bottom: 40px; background-color: #f4f4f5;">
    <div class="main">
      <div class="header">
        <h1 class="logo-text">Keeper<span class="logo-dot">.</span></h1>
      </div>
      <div class="content">
        <h2 style="margin-bottom: 16px; color: #18181b;">E-posta Değişikliği</h2>
        <p style="margin-bottom: 32px; color: #52525b; line-height: 1.6;">
          Hesabınızın e-posta adresini değiştirmek istediniz. Yeni adresinizi onaylamak için tıklayın.
        </p>
        <a href="{{ .ConfirmationURL }}" class="btn">Değişikliği Onayla</a>
      </div>
    </div>
  </div>
</body>
</html>
```