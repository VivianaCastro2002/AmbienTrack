'use client'
import { useState } from "react"
import { LogOut, Wind, ChevronUp, ChevronDown, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


export default function DashboardHeader(){
    const [user] = useState({ name: "Juan Pérez", role: "Administrador" })

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    return(
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between gap-3">
                    <Wind className="h-10 w-10 space-x-4 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">AmbienTrack</h1>
                </div>        
                    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="lg" className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                            </div>
                            {isDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem className="bg-white">
                            <LogOut className="h-4 w-4 mr-2 text-stone-950" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
        </header>

    )
}

