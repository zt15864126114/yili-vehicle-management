<template>
  <div class="cost-analysis">
    <el-card class="main-card">
      <!-- 顶部控制区 -->
      <div class="control-panel">
        <div class="title">费用统计分析</div>
        <div class="controls">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :shortcuts="dateShortcuts"
            @change="handleDateRangeChange"
          />
          <el-radio-group v-model="timeRange" @change="handleTimeRangeChange">
            <el-radio-button label="month">月度</el-radio-button>
            <el-radio-button label="quarter">季度</el-radio-button>
            <el-radio-button label="year">年度</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 统计卡片区域 -->
      <div class="stat-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card total-cost" shadow="hover">
              <div class="card-header">
                <span>总费用支出</span>
                <el-tag size="small">{{ timeRangeLabel }}</el-tag>
              </div>
              <div class="card-value">¥{{ costs.total }}</div>
              <div class="card-trend">
                较上期
                <span :class="costTrend >= 0 ? 'up' : 'down'">
                  {{ Math.abs(costTrend) }}%
                  <el-icon><CaretTop v-if="costTrend >= 0"/><CaretBottom v-else/></el-icon>
                </span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card fuel-cost" shadow="hover">
              <div class="card-header">燃油费用</div>
              <div class="card-value">¥{{ costs.fuel.amount }}</div>
              <div class="card-percent">占比 {{ costs.fuel.percentage }}%</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card maintenance-cost" shadow="hover">
              <div class="card-header">维修保养费用</div>
              <div class="card-value">¥{{ costs.maintenance.amount }}</div>
              <div class="card-percent">占比 {{ costs.maintenance.percentage }}%</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card other-cost" shadow="hover">
              <div class="card-header">其他费用</div>
              <div class="card-value">¥{{ costs.other.amount }}</div>
              <div class="card-percent">占比 {{ costs.other.percentage }}%</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="chart-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="chart-header">
                  <span>费用构成分析</span>
                  <el-tooltip content="查看详细数据">
                    <el-button link @click="showPieDetail">
                      <el-icon><DataLine /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </template>
              <div ref="pieChartRef" class="chart"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card" shadow="hover">
              <template #header>
                <div class="chart-header">
                  <span>费用趋势分析</span>
                  <el-select v-model="trendType" style="width: 120px" @change="updateTrendChart">
                    <el-option label="总费用" value="total" />
                    <el-option label="燃油费用" value="fuel" />
                    <el-option label="维修费用" value="maintenance" />
                    <el-option label="其他费用" value="other" />
                  </el-select>
                </div>
              </template>
              <div ref="lineChartRef" class="chart"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 排名表格区域 -->
      <el-card class="ranking-card" shadow="hover">
        <template #header>
          <div class="ranking-header">
            <span>车辆费用排名</span>
            <el-radio-group v-model="rankingType" size="small" @change="updateRanking">
              <el-radio-button label="total">总费用</el-radio-button>
              <el-radio-button label="fuel">燃油费</el-radio-button>
              <el-radio-button label="maintenance">维修费</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <el-table :data="vehicleCostRanking" border stripe @sort-change="handleSortChange">
          <el-table-column label="排名" type="index" width="80" />
          <el-table-column label="车牌号" prop="plateNumber" />
          <el-table-column label="总费用" prop="totalCost" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="{ row }">
              <span class="cost-cell">¥{{ formatAmount(row.totalCost) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="燃油费用" prop="fuelCost" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="{ row }">
              <span class="cost-cell">¥{{ formatAmount(row.fuelCost) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="维修费用" prop="maintenanceCost" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="{ row }">
              <span class="cost-cell">¥{{ formatAmount(row.maintenanceCost) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="费用占比" width="200">
            <template #default="{ row }">
              <div class="progress-cell">
                <el-progress
                  :percentage="Number((Number(row.totalCost) / Number(totalCost)) * 100).toFixed(1)"
                  :format="(val: number) => val + '%'"
                  :color="getProgressColor(Number((Number(row.totalCost) / Number(totalCost)) * 100))"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="同比" width="120">
            <template #default="{ row }">
              <span :class="row.yearOverYear >= 0 ? 'up' : 'down'">
                {{ Math.abs(row.yearOverYear) }}%
                <el-icon><CaretTop v-if="row.yearOverYear >= 0"/><CaretBottom v-else/></el-icon>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" link @click="showVehicleDetail(row)">
                详情分析
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>

    <!-- 详情分析对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="费用详情分析"
      width="90%"
      :destroy-on-close="true"
      @opened="initCharts"
    >
      <div class="detail-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">月度费用趋势</div>
              </template>
              <div 
                ref="trendChartRef"
                style="width: 100%; height: 300px; border: 1px solid #eee;"
              ></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">费用构成分析</div>
              </template>
              <div 
                ref="pieChartRef"
                style="width: 100%; height: 300px;"
              ></div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">同比环比分析</div>
              </template>
              <div 
                ref="compareChartRef"
                style="width: 100%; height: 300px;"
              ></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';

// 声明响应式数据
const dateRange = ref<[Date, Date]>([new Date(), new Date()]);
const timeRange = ref('month');
const trendType = ref('total');
const rankingType = ref('total');
const pieChartRef = ref<HTMLElement | null>(null);
const lineChartRef = ref();
let pieChart: echarts.ECharts | null = null;
let lineChart: echarts.ECharts | null = null;
const detailDialogVisible = ref(false);
const trendChartRef = ref<HTMLElement | null>(null);
const compareChartRef = ref<HTMLElement | null>(null);
let charts: echarts.ECharts[] = [];

// 车辆列表数据
const vehicleList = ref([
  { id: '1', plateNumber: '鲁H1234J', type: '大型货车' },
  { id: '2', plateNumber: '鲁H5678K', type: '中型货车' },
  { id: '3', plateNumber: '鲁H9012L', type: '小型货车' },
  { id: '4', plateNumber: '鲁H3456M', type: '重型货车' },
  { id: '5', plateNumber: '鲁H7890N', type: '轻型货车' },
  { id: '6', plateNumber: '鲁HK888A', type: '中型货车' },
  { id: '7', plateNumber: '鲁HB666B', type: '小型货车' },
  { id: '8', plateNumber: '鲁HM999C', type: '重型货车' },
  { id: '9', plateNumber: '鲁HD235D', type: '轻型货车' },
  { id: '10', plateNumber: '鲁HF567E', type: '大型货车' }
]);

// 费用数据计算
const calculateCosts = () => {
  const costs = {
    fuel: Math.floor(Math.random() * 5000) + 3000,
    maintenance: Math.floor(Math.random() * 10000) + 2000,
    other: Math.floor(Math.random() * 1000)
  };
  
  return {
    total: costs.fuel + costs.maintenance + costs.other,
    ...costs
  };
};

// 计算展示数据
const costs = computed(() => {
  const currentCosts = calculateCosts();
  const total = currentCosts.total;
  
  return {
    total: formatAmount(total),
    fuel: {
      amount: formatAmount(currentCosts.fuel),
      percentage: Number(((currentCosts.fuel / total) * 100).toFixed(1))
    },
    maintenance: {
      amount: formatAmount(currentCosts.maintenance),
      percentage: Number(((currentCosts.maintenance / total) * 100).toFixed(1))
    },
    other: {
      amount: formatAmount(currentCosts.other),
      percentage: Number(((currentCosts.other / total) * 100).toFixed(1))
    }
  };
});

// 格式化金额
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// 生成排名数据
const vehicleCostRanking = ref(generateVehicleRankingData());

function generateVehicleRankingData() {
  return vehicleList.value.map(vehicle => ({
    id: vehicle.id,
    plateNumber: vehicle.plateNumber,
    totalCost: Math.floor(Math.random() * 50000) + 10000,
    fuelCost: Math.floor(Math.random() * 20000) + 5000,
    maintenanceCost: Math.floor(Math.random() * 30000) + 5000,
    yearOverYear: (Math.random() * 20 - 10).toFixed(1)
  }));
}

// 初始化图表
const initPieChart = () => {
  if (!pieChartRef.value) return;
  
  pieChart = echarts.init(pieChartRef.value);
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
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
          { value: Number(costs.value.fuel.amount.replace(/,/g, '')), name: '燃油费用' },
          { value: Number(costs.value.maintenance.amount.replace(/,/g, '')), name: '维修保养费用' },
          { value: Number(costs.value.other.amount.replace(/,/g, '')), name: '其他费用' }
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

const initLineChart = () => {
  if (!lineChartRef.value) return;
  
  lineChart = echarts.init(lineChartRef.value);
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: months.map(() => Math.floor(Math.random() * 50000) + 10000),
        type: 'line',
        smooth: true
      }
    ]
  };
  lineChart.setOption(option);
};

// 处理窗口大小变化
const handleResize = () => {
  pieChart?.resize();
  lineChart?.resize();
};

// 生命周期钩子
onMounted(() => {
  initPieChart();
  initLineChart();
  window.addEventListener('resize', handleResize);
  updateRanking();
});

// 更新图表方法
const updateCharts = () => {
  initPieChart();
  initLineChart();
};

// 日期变更处理
const handleDateRangeChange = () => {
  updateCharts();
};

// 时间范围变更处理
const handleTimeRangeChange = () => {
  updateCharts();
};

// 计算时间范围标签
const timeRangeLabel = computed(() => {
  switch (timeRange.value) {
    case 'month': return '本月';
    case 'quarter': return '本季度';
    case 'year': return '本年';
    default: return '';
  }
});

// 计算成本趋势
const costTrend = ref(5.8); // 示例数据，实际应该根据历史数据计算

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    }
  }
];

// 显示饼图详情
const showPieDetail = () => {
  detailDialogVisible.value = true;
};

// 更新趋势图表
const updateTrendChart = () => {
  if (!lineChart) return;
  const data = generateMonthlyData();
  lineChart.setOption({
    series: [{
      data: data[trendType.value === 'total' ? 'totalData' : 
        trendType.value === 'fuel' ? 'fuelData' : 'maintenanceData']
    }]
  });
};

// // 定义排名数据的接口
// interface VehicleRanking {
//   id: string;
//   plateNumber: string;
//   totalCost: number;
//   fuelCost: number;
//   maintenanceCost: number;
//   yearOverYear: string;
// }

// // 排序方法
// const sortRanking = (a: VehicleRanking, b: VehicleRanking, key: string) => {
//   switch(key) {
//     case 'totalCost':
//       return b.totalCost - a.totalCost;
//     case 'fuelCost':
//       return b.fuelCost - a.fuelCost;
//     case 'maintenanceCost':
//       return b.maintenanceCost - a.maintenanceCost;
//     default:
//       return b.totalCost - a.totalCost;
//   }
// };

// 更新排名数据
const updateRanking = () => {
  const data = generateVehicleRankingData();
  // 根据选择的类型进行排序
  vehicleCostRanking.value = data.sort((a, b) => {
    switch(rankingType.value) {
      case 'total':
        return b.totalCost - a.totalCost;
      case 'fuel':
        return b.fuelCost - a.fuelCost;
      case 'maintenance':
        return b.maintenanceCost - a.maintenanceCost;
      default:
        return b.totalCost - a.totalCost;
    }
  });
};

// 监听排名类型变化
watch(rankingType, () => {
  updateRanking();
});

// 计算总费用
const totalCost = computed((): number => {
  return vehicleCostRanking.value.reduce((sum, vehicle) => sum + vehicle.totalCost, 0);
});

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 50) return '#F56C6C';
  if (percentage >= 30) return '#E6A23C';
  return '#67C23A';
};

