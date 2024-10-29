import { useContext } from 'react'
import { AppContext } from '../contexts/AppContext'
import { LoadingSpinner } from './LoadingSpinner'

export function SensitivityStats() {
  const { data, loading } = useContext(AppContext)

  if (loading) {
    return <LoadingSpinner />
  }

  if (!data?.isfDynamic?.length || !data?.isfProfile?.length) {
    return null
  }

  const calculateStats = () => {
    const deviations = data.isfDynamic.map((dynamic, i) => 
      Math.abs(dynamic - data.isfProfile[i])
    )

    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length
    const maxDeviation = Math.max(...deviations)
    const minDeviation = Math.min(...deviations)

    return {
      avgDeviation: avgDeviation.toFixed(1),
      maxDeviation: maxDeviation.toFixed(1),
      minDeviation: minDeviation.toFixed(1)
    }
  }

  const stats = calculateStats()

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Desvio Médio</h3>
        <p className="text-2xl font-semibold">{stats.avgDeviation} mg/dL/U</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Maior Desvio</h3>
        <p className="text-2xl font-semibold">{stats.maxDeviation} mg/dL/U</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Menor Desvio</h3>
        <p className="text-2xl font-semibold">{stats.minDeviation} mg/dL/U</p>
      </div>
    </div>
  )
} 