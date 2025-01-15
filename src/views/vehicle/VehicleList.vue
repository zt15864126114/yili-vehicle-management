<template>
  <div class="vehicle-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <el-button type="primary" @click="handleAdd">新增车辆</el-button>
        </div>
      </template>

      <el-table :data="vehicles" border>
        <el-table-column prop="plateNumber" label="车牌号" />
        <el-table-column prop="model" label="车型" />
        <el-table-column prop="purchaseDate" label="购置日期" />
        <el-table-column prop="insuranceExpireDate" label="保险到期日" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Vehicle } from '@/types/vehicle';
import vehicleData from '@/mock/vehicle';

const vehicles = ref<Vehicle[]>([]);

onMounted(() => {
  vehicles.value = vehicleData.vehicles;
});

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    normal: 'success',
    maintenance: 'warning',
    scrapped: 'danger'
  };
  return map[status];
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: '正常',
    maintenance: '维修中',
    scrapped: '已报废'
  };
  return map[status];
};

// 处理函数
const handleAdd = () => {
  // 实现新增逻辑
};

const handleEdit = (vehicle: Vehicle) => {
  // 函数实现
};

const handleDelete = (vehicle: Vehicle) => {
  // 函数实现
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 