export interface TripRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  destination: string;
  purpose: string;
  mileage: number;
  status: 'ongoing' | 'completed' | 'cancelled';
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  maintenanceType: string;
  maintenanceDate: string;
  cost: number;
  description: string;
  garage: string;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  fuelDate: string;
  fuelType: string;
  fuelVolume: number;
  unitPrice: number;
  cost: number;
  station: string;
  currentMileage: number;
} 