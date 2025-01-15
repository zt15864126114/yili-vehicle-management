<template>
  <div class="inspection-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>年检记录管理</span>
          <el-button type="primary" @click="handleAdd">新增年检记录</el-button>
        </div>
      </template>

      <!-- 提醒卡片 -->
      <el-alert
        v-if="upcomingInspections.length > 0"
        type="warning"
        :closable="false"
        class="alert-box"
      >
        <template #title>
          <div class="alert-title">
            有 {{ upcomingInspections.length }} 辆车即将到期年检
            <el-button type="primary" link @click="showUpcomingDialog = true">
              查看详情
            </el-button>
          </div>
        </template>
      </el-alert>

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
        <el-form-item label="检测站">
          <el-select v-model="searchForm.station" placeholder="请选择检测站" clearable>
            <el-option label="兖州车管所" value="兖州车管所" />
            <el-option label="济宁市车管所" value="济宁市车管所" />
            <el-option label="邹城检测站" value="邹城检测站" />
            <el-option label="曲阜检测站" value="曲阜检测站" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测结果">
          <el-select v-model="searchForm.result" placeholder="请选择结果" clearable>
            <el-option label="通过" value="pass" />
            <el-option label="未通过" value="fail" />
            <el-option label="待检" value="pending" />
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
        <el-table-column prop="inspectionDate" label="检测日期" width="120" />
        <el-table-column prop="nextInspectionDate" label="下次年检日期" width="120" />
        <el-table-column prop="station" label="检测站" width="150" />
        <el-table-column prop="inspector" label="检测员" width="100" />
        <el-table-column prop="items" label="检测项目">
          <template #default="{ row }">
            <el-tag
              v-for="item in row.items"
              :key="item"
              size="small"
              class="mx-1"
            >
              {{ item }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="检测费用" width="100">
          <template #default="{ row }">
            ¥{{ row.cost.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="result" label="检测结果" width="100">
          <template #default="{ row }">
            <el-tag :type="getResultType(row.result)">
              {{ getResultText(row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handleViewReport(row)">查看报告</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增年检记录' : '编辑年检记录'"
      width="600px"
    >
      <el-form :model="inspectionForm" label-width="100px">
        <el-form-item label="车辆">
          <el-select v-model="inspectionForm.vehicleId" placeholder="请选择车辆">
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="检测日期">
          <el-date-picker
            v-model="inspectionForm.inspectionDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="下次年检日期">
          <el-date-picker
            v-model="inspectionForm.nextInspectionDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="检测站">
          <el-select v-model="inspectionForm.station" placeholder="请选择检测站">
            <el-option label="兖州车管所" value="兖州车管所" />
            <el-option label="济宁市车管所" value="济宁市车管所" />
            <el-option label="邹城检测站" value="邹城检测站" />
            <el-option label="曲阜检测站" value="曲阜检测站" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测项目">
          <el-checkbox-group v-model="inspectionForm.items">
            <el-checkbox label="尾气检测" />
            <el-checkbox label="制动性能" />
            <el-checkbox label="灯光检测" />
            <el-checkbox label="车辆外观" />
            <el-checkbox label="安全装置" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="检测费用">
          <el-input-number
            v-model="inspectionForm.cost"
            :min="0"
            :precision="2"
            :step="100"
          />
        </el-form-item>
        <el-form-item label="检测员">
          <el-input v-model="inspectionForm.inspector" />
        </el-form-item>
        <el-form-item label="检测结果">
          <el-select v-model="inspectionForm.result" placeholder="请选择结果">
            <el-option label="通过" value="pass" />
            <el-option label="未通过" value="fail" />
            <el-option label="待检" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="inspectionForm.remarks"
            type="textarea"
            :rows="3"
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

    <!-- 即将到期年检提醒对话框 -->
    <el-dialog
      v-model="showUpcomingDialog"
      title="即将到期年检车辆"
      width="800px"
    >
      <el-table :data="upcomingInspections" border>
        <el-table-column label="车牌号">
          <template #default="{ row }">
            {{ getVehiclePlateNumber(row.vehicleId) }}
          </template>
        </el-table-column>
        <el-table-column prop="nextInspectionDate" label="年检到期日" />
        <el-table-column label="剩余天数">
          <template #default="{ row }">
            {{ getDaysUntilInspection(row.nextInspectionDate) }}天
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" @click="handleAddInspection(row)">
              创建年检记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import inspectionRecordData from '@/mock/inspectionRecord';
import vehicleData from '@/mock/vehicle';

const records = ref(inspectionRecordData.records);
const vehicles = ref(vehicleData.vehicles);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const showUpcomingDialog = ref(false);

// 搜索表单
const searchForm = reactive({
  vehicleId: '',
  station: '',
  result: ''
});

// 年检表单
const inspectionForm = reactive({
  id: '',
  vehicleId: '',
  inspectionDate: '',
  nextInspectionDate: '',
  station: '',
  items: [] as string[],
  cost: 0,
  inspector: '',
  result: '',
  remarks: ''
});

// 获取即将到期的年检记录
const upcomingInspections = computed(() => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return records.value.filter((record: { nextInspectionDate: string }) => {
    const nextInspectionDate = new Date(record.nextInspectionDate);
    return nextInspectionDate <= thirtyDaysFromNow && nextInspectionDate >= new Date();
  });
});

// 根据搜索条件过滤记录
const filteredRecords = computed(() => {
  return records.value.filter((record: { vehicleId: string; station: string; result: string }) => {
    const matchVehicle = !searchForm.vehicleId || record.vehicleId === searchForm.vehicleId;
    const matchStation = !searchForm.station || record.station === searchForm.station;
    const matchResult = !searchForm.result || record.result === searchForm.result;
    return matchVehicle && matchStation && matchResult;
  });
});

// 获取车牌号
const getVehiclePlateNumber = (id: string) => {
  const vehicle = vehicles.value.find((v: { id: string }) => v.id === id);
  return vehicle ? vehicle.plateNumber : '-';
};

// 获取状态样式
const getResultType = (result: string) => {
  const map: Record<string, string> = {
    pass: 'success',
    fail: 'danger',
    pending: 'warning'
  };
  return map[result];
};

// 获取状态文本
const getResultText = (result: string) => {
  const map: Record<string, string> = {
    pass: '通过',
    fail: '未通过',
    pending: '待检'
  };
  return map[result];
};

// 计算距离年检天数
const getDaysUntilInspection = (date: string) => {
  const nextDate = new Date(date);
  const today = new Date();
  const diffTime = nextDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    result: ''
  });
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  Object.assign(inspectionForm, {
    id: '',
    vehicleId: '',
    inspectionDate: '',
    nextInspectionDate: '',
    station: '',
    items: [],
    cost: 0,
    inspector: '',
    result: '',
    remarks: ''
  });
};

// 处理编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  Object.assign(inspectionForm, row);
};

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该年检记录吗？', '提示', {
    type: 'warning'
  }).then(() => {
    records.value = records.value.filter((item: { id: string }) => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};

// 查看报告
const handleViewReport = (row: any) => {
  ElMessage.info('查看报告功能开发中...');
};

// 从提醒创建年检记录
const handleAddInspection = (row: any) => {
  handleAdd();
  inspectionForm.vehicleId = row.vehicleId;
};

// 处理提交
const handleSubmit = () => {
  if (dialogType.value === 'add') {
    const newRecord = {
      ...inspectionForm,
      id: String(records.value.length + 1)
    };
    records.value.unshift(newRecord);
    ElMessage.success('新增年检记录成功');
  } else {
    const index = records.value.findIndex((item: { id: string }) => item.id === inspectionForm.id);
    if (index !== -1) {
      records.value[index] = { ...inspectionForm };
      ElMessage.success('更新年检记录成功');
    }
  }
  dialogVisible.value = false;
};

// 修改函数定义，删除未使用的 row 参数
const handleView = (record: any) => {
  // 实现查看功能
  console.log('查看记录:', record);
};
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
.alert-box {
  margin-bottom: 20px;
}
.alert-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.mx-1 {
  margin: 0 4px;
}
</style> 