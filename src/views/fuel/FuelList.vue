<template>
  <div class="fuel-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>加油记录管理</span>
          <el-button type="primary" @click="handleAdd">新增加油记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="车辆">
          <el-select v-model="searchForm.vehicleId" placeholder="请选择车辆" clearable>
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加油站">
          <el-select v-model="searchForm.station" placeholder="请选择加油站" clearable>
            <el-option label="中石化兖州站" value="中石化兖州站" />
            <el-option label="中石油济宁站" value="中石油济宁站" />
            <el-option label="壳牌加油站" value="壳牌加油站" />
            <el-option label="益海嘉里自营站" value="益海嘉里自营站" />
          </el-select>
        </el-form-item>
        <el-form-item label="加油日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 统计卡片 -->
      <div class="statistics-cards">
        <el-card class="stat-card">
          <template #header>本月加油总量</template>
          <div class="stat-value">{{ monthlyStats.totalVolume.toFixed(2) }} L</div>
        </el-card>
        <el-card class="stat-card">
          <template #header>本月加油总费用</template>
          <div class="stat-value">¥{{ monthlyStats.totalCost.toFixed(2) }}</div>
        </el-card>
        <el-card class="stat-card">
          <template #header>本月平均油耗</template>
          <div class="stat-value">{{ monthlyStats.avgConsumption.toFixed(2) }} L/100km</div>
        </el-card>
      </div>

      <!-- 数据表格 -->
      <el-table :data="filteredRecords" border>
        <el-table-column prop="id" label="记录编号" width="100" />
        <el-table-column label="车牌号" width="120">
          <template #default="{ row }">
            {{ getVehiclePlateNumber(row.vehicleId) }}
          </template>
        </el-table-column>
        <el-table-column label="驾驶员" width="100">
          <template #default="{ row }">
            {{ getDriverName(row.driverId) }}
          </template>
        </el-table-column>
        <el-table-column prop="fuelDate" label="加油时间" width="160" />
        <el-table-column prop="fuelType" label="油品" width="100" />
        <el-table-column prop="fuelVolume" label="加油量(L)" width="100" />
        <el-table-column prop="unitPrice" label="单价" width="100">
          <template #default="{ row }">
            ¥{{ row.unitPrice.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="总金额" width="100">
          <template #default="{ row }">
            ¥{{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="station" label="加油站" width="150" />
        <el-table-column prop="currentMileage" label="当前里程" width="120">
          <template #default="{ row }">
            {{ row.currentMileage }}km
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增加油记录' : '编辑加油记录'"
      width="600px"
    >
      <el-form :model="fuelForm" label-width="100px">
        <el-form-item label="车辆">
          <el-select v-model="fuelForm.vehicleId" placeholder="请选择车辆">
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="驾驶员">
          <el-select v-model="fuelForm.driverId" placeholder="请选择驾驶员">
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加油时间">
          <el-date-picker
            v-model="fuelForm.fuelDate"
            type="datetime"
            placeholder="选择时间"
          />
        </el-form-item>
        <el-form-item label="油品">
          <el-select v-model="fuelForm.fuelType" placeholder="请选择油品">
            <el-option label="92#汽油" value="92#汽油" />
            <el-option label="95#汽油" value="95#汽油" />
            <el-option label="98#汽油" value="98#汽油" />
            <el-option label="0#柴油" value="0#柴油" />
          </el-select>
        </el-form-item>
        <el-form-item label="加油量">
          <el-input-number
            v-model="fuelForm.fuelVolume"
            :min="0"
            :precision="2"
            :step="5"
          />
        </el-form-item>
        <el-form-item label="单价">
          <el-input-number
            v-model="fuelForm.unitPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            @change="calculateCost"
          />
        </el-form-item>
        <el-form-item label="总金额">
          <el-input-number
            v-model="fuelForm.cost"
            :min="0"
            :precision="2"
            :step="10"
            disabled
          />
        </el-form-item>
        <el-form-item label="加油站">
          <el-select v-model="fuelForm.station" placeholder="请选择加油站">
            <el-option label="中石化兖州站" value="中石化兖州站" />
            <el-option label="中石油济宁站" value="中石油济宁站" />
            <el-option label="壳牌加油站" value="壳牌加油站" />
            <el-option label="益海嘉里自营站" value="益海嘉里自营站" />
          </el-select>
        </el-form-item>
        <el-form-item label="当前里程">
          <el-input-number
            v-model="fuelForm.currentMileage"
            :min="0"
            :step="100"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FuelRecord } from '@/types/record';
import fuelRecordData from '@/mock/fuelRecord';
import vehicleData from '@/mock/vehicle';
import driverData from '@/mock/driver';

const records = ref<FuelRecord[]>([]);
const vehicles = ref(vehicleData.vehicles);
const drivers = ref(driverData.drivers);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');

// 搜索表单
const searchForm = reactive({
  vehicleId: '',
  station: '',
  dateRange: [] as string[]
});

// 加油表单
const fuelForm = reactive({
  id: '',
  vehicleId: '',
  driverId: '',
  fuelDate: '',
  fuelType: '',
  fuelVolume: 0,
  unitPrice: 0,
  cost: 0,
  station: '',
  currentMileage: 0
});

// 计算总金额
const calculateCost = () => {
  fuelForm.cost = Number((fuelForm.fuelVolume * fuelForm.unitPrice).toFixed(2));
};

// 监听加油量变化，自动计算总金额
watch(() => fuelForm.fuelVolume, calculateCost);

// 月度统计数据
const monthlyStats = computed(() => {
  const now = new Date();
  const thisMonth = records.value.filter(record => {
    const recordDate = new Date(record.fuelDate);
    return recordDate.getMonth() === now.getMonth() &&
           recordDate.getFullYear() === now.getFullYear();
  });

  const totalVolume = thisMonth.reduce((sum, record) => sum + record.fuelVolume, 0);
  const totalCost = thisMonth.reduce((sum, record) => sum + record.cost, 0);
  const avgConsumption = totalVolume / (thisMonth.length || 1);

  return {
    totalVolume,
    totalCost,
    avgConsumption
  };
});

// 根据搜索条件过滤记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    const matchVehicle = !searchForm.vehicleId || record.vehicleId === searchForm.vehicleId;
    const matchStation = !searchForm.station || record.station === searchForm.station;
    let matchDate = true;
    if (searchForm.dateRange?.length === 2) {
      const recordDate = new Date(record.fuelDate);
      const startDate = new Date(searchForm.dateRange[0]);
      const endDate = new Date(searchForm.dateRange[1]);
      matchDate = recordDate >= startDate && recordDate <= endDate;
    }
    return matchVehicle && matchStation && matchDate;
  });
});