// 显示车辆详情
const showVehicleDetail = (vehicle: any) => {
  detailDialogVisible.value = true;
  console.log('显示车辆详情:', vehicle.plateNumber); // 使用 vehicle 参数
};

// 生成月度数据
const generateMonthlyData = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const fuelData = months.map(() => Math.floor(Math.random() * 3000) + 4000);
  const maintenanceData = months.map(() => Math.floor(Math.random() * 2000) + 1500);
  const totalData = months.map((_, i) => fuelData[i] + maintenanceData[i]);
  
  return {
    months,
    fuelData,
    maintenanceData,
    totalData
  };
};

// 处理表格排序
const handleSortChange = ({ prop, order }: { prop: string, order: string | null }) => {
  if (!prop || !order) {
    updateRanking();
    return;
  }

  const data = [...vehicleCostRanking.value];
  vehicleCostRanking.value = data.sort((a, b) => {
    const factor = order === 'ascending' ? 1 : -1;
    return ((a[prop as keyof typeof a] as number) - (b[prop as keyof typeof b] as number)) * factor;
  });
};

// 初始化详情图表
const initCharts = () => {
  const trendChart = echarts.init(trendChartRef.value);
  trendChart.setOption({
    grid: {
      top: 40,
      right: 20,
      bottom: 40,
      left: 50
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>总费用: ¥{c}'
    },
    xAxis: { 
      type: 'category', 
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: {
        lineStyle: {
          color: '#909399'
        }
      }
    },
    yAxis: { 
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [{ 
      data: [null, null, null, null, null, null, null, null, 15800, 16200, 16500, 17100], // 调整为更真实的月度总费用
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3,
        color: '#409EFF'
      },
      itemStyle: {
        color: '#409EFF'
      }
    }]
  });
  
  // 饼图 - 更真实的费用构成
  if (pieChartRef.value) {
    const pieChart = echarts.init(pieChartRef.value);
    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: ¥{c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        top: 0
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        data: [
          { value: 28500, name: '燃油费用' },    // 约4个月的燃油费
          { value: 18600, name: '维修费用' },    // 约4个月的维修费
          { value: 12000, name: '保养费用' },    // 约4个月的保养费
          { value: 6500, name: '停车费用' },     // 约4个月的停车费
          { value: 4800, name: '保险费用' },     // 约4个月的保险费
          { value: 3200, name: '其他费用' }      // 其他杂费
        ]
      }]
    });
    charts.push(pieChart);
  }

  // 对比图 - 更真实的月度费用类型对比
  if (compareChartRef.value) {
    const compareChart = echarts.init(compareChartRef.value);
    compareChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['燃油费用', '维修保养费用', '停车费用', '其他费用'],
        top: 0
      },
      grid: {
        top: 40,
        right: 20,
        bottom: 40,
        left: 50
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
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
          type: 'bar',
          stack: 'total',
          data: [null, null, null, null, null, null, null, null, 7000, 7200, 7100, 7200],
          itemStyle: { color: '#409EFF' }
        },
        {
          name: '维修保养费用',
          type: 'bar',
          stack: 'total',
          data: [null, null, null, null, null, null, null, null, 5800, 5900, 6200, 6300],
          itemStyle: { color: '#95d475' }
        },
        {
          name: '停车费用',
          type: 'bar',
          stack: 'total',
          data: [null, null, null, null, null, null, null, null, 1600, 1700, 1800, 1900],
          itemStyle: { color: '#ffd666' }
        },
        {
          name: '其他费用',
          type: 'bar',
          stack: 'total',
          data: [null, null, null, null, null, null, null, null, 1400, 1400, 1400, 1700],
          itemStyle: { color: '#909399' }
        }
      ]
    });
    charts.push(compareChart);
  }
};

