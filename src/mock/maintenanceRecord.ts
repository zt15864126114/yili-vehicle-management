import Mock from 'mockjs';

const maintenanceRecordData = Mock.mock({
  'records|50': [{
    'id|+1': 1,
    'vehicleId|1-20': 1,
    'maintenanceType|1': ['定期保养', '故障维修', '轮胎更换', '油液更换', '制动系统维修'],
    'maintenanceDate': '@date("yyyy-MM-dd")',
    'cost|1000-10000': 1,
    'description': '@csentence(10, 20)',
    'garage|1': ['益海嘉里维修中心', '兖州汽车维修厂', '重汽专修厂', '德州汽修'],
    'nextMaintenanceDate': '@date("yyyy-MM-dd")',
    'status|1': ['pending', 'processing', 'completed']
  }]
});

export default maintenanceRecordData; 