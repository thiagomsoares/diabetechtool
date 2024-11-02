'use client'

import React, { useState } from 'react';
import { ProfileCalculations } from '@/app/utils/ProfileCalculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Feedback } from '@/app/components/Feedback';

export default function ProfileCalculatorPage() {
  const [activeTab, setActiveTab] = useState('motol');
  const [results, setResults] = useState<any>(null);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Calculadora de Perfil</h2>
        <p className="text-gray-600">
          Calcule seu perfil basal usando os métodos Motol ou DPV.
        </p>
      </div>

      <Tabs defaultValue="motol" className="w-full">
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
              {/* Similar form structure for DPV method */}
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
          {/* Display results here */}
        </Card>
      )}
    </div>
  );
} 