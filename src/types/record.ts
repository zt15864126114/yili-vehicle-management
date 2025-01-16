export interface TripRecord {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  driverId: string;
  driverName: string;
  departureTime: string;
  returnTime: string;
  mileage: number;
  route: string;
  purpose: string;
  status: 'ongoing' | 'completed' | 'cancelled';
  remarks: string;
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