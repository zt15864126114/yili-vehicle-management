import Mock from 'mockjs';

const inspectionRecordData = Mock.mock({
  'records|30': [{
    'id|+1': 1,
    'vehicleId|1-20': 1,
    'inspectionDate': '@date("yyyy-MM-dd")',
    'nextInspectionDate': '@date("yyyy-MM-dd")',
    'cost|200-800': 1,
    'station|1': ['兖州车管所', '济宁市车管所', '邹城检测站', '曲阜检测站'],
    'result|1': ['pass', 'fail', 'pending'],
    'items': () => {
      const items = ['尾气检测', '制动性能', '灯光检测', '车辆外观', '安全装置'];
      return Mock.Random.shuffle(items).slice(0, Mock.Random.integer(3, 5));
    },
    'inspector': '@cname',
    'remarks': '@csentence(10, 20)'
  }]
});

export default inspectionRecordData; 