<template>
  <div class="driver-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>驾驶员管理</span>
          <el-button type="primary" @click="handleAdd">新增驾驶员</el-button>
        </div>
      </template>

      <el-table :data="drivers" border>
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="licenseNumber" label="驾驶证号" />
        <el-table-column prop="phoneNumber" label="联系电话" />
        <el-table-column prop="licenseExpireDate" label="证件到期日" />
        <el-table-column prop="drivingYears" label="驾龄">
          <template #default="{ row }">
            {{ row.drivingYears }}年
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" @click="handleViewRecord(row)">行驶记录</el-button>
              <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 驾驶员表单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增驾驶员' : '编辑驾驶员'"
      width="500px"
    >
      <el-form :model="driverForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="driverForm.name" />
        </el-form-item>
        <el-form-item label="驾驶证号">
          <el-input v-model="driverForm.licenseNumber" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="driverForm.phoneNumber" />
        </el-form-item>
        <el-form-item label="证件到期日">
          <el-date-picker
            v-model="driverForm.licenseExpireDate"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="驾龄">
          <el-input-number v-model="driverForm.drivingYears" :min="1" />
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
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { Driver, DriverForm } from '@/types/driver';
import driverData from '@/mock/driver';

const currentId = ref<string>('');

const drivers = ref<Driver[]>([]);
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const driverForm = ref<DriverForm>({
  name: '',
  licenseNumber: '',
  phoneNumber: '',
  licenseExpireDate: '',
  drivingYears: 0,
  status: 'available'
});

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    available: 'success',
    onDuty: 'warning',
    leave: 'info'
  };
  return map[status];
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    available: '空闲',
    onDuty: '在岗',
    leave: '请假'
  };
  return map[status];
};

const handleAdd = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  Object.assign(driverForm.value, {
    name: '',
    licenseNumber: '',
    phoneNumber: '',
    licenseExpireDate: '',
    drivingYears: 0,
    status: 'available'
  });
};

const handleEdit = (driver: Driver) => {
  currentId.value = driver.id;
  Object.assign(driverForm.value, driver);
  dialogVisible.value = true;
};

const handleDelete = (row: Driver) => {
  ElMessage.success('删除成功');
  drivers.value = drivers.value.filter(item => item.id !== row.id);
};

const handleViewRecord = (row: Driver) => {
  // 查看驾驶记录的实现
};

const handleSubmit = () => {
  if (dialogType.value === 'add') {
    const newDriver: Driver = {
      id: String(Date.now()),
      ...driverForm.value
    };
    drivers.value.unshift(newDriver);
    ElMessage.success('新增驾驶员成功');
  } else {
    const index = drivers.value.findIndex(item => item.id === currentId.value);
    if (index !== -1) {
      drivers.value[index] = {
        ...drivers.value[index],
        ...driverForm.value
      };
      ElMessage.success('更新驾驶员信息成功');
    }
  }
  dialogVisible.value = false;
};

const handleView = (driver: Driver) => {
  // 实现查看功能
  console.log('查看驾驶员:', driver);
};

// 初始化数据
drivers.value = driverData.drivers;
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 