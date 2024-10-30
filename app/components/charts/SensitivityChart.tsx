import { useApp } from '../../contexts/AppContext'
import { Line } from 'react-chartjs-2'
import { Feedback } from '../Feedback'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export function SensitivityChart() {
  const { data } = useApp()

  if (!data) return null

  if (!data.isfDynamic?.length || !data.isfProfile?.length) {
    return (
      <Feedback
        type="warning"
        title="Dados não disponíveis"
        message="Não foram encontrados dados de sensibilidade para o período selecionado. Verifique se seu site Nightscout está configurado para enviar dados de OpenAPS."
      />
    )
  }

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Sensibilidade Dinâmica',
        data: data.isfDynamic,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Sensibilidade do Perfil',
        data: data.isfProfile,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Análise de Sensibilidade à Insulina'
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} mg/dL/U`
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Sensibilidade (mg/dL/U)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Data/Hora'
        }
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <Line data={chartData} options={options} />
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Estatísticas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Média Sensibilidade Dinâmica</p>
            <p className="text-lg font-medium">
              {(data.isfDynamic.reduce((a, b) => a + b, 0) / data.isfDynamic.length).toFixed(1)} mg/dL/U
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Média Sensibilidade Perfil</p>
            <p className="text-lg font-medium">
              {(data.isfProfile.reduce((a, b) => a + b, 0) / data.isfProfile.length).toFixed(1)} mg/dL/U
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 