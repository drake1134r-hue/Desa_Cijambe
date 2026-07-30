"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
  datasets: [
    {
      label: "Pertumbuhan Pendidikan (%)",
      data: [68, 71, 74, 76, 79, 82],
      borderColor: "#0f766e",
      backgroundColor: "rgba(15, 118, 110, 0.25)",
      tension: 0.35,
    },
  ],
};

const options = {
  responsive: true,
  animation: {
    duration: 900,
  },
  plugins: {
    legend: {
      position: "top" as const,
    },
  },
};

export default function PopulationCharts() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Grafik Desa</p>
          <h2 className="mt-4 text-4xl font-semibold">Data Pendidikan Penduduk</h2>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl">
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}
