import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, OctagonAlert } from "lucide-react"
interface AlertasProps {
    variant?: "advertencia" | "destructiva";
    mensaje: string;
}

export default function Alertas({ variant = "advertencia", mensaje }: AlertasProps) {
    return (
    <div>
        {variant === "advertencia" ? (
            <Alert className="flex text-yellow-500 border-yellow-200 bg-yellow-50 items-center space-x-2 mb-1 py-2">
                <AlertTriangle className="!w-6 !h-6" />
                <div>
                    <AlertTitle className="text-base">Advertencia</AlertTitle>
                    <AlertDescription>
                        {mensaje}
                    </AlertDescription>

                </div>

            </Alert>
            ) : (
            <Alert variant="destructive" className="flex  border-red-200 bg-red-50 items-center space-x-2 mb-1 py-2">
                <OctagonAlert className="!w-6 !h-6"/>
                <div>
                    <AlertTitle  className="text-base">Alerta</AlertTitle>
                    <AlertDescription>
                        {mensaje}
                    </AlertDescription>
                </div>
            </Alert>
            )}
    </div>
    );
}