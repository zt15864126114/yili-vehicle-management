<template>
  <div class="inspection-list">
    <el-card class="inspection-card">
      <template #header>
        <div class="card-header">
          <span>年检记录</span>
          <el-button type="primary" @click="handleAdd">新增记录</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.vehicleNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待年检" value="pending" />
            <el-option label="已年检" value="completed" />
            <el-option label="未通过" value="failed" />
          </el-select>
        </el-form-item>
        <el-form-item label="年检日期">
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
          <el-table-column prop="inspectionDate" label="年检日期" width="120" />
          <el-table-column prop="nextInspectionDate" label="下次年检日期" width="120" />
          <el-table-column prop="location" label="年检地点" min-width="180" />
          <el-table-column prop="cost" label="年检费用" width="120">
            <template #default="{ row }">
              ¥{{ row.cost.toFixed(2) }}
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
          <el-table-column prop="remarks" label="备注" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleView(row)">查看</el-button>
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
      :title="dialogType === 'add' ? '新增年检记录' : '编辑年检记录'"
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

        <el-form-item label="年检日期" prop="inspectionDate">
          <el-date-picker
            v-model="formData.inspectionDate"
            type="date"
            placeholder="选择年检日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            @change="updateNextInspectionDate"
          />
        </el-form-item>

        <el-form-item label="下次年检" prop="nextInspectionDate">
          <el-date-picker
            v-model="formData.nextInspectionDate"
            type="date"
            placeholder="选择下次年检日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
            :disabled="true"
          />
        </el-form-item>

        <el-form-item label="年检地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入年检地点" />
        </el-form-item>

        <el-form-item label="年检费用" prop="cost">
          <el-input-number
            v-model="formData.cost"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="待年检" value="pending" />
            <el-option label="已年检" value="completed" />
            <el-option label="未通过" value="failed" />
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

    <!-- 查看详情对话框 -->
    <el-dialog
      title="年检详情"
      v-model="viewDialogVisible"
      width="600px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="车牌号">{{ currentRecord.vehicleNumber }}</el-descriptions-item>
        <el-descriptions-item label="年检日期">{{ currentRecord.inspectionDate }}</el-descriptions-item>
        <el-descriptions-item label="下次年检日期">{{ currentRecord.nextInspectionDate }}</el-descriptions-item>
        <el-descriptions-item label="年检费用">¥{{ currentRecord.cost?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="年检地点" :span="2">{{ currentRecord.location }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ statusMap[currentRecord.status as keyof typeof statusMap] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="经办人">{{ currentRecord.handler }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '无' }}</el-descriptions-item>
        <el-descriptions-item label="检测项目" :span="2">
          <el-tag
            v-for="(item, index) in currentRecord.inspectionItems"
            :key="index"
            :type="item.passed ? 'success' : 'danger'"
            style="margin-right: 5px; margin-bottom: 5px;"
          >
            {{ item.name }}: {{ item.passed ? '通过' : '未通过' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 搜索表单
const searchForm = ref({
  vehicleNumber: '',
  status: '',
  dateRange: []
});

// 状态映射
const statusMap = {
  pending: '待年检',
  completed: '已年检',
  failed: '未通过'
} as const;

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  };
  return typeMap[status] || 'info';
};

// 生成示例数据
const generateInspectionRecords = () => {
  const vehicles = [
    '鲁H85697', '鲁H67M89', '鲁H2N680', '鲁H1U579',
    '鲁HK7K11', '鲁H9M229', '鲁H3S338', '鲁H4K472'
  ];
  const locations = [
    '济宁市机动车检测中心',
    '兖州区机动车检测站',
    '济宁高新区机动车检测中心',
    '济宁市交通局检测中心'
  ];
  const handlers = [
    '张志强', '李建国', '王大明', '刘海洋', '赵国强'
  ];

  return Array.from({ length: 30 }, (_, index) => {
    const inspectionDate = getRandomRecentDate(12);
    const nextInspectionDate = new Date(new Date(inspectionDate).setFullYear(new Date(inspectionDate).getFullYear() + 1)).toISOString().split('T')[0];
    
    return {
      id: String(index + 1),
      vehicleId: String(Math.floor(Math.random() * 8) + 1),
      vehicleNumber: vehicles[Math.floor(Math.random() * vehicles.length)],
      inspectionDate,
      nextInspectionDate,
      location: locations[Math.floor(Math.random() * locations.length)],
      cost: Math.floor(Math.random() * 500) + 500,
      status: ['pending', 'completed', 'completed', 'completed', 'failed'][Math.floor(Math.random() * 5)],
      handler: handlers[Math.floor(Math.random() * handlers.length)],
      remarks: '',
      inspectionItems: [
        { name: '外观检查', passed: Math.random() > 0.1 },
        { name: '底盘检查', passed: Math.random() > 0.1 },
        { name: '尾气检测', passed: Math.random() > 0.1 },
        { name: '制动性能', passed: Math.random() > 0.1 },
        { name: '灯光检测', passed: Math.random() > 0.1 },
        { name: '安全装置', passed: Math.random() > 0.1 }
      ]
    };
  });
};

// 生成最近日期
const getRandomRecentDate = (months = 12) => {
  const today = new Date();
  const pastDate = new Date(today.getTime() - months * 30 * 24 * 60 * 60 * 1000);
  const randomTime = pastDate.getTime() + Math.random() * (today.getTime() - pastDate.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
};

// 年检记录数据
const inspectionRecords = ref(generateInspectionRecords());

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);
const tableHeight = 'calc(100vh - 330px)';

// 过滤后的数据
const filteredRecords = computed(() => {
  return inspectionRecords.value.filter(record => {
    const matchVehicle = !searchForm.value.vehicleNumber || 
      record.vehicleNumber.includes(searchForm.value.vehicleNumber);
    const matchStatus = !searchForm.value.status || 
      record.status === searchForm.value.status;
    
    let matchDate = true;
    if (searchForm.value.dateRange?.length === 2) {
      const recordDate = record.inspectionDate;
      matchDate = recordDate >= (searchForm.value.dateRange[0] as string) && 
                 recordDate <= (searchForm.value.dateRange[1] as string);
    }
    
    return matchVehicle && matchStatus && matchDate;
  }).sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());
});

// 分页后的数据
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 对话框相关
const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref();

// 添加类型定义
interface InspectionRecord {
  id: string;
  vehicleNumber: string;
  inspectionDate: string;
  nextInspectionDate: string;
  location: string;
  cost: number;
  status: string;
  handler: string;
  remarks: string;
  inspectionItems: Array<{ name: string; passed: boolean }>;
}

// 修改 currentRecord 的初始值
const currentRecord = ref<InspectionRecord>({
  id: '',
  vehicleNumber: '',
  inspectionDate: '',
  nextInspectionDate: '',
  location: '',
  cost: 0,
  status: '',
  handler: '',
  remarks: '',
  inspectionItems: []
});

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
  inspectionDate: '',
  nextInspectionDate: '',
  location: '',
  cost: 0,
  status: '',
  handler: '',
  remarks: '',
  inspectionItems: []
});