// 监听对话框关闭
watch(detailDialogVisible, (val) => {
  if (!val) {
    charts.forEach(chart => chart?.dispose());
    charts = [];
    window.removeEventListener('resize', handleResize);
  } else {
    window.addEventListener('resize', handleResize);
  }
});

// 组件卸载时清理
onBeforeUnmount(() => {
  charts.forEach(chart => chart?.dispose());
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.cost-analysis {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.main-card {
  background-color: #fff;
  border-radius: 8px;
}

.control-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.stat-cards {
  margin-bottom: 24px;
  padding: 0 20px;
}

.stat-card {
  height: 140px;
  padding: 20px;
  transition: all 0.3s ease;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  min-width: 280px;
  word-wrap: break-word;
  word-break: break-all;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #606266;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.card-value {
  font-size: 26px;
  font-weight: bold;
  color: #303133;
  margin: 12px 0;
  white-space: nowrap;
  overflow: visible;
  line-height: 1.2;
}

.card-trend, .card-percent {
  font-size: 14px;
  color: #909399;
  white-space: nowrap;
  overflow: visible;
}

.up {
  color: #67C23A;
}

.down {
  color: #F56C6C;
}

.chart-section {
  margin-bottom: 24px;
  padding: 0 20px;
}

.chart-card {
  border: none;
  background: #fff;
  border-radius: 8px;
}

.chart {
  height: 400px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.ranking-card {
  margin: 0 20px;
  border: none;
  background: #fff;
  border-radius: 8px;
}

.ranking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}

/* 自定义卡片颜色 */
.total-cost {
  background: linear-gradient(135deg, #e6f3ff 0%, #ffffff 100%);
}

.fuel-cost {
  background: linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%);
}

.maintenance-cost {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.other-cost {
  background: linear-gradient(135deg, #fbe9e7 0%, #ffffff 100%);
}

/* 调整卡片间距 */
.el-row {
  margin: 0 -10px;
}

.el-col {
  padding: 0 10px;
}

.detail-content {
  padding: 20px;
}

.detail-chart-card {
  margin-bottom: 20px;
}

.chart-box {
  padding: 10px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}
</style>
