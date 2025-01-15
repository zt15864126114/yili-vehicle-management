import { createRouter, createWebHashHistory } from 'vue-router';

const router = createRouter({
  history: createWebHashHistory('/yili-vehicle-management/'),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'vehicles',
          component: () => import('@/views/vehicle/VehicleList.vue')
        },
        {
          path: 'drivers',
          component: () => import('@/views/driver/DriverList.vue')
        },
        {
          path: 'trips',
          component: () => import('@/views/trip/TripList.vue')
        },
        {
          path: 'maintenance',
          component: () => import('@/views/maintenance/MaintenanceList.vue')
        },
        {
          path: 'fuel',
          component: () => import('@/views/fuel/FuelList.vue')
        },
        {
          path: 'inspection',
          component: () => import('@/views/inspection/InspectionList.vue')
        },
        {
          path: 'accident',
          component: () => import('@/views/accident/AccidentList.vue')
        },
        {
          path: 'statistics',
          component: () => import('@/views/statistics/CostAnalysis.vue')
        },
        {
          path: 'settings',
          component: () => import('@/views/system/Settings.vue')
        }
      ]
    }
  ]
});

export default router; 