import Mock from 'mockjs';

const vehicleData = Mock.mock({
  'vehicles|20': [{
    'id|+1': 1,
    'plateNumber': /鲁Q[A-Z0-9]{5}/,
    'model|1': ['五十铃', '解放J6', '重汽豪沃', '东风天龙'],
    'purchaseDate': '@date("yyyy-MM-dd")',
    'insuranceExpireDate': '@date("yyyy-MM-dd")',
    'status|1': ['normal', 'maintenance', 'scrapped']
  }]
});

export default vehicleData; 