const chartData: Record<string, { hora: string; valor: number }[]> = {
  all: [
    { hora: "20:01", valor: 86 },
    { hora: "20:02", valor: 95 },
    { hora: "20:03", valor: 37 },
    { hora: "20:04", valor: 73 },
    { hora: "20:05", valor: 9 },
    { hora: "20:06", valor: 14 },
    { hora: "20:07", valor: 21 },
    { hora: "20:08", valor: 14 },
    { hora: "20:09", valor: 24 },
    { hora: "20:10", valor: 24 },
  ],
  temperature: [
    { hora: "20:01", valor: 21 },
    { hora: "20:02", valor: 22 },
    { hora: "20:03", valor: 23 },
    { hora: "20:04", valor: 22 },
    { hora: "20:05", valor: 23 },
    { hora: "20:06", valor: 14 },
    { hora: "20:07", valor: 21 },
    { hora: "20:08", valor: 14 },
    { hora: "20:09", valor: 24 },
    { hora: "20:10", valor: 24 }
  ],
  humedad: [
    { hora: "20:01", valor: 69 },
    { hora: "20:02", valor: 96 },
    { hora: "20:03", valor: 77 },
    { hora: "20:04", valor: 73 },
    { hora: "20:05", valor: 90 },
    { hora: "20:06", valor: 15 },
    { hora: "20:07", valor: 61 },
    { hora: "20:08", valor: 18 },
    { hora: "20:09", valor: 34 },
    { hora: "20:10", valor: 20 },
  ],
  light: [
    { hora: "20:01", valor: 400 },
    { hora: "20:02", valor: 405 },
    { hora: "20:03", valor: 420 },
    { hora: "20:04", valor: 407 },
    { hora: "20:05", valor: 430 },
    { hora: "20:01", valor: 400 },
    { hora: "20:02", valor: 405 },
    { hora: "20:03", valor: 420 },
    { hora: "20:04", valor: 470 },
    { hora: "20:05", valor: 430 },
  ],
    noise: [
    { hora: "20:01", valor: 40 },
    { hora: "20:02", valor: 55 },
    { hora: "20:03", valor: 42 },
    { hora: "20:04", valor: 76 },
    { hora: "20:05", valor: 43 },
    { hora: "20:01", valor: 40 },
    { hora: "20:02", valor: 45 },
    { hora: "20:03", valor: 2 },
    { hora: "20:04", valor: 7 },
    { hora: "20:05", valor: 43 },
  ],
    airQuality: [
    { hora: "20:01", valor: 70 },
    { hora: "20:02", valor: 45 },
    { hora: "20:03", valor: 62 },
    { hora: "20:04", valor: 47 },
    { hora: "20:05", valor: 43 },
    { hora: "20:01", valor: 80 },
    { hora: "20:02", valor: 45 },
    { hora: "20:03", valor: 62 },
    { hora: "20:04", valor: 47 },
    { hora: "20:05", valor: 3 },
  ],

}
const estilosPorParametro: Record<
  string,
  {
    color: string
    ticks: number[]
    formato?: (value: number) => string
  }
> = {
  all: {
    color: "var(--chart-9)",
    ticks: [0, 25, 50, 75, 100],
    formato: (value) => `${value}%`
  },
  temperature: {
    color: "var(--chart-1)",
    ticks: [10, 15, 20, 25, 30, 40],
    formato: (value) => `${value}°C`
  },
  humidity: {
    color: "var(--chart-6)",
    ticks: [0, 25, 50, 75, 100],
    formato: (value) => `${value}%`
  },
  light: {
    color: "var(--chart-5)",
    ticks: [0, 200, 400, 600, 800],
    formato: (value) => `${value} lx`
  },
  noise: {
    color: "var(--chart-2)",
    ticks: [0, 20, 40, 60, 80],
    formato: (value) => `${value} dB`
  },
  airQuality: {
    color: "var(--chart-7)",
    ticks: [0, 25, 50, 75, 100],
    formato: (value) => `${value} AQI`
  }
}
export {chartData, estilosPorParametro}
