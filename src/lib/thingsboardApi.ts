const TOKEN_THINGSBOARD = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ2LmNhc3RybzA1QHVmcm9tYWlsLmNsIiwidXNlcklkIjoiNThhNWI4MzAtNDE5YS0xMWYwLWE3NjAtYzM0YjgzMzY4NjEyIiwic2NvcGVzIjpbIlRFTkFOVF9BRE1JTiJdLCJzZXNzaW9uSWQiOiIwYjNjN2MyOS1lNjdlLTQxODUtYTAwMC1mNTEwZWNhYWY5OWEiLCJleHAiOjE3NTE5NDUyMzEsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNzUxOTM2MjMxLCJmaXJzdE5hbWUiOiJWaXZpYW5hIiwibGFzdE5hbWUiOiJDYXN0cm8iLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiOGUxZDM0MjAtNDE5MC0xMWYwLWE3NjAtYzM0YjgzMzY4NjEyIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCJ9.By4pUUf9jDeNj5png8Jc4WvZNS5kelS-xB4DBKF-9DXNS_kjuhwmUia48ee0ok-5-yWiOs5APBHOkJeU-Ni5Iw"
const BASE_URL = "http://iot.ceisufro.cl:8080";
const DEVICE_ID = "6df1cc90-470f-11f0-a76f-af9873efe2ab"; 


// Tipos de datos
export interface TelemetriaAmbiental {
  temperature: number;
  humidity: number;
  light: number;
  noise: number;
  airQuality: number;
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

  const eco2 = parseFloat(data.eco2?.[0]?.value ?? "0");
  const tvoc = parseFloat(data.tvoc?.[0]?.value ?? "0");

  const airQuality = (eco2 + tvoc) / 2;

  return {
    temperature: parseFloat(data.temperature?.[0]?.value ?? "0"),
    humidity: parseFloat(data.humidity?.[0]?.value ?? "0"),
    light: parseFloat(data.lux?.[0]?.value ?? "0"),
    noise: parseFloat(data.noise?.[0]?.value ?? "0"),
    airQuality: parseFloat(data.noise?.[0]?.value ?? "0")
  };
}