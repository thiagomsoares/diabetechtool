'use client'

import React, { useState } from 'react';
import { ProfileCalculations } from '@/app/utils/ProfileCalculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Feedback } from '@/app/components/Feedback';

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

export default function ProfileCalculatorPage() {
  const [activeTab, setActiveTab] = useState('motol');
  const [results, setResults] = useState<ProfileResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const calculator = new ProfileCalculations();

  const handleMotolSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
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
    const formData = new FormData(e.currentTarget);
    
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
            <form onSubmit={handleMotolSubmit} className="space-y-4 p-6">
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
            <form onSubmit={handleDPVSubmit} className="space-y-4 p-6">
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
    </div>
  );
} 