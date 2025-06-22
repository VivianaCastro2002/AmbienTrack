import Image from "next/image";
import GraficoGeneral from "@/components/graficoGeneral";
import GridTarjetas from "@/components/gridTarjetas";



export default function Home() {
  
  return (
    <div className="items-center min-h-full sm:px-6 sm:py-3 ">
      <main className="px-6">
        <GridTarjetas/>
        <GraficoGeneral/>
      </main>

    </div>
  );
}
