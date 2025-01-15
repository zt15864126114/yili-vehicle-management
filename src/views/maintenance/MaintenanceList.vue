<template>
  <div class="maintenance-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维修保养记录管理</span>
          <el-button type="primary" @click="handleAdd">新增维修记录</el-button>
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
        <el-form-item label="维修类型">
          <el-select v-model="searchForm.maintenanceType" placeholder="请选择类型" clearable>
            <el-option label="定期保养" value="定期保养" />
            <el-option label="故障维修" value="故障维修" />
            <el-option label="轮胎更换" value="轮胎更换" />
            <el-option label="油液更换" value="油液更换" />
            <el-option label="制动系统维修" value="制动系统维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修日期">
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

      <!-- 数据表格 -->
      <el-table :data="filteredRecords" border>
        <el-table-column prop="id" label="记录编号" width="100" />
        <el-table-column label="车牌号" width="120">
          <template #default="{ row }">
            {{ getVehiclePlateNumber(row.vehicleId) }}
          </template>
        </el-table-column>
        <el-table-column prop="maintenanceType" label="维修类型" width="120" />
        <el-table-column prop="maintenanceDate" label="维修日期" width="120" />
        <el-table-column prop="cost" label="维修费用" width="120">
          <template #default="{ row }">
            ¥{{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="garage" label="维修厂" width="150" />
        <el-table-column prop="description" label="维修内容" show-overflow-tooltip />
        <el-table-column prop="nextMaintenanceDate" label="下次保养日期" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
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
      :title="dialogType === 'add' ? '新增维修记录' : '编辑维修记录'"
      width="600px"
    >
      <el-form :model="maintenanceForm" label-width="100px">
        <el-form-item label="车辆">
          <el-select v-model="maintenanceForm.vehicleId" placeholder="请选择车辆">
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="maintenanceForm.maintenanceType" placeholder="请选择类型">
            <el-option label="定期保养" value="定期保养" />
            <el-option label="故障维修" value="故障维修" />
            <el-option label="轮胎更换" value="轮胎更换" />
            <el-option label="油液更换" value="油液更换" />
            <el-option label="制动系统维修" value="制动系统维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修日期">
          <el-date-picker
            v-model="maintenanceForm.maintenanceDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="维修费用">
          <el-input-number
            v-model="maintenanceForm.cost"
            :min="0"
            :precision="2"
            :step="100"
          />
        </el-form-item>
        <el-form-item label="维修厂">
          <el-input v-model="maintenanceForm.garage" />
        </el-form-item>
        <el-form-item label="维修内容">
          <el-input
            v-model="maintenanceForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="下次保养日期">
          <el-date-picker
            v-model="maintenanceForm.nextMaintenanceDate"
            type="date"
            placeholder="选择日期"
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
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { MaintenanceRecord } from '@/types/record';
import maintenanceRecordData from '@/mock/maintenanceRecord';
import vehicleData from '@/mock/vehicle';

const records = ref<MaintenanceRecord[]>([]);
const vehicles = ref(vehicleData.vehicles);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');

// 搜索表单
const searchForm = reactive({
  vehicleId: '',
  maintenanceType: '',
  dateRange: [] as string[]
});

// 维修表单
const maintenanceForm = reactive({
  id: '',
  vehicleId: '',
  maintenanceType: '',
  maintenanceDate: '',
  cost: 0,
  garage: '',
  description: '',
  nextMaintenanceDate: '',
  status: 'pending'
});

// 根据搜索条件过滤记录
const filteredRecords = computed(() => {
  return records.value.filter(record => {
    const matchVehicle = !searchForm.vehicleId || record.vehicleId === searchForm.vehicleId;
    const matchType = !searchForm.maintenanceType || record.maintenanceType === searchForm.maintenanceType;
    let matchDate = true;
    if (searchForm.dateRange?.length === 2) {
      const recordDate = new Date(record.maintenanceDate);
      const startDate = new Date(searchForm.dateRange[0]);
      const endDate = new Date(searchForm.dateRange[1]);
      matchDate = recordDate >= startDate && recordDate <= endDate;
    }
    return matchVehicle && matchType && matchDate;
  });
});

// 获取车牌号
const getVehiclePlateNumber = (id: string) => {
  const vehicle = vehicles.value.find((v: { id: string }) => v.id === id);
  return vehicle ? vehicle.plateNumber : '-';
};

// 获取状态样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'info',
    processing: 'warning',
    completed: 'success'
  };
  return map[status];
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '维修中',
    completed: '已完成'
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
    maintenanceType: '',
    dateRange: []
  });
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  Object.assign(maintenanceForm, {
    id: '',
    vehicleId: '',
    maintenanceType: '',
    maintenanceDate: '',
    cost: 0,
    garage: '',
    description: '',
    nextMaintenanceDate: '',
    status: 'pending'
  });
};

// 处理编辑
const handleEdit = (row: MaintenanceRecord) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  Object.assign(maintenanceForm, row);
};

// 处理删除
const handleDelete = (row: MaintenanceRecord) => {
  ElMessageBox.confirm('确定要删除该维修记录吗？', '提示', {
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
      ...maintenanceForm,
      id: String(records.value.length + 1)
    };
    records.value.unshift(newRecord);
    ElMessage.success('新增维修记录成功');
  } else {
    const index = records.value.findIndex(item => item.id === maintenanceForm.id);
    if (index !== -1) {
      records.value[index] = { ...maintenanceForm };
      ElMessage.success('更新维修记录成功');
    }
  }
  dialogVisible.value = false;
};

// 初始化数据
records.value = maintenanceRecordData.records;
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