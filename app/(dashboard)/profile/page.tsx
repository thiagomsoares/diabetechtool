'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NightscoutProfile } from '@/app/types/nightscout';
import dynamic from 'next/dynamic';
import { Layout, Config, Data } from 'plotly.js';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';
import { useLoadingState } from '@/app/hooks/useLoadingState';
import { LoadingSteps } from '@/app/components/LoadingSteps';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ProfilePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<NightscoutProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const { isSearching, currentLoadingStep, motivationalPhrase, LOADING_STEPS } = useLoadingState(loading);

  useEffect(() => {
    const fetchProfiles = async () => {
      const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
      if (!config) {
        router.push('/');
        return;
      }

      try {
        const { baseUrl, apiSecret } = JSON.parse(config);
        const response = await fetch('/api/nightscout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `${baseUrl}/api/v1/profile`,
            apiSecret
          }),
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar perfis');
        }

        const data = await response.json();
        setProfiles(data);
        setSelectedProfile(data[0]?._id || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfis');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, [router]);

  const getCurrentProfile = () => {
    if (!selectedProfile) return null;
    const profile = profiles.find(p => p._id === selectedProfile);
    if (!profile) return null;
    return profile;
  };

  const renderBarChart = (data: { time: string; value: number }[], title: string, yaxis: string) => {
    const layout: Partial<Layout> = {
      title,
      yaxis: { title: yaxis },
      margin: { t: 40, r: 20, l: 50, b: 40 },
      height: 300,
      showlegend: false,
      plot_bgcolor: 'white',
      paper_bgcolor: 'white'
    };

    const plotData: Partial<Data>[] = [{
      x: data.map(d => d.time),
      y: data.map(d => d.value),
      type: 'bar',
      marker: {
        color: '#2563eb'
      }
    }];

    return (
      <Plot
        data={plotData}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
      />
    );
  };

  const renderProfileData = (profile: NightscoutProfile) => {
    const store = profile.store[profile.defaultProfile];
    if (!store) return null;

    const profileTimezone = store.timezone || 'UTC';
    const createdAt = zonedTimeToUtc(new Date(profile.created_at), profileTimezone);

    return (
      <div className="space-y-8">
        {/* Informações Gerais */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome do Perfil</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.defaultProfile}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duração da Insulina</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.dia} horas</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Unidades</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.units}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Fuso Horário</dt>
                <dd className="mt-1 text-sm text-gray-900">{store.timezone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Data de Criação</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {format(createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sensibilidade */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sensibilidade à Insulina (ISF)</h3>
              {renderBarChart(store.sens, '', 'ISF (mg/dL/U)')}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {store.sens.map((s, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Carboidratos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Relação I:C</h3>
              {renderBarChart(store.carbratio, '', 'I:C (g/U)')}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {store.carbratio.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Basal */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Taxa Basal</h3>
              {renderBarChart(store.basal, '', 'Basal (U/h)')}
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horário</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {store.basal.map((b, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{b.value.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const currentProfile = getCurrentProfile();

  return (
    <div className="container mx-auto px-4 py-8">
      <LoadingSteps
        isSearching={isSearching}
        currentLoadingStep={currentLoadingStep}
        motivationalPhrase={motivationalPhrase}
        loadingSteps={LOADING_STEPS}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Perfis do Nightscout</h1>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Perfis do Nightscout</h2>
          <select
            value={selectedProfile || ''}
            onChange={(e) => setSelectedProfile(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {profiles.map((profile) => (
              <option key={profile._id} value={profile._id}>
                {profile.defaultProfile} ({format(new Date(profile.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })})
              </option>
            ))}
          </select>
        </div>

        {currentProfile && renderProfileData(currentProfile)}
      </div>
    </div>
  );
}