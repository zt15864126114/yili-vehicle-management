export const menuItems = [
  {
    title: '仪表盘',
    icon: 'Odometer',
    path: '/dashboard'
  },
  {
    title: '车辆管理',
    icon: 'Van',
    path: '/vehicles'
  },
  {
    title: '驾驶员管理',
    icon: 'User',
    path: '/drivers'
  },
  {
    title: '运营管理',
    icon: 'Operation',
    path: '/operation',
    children: [
      {
        title: '出车记录',
        path: '/trips'
      },
      {
        title: '维修记录',
        path: '/maintenance'
      },
      {
        title: '加油记录',
        path: '/fuel'
      }
    ]
  },
  {
    title: '安全管理',
    icon: 'Shield',
    path: '/safety',
    children: [
      {
        title: '年检记录',
        path: '/inspection'
      },
      {
        title: '事故记录',
        path: '/accident'
      }
    ]
  },
  {
    title: '统计分析',
    icon: 'DataLine',
    path: '/statistics'
  },
  {
    title: '系统设置',
    icon: 'Setting',
    path: '/settings'
  }
]; 