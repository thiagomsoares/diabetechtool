import { render, screen } from '@testing-library/react'
import { Dashboard } from '@/components/Dashboard'
import { AppContext } from '@/contexts/AppContext'

describe('Dashboard', () => {
  it('mostra loading spinner quando está carregando', () => {
    render(
      <AppContext.Provider value={{ loading: true, data: null, error: null }}>
        <Dashboard />
      </AppContext.Provider>
    )
    
    expect(screen.getByText('Carregando dados...')).toBeInTheDocument()
  })

  it('mostra mensagem de erro quando há erro', () => {
    render(
      <AppContext.Provider 
        value={{ 
          loading: false, 
          data: null, 
          error: new Error('Erro de conexão') 
        }}
      >
        <Dashboard />
      </AppContext.Provider>
    )
    
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument()
    expect(screen.getByText('Erro de conexão')).toBeInTheDocument()
  })

  it('renderiza dados corretamente', () => {
    const mockData = {
      timestamps: ['2023-01-01'],
      bgs: [120],
      isfDynamic: [50],
      isfProfile: [45],
      deviations: [5],
      tableData: [],
      hourlyStats: []
    }

    render(
      <AppContext.Provider 
        value={{ 
          loading: false, 
          data: mockData, 
          error: null 
        }}
      >
        <Dashboard />
      </AppContext.Provider>
    )
    
    expect(screen.getByTestId('glucose-stats')).toBeInTheDocument()
    expect(screen.getByTestId('hourly-chart')).toBeInTheDocument()
    expect(screen.getByTestId('data-table')).toBeInTheDocument()
  })
}) 