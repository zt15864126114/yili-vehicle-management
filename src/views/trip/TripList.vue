<template>
  <div class="trip-list">
    <el-card class="trip-card">
      <template #header>
        <div class="card-header">
          <span>出车记录</span>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.vehicleNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="驾驶员">
          <el-input v-model="searchForm.driverName" placeholder="请输入驾驶员姓名" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="出车日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格内容区域 -->
      <div class="table-container">
        <el-table 
          :data="paginatedTrips" 
          style="width: 100%"
          :height="tableHeight"
        >
          <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
          <el-table-column prop="driverName" label="驾驶员" width="100" />
          <el-table-column prop="departureTime" label="出车时间" width="160" />
          <el-table-column prop="returnTime" label="返回时间" width="160" />
          <el-table-column prop="mileage" label="行驶里程" width="100">
            <template #default="{ row }">
              {{ row.mileage }} km
            </template>
          </el-table-column>
          <el-table-column prop="route" label="行驶路线" min-width="200" />
          <el-table-column prop="purpose" label="用途" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ statusMap[row.status as keyof typeof statusMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
          :total="filteredTrips.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 添加新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增出车记录' : '编辑出车记录'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
        style="max-height: 60vh; overflow-y: auto;"
      >
        <el-form-item label="车辆" prop="vehicleId">
          <el-select
            v-model="formData.vehicleId"
            placeholder="请选择车辆"
            style="width: 100%"
            @change="handleVehicleChange"
          >
            <el-option
              v-for="vehicle in availableVehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="驾驶员" prop="driverId">
          <el-select
            v-model="formData.driverId"
            placeholder="请选择驾驶员"
            style="width: 100%"
            @change="handleDriverChange"
          >
            <el-option
              v-for="driver in availableDrivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="出发时间" prop="departureTime">
          <el-date-picker
            v-model="formData.departureTime"
            type="datetime"
            placeholder="选择出发时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="预计返回" prop="returnTime">
          <el-date-picker
            v-model="formData.returnTime"
            type="datetime"
            placeholder="选择预计返回时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
            :disabled-date="disabledDate"
          />
        </el-form-item>

        <el-form-item label="预计里程" prop="mileage">
          <el-input-number
            v-model="formData.mileage"
            :min="1"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="行驶路线" prop="route">
          <el-input v-model="formData.route" placeholder="请输入行驶路线" />
        </el-form-item>

        <el-form-item label="用途" prop="purpose">
          <el-select v-model="formData.purpose" placeholder="请选择用途" style="width: 100%">
            <el-option label="原料运输" value="原料运输" />
            <el-option label="成品配送" value="成品配送" />
            <el-option label="设备维修" value="设备维修" />
            <el-option label="客户接待" value="客户接待" />
            <el-option label="商务出差" value="商务出差" />
            <el-option label="货物配送" value="货物配送" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="formData.remarks"
            type="textarea"
            rows="3"
            placeholder="请输入备注信息"
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
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { TripRecord } from '@/types/record';

// 搜索表单
const searchForm = ref({
  vehicleNumber: '',
  driverName: '',
  status: '',
  dateRange: []
});

// 状态映射
const statusMap = {
  ongoing: '进行中',
  completed: '已完成',
  cancelled: '已取消'
} as const;

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    ongoing: 'primary',
    completed: 'success',
    cancelled: 'info'
  };
  return typeMap[status] || 'info';
};

// 生成示例数据
const generateTrips = () => {
  const vehicles = [
    '鲁H85697', '鲁H67M89', '鲁H2N680', '鲁H1U579',
    '鲁HK7K11', '鲁H9M229', '鲁H3S338', '鲁H4K472'
  ];
  const drivers = [
    '张志强', '李建国', '王大明', '刘海洋', '赵国强',
    '孙志远', '周建军', '吴海波', '郑光明', '马建设'
  ];
  const routes = [
    '兖州-济南-兖州',
    '兖州-泰安-兖州',
    '兖州-枣庄-兖州',
    '兖州-临沂-兖州',
    '兖州-青岛-兖州',
    '兖州-潍坊-兖州'
  ];
  const purposes = [
    '原料运输',
    '成品配送',
    '设备维修',
    '客户接待',
    '商务出差',
    '货物配送'
  ];

  return Array.from({ length: 50 }, (_, index) => {
    const departureTime = getRandomRecentDate(1);
    const returnTime = new Date(new Date(departureTime).getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
    
    return {
      id: String(index + 1),
      vehicleId: String(Math.floor(Math.random() * 8) + 1),
      vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
      driverId: String(Math.floor(Math.random() * 10) + 1),
      driverName: drivers[Math.floor(Math.random() * drivers.length)],
      departureTime: departureTime.replace('T', ' '),
      returnTime: returnTime,
      mileage: Math.floor(Math.random() * 300) + 100,
      route: routes[Math.floor(Math.random() * routes.length)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      status: ['ongoing', 'completed', 'completed', 'completed', 'cancelled'][Math.floor(Math.random() * 5)],
      remarks: ''
    };
  });
};

// 生成最近日期
const getRandomRecentDate = (months = 1) => {
  const today = new Date();
  const pastDate = new Date(today.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  const randomTime = pastDate.getTime() + Math.random() * (today.getTime() - pastDate.getTime());
  return new Date(randomTime).toISOString().slice(0, 16);
};

// 出车记录数据
const trips = ref(generateTrips());

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const tableHeight = 'calc(100vh - 330px)';

// 过滤后的数据
const filteredTrips = computed(() => {
  return trips.value.filter(trip => {
    const matchVehicle = !searchForm.value.vehicleNumber || 
      trip.vehicleNumber.includes(searchForm.value.vehicleNumber);
    const matchDriver = !searchForm.value.driverName || 
      trip.driverName.includes(searchForm.value.driverName);
    const matchStatus = !searchForm.value.status || 
      trip.status === searchForm.value.status;
    
    let matchDate = true;
    if (searchForm.value.dateRange?.length === 2) {
      const tripDate = trip.departureTime.split(' ')[0];
      matchDate = tripDate >= (searchForm.value.dateRange[0] as string) && 
                 tripDate <= (searchForm.value.dateRange[1] as string);
    }
    
    return matchVehicle && matchDriver && matchStatus && matchDate;
  }).sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
});

// 分页后的数据
const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredTrips.value.slice(start, end);
});

// 处理每页显示数量变化
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

// 处理页码变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    vehicleNumber: '',
    driverName: '',
    status: '',
    dateRange: []
  };
  currentPage.value = 1;
};

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();

