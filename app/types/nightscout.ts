export interface TimeValue {
  time: string;
  timeAsSeconds: number;
  value: number;
}

export interface ProfileStore {
  dia: number;
  carbratio: TimeValue[];
  sens: TimeValue[];
  basal: TimeValue[];
  target_low: TimeValue[];
  target_high: TimeValue[];
  units: string;
  timezone: string;
}

export interface NightscoutProfile {
  _id: string;
  defaultProfile: string;
  date: number;
  created_at: string;
  startDate: string;
  store: {
    [key: string]: ProfileStore;
  };
  app: string;
  utcOffset: number;
  identifier: string;
  srvModified: number;
  srvCreated: number;
  subject: string;
}

export interface NightscoutEntry {
  _id: string;
  device: string;
  date: number;
  dateString: string;
  sgv: number;
  delta: number;
  direction: string;
  type: string;
  filtered: number;
  unfiltered: number;
  rssi: number;
  noise: number;
  sysTime: string;
  utcOffset: number;
}

export interface DeviceStatus {
  _id: string;
  device: string;
  created_at: string;
  pump?: {
    clock: string;
    reservoir: number;
    battery: {
      percent: number;
    };
    status: {
      status: string;
      timestamp: string;
    };
  };
  openaps?: {
    suggested: {
      bg: number;
      temp: string;
      sens?: number;
      sensitivityRatio?: number;
      sensitivities?: number;
      variable_sens?: number;
      timestamp: string;
    };
    enacted?: {
      bg: number;
      temp: string;
      timestamp: string;
    };
    iob: {
      iob: number;
      basaliob: number;
      timestamp: string;
    };
  };
  uploaderBattery?: number;
}

export interface NightscoutData {
  timestamps: string[];
  bgs: number[];
  isfDynamic: number[];
  isfProfile: number[];
  deviations: number[];
  tableData: {
    timestamp: string;
    bg: number;
    isfDynamic: number;
    isfProfile: number;
    deviation: number;
  }[];
  hourlyStats: {
    hour: number;
    avgDeviation: number;
    avgIsfDynamic: number;
    avgIsfProfile: number;
    count: number;
  }[];
}

export interface NightscoutConfig {
  baseUrl: string;
  apiSecret: string;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface LoadingStats {
  current: number;
  total: number;
} 