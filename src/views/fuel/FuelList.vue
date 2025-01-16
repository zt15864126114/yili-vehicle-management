<template>
  <div class="fuel-list">
    <el-card class="fuel-card">
      <template #header>
        <div class="card-header">
          <span>加油记录</span>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.vehicleNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="加油类型">
          <el-select v-model="searchForm.fuelType" placeholder="请选择类型" clearable>
            <el-option label="汽油" value="gasoline" />
            <el-option label="柴油" value="diesel" />
          </el-select>
        </el-form-item>
        <el-form-item label="加油日期">
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
          <el-table-column prop="fuelTime" label="加油时间" width="160" />
          <el-table-column prop="fuelType" label="油品类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.fuelType === 'gasoline' ? 'success' : 'warning'">
                {{ fuelTypeMap[row.fuelType as keyof typeof fuelTypeMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="volume" label="加油量" width="100">
            <template #default="{ row }">
              {{ row.volume }}L
            </template>
          </el-table-column>
          <el-table-column prop="unitPrice" label="单价" width="100">
            <template #default="{ row }">
              ¥{{ row.unitPrice.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="总金额" width="120">
            <template #default="{ row }">
              ¥{{ row.cost.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="currentMileage" label="当前里程" width="120">
            <template #default="{ row }">
              {{ row.currentMileage }}km
            </template>
          </el-table-column>
          <el-table-column prop="location" label="加油站" min-width="180" />
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
      :title="dialogType === 'add' ? '新增加油记录' : '编辑加油记录'"
      v-model="dialogVisible"
      width="500px"
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

        <el-form-item label="加油时间" prop="fuelTime">
          <el-date-picker
            v-model="formData.fuelTime"
            type="datetime"
            placeholder="选择加油时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="油品类型" prop="fuelType">
          <el-select v-model="formData.fuelType" placeholder="请选择油品类型" style="width: 100%">
            <el-option label="汽油" value="gasoline" />
            <el-option label="柴油" value="diesel" />
          </el-select>
        </el-form-item>

        <el-form-item label="加油量" prop="volume">
          <el-input-number
            v-model="formData.volume"
            :min="1"
            :precision="2"
            :step="10"
            style="width: 100%"
            @change="calculateCost"
          />
        </el-form-item>

        <el-form-item label="单价" prop="unitPrice">
          <el-input-number
            v-model="formData.unitPrice"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
            @change="calculateCost"
          />
        </el-form-item>

        <el-form-item label="总金额" prop="cost">
          <el-input-number
            v-model="formData.cost"
            :min="0"
            :precision="2"
            :step="10"
            style="width: 100%"
            disabled
          />
        </el-form-item>

        <el-form-item label="当前里程" prop="currentMileage">
          <el-input-number
            v-model="formData.currentMileage"
            :min="0"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="加油站" prop="location">
          <el-input v-model="formData.location" placeholder="请输入加油站名称" />
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
  fuelType: '',
  dateRange: []
});

// 油品类型映射
const fuelTypeMap = {
  gasoline: '汽油',
  diesel: '柴油'
} as const;

// 生成示例数据
const generateFuelRecords = () => {
  const vehicles = [
    '鲁H85697', '鲁H67M89', '鲁H2N680', '鲁H1U579',
    '鲁HK7K11', '鲁H9M229', '鲁H3S338', '鲁H4K472'
  ];
  const locations = [
    '中国石化兖州第一加油站',
    '中国石油兖州西加油站',
    '中国石化兖州南加油站',
    '中国石油兖州北加油站',
    '壳牌兖州加油站'
  ];
  const handlers = ['张明', '李强', '王华', '赵伟', '刘勇'];

  return Array.from({ length: 50 }, (_, index) => {
    const fuelType = Math.random() > 0.3 ? 'diesel' : 'gasoline';
    const unitPrice = fuelType === 'diesel' ? 7.5 + Math.random() * 0.5 : 8.2 + Math.random() * 0.5;
    const volume = Math.floor(Math.random() * 200) + 100;
    
    return {
      id: String(index + 1),
      vehicleId: String(Math.floor(Math.random() * 8) + 1),
      vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
      fuelTime: getRandomRecentDate(1).replace('T', ' '),
      fuelType,
      volume,
      unitPrice,
      cost: +(volume * unitPrice).toFixed(2),
      currentMileage: Math.floor(Math.random() * 50000) + 100000,
      location: locations[Math.floor(Math.random() * locations.length)],
      handler: handlers[Math.floor(Math.random() * handlers.length)],
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

// 加油记录数据
const fuelRecords = ref(generateFuelRecords());

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const tableHeight = 'calc(100vh - 330px)';

// 过滤后的数据
const filteredRecords = computed(() => {
  return fuelRecords.value.filter(record => {
    const matchVehicle = !searchForm.value.vehicleNumber || 
      record.vehicleNumber.includes(searchForm.value.vehicleNumber);
    const matchType = !searchForm.value.fuelType || 
      record.fuelType === searchForm.value.fuelType;
    
    let matchDate = true;
    if (searchForm.value.dateRange?.length === 2) {
      const recordDate = record.fuelTime.split(' ')[0];
      matchDate = recordDate >= (searchForm.value.dateRange[0] as string) && 
                 recordDate <= (searchForm.value.dateRange[1] as string);
    }
    
    return matchVehicle && matchType && matchDate;
  }).sort((a, b) => new Date(b.fuelTime).getTime() - new Date(a.fuelTime).getTime());
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
  fuelTime: '',
  fuelType: '',
  volume: 0,
  unitPrice: 0,
  cost: 0,
  currentMileage: 0,
  location: '',
  handler: '',
  remarks: ''
});

// 表单验证规则
const rules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: ['blur', 'change'] }],
  fuelTime: [{ required: true, message: '请选择加油时间', trigger: ['blur', 'change'] }],
  fuelType: [{ required: true, message: '请选择油品类型', trigger: ['blur', 'change'] }],
  volume: [{ required: true, message: '请输入加油量', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  currentMileage: [{ required: true, message: '请输入当前里程', trigger: 'blur' }],
  location: [{ required: true, message: '请输入加油站', trigger: 'blur' }],
  handler: [{ required: true, message: '请输入经办人', trigger: 'blur' }]
};

// 处理车辆选择变化
const handleVehicleChange = (vehicleId: string) => {
  const vehicle = availableVehicles.value.find(v => v.id === vehicleId);
  if (vehicle) {
    formData.value.vehicleNumber = vehicle.plateNumber;
  }
};

// 计算总金额
const calculateCost = () => {
  if (formData.value.volume && formData.value.unitPrice) {
    formData.value.cost = +(formData.value.volume * formData.value.unitPrice).toFixed(2);
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
    fuelType: '',
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
    fuelTime: '',
    fuelType: '',
    volume: 0,
    unitPrice: 0,
    cost: 0,
    currentMileage: 0,
    location: '',
    handler: '',
    remarks: ''
  };
  dialogVisible.value = true;
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
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除该加油记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    fuelRecords.value = fuelRecords.value.filter(item => item.id !== row.id);
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
          ...formData.value
        };
        fuelRecords.value.unshift(newRecord);
        ElMessage.success('新增成功');
      } else {
        // 更新记录
        const index = fuelRecords.value.findIndex(item => item.id === currentId.value);
        if (index !== -1) {
          fuelRecords.value[index] = {
            ...fuelRecords.value[index],  // 保留原有的 id
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
.fuel-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.fuel-card {
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