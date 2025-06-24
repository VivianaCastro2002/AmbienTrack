const TOKEN_THINGSBOARD = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2LmNpZnVlbnRlczA0QHVmcm9tYWlsLmNsIiwidXNlcklkIjoiNGQ0MDY0NDAtNDE5YS0xMWYwLWE3NjAtYzM0YjgzMzY4NjEyIiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJzZXNzaW9uSWQiOiIwNmQxYTRhZS00MTkxLTRhNjEtYjRiMC0xM2NiMGE0NmE0MjciLCJleHAiOjE3NTA4MDk1NDQsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzUwODAwNTQ0LCJmaXJzdE5hbWUiOiJWYWxlbnRpbmEiLCJsYXN0TmFtZSI6IkNpZnVlbnRlcyIsImVuYWJsZWQiOnRydWUsImlzUHVibGljIjpmYWxzZSwidGVuYW50SWQiOiI4ZTFkMzQyMC00MTkwLTExZjAtYTc2MC1jMzRiODMzNjg2MTIiLCJjdXN0b21lcklkIjoiMTM4MTQwMDAtMWRkMi0xMWIyLTgwODAtODA4MDgwODA4MDgwIn0.849528RTHrduRBhHDk8tPRExIleWClXNb_xSm97mbmWCUpRGC__0RRlrYSXulFKyTZh5feZRg3rTMCoJaRg8gg"
const BASE_URL = "http://iot.ceisufro.cl:8080";
const DEVICE_ID = "6df1cc90-470f-11f0-a76f-af9873efe2ab"; 


// Tipos de datos
export interface TelemetriaAmbiental {
  temperature: number;
  humidity: number;
  light: number;
  noise: number;
}

// Función para obtener los últimos valores de telemetría
export async function obtenerUltimosValores(): Promise<TelemetriaAmbiental> {
  const url = `${BASE_URL}/api/plugins/telemetry/DEVICE/${DEVICE_ID}/values/timeseries?keys=temperature,humidity,lux,noise`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN_THINGSBOARD}`,
      "Content-Type": "application/json"
    }
  });

  if (!res.ok) {
    throw new Error("Error al obtener datos de ThingsBoard");
  }

  const data = await res.json();

  return {
    temperature: parseFloat(data.temperature?.[0]?.value ?? "0"),
    humidity: parseFloat(data.humidity?.[0]?.value ?? "0"),
    light: parseFloat(data.lux?.[0]?.value ?? "0"),
    noise: parseFloat(data.noise?.[0]?.value ?? "0")
  };
}