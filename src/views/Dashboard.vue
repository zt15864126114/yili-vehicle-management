<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="card in statisticsCards" :key="card.title">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <span>{{ card.title }}</span>
              <el-tag :type="card.type">{{ card.tag }}</el-tag>
            </div>
          </template>
          <div class="card-value">{{ card.value }}</div>
          <div class="card-footer">
            <span>{{ card.footer }}</span>
            <el-button link type="primary">详情</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>月度费用趋势</template>
          <div ref="costChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>车辆使用率</template>
          <div ref="usageChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项 -->
    <el-card class="todo-card">
      <template #header>
        <div class="card-header">
          <span>待办事项</span>
          <el-button type="primary" link>查看全部</el-button>
        </div>
      </template>
      <el-table :data="todoList" style="width: 100%">
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.tagType">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" />
        <el-table-column prop="deadline" label="截止日期" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.statusType">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

// 统计卡片数据
const statisticsCards = [
  {
    title: '车辆总数',
    value: '28',
    tag: '正常运行',
    type: 'success',
    footer: '较上月 +2'
  },
  {
    title: '本月行驶里程',
    value: '12,345 km',
    tag: '正常',
    type: 'info',
    footer: '日均 411.5 km'
  },
  {
    title: '本月油耗',
    value: '2,860 L',
    tag: '偏高',
    type: 'warning',
    footer: '较上月 +15%'
  },
  {
    title: '本月费用',
    value: '¥45,678',
    tag: '正常',
    type: 'success',
    footer: '较上月 -5%'
  }
];

// 待办事项数据
const todoList = [
  {
    type: '年检提醒',
    tagType: 'warning',
    content: '车牌号：鲁H12345 需要进行年度检验',
    deadline: '2024-03-15',
    status: '待处理',
    statusType: 'warning'
  },
  {
    type: '保养提醒',
    tagType: 'info',
    content: '车牌号：鲁H67890 需要进行定期保养',
    deadline: '2024-03-10',
    status: '进行中',
    statusType: 'primary'
  },
  {
    type: '保险到期',
    tagType: 'danger',
    content: '车牌号：鲁H24680 车辆保险即将到期',
    deadline: '2024-03-20',
    status: '待处理',
    statusType: 'warning'
  }
];

// 图表实例
let costChart: echarts.ECharts | null = null;
let usageChart: echarts.ECharts | null = null;
const costChartRef = ref<HTMLElement>();
const usageChartRef = ref<HTMLElement>();

// 初始化费用趋势图表
const initCostChart = () => {
  if (costChartRef.value) {
    costChart = echarts.init(costChartRef.value);
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['燃油费用', '维修费用', '其他费用']
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
          data: [15000, 14000, 16000, 15500, 16500, 17000]
        },
        {
          name: '维修费用',
          type: 'line',
          data: [5000, 6000, 4500, 5500, 6500, 5000]
        },
        {
          name: '其他费用',
          type: 'line',
          data: [2000, 2500, 2300, 2800, 2600, 2400]
        }
      ]
    };
    costChart.setOption(option);
  }
};

// 初始化使用率图表
const initUsageChart = () => {
  if (usageChartRef.value) {
    usageChart = echarts.init(usageChartRef.value);
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '车辆使用状态',
          type: 'pie',
          radius: '50%',
          data: [
            { value: 18, name: '正常使用' },
            { value: 5, name: '维修中' },
            { value: 3, name: '待检验' },
            { value: 2, name: '闲置' }
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
    usageChart.setOption(option);
  }
};

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  costChart?.resize();
  usageChart?.resize();
};

onMounted(() => {
  initCostChart();
  initUsageChart();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  costChart?.dispose();
  usageChart?.dispose();
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.stat-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-value {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #666;
}
.chart-row {
  margin-bottom: 20px;
}
.chart {
  height: 400px;
}
.todo-card {
  margin-bottom: 20px;
}
</style> 