// 表单验证规则
const rules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: ['blur', 'change'] }],
  inspectionDate: [{ required: true, message: '请选择年检日期', trigger: ['blur', 'change'] }],
  location: [{ required: true, message: '请输入年检地点', trigger: 'blur' }],
  cost: [{ required: true, message: '请输入年检费用', trigger: 'blur' }],
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

// 更新下次年检日期
const updateNextInspectionDate = () => {
  if (formData.value.inspectionDate) {
    const nextDate = new Date(formData.value.inspectionDate);
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    formData.value.nextInspectionDate = nextDate.toISOString().split('T')[0];
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
    status: '',
    dateRange: []
  };
  currentPage.value = 1;
};

// 处理查看
const handleView = (row: any) => {
  currentRecord.value = row;
  viewDialogVisible.value = true;
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  formData.value = {
    vehicleId: '',
    vehicleNumber: '',
    inspectionDate: '',
    nextInspectionDate: '',
    location: '',
    cost: 0,
    status: 'pending',
    handler: '',
    remarks: '',
    inspectionItems: []
  };
  dialogVisible.value = true;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 添加 currentId
const currentId = ref('');

// 修改 handleEdit 函数
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
    `确定要删除该年检记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    inspectionRecords.value = inspectionRecords.value.filter(item => item.id !== row.id);
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
          id: String(Date.now()),  // 使用时间戳作为 id
          ...formData.value,
          inspectionItems: [
            { name: '外观检查', passed: true },
            { name: '底盘检查', passed: true },
            { name: '尾气检测', passed: true },
            { name: '制动性能', passed: true },
            { name: '灯光检测', passed: true },
            { name: '安全装置', passed: true }
          ]
        };
        inspectionRecords.value.unshift(newRecord);
        ElMessage.success('新增成功');
      } else {
        // 更新记录
        const index = inspectionRecords.value.findIndex(item => item.id === currentId.value);
        if (index !== -1) {
          inspectionRecords.value[index] = {
            ...inspectionRecords.value[index],  // 保留原有的 id
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
.inspection-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.inspection-card {
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