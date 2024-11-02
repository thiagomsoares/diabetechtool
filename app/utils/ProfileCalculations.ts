export class ProfileCalculations {
  calculateMotolProfile(age: number, tdd: number, weight: number, isMMOL: boolean) {
    // Validações
    if (age < 1 || age > 18) {
      throw new Error("Idade deve estar entre 1 e 18 anos");
    }
    if ((weight < 5 || weight > 150) && (tdd < 5 || tdd > 150)) {
      throw new Error("Peso ou TDD inválidos");
    }

    // Calcula TDD se não fornecido
    const calculatedTdd = tdd === 0 ? this.calculateTDDFromWeight(age, weight) : tdd;

    // Fatores baseados na idade
    const ageFactors = this.getAgeFactors(age);

    // Cálculos dos parâmetros do perfil
    const basalSum = calculatedTdd * ageFactors.basalFactorFrom;
    const isf = ageFactors.isfFactor * 100.0 / calculatedTdd;
    const ic = ageFactors.icrFactor * 100.0 / calculatedTdd;

    // Conversão para MMOL se necessário
    const isfFinal = isMMOL ? isf * 0.0555 : isf;

    // Distribuição das basais ao longo do dia (24 períodos de 1 hora)
    const basalProfile = this.getBasalDistribution(age, basalSum);

    return {
      totalBasal: basalSum,
      isf: isfFinal,
      ic: ic,
      tdd: calculatedTdd,
      basalProfile: basalProfile
    };
  }

  calculateDPVProfile(age: number, tdd: number, basalPct: number, isMMOL: boolean) {
    // Validações
    if (age < 1 || age > 18) {
      throw new Error("Idade deve estar entre 1 e 18 anos");
    }
    if (tdd < 5 || tdd > 150) {
      throw new Error("TDD deve estar entre 5 e 150");
    }
    if (basalPct < 32 || basalPct > 37) {
      throw new Error("Porcentagem basal deve estar entre 32% e 37%");
    }

    // Cálculos baseados no DPV
    const basalSum = tdd * (basalPct / 100);
    const isf = this.calculateDPVISF(age, tdd);
    const ic = this.calculateDPVIC(age, tdd);

    // Conversão para MMOL se necessário
    const isfFinal = isMMOL ? isf * 0.0555 : isf;

    // Distribuição das basais ao longo do dia (24 períodos de 1 hora)
    const basalProfile = this.getDPVBasalDistribution(age, basalSum);

    return {
      totalBasal: basalSum,
      isf: isfFinal,
      ic: ic,
      tdd: tdd,
      basalProfile: basalProfile
    };
  }

  private calculateTDDFromWeight(age: number, weight: number) {
    if (age <= 5) return weight * 0.4;
    if (age <= 11) return weight * 0.5;
    return weight * 0.6;
  }

  private calculateDPVISF(age: number, tdd: number) {
    let factor;
    if (age <= 5) factor = 1700.0;
    else if (age <= 11) factor = 1500.0;
    else factor = 1300.0;
    return factor / tdd;
  }

  private calculateDPVIC(age: number, tdd: number) {
    let factor;
    if (age <= 5) factor = 2800.0;
    else if (age <= 11) factor = 2500.0;
    else factor = 2200.0;
    return factor / tdd;
  }

  private getAgeFactors(age: number) {
    if (age <= 5) {
      return {
        basalFactorFrom: 0.33,
        basalFactorTo: 0.35,
        isfFactor: 15.0,
        icrFactor: 25.0
      };
    }
    if (age <= 11) {
      return {
        basalFactorFrom: 0.35,
        basalFactorTo: 0.40,
        isfFactor: 13.0,
        icrFactor: 23.0
      };
    }
    return {
      basalFactorFrom: 0.40,
      basalFactorTo: 0.45,
      isfFactor: 10.0,
      icrFactor: 20.0
    };
  }

  private getBasalDistribution(age: number, totalBasal: number) {
    const baseDistribution = this.getBaseDistribution(age);
    const scaledDistribution = baseDistribution.map(rate => 
      (rate * totalBasal / this.sumArray(baseDistribution)).toFixed(3)
    );

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      rate: scaledDistribution[hour]
    }));
  }

  private getDPVBasalDistribution(age: number, totalBasal: number) {
    const baseDistribution = this.getDPVBaseDistribution(age);
    const scaledDistribution = baseDistribution.map(rate => 
      (rate * totalBasal / this.sumArray(baseDistribution)).toFixed(3)
    );

    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      rate: scaledDistribution[hour]
    }));
  }

  private getBaseDistribution(age: number) {
    if (age <= 5) {
      return [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.04, 0.04];
    }
    if (age <= 11) {
      return [0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.06, 0.04, 0.04, 0.03, 0.03, 0.04, 0.05, 0.05, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.04, 0.04];
    }
    return [0.03, 0.03, 0.03, 0.03, 0.04, 0.04, 0.06, 0.06, 0.06, 0.04, 0.03, 0.03, 0.03, 0.03, 0.04, 0.05, 0.04, 0.03, 0.03, 0.04, 0.05, 0.04, 0.04, 0.03];
  }

  private getDPVBaseDistribution(age: number) {
    if (age <= 5) {
      return [0.04, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.04, 0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.04, 0.04];
    }
    if (age <= 11) {
      return [0.04, 0.04, 0.04, 0.04, 0.05, 0.05, 0.06, 0.06, 0.06, 0.04, 0.04, 0.03, 0.03, 0.04, 0.05, 0.05, 0.04, 0.04, 0.04, 0.05, 0.05, 0.05, 0.04, 0.04];
    }
    return [0.03, 0.03, 0.03, 0.03, 0.04, 0.04, 0.06, 0.06, 0.06, 0.04, 0.03, 0.03, 0.03, 0.03, 0.04, 0.05, 0.04, 0.03, 0.03, 0.04, 0.05, 0.04, 0.04, 0.03];
  }

  private sumArray(arr: number[]) {
    return arr.reduce((a, b) => a + b, 0);
  }

  getISFVariations(age: number, baseISF: number, isMMOL: boolean) {
    const variations = age <= 5 ? 
      [0.0, -2.0, 0.0, 0.0, -2.0, 0.0, -2.0] :
      age <= 11 ?
        [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -1.0] :
        [0.2, 0.0, 0.2, 0.2, 0.0, 0.2, 0.2];

    const times = ["00:00", "06:00", "09:00", "11:00", "14:00", "16:00", "19:00"];
    
    return times.map((time, i) => ({
      time: time,
      isf: (isMMOL ? (baseISF + variations[i]) * 0.0555 : baseISF + variations[i]).toFixed(2)
    }));
  }

  getICVariations(age: number, baseIC: number) {
    const variations = age <= 5 ? 
      [0.0, -4.0, -1.0, -2.0, -4.0, 0.0, -4.0] :
      age <= 11 ?
        [0.0, -3.0, 0.0, -1.0, -3.0, 0.0, -2.0] :
        [0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -1.0];

    const times = ["00:00", "06:00", "09:00", "11:00", "14:00", "16:00", "19:00"];
    
    return times.map((time, i) => ({
      time: time,
      ic: (baseIC + variations[i]).toFixed(1)
    }));
  }
} 