// 获取车牌号
const getVehiclePlateNumber = (id: string) => {
  const vehicle = vehicles.value.find((v: { id: string }) => v.id === id);
  return vehicle ? vehicle.plateNumber : '-';
};

// 获取驾驶员姓名
const getDriverName = (id: string) => {
  const driver = drivers.value.find((d: { id: string }) => d.id === id);
  return driver ? driver.name : '-';
};

// 处理搜索
const handleSearch = () => {
  // 实际项目中这里会调用API
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    vehicleId: '',
    station: '',
    dateRange: []
  });
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  Object.assign(fuelForm, {
    id: '',
    vehicleId: '',
    driverId: '',
    fuelDate: '',
    fuelType: '',
    fuelVolume: 0,
    unitPrice: 0,
    cost: 0,
    station: '',
    currentMileage: 0
  });
};

// 处理编辑
const handleEdit = (row: FuelRecord) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  Object.assign(fuelForm, row);
};

// 处理删除
const handleDelete = (row: FuelRecord) => {
  ElMessageBox.confirm('确定要删除该加油记录吗？', '提示', {
    type: 'warning'
  }).then(() => {
    records.value = records.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};

// 处理提交
const handleSubmit = () => {
  if (dialogType.value === 'add') {
    const newRecord = {
      ...fuelForm,
      id: String(records.value.length + 1)
    };
    records.value.unshift(newRecord);
    ElMessage.success('新增加油记录成功');
  } else {
    const index = records.value.findIndex(item => item.id === fuelForm.id);
    if (index !== -1) {
      records.value[index] = { ...fuelForm };
      ElMessage.success('更新加油记录成功');
    }
  }
  dialogVisible.value = false;
};

// 初始化数据
records.value = fuelRecordData.records;
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
}
.statistics-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.stat-card {
  flex: 1;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 