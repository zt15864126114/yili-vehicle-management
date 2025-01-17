import Mock from 'mockjs';

const driverData = Mock.mock({
  'drivers|10': [{
    'id|+1': 1,
    'name': '@cname',
    'licenseNumber': /[A-Z0-9]{12}/,
    'licenseExpireDate': '@date("yyyy-MM-dd")',
    'phoneNumber': /1[3-9]\d{9}/,
    'status|1': ['available', 'onDuty', 'leave'],
    'entryDate': '@date("yyyy-MM-dd")',
    'drivingYears|3-20': 1
  }]
});

export default driverData; 