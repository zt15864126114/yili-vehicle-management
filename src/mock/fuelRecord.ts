import type { FuelRecord } from '@/types/record';

export default {
  records: [
    {
      id: '1',
      vehicleId: '1',
      driverId: '1',
      fuelDate: '2024-03-15 08:30:00',
      fuelType: '92#汽油',
      fuelVolume: 45.5,
      unitPrice: 7.23,
      cost: 328.97,
      station: '中石化兖州站',
      currentMileage: 15680
    }
  ] as FuelRecord[]
}; 