"use client";

import { useEffect, useState } from "react";
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloud,
  MapPin,
  Search,
  X,
  Wind,
  CalendarDays,
  Droplets,
  CloudDrizzle,
  CloudFog,
  Loader2
} from "lucide-react";

const getWeatherIcon = (code: number, className: string) => {
  // Animasyonlu İkonlar
  if (code === 0) return <Sun className={`${className} text-yellow-500 dark:text-yellow-400 animate-[spin_12s_linear_infinite]`} />;
  if (code >= 1 && code <= 3) return <CloudSun className={`${className} text-blue-500 dark:text-blue-400`} />;
  if (code === 45 || code === 48) return <CloudFog className={`${className} text-gray-500 dark:text-gray-400`} />;
  if (code >= 51 && code <= 57) return <CloudDrizzle className={`${className} text-blue-400 dark:text-blue-300`} />;
  if (code >= 61 && code <= 67) return <CloudRain className={`${className} text-blue-600 dark:text-blue-500`} />;
  if (code >= 71 && code <= 77) return <CloudSnow className={`${className} text-zinc-400 dark:text-white`} />;
  if (code >= 80 && code <= 82) return <CloudRain className={`${className} text-blue-700 dark:text-blue-600`} />;
  if (code >= 95 && code <= 99) return <CloudLightning className={`${className} text-yellow-600 dark:text-yellow-500`} />;
  return <CloudSun className={className} />;
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [locationName, setLocationName] = useState<string>("Ankara");
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [weatherLoading, setWeatherLoading] = useState(true);

  // --- WEATHER FUNCTIONS ---
  const fetchWeather = async (lat: number, lon: number, name: string) => {
    try {
      setWeatherLoading(true);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await res.json();

      setWeather({
        temp: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        code: data.current.weather_code
      });

      const daily = data.daily;
      const next5Days = [];
      for (let i = 1; i <= 5; i++) {
        const date = new Date(daily.time[i]);
        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'short' });
        next5Days.push({
          day: dayName,
          max: Math.round(daily.temperature_2m_max[i]),
          min: Math.round(daily.temperature_2m_min[i]),
          code: daily.weather_code[i]
        });
      }
      setForecast(next5Days);
      setLocationName(name);

      localStorage.setItem("keeper_weather_loc", JSON.stringify({ lat, lon, name }));
    } catch (error) {
      console.error("Hava durumu hatası:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    try {
      setWeatherLoading(true);
    const searchTerm = citySearch.trim();
      let res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=5&language=tr&format=json`);
      let data = await res.json();

      if ((!data.results || data.results.length === 0) && searchTerm.includes(" ")) {
        const firstWord = searchTerm.split(" ")[0];
        res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(firstWord)}&count=5&language=tr&format=json`);
        data = await res.json();
      }

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const { latitude, longitude, name, admin1, country } = result;
        let displayName = name;
        if (admin1 && admin1 !== name) {
          displayName = `${name}, ${admin1}`;
        } else if (country) {
          displayName = `${name}, ${country}`;
        }

        await fetchWeather(latitude, longitude, displayName);
        setIsWeatherModalOpen(false);
        setCitySearch("");
      } else {
        alert(`"${citySearch}" bulunamadı.`);
      }
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    const savedLoc = localStorage.getItem("keeper_weather_loc");
    if (savedLoc) {
      const { lat, lon, name } = JSON.parse(savedLoc);
      fetchWeather(lat, lon, name);
    } else {
      fetchWeather(39.93, 32.85, "Ankara");
    }
  }, []);

  const getWeatherGradient = () => {
    if (!weather) return "from-zinc-500/10 via-transparent to-zinc-500/5";
    const code = weather.code;
    if (code === 0) return "from-yellow-500/20 via-orange-500/10 to-amber-500/5";
    if (code >= 1 && code <= 3) return "from-blue-400/15 via-sky-500/10 to-cyan-500/5";
    if (code === 45 || code === 48) return "from-gray-400/20 via-slate-500/10 to-zinc-500/5";
    if (code >= 51 && code <= 57) return "from-blue-500/15 via-cyan-500/10 to-teal-500/5";
    if (code >= 61 && code <= 67) return "from-blue-600/20 via-indigo-500/10 to-blue-500/5";
    if (code >= 71 && code <= 77) return "from-slate-300/20 via-zinc-400/10 to-gray-500/5";
    if (code >= 80 && code <= 82) return "from-indigo-600/20 via-blue-600/10 to-cyan-600/5";
    if (code >= 95 && code <= 99) return "from-purple-600/20 via-indigo-600/10 to-violet-600/5";
    return "from-blue-500/10 via-transparent to-emerald-500/5";
  };

  return (
    <>
      <div
        onClick={() => setIsWeatherModalOpen(true)}
        className="group lg:col-span-2 cursor-pointer relative overflow-hidden rounded-[2rem] bg-white/70 dark:bg-white/[0.03] border border-zinc-200/50 dark:border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between shadow-xl hover:shadow-2xl hover:border-zinc-300 dark:hover:border-white/[0.15] transition-all duration-500 h-[200px]"
      >
        {/* Animasyonlu Hava Durumu Arka Planı */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getWeatherGradient()} transition-all duration-1000`}></div>
        
        {/* Işık Efekti */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 dark:bg-white/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Güneş/Bulut Animasyonu */}
        {weather?.code === 0 && (
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
        )}
        {weather?.code >= 61 && weather?.code <= 82 && (
          <>
            <div className="absolute top-8 left-1/4 w-1 h-8 bg-blue-400/40 rounded-full animate-[rain_1s_ease-in-out_infinite]" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-12 left-1/3 w-1 h-6 bg-blue-400/30 rounded-full animate-[rain_1s_ease-in-out_infinite]" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute top-6 left-1/2 w-1 h-10 bg-blue-400/40 rounded-full animate-[rain_1s_ease-in-out_infinite]" style={{animationDelay: '0.4s'}}></div>
          </>
        )}

        {/* 1. KATMAN: ANLIK DURUM */}
        <div className="relative z-10 p-8 h-full flex flex-col justify-between transition-all duration-500 group-hover:translate-y-[-15px] group-hover:scale-95 group-hover:opacity-20 group-hover:blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-sm font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
                {locationName}
              </div>
              <div className="mt-4 animate-[fadeInUp_0.5s_ease-out]">
                <span className="text-7xl font-bold text-zinc-900 dark:text-white tracking-tighter drop-shadow-2xl">
                  {weather ? weather.temp : "--"}°
                </span>
              </div>
            </div>

            {/* Büyük İkon */}
            <div className="relative w-20 h-20 flex items-center justify-center animate-in zoom-in duration-700">
              {weather ? (
                weather.code === 0 ? (
                  <Sun className="w-16 h-16 text-yellow-500 dark:text-yellow-400 animate-[spin_12s_linear_infinite] drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]" strokeWidth={1.5} />
                ) : (
                  <div className="relative">
                    <Cloud className="w-16 h-16 text-zinc-400 dark:text-white/90 drop-shadow-lg dark:fill-white/5" strokeWidth={1.5} />
                    {(weather.code >= 51) && <Droplets className="w-6 h-6 text-blue-500 dark:text-blue-400 absolute -bottom-2 left-1/2 -translate-x-1/2 animate-bounce" />}
                  </div>
                )
              ) : <Loader2 className="w-10 h-10 animate-spin text-zinc-400 dark:text-white" />}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2 backdrop-blur-md">
              <Wind className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              {weather ? weather.wind : "-"} km/s
            </div>
            <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 flex items-center gap-2 backdrop-blur-md">
              <Droplets className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              %{weather ? weather.humidity : "-"}
            </div>
          </div>
        </div>

        {/* 2. KATMAN: 5 GÜNLÜK TAHMİN */}
        <div className="absolute inset-0 bg-white/95 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-200 dark:border-white/10 p-6 flex flex-col justify-center opacity-0 translate-y-10 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20">
          <div className="flex items-center justify-between text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-4 px-2">
            <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> 5 Günlük Tahmin</span>
          </div>

          <div className="grid grid-cols-5 gap-3 h-full px-1">
            {forecast.map((day, index) => (
              <div key={index} className="flex flex-col items-center justify-between group/day">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">{day.day}</span>

                <div className="my-1 transform group-hover/day:scale-110 transition-transform duration-300">
                  {getWeatherIcon(day.code, "w-5 h-5")}
                </div>

                <div className="w-full flex flex-col items-center gap-1 h-16 justify-end">
                  <div className="relative w-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden h-full">
                    <div
                      className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 via-emerald-400 to-yellow-300 rounded-full"
                      style={{ height: `${Math.min(((day.max) / 35) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center -gap-1">
                    <span className="text-[10px] font-bold text-zinc-900 dark:text-white">{day.max}°</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500">{day.min}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WEATHER MODAL */}
      {isWeatherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsWeatherModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">Konum Ayarları</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">İlçe veya şehir adı girin (örn: Çankaya)</p>

            <form onSubmit={handleCitySearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Örn: Kadıköy, Bornova..."
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={weatherLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white dark:text-black font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {weatherLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Konumu Güncelle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
