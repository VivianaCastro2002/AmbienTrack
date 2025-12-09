"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import GridTarjetas from "@/components/gridTarjetas"
import { obtenerUltimosValores, TelemetriaAmbiental } from "@/lib/thingsboardApi"
import GraficoGeneral from "@/components/graficoGeneral"
import { Parametro, DatoAmbiental, calcularCondicionGeneral, evaluarParametro } from "@/utils/parametros"
import Alertas from "@/components/alertas"
import { estilosPorParametro } from "@/utils/estilosGraficos"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Recomendaciones from "@/components/recomendaciones";
import { recomendacionesPorParametro } from "@/utils/recomendacionesData";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb"
import { getSalaConfig } from "@/utils/storage"


const PARAMETROS: { key: Exclude<Parametro, "all">; label: string }[] = [
  { key: "temperature", label: "Temperatura" },
  { key: "humidity", label: "Humedad" },
  { key: "lux", label: "Luminosidad" },
  { key: "noise", label: "Ruido" },
  { key: "airQuality", label: "Calidad del Aire" }
]

export default function Dashboard() {
  const searchParams = useSearchParams()
  // const salaId = searchParams.get("sala") // Ya no es necesario si solo hay una sala en local

  const [tab, setTab] = useState("general")
  const [loading, setLoading] = useState(true)
  const [valores, setValores] = useState<TelemetriaAmbiental | null>(null)
  const [rangosIdeales, setRangosIdeales] = useState<any>(null)
  const [historial, setHistorial] = useState<any[]>([])
  const [mensajesAlerta, setMensajesAlerta] = useState<{ mensaje: string; variant: "destructive" | "warning" }[]>([])
  const [recomendaciones, setRecomendaciones] = useState<any[]>([])
  const [salaNombre, setSalaNombre] = useState("")

  useEffect(() => {
    cargarDatosSala()
  }, [])

  const cargarDatosSala = async () => {
    setLoading(true)
    try {
      // 1. Cargar configuración de sala desde LocalStorage
      const sala = getSalaConfig()

      if (sala) {
        setSalaNombre(sala.nombre)

        // 2. Cargar parámetros ideales
        const rangos: any = {}
        Object.entries(sala.parametros).forEach(([tipo, p]) => {
          rangos[tipo] = { min: p.min, max: p.max }
        })
        setRangosIdeales(rangos)

        // 3. Cargar datos de ThingsBoard
        if (sala.accessToken) {
          try {
            const datos = await obtenerUltimosValores(sala.deviceId, sala.accessToken)
            if (datos) {
              setValores(datos)
              // Generar alertas y recomendaciones
              const nuevasAlertas: any[] = []
              const nuevasRecomendaciones: any[] = []

              Object.entries(datos).forEach(([key, value]) => {
                const tipo = key as Parametro
                if (key === 'timestamp') return

                const rango = rangos[tipo]
                if (rango) {
                  const ticks = estilosPorParametro[tipo].ticks
                  const minGrafico = Math.min(...ticks)
                  const maxGrafico = Math.max(...ticks)
                  const evaluacion = evaluarParametro(tipo as any, value as number, rango.min, rango.max, minGrafico, maxGrafico)

                  if (evaluacion !== 'Normal') {
                    nuevasAlertas.push({
                      mensaje: evaluacion,
                      variant: evaluacion === 'Muy Alta' || evaluacion === 'Muy Baja' ? 'destructive' : 'warning'
                    })

                    // Buscar recomendaciones
                    const recs = recomendacionesPorParametro[tipo]
                    if (recs) {
                      if (evaluacion === 'Muy Alta' || evaluacion === 'Muy Baja') {
                        nuevasRecomendaciones.push(...recs.critico)
                      } else {
                        nuevasRecomendaciones.push(...recs.advertencia)
                      }
                    }
                  }
                }
              })
              setMensajesAlerta(nuevasAlertas)
              setRecomendaciones(nuevasRecomendaciones)
            }
          } catch (err) {
            console.error("Error fetching ThingsBoard data:", err)
          }
        }
      }
    } catch (error) {
      console.error("Error cargando datos:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/ambientrack/gestion-salas">Configuración</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{salaNombre || "Dashboard"}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{salaNombre}</h1>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full px-6">
            <TabsTrigger value="general">Vista General</TabsTrigger>
            <TabsTrigger value="recomendaciones">Recomendaciones</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="space-y-6 mt-6">
            {loading && <p>Cargando datos...</p>}
            {!loading && !valores && <p>No hay datos disponibles. Verifica la configuración del dispositivo.</p>}

            {!loading && valores && rangosIdeales && (
              <GridTarjetas valores={valores} rangosIdeales={rangosIdeales} />
            )}
            {!loading && valores && rangosIdeales && (
              <GraficoGeneral
                valores={valores}
                historial={historial}
                setHistorial={setHistorial}
              />
            )}
            {mensajesAlerta.map((alerta, idx) => (
              alerta && (
                <Alertas
                  key={idx}
                  mensaje={alerta.mensaje}
                  variant={alerta.variant}
                  onVerRecomendaciones={() => setTab("recomendaciones")}
                />
              )
            ))}
          </TabsContent>
          <TabsContent value="recomendaciones" className="mt-6">
            <Recomendaciones recomendaciones={recomendaciones} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}