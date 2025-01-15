// 首先创建驾驶员相关的类型定义
export type DriverStatus = 'available' | 'onDuty' | 'leave';

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpireDate: string;
  phoneNumber: string;
  status: DriverStatus;
  drivingYears?: number;
}

export interface DriverForm {
  name: string;
  licenseNumber: string;
  licenseExpireDate: string;
  phoneNumber: string;
  status: DriverStatus;
  drivingYears?: number;
} 