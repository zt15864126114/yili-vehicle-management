// 车辆信息接口
export interface Vehicle {
  id: string;
  plateNumber: string;
  model: string;
  purchaseDate: string;
  insuranceExpireDate: string;
  status: 'normal' | 'maintenance' | 'scrapped';
}

// 驾驶员信息接口
export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpireDate: string;
  phoneNumber: string;
  status: 'available' | 'onDuty' | 'leave';
}

// 其他接口定义... 