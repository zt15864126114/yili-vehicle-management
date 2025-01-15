<template>
  <div class="trip-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>出车记录管理</span>
          <el-button type="primary" @click="handleAdd">新增出车记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="车牌号">
          <el-select v-model="searchForm.vehicleId" placeholder="请选择车辆" clearable>
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="驾驶员">
          <el-select v-model="searchForm.driverId" placeholder="请选择驾驶员" clearable>
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

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
        <el-table-column prop="startTime" label="出发时间" width="160" />
        <el-table-column prop="endTime" label="返回时间" width="160" />
        <el-table-column prop="destination" label="目的地" />
        <el-table-column prop="purpose" label="用途" />
        <el-table-column prop="mileage" label="里程(km)" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button 
                type="primary" 
                :disabled="row.status !== 'ongoing'"
                @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button 
                type="danger" 
                :disabled="row.status !== 'ongoing'"
                @click="handleCancel(row)"
              >
                取消
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="'新增出车记录'"
      width="600px"
    >
      <el-form :model="tripForm" label-width="100px">
        <el-form-item label="车辆">
          <el-select v-model="tripForm.vehicleId" placeholder="请选择车辆">
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="驾驶员">
          <el-select v-model="tripForm.driverId" placeholder="请选择驾驶员">
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="出发时间">
          <el-date-picker
            v-model="tripForm.startTime"
            type="datetime"
            placeholder="选择出发时间"
          />
        </el-form-item>
        <el-form-item label="目的地">
          <el-input v-model="tripForm.destination" />
        </el-form-item>
        <el-form-item label="用途">
          <el-select v-model="tripForm.purpose" placeholder="请选择用途">
            <el-option label="货物运输" value="货物运输" />
            <el-option label="员工接送" value="员工接送" />
            <el-option label="商务用车" value="商务用车" />
            <el-option label="其他" value="其他" />
          </el-select>
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
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { TripRecord } from '@/types/record';
import tripRecordData from '@/mock/tripRecord';
import vehicleData from '@/mock/vehicle';
import driverData from '@/mock/driver';

const records = ref<TripRecord[]>([]);
const vehicles = ref(vehicleData.vehicles);
const drivers = ref(driverData.drivers);
const dialogVisible = ref(false);

// 搜索表单
const searchForm = reactive({
  vehicleId: '',
  driverId: '',
  status: ''
});

// 新增表单
const tripForm = reactive({
  vehicleId: '',
  driverId: '',
  startTime: '',
  destination: '',
  purpose: ''
});

// 根据搜索条件过滤记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    const matchVehicle = !searchForm.vehicleId || record.vehicleId === searchForm.vehicleId;
    const matchDriver = !searchForm.driverId || record.driverId === searchForm.driverId;
    const matchStatus = !searchForm.status || record.status === searchForm.status;
    return matchVehicle && matchDriver && matchStatus;
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

// 获取状态样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    ongoing: 'warning',
    completed: 'success',
    cancelled: 'info'
  };
  return map[status];
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  };
  return map[status];
};

// 处理搜索
const handleSearch = () => {
  // 实际项目中这里会调用API
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    vehicleId: '',
    driverId: '',
    status: ''
  });
};

// 处理新增
const handleAdd = () => {
  dialogVisible.value = true;
  Object.assign(tripForm, {
    vehicleId: '',
    driverId: '',
    startTime: '',
    destination: '',
    purpose: ''
  });
};

// 处理完成
const handleComplete = (row: TripRecord) => {
  row.status = 'completed';
  row.endTime = new Date().toISOString();
  ElMessage.success('出车记录已完成');
};

// 处理取消
const handleCancel = (row: TripRecord) => {
  row.status = 'cancelled';
  ElMessage.success('出车记录已取消');
};

// 处理提交
const handleSubmit = () => {
  const newRecord = {
    ...tripForm,
    id: String(records.value.length + 1),
    status: 'ongoing' as const,
    mileage: 0,
    endTime: ''
  };
  records.value.unshift(newRecord);
  dialogVisible.value = false;
  ElMessage.success('新增出车记录成功');
};

// 初始化数据
records.value = tripRecordData.records;
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 