// 表单数据
const formData = ref<Omit<TripRecord, 'id'>>({
  vehicleId: '',
  vehicleNumber: '',
  driverId: '',
  driverName: '',
  departureTime: '',
  returnTime: '',
  mileage: 0,
  route: '',
  purpose: '',
  status: 'ongoing',
  remarks: ''
});

// 表单验证规则
const rules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  driverId: [{ required: true, message: '请选择驾驶员', trigger: 'change' }],
  departureTime: [{ required: true, message: '请选择出发时间', trigger: 'change' }],
  returnTime: [{ required: true, message: '请选择返回时间', trigger: 'change' }],
  mileage: [{ required: true, message: '请输入预计里程', trigger: 'blur' }],
  route: [{ required: true, message: '请输入行驶路线', trigger: 'blur' }],
  purpose: [{ required: true, message: '请选择用途', trigger: 'change' }]
};

// 可用车辆列表
const availableVehicles = ref([
  { id: '1', plateNumber: '鲁H85697' },
  { id: '2', plateNumber: '鲁H67M89' },
  { id: '3', plateNumber: '鲁H2N680' },
  { id: '4', plateNumber: '鲁H1U579' },
  { id: '5', plateNumber: '鲁HK7K11' },
  { id: '6', plateNumber: '鲁H9M229' },
  { id: '7', plateNumber: '鲁H3S338' },
  { id: '8', plateNumber: '鲁H4K472' }
]);

// 可用驾驶员列表
const availableDrivers = ref([
  { id: '1', name: '张志强' },
  { id: '2', name: '李建国' },
  { id: '3', name: '王大明' },
  { id: '4', name: '刘海洋' },
  { id: '5', name: '赵国强' },
  { id: '6', name: '孙志远' },
  { id: '7', name: '周建军' },
  { id: '8', name: '吴海波' },
  { id: '9', name: '郑光明' },
  { id: '10', name: '马建设' }
]);

// 处理车辆选择变化
const handleVehicleChange = (vehicleId: string) => {
  const vehicle = availableVehicles.value.find(v => v.id === vehicleId);
  if (vehicle) {
    formData.value.vehicleNumber = vehicle.plateNumber;
  }
};

// 处理驾驶员选择变化
const handleDriverChange = (driverId: string) => {
  const driver = availableDrivers.value.find(d => d.id === driverId);
  if (driver) {
    formData.value.driverName = driver.name;
  }
};

// 禁用日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000;
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  formData.value = {
    vehicleId: '',
    vehicleNumber: '',
    driverId: '',
    driverName: '',
    departureTime: '',
    returnTime: '',
    mileage: 0,
    route: '',
    purpose: '',
    status: 'ongoing',
    remarks: ''
  };
  dialogVisible.value = true;
};

// 添加 currentId
const currentId = ref('');

// 处理编辑
const handleEdit = (row: TripRecord) => {
  currentId.value = row.id;  // 保存当前编辑记录的 id
  dialogType.value = 'edit';
  formData.value = {
    vehicleId: row.vehicleId,
    vehicleNumber: row.vehicleNumber,
    driverId: row.driverId,
    driverName: row.driverName,
    departureTime: row.departureTime,
    returnTime: row.returnTime,
    mileage: row.mileage,
    route: row.route,
    purpose: row.purpose,
    status: row.status,
    remarks: row.remarks
  };
  dialogVisible.value = true;
};

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增记录
        const newTrip = {
          id: String(Date.now()),  // 使用时间戳作为 id
          ...formData.value,
          status: 'ongoing'  // 确保新记录状态为进行中
        };
        trips.value.unshift(newTrip);
        ElMessage.success('新增成功');
      } else {
        // 更新记录
        const index = trips.value.findIndex(item => item.id === currentId.value);
        if (index !== -1) {
          trips.value[index] = {
            ...trips.value[index],
            ...formData.value
          };
          ElMessage.success('更新成功');
        }
      }
      dialogVisible.value = false;
    } else {
      console.log('验证失败', fields);
    }
  });
};

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除该出车记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    trips.value = trips.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};
</script>

<style scoped>
.trip-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.trip-card {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 