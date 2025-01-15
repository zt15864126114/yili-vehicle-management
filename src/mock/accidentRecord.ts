import Mock from 'mockjs';

const accidentRecordData = Mock.mock({
  'records|20': [{
    'id|+1': 1,
    'vehicleId|1-20': 1,
    'driverId|1-10': 1,
    'accidentDate': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'location': '@city(true)',
    'type|1': ['碰撞', '刮蹭', '追尾', '翻车', '其他'],
    'severity|1': ['minor', 'moderate', 'severe'],
    'description': '@cparagraph(1, 2)',
    'responsibility|1': ['全责', '主责', '次责', '无责'],
    'thirdParty': {
      'name': '@cname',
      'phone': /1[3-9]\d{9}/,
      'plateNumber': /[京津沪渝冀豫云辽黑湘鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z]\d{5}/
    },
    'cost': {
      'repair|1000-50000': 1,
      'compensation|1000-30000': 1,
      'other|0-5000': 1
    },
    'status|1': ['pending', 'processing', 'completed'],
    'handledBy': '@cname',
    'insuranceClaim': {
      'claimNumber': /CL\d{8}/,
      'claimAmount|1000-50000': 1,
      'status|1': ['待申请', '已申请', '已赔付', '已驳回']
    },
    'attachments|1-3': [{
      'name': '@word(5, 10).jpg',
      'url': '@image("200x200")',
      'type': 'image/jpeg'
    }]
  }]
});

export default accidentRecordData; 