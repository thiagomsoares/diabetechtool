'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ProfileCalculations } from '@/app/utils/ProfileCalculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Feedback } from '@/app/components/Feedback';
import Cookies from 'js-cookie';

interface ProfileResults {
  totalBasal: number;
  isf: number;
  ic: number;
  tdd: number;
  basalProfile: {
    hour: number;
    rate: string;
  }[];
}

interface NightscoutProfile {
  defaultProfile: string;
  store: {
    [key: string]: {
      dia: number;
      carbratio: { time: string; value: number }[];
      sens: { time: string; value: number }[];
      basal: { time: string; value: number }[];
      target_low: { time: string; value: number }[];
      target_high: { time: string; value: number }[];
      units: string;
    };
  };
}

export default function ProfileCalculatorPage() {
  const [activeTab, setActiveTab] = useState('motol');
  const [results, setResults] = useState<ProfileResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const calculator = new ProfileCalculations();

  const motolFormRef = useRef<HTMLFormElement>(null);
  const dpvFormRef = useRef<HTMLFormElement>(null);

  const [nightscoutProfile, setNightscoutProfile] = useState<NightscoutProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNightscoutProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError(null);

        const config = localStorage.getItem('nightscout_config') || Cookies.get('nightscout_config');
        if (!config) {
          throw new Error('Configuração do Nightscout não encontrada');
        }

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
          throw new Error('Erro ao buscar perfil do Nightscout');
        }

        const profiles = await response.json();
        if (profiles && profiles.length > 0) {
          setNightscoutProfile(profiles[0]);
        }
      } catch (err) {
        setProfileError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchNightscoutProfile();
  }, []);

  const handleMotolSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!motolFormRef.current) return;
    const formData = new FormData(motolFormRef.current);
    
    try {
      const results = calculator.calculateMotolProfile(
        Number(formData.get('age')),
        Number(formData.get('tdd')),
        Number(formData.get('weight')),
        formData.get('units') === 'mmol'
      );
      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular perfil');
    }
  };

  const handleDPVSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!dpvFormRef.current) return;
    const formData = new FormData(dpvFormRef.current);
    
    try {
      const results = calculator.calculateDPVProfile(
        Number(formData.get('age')),
        Number(formData.get('tdd')),
        Number(formData.get('basalPct')),
        formData.get('units') === 'mmol'
      );
      setResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao calcular perfil');
    }
  };

  const renderResults = () => {
    if (!results) return null;

    const formRef = activeTab === 'motol' ? motolFormRef.current : dpvFormRef.current;
    if (!formRef) return null;

    const formData = new FormData(formRef);

    const isfVariations = calculator.getISFVariations(
      Number(formData.get('age')),
      results.isf,
      formData.get('units') === 'mmol'
    );

    const icVariations = calculator.getICVariations(
      Number(formData.get('age')),
      results.ic
    );

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">Total Basal</h4>
            <p className="mt-1 text-2xl font-semibold">{results.totalBasal.toFixed(2)} U</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">ISF</h4>
            <p className="mt-1 text-2xl font-semibold">{results.isf.toFixed(2)} mg/dL/U</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">IC</h4>
            <p className="mt-1 text-2xl font-semibold">{results.ic.toFixed(2)} g/U</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-sm font-medium text-gray-500">TDD</h4>
            <p className="mt-1 text-2xl font-semibold">{results.tdd.toFixed(2)} U</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">Perfil Basal</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taxa (U/h)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.basalProfile.map((entry) => (
                    <tr key={entry.hour} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.hour.toString().padStart(2, '0')}:00
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">Sensibilidade (ISF)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ISF
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isfVariations.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.isf} {formData.get('units') === 'mmol' ? 'mmol/L' : 'mg/dL'}/U
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="text-lg font-medium mb-4">Carboidratos (IC)</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Horário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IC (g/U)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {icVariations.map((entry, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.ic}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfileComparison = () => {
    if (loadingProfile) {
      return (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (profileError) {
      return (
        <Feedback
          type="error"
          message={profileError}
        />
      );
    }

    if (!nightscoutProfile || !results) {
      return null;
    }

    const activeForm = activeTab === 'motol' ? motolFormRef.current : dpvFormRef.current;
    if (!activeForm) return null;
    
    const formData = new FormData(activeForm);

    const activeProfile = nightscoutProfile.store[nightscoutProfile.defaultProfile];
    
    // Organizar dados do perfil do Nightscout
    const nsBasal = activeProfile.basal.map(b => ({
      hour: parseInt(b.time.split(':')[0]),
      rate: b.value.toFixed(3)
    })).sort((a, b) => a.hour - b.hour);

    const nsISF = activeProfile.sens.map(s => ({
      time: s.time,
      value: s.value.toFixed(2)
    }));

    const nsIC = activeProfile.carbratio.map(c => ({
      time: c.time,
      value: c.value.toFixed(1)
    }));

    // Obter variações de ISF e IC usando os dados do formulário ativo
    const isfVariations = calculator.getISFVariations(
      Number(formData.get('age')),
      results.isf,
      formData.get('units') === 'mmol'
    );

    const icVariations = calculator.getICVariations(
      Number(formData.get('age')),
      results.ic
    );

    return (
      <Card className="mt-8">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Comparação com Perfil Atual</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Comparação Basal */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">Perfil Basal</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Hora</th>
                      <th className="px-4 py-2">Calculado</th>
                      <th className="px-4 py-2">Atual</th>
                      <th className="px-4 py-2">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.basalProfile.map((entry) => {
                      const nsEntry = nsBasal.find(b => b.hour === entry.hour);
                      const diff = nsEntry ? 
                        ((parseFloat(entry.rate) - parseFloat(nsEntry.rate)) / parseFloat(nsEntry.rate) * 100).toFixed(1) : 
                        'N/A';
                      
                      return (
                        <tr key={entry.hour} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{entry.hour.toString().padStart(2, '0')}:00</td>
                          <td className="px-4 py-2">{entry.rate}</td>
                          <td className="px-4 py-2">{nsEntry?.rate || 'N/A'}</td>
                          <td className={`px-4 py-2 ${parseFloat(diff) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {diff !== 'N/A' ? `${diff}%` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comparação ISF */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">Sensibilidade (ISF)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Horário</th>
                      <th className="px-4 py-2">Calculado</th>
                      <th className="px-4 py-2">Atual</th>
                      <th className="px-4 py-2">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isfVariations.map((entry, index) => {
                      const nsEntry = nsISF.find(s => s.time === entry.time);
                      const diff = nsEntry ? 
                        ((parseFloat(entry.isf) - parseFloat(nsEntry.value)) / parseFloat(nsEntry.value) * 100).toFixed(1) : 
                        'N/A';
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{entry.time}</td>
                          <td className="px-4 py-2">{entry.isf}</td>
                          <td className="px-4 py-2">{nsEntry?.value || 'N/A'}</td>
                          <td className={`px-4 py-2 ${parseFloat(diff) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {diff !== 'N/A' ? `${diff}%` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Comparação IC */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="text-lg font-medium mb-4">Carboidratos (IC)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Horário</th>
                      <th className="px-4 py-2">Calculado</th>
                      <th className="px-4 py-2">Atual</th>
                      <th className="px-4 py-2">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {icVariations.map((entry, index) => {
                      const nsEntry = nsIC.find(c => c.time === entry.time);
                      const diff = nsEntry ? 
                        ((parseFloat(entry.ic) - parseFloat(nsEntry.value)) / parseFloat(nsEntry.value) * 100).toFixed(1) : 
                        'N/A';
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2">{entry.time}</td>
                          <td className="px-4 py-2">{entry.ic}</td>
                          <td className="px-4 py-2">{nsEntry?.value || 'N/A'}</td>
                          <td className={`px-4 py-2 ${parseFloat(diff) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {diff !== 'N/A' ? `${diff}%` : 'N/A'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Calculadora de Perfil</h2>
        <p className="text-gray-600">
          Calcule seu perfil basal usando os métodos Motol ou DPV.
        </p>
      </div>

      <Tabs defaultValue="motol" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="motol">Método Motol</TabsTrigger>
          <TabsTrigger value="dpv">Método DPV</TabsTrigger>
        </TabsList>

        <TabsContent value="motol">
          <Card>
            <form ref={motolFormRef} onSubmit={handleMotolSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motol-age">Idade (anos)</Label>
                  <Input
                    id="motol-age"
                    name="age"
                    type="number"
                    required
                    min="1"
                    max="18"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motol-weight">Peso (kg)</Label>
                  <Input
                    id="motol-weight"
                    name="weight"
                    type="number"
                    required
                    min="5"
                    max="150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motol-tdd">TDD (opcional)</Label>
                  <Input
                    id="motol-tdd"
                    name="tdd"
                    type="number"
                    min="0"
                    max="150"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidades</Label>
                  <RadioGroup defaultValue="mgdl" name="units">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mgdl" id="motol-mgdl" />
                      <Label htmlFor="motol-mgdl">mg/dL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mmol" id="motol-mmol" />
                      <Label htmlFor="motol-mmol">mmol/L</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <Button type="submit">Calcular</Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="dpv">
          <Card>
            <form ref={dpvFormRef} onSubmit={handleDPVSubmit} className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dpv-age">Idade (anos)</Label>
                  <Input
                    id="dpv-age"
                    name="age"
                    type="number"
                    required
                    min="1"
                    max="18"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpv-tdd">TDD (U)</Label>
                  <Input
                    id="dpv-tdd"
                    name="tdd"
                    type="number"
                    required
                    min="5"
                    max="150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dpv-basalpct">Porcentagem Basal (%)</Label>
                  <Input
                    id="dpv-basalpct"
                    name="basalPct"
                    type="number"
                    required
                    min="32"
                    max="37"
                    placeholder="32-37%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidades</Label>
                  <RadioGroup defaultValue="mgdl" name="units">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mgdl" id="dpv-mgdl" />
                      <Label htmlFor="dpv-mgdl">mg/dL</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mmol" id="dpv-mmol" />
                      <Label htmlFor="dpv-mmol">mmol/L</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <Button type="submit">Calcular</Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Feedback
          type="error"
          message={error}
        />
      )}

      {results && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Resultados</h3>
          {renderResults()}
        </Card>
      )}

      {renderProfileComparison()}
    </div>
  );
} 