'use client'
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { TrendingUp } from "lucide-react"
import { estilosPorParametro } from "@/utils/estilosGraficos"
import { DatoAmbiental, Parametro } from "@/utils/simulacionApi"
import { TelemetriaAmbiental } from "@/lib/thingsboardApi"
import { calcularCondicionGeneral } from "@/utils/simulacionApi"

interface Props {
  valores: TelemetriaAmbiental;
}

export default function GraficoGeneral({ valores }: Props){
    const parametrosDisponibles: Parametro[] = [
    "all",
    "temperature",
    "humidity",
    "light",
    "noise",
    "airQuality",
    
    ];

    const nombresParametros: Record<Parametro, string> = {
        temperature: "Temperatura",
        humidity: "Humedad",
        light: "Iluminación",
        noise: "Ruido",
        airQuality: "Calidad del Aire",
        all: "Ambiente General",        
    };

  const [selectedParameter, setSelectedParameter] = useState<Parametro>("all");
  const [loading, setLoading] = useState(true);

  function getHistorial(param: Parametro): DatoAmbiental[] {
    if (typeof window === "undefined") return [];
    const raw = sessionStorage.getItem(`historial_${param}`);
    return raw ? JSON.parse(raw) : [];
  }

  const [historial, setHistorial] = useState<Record<Parametro, DatoAmbiental[]>>(() => {
    const inicial: Record<Parametro, DatoAmbiental[]> = {
      temperature: getHistorial("temperature"),
      humidity: getHistorial("humidity"),
      light: getHistorial("light"),
      noise: getHistorial("noise"),
      airQuality: getHistorial("airQuality"),
      all: [],
    };
    return inicial;
  });

  const config = estilosPorParametro[selectedParameter] ?? estilosPorParametro["temperature"];

  const nivelCondicion: Record<string, number> = {
  "Excelente": 5,
  "Aceptable": 4,
  "Poco Tolerable": 3,
  "Mala": 2,
  "Muy Mala": 1,
  "Indefinida": 0,
};


  useEffect(() => {
  const now = new Date();
  const hora = now.toTimeString().slice(0, 5);

  setHistorial(prev => {
    const actualizado: Record<Parametro, DatoAmbiental[]> = { ...prev };

    const nuevoValores: Record<Parametro, number> = {
      temperature: valores.temperature ?? 0,
      humidity: valores.humidity ?? 0,
      light: valores.light ?? 0,
      noise: valores.noise ?? 0,
      airQuality: valores.airQuality ?? 0,
      all: 0,
    };

    const promedioAll = calcularCondicionGeneral(nuevoValores);

    nuevoValores.all = promedioAll;

    (Object.keys(nuevoValores) as Parametro[]).forEach(param => {
      const valor = nuevoValores[param];
      const anterior = prev[param] ?? [];
      const nuevos = [...anterior, { hora, valor }];
      const ultimos = nuevos.length > 10 ? nuevos.slice(-10) : nuevos;
      actualizado[param] = ultimos;

      if (typeof window !== "undefined") {
        sessionStorage.setItem(`historial_${param}`, JSON.stringify(ultimos));
      }
    });
    return actualizado;
  });

  setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [valores]);


  const datos = historial[selectedParameter] ?? [];

    const chartConfig = {
        valor: {
        label: "Valor",
        },
    } satisfies ChartConfig;

    return(
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between ">
                    <div>
                        <CardTitle className="flex items-center ">
                            <TrendingUp className="h-5 w-5 mr-2"/>
                            {`Nivel de ${nombresParametros[selectedParameter]}`}
                        </CardTitle>
                        <CardDescription>
                        {`Estado actual de ${nombresParametros[selectedParameter]}`}
                        </CardDescription>
                    </div>

                    <Select value={selectedParameter} onValueChange={(value) => setSelectedParameter(value as Parametro)}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar parámetro" />
                        </SelectTrigger>
                    <SelectContent>
                        {parametrosDisponibles.map((param) => (
                            <SelectItem key={param} value={param}>
                            {nombresParametros[param]}
                            </SelectItem>
                        ))}
                    </SelectContent>                   
                    </Select>
                </div>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <p className="text-muted-foreground">Cargando datos simulados...</p>
                ) : (
                <ChartContainer config={chartConfig} className="min-h-[200px] max-h-72 w-full">
                    <LineChart
                        accessibilityLayer
                        data={datos}
                        margin={{ left: 0, right: 22 }}
                    >
                    <CartesianGrid vertical horizontal strokeDasharray="3 3"  />
                    <XAxis
                        dataKey="hora"
                        tickLine={false}
                        tickMargin={8}       
                    />
                    <YAxis
                        tickLine={false}
                        tickMargin={8}
                        ticks={config.ticks}
                        tickFormatter={(value) => config.formato?.(value) ?? value}
                            
                    />
                    <ChartTooltip content={<ChartTooltipContent/>}  formatter={(value) => config.formato?(Number(value)) : value} />
                    <ChartLegend content={<ChartLegendContent />} />            
                    <Line
                        dataKey="valor"
                        stroke={config.color}
                        strokeWidth={2}
                        isAnimationActive={false}              
                    />
                    </LineChart>
                </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
