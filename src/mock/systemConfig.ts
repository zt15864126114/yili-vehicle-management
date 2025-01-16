import Mock from 'mockjs';

const systemConfigData = Mock.mock({
  'settings': {
    'company': {
      'name': '益海嘉里（兖州）粮油工业有限公司',
      'address': '山东省济宁市兖州区新兖镇新驿大道',
      'contact': '0537-6621825',
      'logo': '@image("200x200")'
    },
    'system': {
      'name': '车辆管理系统',
      'version': '1.0.0',
      'theme': 'light',
      'pageSize': 20,
      'dateFormat': 'YYYY-MM-DD',
      'timeFormat': 'HH:mm:ss'
    },
    'notification': {
      'maintenanceReminder': 7,
      'inspectionReminder': 30,
      'insuranceReminder': 30,
      'licenseReminder': 30
    },
    'backup': {
      'autoBackup': true,
      'backupTime': '03:00',
      'backupRetention': 30,
      'lastBackupTime': '@datetime("yyyy-MM-dd HH:mm:ss")'
    }
  }
});

export default systemConfigData; 