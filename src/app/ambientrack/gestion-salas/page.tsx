"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2 } from "lucide-react"
import { getSalaConfig, saveSalaConfig, ParametroIdeal } from "@/utils/storage"
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from "next/navigation"

const UNIDADES: Record<string, string> = {
  temperature: "°C",
  humidity: "%",
  lux: "lux",
  noise: "pdm",
  airQuality: "AQI"
}
const NOMBRES_PARAMETROS: Record<string, string> = {
  temperature: "Temperatura",
  humidity: "Humedad",
  lux: "Luminosidad",
  noise: "Ruido",
  airQuality: "Calidad del Aire"
}

const keysParametros = Object.keys(UNIDADES)

export default function GestionSalas() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const [formulario, setFormulario] = useState({
    id: "",
    nombre: "Sala Principal",
    parametros: {} as Record<string, ParametroIdeal>,
    deviceId: "",
    accessToken: ""
  })

  useEffect(() => {
    cargarSala()
  }, [])

  const defaultParametros = (): Record<string, ParametroIdeal> => {
    return {
      temperature: { min: 20, max: 24, unidad: "°C" },
      humidity: { min: 40, max: 60, unidad: "%" },
      lux: { min: 300, max: 500, unidad: "lux" },
      noise: { min: 0, max: 200, unidad: "pdm" },
      airQuality: { min: 0, max: 750, unidad: "AQI" }
    }
  }

  const cargarSala = () => {
    setLoading(true)
    try {
      const config = getSalaConfig()

      if (config) {
        setFormulario({
          id: config.id,
          nombre: config.nombre,
          deviceId: config.deviceId,
          accessToken: config.accessToken,
          parametros: config.parametros
        })
      } else {
        // Si no hay sala, inicializar con defaults
        setFormulario({
          id: uuidv4(),
          nombre: "Sala Principal",
          deviceId: "",
          accessToken: "",
          parametros: defaultParametros()
        })
      }
    } catch (error: any) {
      console.error("Error cargando sala:", error)
      setMessage({ text: "Error al cargar la configuración", type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const guardarConfiguracion = async () => {
    setSaving(true)
    setMessage(null)
    try {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))

      saveSalaConfig({
        id: formulario.id || uuidv4(),
        nombre: formulario.nombre,
        deviceId: formulario.deviceId,
        accessToken: formulario.accessToken,
        parametros: formulario.parametros
      })

      setMessage({ text: "Configuración guardada correctamente (Local)", type: 'success' })
      router.push("/ambientrack/dashboard")
    } catch (error: any) {
      console.error("Error guardando:", error)
      setMessage({ text: "Error al guardar la configuración: " + error.message, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleParametroChange = (tipo: string, campo: "min" | "max", valor: string) => {
    setFormulario((prev) => ({
      ...prev,
      parametros: {
        ...prev.parametros,
        [tipo]: {
          ...prev.parametros[tipo],
          [campo]: Number.parseFloat(valor) || 0,
        },
      },
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Dispositivo</h1>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Conexión ThingsBoard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Sala / Dispositivo</Label>
                <Input
                  id="nombre"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device_id">ID del Dispositivo (UUID)</Label>
                <Input
                  id="device_id"
                  value={formulario.deviceId}
                  onChange={(e) => setFormulario(f => ({ ...f, deviceId: e.target.value }))}
                  placeholder="Ej: 97d4bd00-..."
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="access_token">Token de Usuario (JWT)</Label>
                <Input
                  id="access_token"
                  value={formulario.accessToken}
                  onChange={(e) => setFormulario(f => ({ ...f, accessToken: e.target.value }))}
                  placeholder="Bearer eyJ..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parámetros Ideales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {keysParametros.map((tipo) => (
                <div key={tipo} className="p-4 border rounded-lg bg-white shadow-sm">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    {NOMBRES_PARAMETROS[tipo]}
                    <span className="text-xs text-gray-500 font-normal">({UNIDADES[tipo]})</span>
                  </h3>
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-500">Mínimo</Label>
                      <Input
                        type="number"
                        value={formulario.parametros[tipo]?.min ?? 0}
                        onChange={(e) => handleParametroChange(tipo, "min", e.target.value)}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-gray-500">Máximo</Label>
                      <Input
                        type="number"
                        value={formulario.parametros[tipo]?.max ?? 0}
                        onChange={(e) => handleParametroChange(tipo, "max", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={guardarConfiguracion} disabled={saving} size="lg" className="w-full md:w-auto">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
