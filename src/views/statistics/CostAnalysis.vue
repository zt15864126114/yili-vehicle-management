<template>
  <div class="cost-analysis">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>费用统计分析</span>
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="month">月度</el-radio-button>
            <el-radio-button label="quarter">季度</el-radio-button>
            <el-radio-button label="year">年度</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <!-- 统计卡片 -->
      <div class="statistics-cards">
        <el-card class="stat-card">
          <template #header>总费用支出</template>
          <div class="stat-value">¥{{ totalCost.toFixed(2) }}</div>
        </el-card>
        <el-card class="stat-card">
          <template #header>燃油费用</template>
          <div class="stat-value">¥{{ fuelCost.toFixed(2) }}</div>
        </el-card>
        <el-card class="stat-card">
          <template #header>维修保养费用</template>
          <div class="stat-value">¥{{ maintenanceCost.toFixed(2) }}</div>
        </el-card>
        <el-card class="stat-card">
          <template #header>其他费用</template>
          <div class="stat-value">¥{{ otherCost.toFixed(2) }}</div>
        </el-card>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <el-card class="chart-card">
          <template #header>费用构成</template>
          <div ref="pieChartRef" class="chart"></div>
        </el-card>
        <el-card class="chart-card">
          <template #header>费用趋势</template>
          <div ref="lineChartRef" class="chart"></div>
        </el-card>
      </div>

      <!-- 车辆费用排名 -->
      <el-card class="ranking-card">
        <template #header>车辆费用排名</template>
        <el-table :data="vehicleCostRanking" border>
          <el-table-column label="排名" type="index" width="80" />
          <el-table-column label="车牌号" prop="plateNumber" />
          <el-table-column label="总费用" prop="totalCost">
            <template #default="{ row }">
              ¥{{ row.totalCost.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="燃油费用" prop="fuelCost">
            <template #default="{ row }">
              ¥{{ row.fuelCost.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="维修费用" prop="maintenanceCost">
            <template #default="{ row }">
              ¥{{ row.maintenanceCost.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="费用占比" width="200">
            <template #default="{ row }">
              <el-progress
                :percentage="(row.totalCost / totalCost * 100).toFixed(1)"
                :format="(val: number) => val + '%'"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import fuelRecordData from '@/mock/fuelRecord';
import maintenanceRecordData from '@/mock/maintenanceRecord';
import vehicleData from '@/mock/vehicle';

const timeRange = ref<'month' | 'quarter' | 'year'>('month');
const pieChartRef = ref<HTMLElement>();
const lineChartRef = ref<HTMLElement>();
let pieChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;

// 计算统计数据
const totalCost = computed(() => fuelCost.value + maintenanceCost.value + otherCost.value);
const fuelCost = computed(() => {
  return fuelRecordData.records.reduce((sum: number, record: { cost: number }) => sum + record.cost, 0);
});
const maintenanceCost = computed(() => {
  return maintenanceRecordData.records.reduce((sum: number, record: { cost: number }) => sum + record.cost, 0);
});
const otherCost = computed(() => 0); // 其他费用暂时为0

// 计算车辆费用排名
const vehicleCostRanking = computed(() => {
  const ranking = vehicleData.vehicles.map((vehicle: { id: string; plateNumber: string }) => {
    const fuelCost = fuelRecordData.records
      .filter((record: { vehicleId: string }) => record.vehicleId === vehicle.id)
      .reduce((sum: number, record: { cost: number }) => sum + record.cost, 0);
    
    const maintenanceCost = maintenanceRecordData.records
      .filter((record: { vehicleId: string }) => record.vehicleId === vehicle.id)
      .reduce((sum: number, record: { cost: number }) => sum + record.cost, 0);

    return {
      id: vehicle.id,
      plateNumber: vehicle.plateNumber,
      fuelCost,
      maintenanceCost,
      totalCost: fuelCost + maintenanceCost
    };
  });

  return ranking.sort((a: { totalCost: number }, b: { totalCost: number }) => b.totalCost - a.totalCost);
});

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return;
  
  pieChart = echarts.init(pieChartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '70%',
        data: [
          { value: fuelCost.value, name: '燃油费用' },
          { value: maintenanceCost.value, name: '维修保养费用' },
          { value: otherCost.value, name: '其他费用' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  pieChart.setOption(option);
};

// 初始化折线图
const initLineChart = () => {
  if (!lineChartRef.value) return;
  
  lineChart = echarts.init(lineChartRef.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['燃油费用', '维修保养费用', '总费用']
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '燃油费用',
        type: 'line',
        data: [5000, 4500, 6000, 5500, 6500, 7000]
      },
      {
        name: '维修保养费用',
        type: 'line',
        data: [2000, 3000, 1500, 2500, 3500, 2000]
      },
      {
        name: '总费用',
        type: 'line',
        data: [7000, 7500, 7500, 8000, 10000, 9000]
      }
    ]
  };
  lineChart.setOption(option);
};

// 处理时间范围变化
const handleTimeRangeChange = () => {
  // 根据时间范围重新加载数据和更新图表
  initPieChart();
  initLineChart();
};

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  pieChart?.resize();
  lineChart?.resize();
};

onMounted(() => {
  initPieChart();
  initLineChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  pieChart?.dispose();
  lineChart?.dispose();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart {
  height: 400px;
}

.ranking-card {
  margin-top: 20px;
}
</style> 