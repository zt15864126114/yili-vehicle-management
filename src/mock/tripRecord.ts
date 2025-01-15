import Mock from 'mockjs';

const tripRecordData = Mock.mock({
  'records|30': [{
    'id|+1': 1,
    'vehicleId|1-20': 1,
    'driverId|1-10': 1,
    'startTime': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'endTime': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'destination': '@city(true)',
    'purpose|1': ['货物运输', '员工接送', '商务用车', '其他'],
    'mileage|100-1000': 1,
    'status|1': ['ongoing', 'completed', 'cancelled']
  }]
});

export default tripRecordData; 