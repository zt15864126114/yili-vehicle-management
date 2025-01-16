<template>
  <div class="driver-list">
    <el-card class="driver-card">
      <template #header>
        <div class="card-header">
          <span>驾驶员管理</span>
          <el-button type="primary" @click="handleAdd">新增驾驶员</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <!-- 搜索表单内容不变 -->
      </el-form>

      <!-- 表格内容区域 -->
      <div class="table-container">
        <el-table 
          :data="paginatedDrivers" 
          style="width: 100%"
          :height="tableHeight"
        >
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
                {{ statusMap[row.status as keyof typeof statusMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row: driver }">
              <el-button type="primary" link @click="handleView(driver)">查看</el-button>
              <el-button type="primary" link @click="handleEdit(driver)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(driver)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 15, 20, 30]"
          :total="filteredDrivers.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
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

    <!-- 添加查看对话框 -->
    <el-dialog
      title="驾驶员详情"
      v-model="viewDialogVisible"
      width="600px"
      class="view-dialog"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">
          {{ currentDriver.name }}
        </el-descriptions-item>
        <el-descriptions-item label="驾驶证号">
          {{ currentDriver.licenseNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ currentDriver.phoneNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="驾龄">
          {{ currentDriver.drivingYears }} 年
        </el-descriptions-item>
        <el-descriptions-item label="驾驶证到期日">
          {{ currentDriver.licenseExpireDate }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentDriver.status)">
            {{ statusMap[currentDriver.status as keyof typeof statusMap] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最近体检日期" :span="2">
          {{ currentDriver.lastPhysicalDate || '暂无记录' }}
        </el-descriptions-item>
        <el-descriptions-item label="驾驶记录" :span="2">
          <el-table :data="currentDriver.drivingRecords || []" style="width: 100%">
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
            <el-table-column prop="mileage" label="行驶里程" width="100">
              <template #default="{ row }">
                {{ row.mileage }} km
              </template>
            </el-table-column>
            <el-table-column prop="route" label="行驶路线" />
          </el-table>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentDriver.remarks || '暂无备注' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="viewDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { Driver, DriverForm } from '@/types/driver';

const currentId = ref<string>('');

// 生成最近半年内的随机日期
const getRandomRecentDate = (months = 6) => {
  const today = new Date();
  const pastDate = new Date(today.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  const randomTime = pastDate.getTime() + Math.random() * (today.getTime() - pastDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

// 生成最近的驾驶记录
const generateRecentDrivingRecords = () => {
  const records = [];
  const routes = [
    '兖州-济南-兖州',
    '兖州-泰安-兖州',
    '兖州-枣庄-兖州',
    '兖州-临沂-兖州',
    '兖州-青岛-兖州',
    '兖州-潍坊-兖州'
  ];
  const vehicles = [
    '鲁H85697', '鲁H67M89', '鲁H2N680', '鲁H1U579',
    '鲁HK7K11', '鲁H9M229', '鲁H3S338', '鲁H4K472'
  ];

  // 生成5条最近的记录
  for(let i = 0; i < 5; i++) {
    records.push({
      date: getRandomRecentDate(1), // 最近一个月的记录
      vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
      mileage: Math.floor(Math.random() * 300) + 100, // 100-400公里
      route: routes[Math.floor(Math.random() * routes.length)]
    });
  }

  // 按日期降序排序
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const drivers = ref(Array.from({ length: 25 }, (_, index) => ({
  id: String(index + 1),
  name: [
    '张志强', '李建国', '王大明', '刘海洋', '赵国强',
    '孙志远', '周建军', '吴海波', '郑光明', '马建设',
    '陈志强', '杨海龙', '徐国庆', '朱建华', '胡志明',
    '冯海涛', '邓建业', '彭海军', '邹国梁', '韩建军',
    '萧志远', '唐海波', '许国强', '范建设', '金海龙'
  ][index],
  licenseNumber: `37280${Math.floor(Math.random() * 2) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  phoneNumber: `1${Math.floor(Math.random() * 5) + 3}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  licenseExpireDate: new Date(new Date().setFullYear(new Date().getFullYear() + Math.floor(Math.random() * 2) + 1)).toISOString().split('T')[0],
  drivingYears: Math.floor(Math.random() * 10) + 5, // 5-15年驾龄
  status: ['available', 'onDuty', 'leave'][Math.floor(Math.random() * 3)],
  remarks: ''
})));
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

// @ts-ignore
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
  Object.assign(driverForm.value, {
    ...driver,
    drivingYears: driver.drivingYears || 0
  });
  dialogVisible.value = true;
};

const handleDelete = (row: Driver) => {
  ElMessage.success('删除成功');
  drivers.value = drivers.value.filter(item => item.id !== row.id);
};

const handleView = (row: any) => {
  currentDriver.value = {
    ...row,
    lastPhysicalDate: getRandomRecentDate(3), // 最近3个月内的体检日期
    drivingRecords: generateRecentDrivingRecords()
  };
  viewDialogVisible.value = true;
};

const handleSubmit = () => {
  if (dialogType.value === 'add') {
    const newDriver = {
      id: String(Date.now()),
      ...driverForm.value,
      drivingYears: driverForm.value.drivingYears || 0,
      remarks: ''
    };
    drivers.value.unshift(newDriver);
    ElMessage.success('新增驾驶员成功');
  } else {
    const index = drivers.value.findIndex(item => item.id === currentId.value);
    if (index !== -1) {
      drivers.value[index] = {
        ...drivers.value[index],
        ...driverForm.value,
        drivingYears: driverForm.value.drivingYears || 0
      };
      ElMessage.success('更新驾驶员信息成功');
    }
  }
  dialogVisible.value = false;
};

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const tableHeight = 'calc(100vh - 330px)';

// 过滤后的数据
const filteredDrivers = computed(() => {
  return drivers.value.filter(driver => {
    const matchName = !searchForm.value.name || 
      driver.name.includes(searchForm.value.name);
    const matchStatus = !searchForm.value.status || 
      driver.status === searchForm.value.status;
    return matchName && matchStatus;
  });
});

// 分页后的数据
const paginatedDrivers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDrivers.value.slice(start, end);
});

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1; // 重置到第一页
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// @ts-ignore
const handleSearch = () => {
  currentPage.value = 1;
};

// @ts-ignore
const resetSearch = () => {
  searchForm.value = {
    name: '',
    status: ''
  };
  currentPage.value = 1;
};

// 搜索表单
const searchForm = ref({
  name: '',
  status: ''
});

// 查看对话框相关
const viewDialogVisible = ref(false);
const currentDriver = ref<{
  name: string;
  licenseNumber: string;
  phoneNumber: string;
  drivingYears: number;
  licenseExpireDate: string;
  status: string;
  lastPhysicalDate: string;
  remarks: string;
  drivingRecords: Array<{
    date: string;
    vehicleNumber: string;
    mileage: number;
    route: string;
  }>;
}>({
  name: '',
  licenseNumber: '',
  phoneNumber: '',
  drivingYears: 0,
  licenseExpireDate: '',
  status: '',
  lastPhysicalDate: '',
  remarks: '',
  drivingRecords: []
});

// 状态映射
const statusMap = {
  available: '可用',
  onDuty: '在岗',
  leave: '请假'
} as const;
</script>

<style scoped>
.driver-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.driver-card {
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.table-container {
  flex: 1;
  overflow: hidden;
}

.pagination-container {
  padding: 15px 0;
  background-color: white;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__body) {
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
}

.view-dialog {
  :deep(.el-descriptions__label) {
    width: 120px;
    justify-content: flex-end;
  }
  
  :deep(.el-descriptions__content) {
    padding: 8px 12px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 