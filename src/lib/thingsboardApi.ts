const TB_BASE_URL = process.env.NEXT_PUBLIC_TB_BASE_URL!;
const KEYS = "bme_temp_c,bme_hum_pct,bh1750_lux,noise,sgp30_eco2_ppm,sgp30_tvoc_ppb";

export interface TelemetriaAmbiental {
  temperature: number;
  humidity: number;
  lux: number;
  noise: number;
  airQuality: number;
}

export async function obtenerUltimosValores(deviceId: string, token: string): Promise<TelemetriaAmbiental> {
  // Asegurarse de que el token tenga el prefijo Bearer si no lo tiene
  const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

  // Usamos la API de Plugins de Telemetría (Requiere autenticación de usuario y Device ID)
  const res = await fetch(`${TB_BASE_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${KEYS}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Authorization": authHeader
    }
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Token expirado o inválido");
    if (res.status === 404) throw new Error("Dispositivo no encontrado");
    throw new Error(`Error ThingsBoard: ${res.status}`);
  }

  const data = await res.json();

  const eco2 = parseFloat(data.sgp30_eco2_ppm?.[0]?.value ?? "0");
  const tvoc = parseFloat(data.sgp30_tvoc_ppb?.[0]?.value ?? "0");
  const airQuality = (eco2 + tvoc) / 2;

  return {
    temperature: parseFloat(data.bme_temp_c?.[0]?.value ?? "0"),
    humidity: parseFloat(data.bme_hum_pct?.[0]?.value ?? "0"),
    lux: parseFloat(data.bh1750_lux?.[0]?.value ?? "0"),
    noise: parseFloat(data.noise?.[0]?.value ?? "0"),
    airQuality
  };
}
