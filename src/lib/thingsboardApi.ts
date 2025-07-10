const TB_BASE_URL = "http://iot.ceisufro.cl:8080";
const TB_USERNAME = "v.castro05@ufromail.cl"; // Reemplaza por tu correo
const TB_PASSWORD = "Vivi2002";         // Reemplaza por tu contraseña
const KEYS = "temperature,humidity,light,noise,eCO2,TVOC";

// Tipo de datos retornados
export interface TelemetriaAmbiental {
  temperature: number;
  humidity: number;
  light: number;
  noise: number;
  airQuality: number;
}

// Estado en memoria
let authToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiraEn: number = 0; // timestamp en ms

// Función para hacer login
async function loginThingsBoard(): Promise<void> {
  const res = await fetch(`${TB_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      username: TB_USERNAME,
      password: TB_PASSWORD
    })
  });

  if (!res.ok) throw new Error("Login ThingsBoard fallido");

  const data = await res.json();
  authToken = data.token;
  refreshToken = data.refreshToken;
  tokenExpiraEn = Date.now() + 14 * 60 * 1000; // 14 minutos de validez
}

// Función para refrescar el token
async function refrescarToken(): Promise<void> {
  if (!refreshToken) return loginThingsBoard(); // fallback

  const res = await fetch(`${TB_BASE_URL}/api/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": `Bearer ${authToken}`
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });

  if (!res.ok) return loginThingsBoard(); // fallback a nuevo login si falla

  const data = await res.json();
  authToken = data.token;
  refreshToken = data.refreshToken;
  tokenExpiraEn = Date.now() + 14 * 60 * 1000;
}

// Función que garantiza que haya un token válido
async function asegurarTokenValido(): Promise<void> {
  if (!authToken || Date.now() > tokenExpiraEn) {
    if (refreshToken) {
      await refrescarToken();
    } else {
      await loginThingsBoard();
    }
  }
}

// Función principal para obtener telemetría
export async function obtenerUltimosValores(deviceId: string): Promise<TelemetriaAmbiental> {
  await asegurarTokenValido();

  const res = await fetch(`${TB_BASE_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${KEYS}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": `Bearer ${authToken}`
    }
  });

  if (!res.ok) throw new Error("Error al obtener datos de ThingsBoard");

  const data = await res.json();

  const eco2 = parseFloat(data.eCO2?.[0]?.value ?? "0");
  const tvoc = parseFloat(data.TVOC?.[0]?.value ?? "0");
  const airQuality = (eco2 + tvoc) / 2;

  return {
    temperature: parseFloat(data.temperature?.[0]?.value ?? "0"),
    humidity: parseFloat(data.humidity?.[0]?.value ?? "0"),
    light: parseFloat(data.light?.[0]?.value ?? "0"),
    noise: parseFloat(data.noise?.[0]?.value ?? "0"),
    airQuality
  };
}
