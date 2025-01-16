<template>
  <div class="maintenance-list">
    <el-card class="maintenance-card">
      <template #header>
        <div class="card-header">
          <span>维修记录</span>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.vehicleNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="维修类型">
          <el-select v-model="searchForm.maintenanceType" placeholder="请选择类型" clearable>
            <el-option label="定期保养" value="regular" />
            <el-option label="故障维修" value="repair" />
            <el-option label="紧急维修" value="emergency" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="待处理" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修日期">
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
          :data="paginatedRecords" 
          style="width: 100%"
          :height="tableHeight"
        >
          <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
          <el-table-column prop="maintenanceType" label="维修类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeTag(row.maintenanceType)">
                {{ maintenanceTypeMap[row.maintenanceType as keyof typeof maintenanceTypeMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="160" />
          <el-table-column prop="endTime" label="结束时间" width="160" />
          <el-table-column prop="location" label="维修地点" width="150" />
          <el-table-column prop="cost" label="维修费用" width="120">
            <template #default="{ row }">
              ¥{{ row.cost.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="items" label="维修项目" min-width="200">
            <template #default="{ row }">
              <el-tag
                v-for="(item, index) in row.items"
                :key="index"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ item }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ statusMap[row.status as keyof typeof statusMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handler" label="经办人" width="100" />
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
          :total="filteredRecords.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增维修记录' : '编辑维修记录'"
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

        <el-form-item label="维修类型" prop="maintenanceType">
          <el-select v-model="formData.maintenanceType" placeholder="请选择维修类型" style="width: 100%">
            <el-option label="定期保养" value="regular" />
            <el-option label="故障维修" value="repair" />
            <el-option label="紧急维修" value="emergency" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="维修地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入维修地点" />
        </el-form-item>

        <el-form-item label="维修费用" prop="cost">
          <el-input-number
            v-model="formData.cost"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="维修项目" prop="items">
          <el-select
            v-model="formData.items"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="请选择或输入维修项目"
            style="width: 100%"
          >
            <el-option
              v-for="item in commonMaintenanceItems"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="进行中" value="ongoing" />
            <el-option label="已完成" value="completed" />
            <el-option label="待处理" value="pending" />
          </el-select>
        </el-form-item>

        <el-form-item label="经办人" prop="handler">
          <el-input v-model="formData.handler" placeholder="请输入经办人" />
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

// 搜索表单
const searchForm = ref({
  vehicleNumber: '',
  maintenanceType: '',
  status: '',
  dateRange: []
});

// 状态映射
const statusMap = {
  ongoing: '进行中',
  completed: '已完成',
  pending: '待处理'
} as const;

// 维修类型映射
const maintenanceTypeMap = {
  regular: '定期保养',
  repair: '故障维修',
  emergency: '紧急维修'
} as const;

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    ongoing: 'primary',
    completed: 'success',
    pending: 'warning'
  };
  return typeMap[status] || 'info';
};

// 获取维修类型标签
const getTypeTag = (type: string) => {
  const typeMap: { [key: string]: string } = {
    regular: 'info',
    repair: 'warning',
    emergency: 'danger'
  };
  return typeMap[type] || 'info';
};

// 常见维修项目
const commonMaintenanceItems = [
  '机油更换',
  '机油滤清器更换',
  '空气滤清器更换',
  '刹车片更换',
  '轮胎更换',
  '电瓶维护',
  '变速箱油更换',
  '冷却液更换',
  '发动机维修',
  '底盘维护',
  '车灯维修',
  '空调维修'
];

// 生成示例数据
const generateMaintenanceRecords = () => {
  const vehicles = [
    '鲁H85697', '鲁H67M89', '鲁H2N680', '鲁H1U579',
    '鲁HK7K11', '鲁H9M229', '鲁H3S338', '鲁H4K472'
  ];
  const locations = [
    '公司维修车间',
    '济宁市汽车维修中心',
    '解放4S店济宁店',
    '东风4S店济宁店',
    '重汽4S店济宁店'
  ];
  const handlers = ['张师傅', '李师傅', '王师傅', '刘师傅', '赵师傅'];

  return Array.from({ length: 50 }, (_, index) => {
    const startTime = getRandomRecentDate(6);
    const endTime = new Date(new Date(startTime).getTime() + Math.random() * 72 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
    const maintenanceItems = commonMaintenanceItems
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    return {
      id: String(index + 1),
      vehicleId: String(Math.floor(Math.random() * 8) + 1),
      vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
      maintenanceType: ['regular', 'repair', 'emergency'][Math.floor(Math.random() * 3)],
      startTime: startTime.replace('T', ' '),
      endTime: endTime,
      location: locations[Math.floor(Math.random() * locations.length)],
      cost: Math.floor(Math.random() * 5000) + 500,
      items: maintenanceItems,
      status: ['ongoing', 'completed', 'completed', 'completed', 'pending'][Math.floor(Math.random() * 5)],
      handler: handlers[Math.floor(Math.random() * handlers.length)],
      remarks: ''
    };
  });
};

// 生成最近日期
const getRandomRecentDate = (months = 6) => {
  const today = new Date();
  const pastDate = new Date(today.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  const randomTime = pastDate.getTime() + Math.random() * (today.getTime() - pastDate.getTime());
  return new Date(randomTime).toISOString().slice(0, 16);
};

// 维修记录数据
const maintenanceRecords = ref(generateMaintenanceRecords());

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const tableHeight = 'calc(100vh - 330px)';

// 过滤后的数据
const filteredRecords = computed(() => {
  return maintenanceRecords.value.filter(record => {
    const matchVehicle = !searchForm.value.vehicleNumber || 
      record.vehicleNumber.includes(searchForm.value.vehicleNumber);
    const matchType = !searchForm.value.maintenanceType || 
      record.maintenanceType === searchForm.value.maintenanceType;
    const matchStatus = !searchForm.value.status || 
      record.status === searchForm.value.status;
    
    let matchDate = true;
    if (searchForm.value.dateRange?.length === 2) {
      const recordDate = record.startTime.split(' ')[0];
      matchDate = recordDate >= (searchForm.value.dateRange[0] as string) && 
                 recordDate <= (searchForm.value.dateRange[1] as string);
    }
    
    return matchVehicle && matchType && matchStatus && matchDate;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
});

// 分页后的数据
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();

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

// 表单数据
const formData = ref({
  vehicleId: '',
  vehicleNumber: '',
  maintenanceType: '',
  startTime: '',
  endTime: '',
  location: '',
  cost: 0,
  items: [],
  status: '',
  handler: '',
  remarks: ''
});

// 表单验证规则
const rules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: ['blur', 'change'] }],
  maintenanceType: [{ required: true, message: '请选择维修类型', trigger: ['blur', 'change'] }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: ['blur', 'change'] }],
  location: [{ required: true, message: '请输入维修地点', trigger: 'blur' }],
  cost: [{ required: true, message: '请输入维修费用', trigger: 'blur' }],
  items: [{ required: true, message: '请选择维修项目', trigger: ['blur', 'change'] }],
  status: [{ required: true, message: '请选择状态', trigger: ['blur', 'change'] }],
  handler: [{ required: true, message: '请输入经办人', trigger: 'blur' }]
};

// 处理车辆选择变化
const handleVehicleChange = (vehicleId: string) => {
  const vehicle = availableVehicles.value.find(v => v.id === vehicleId);
  if (vehicle) {
    formData.value.vehicleNumber = vehicle.plateNumber;
  }
};

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
    maintenanceType: '',
    status: '',
    dateRange: []
  };
  currentPage.value = 1;
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  formData.value = {
    vehicleId: '',
    vehicleNumber: '',
    maintenanceType: '',
    startTime: '',
    endTime: '',
    location: '',
    cost: 0,
    items: [],
    status: 'pending',
    handler: '',
    remarks: ''
  };
  dialogVisible.value = true;
  // 重置表单验证
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 添加 currentId
const currentId = ref('');

// 处理编辑
const handleEdit = (row: any) => {
  currentId.value = row.id;  // 保存当前编辑记录的 id
  dialogType.value = 'edit';
  formData.value = { ...row };
  dialogVisible.value = true;
  // 重置表单验证
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除该维修记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    maintenanceRecords.value = maintenanceRecords.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate((valid: boolean, fields: any) => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增记录
        const newRecord = {
          id: String(Date.now()),
          ...formData.value,
          status: 'pending'
        };
        maintenanceRecords.value.unshift(newRecord);
        ElMessage.success('新增成功');
      } else {
        // 更新记录
        const index = maintenanceRecords.value.findIndex(item => item.id === currentId.value);
        if (index !== -1) {
          maintenanceRecords.value[index] = {
            ...maintenanceRecords.value[index],  // 保留原有的 id
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
</script>

<style scoped>
.maintenance-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.maintenance-card {
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