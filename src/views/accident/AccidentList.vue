<template>
  <div class="accident-list">
    <el-card class="accident-card">
      <template #header>
        <div class="card-header">
          <span>事故记录</span>
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
        <el-form-item label="事故等级">
          <el-select v-model="searchForm.level" placeholder="请选择等级" clearable>
            <el-option label="轻微" value="minor" />
            <el-option label="一般" value="normal" />
            <el-option label="重大" value="major" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item label="事故日期">
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
          <el-table-column prop="driverName" label="驾驶员" width="100" />
          <el-table-column prop="accidentTime" label="事故时间" width="160" />
          <el-table-column prop="location" label="事故地点" min-width="180" />
          <el-table-column prop="level" label="事故等级" width="100">
            <template #default="{ row }">
              <el-tag :type="getLevelType(row.level)">
                {{ levelMap[row.level as keyof typeof levelMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="处理状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ statusMap[row.status as keyof typeof statusMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="损失金额" width="120">
            <template #default="{ row }">
              ¥{{ row.cost.toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column prop="responsibility" label="责任认定" width="120">
            <template #default="{ row }">
              <el-tag :type="getResponsibilityType(row.responsibility)">
                {{ responsibilityMap[row.responsibility as keyof typeof responsibilityMap] }}
              </el-tag>
            </template>
          </el-table-column>
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
      :title="dialogType === 'add' ? '新增事故记录' : '编辑事故记录'"
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

        <el-form-item label="事故时间" prop="accidentTime">
          <el-date-picker
            v-model="formData.accidentTime"
            type="datetime"
            placeholder="选择事故时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="事故地点" prop="location">
          <el-input v-model="formData.location" placeholder="请输入事故地点" />
        </el-form-item>

        <el-form-item label="事故等级" prop="level">
          <el-select v-model="formData.level" placeholder="请选择事故等级" style="width: 100%">
            <el-option label="轻微" value="minor" />
            <el-option label="一般" value="normal" />
            <el-option label="重大" value="major" />
          </el-select>
        </el-form-item>

        <el-form-item label="处理状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择处理状态" style="width: 100%">
            <el-option label="待处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>

        <el-form-item label="损失金额" prop="cost">
          <el-input-number
            v-model="formData.cost"
            :min="0"
            :precision="2"
            :step="1000"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="责任认定" prop="responsibility">
          <el-select v-model="formData.responsibility" placeholder="请选择责任认定" style="width: 100%">
            <el-option
              v-for="(label, value) in responsibilityMap"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="事故描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            rows="3"
            placeholder="请输入事故详细描述"
          />
        </el-form-item>

        <el-form-item label="处理过程" prop="process">
          <el-input
            v-model="formData.process"
            type="textarea"
            rows="3"
            placeholder="请输入事故处理过程"
          />
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
      title="事故详情"
      v-model="viewDialogVisible"
      width="700px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="车牌号">{{ currentRecord.vehicleNumber }}</el-descriptions-item>
        <el-descriptions-item label="驾驶员">{{ currentRecord.driverName }}</el-descriptions-item>
        <el-descriptions-item label="事故时间">{{ currentRecord.accidentTime }}</el-descriptions-item>
        <el-descriptions-item label="事故地点">{{ currentRecord.location }}</el-descriptions-item>
        <el-descriptions-item label="事故等级">
          <el-tag :type="getLevelType(currentRecord.level)">
            {{ levelMap[currentRecord.level as keyof typeof levelMap] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理状态">
          <el-tag :type="getStatusType(currentRecord.status)">
            {{ statusMap[currentRecord.status as keyof typeof statusMap] }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="损失金额">¥{{ currentRecord.cost?.toFixed(2) }}</el-descriptions-item>
        <el-descriptions-item label="责任认定">
          {{ responsibilityMap[currentRecord.responsibility as keyof typeof responsibilityMap] }}
        </el-descriptions-item>
        <el-descriptions-item label="事故描述" :span="2">{{ currentRecord.description || '无' }}</el-descriptions-item>
        <el-descriptions-item label="处理过程" :span="2">{{ currentRecord.process || '无' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ currentRecord.remarks || '无' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 事故照片 -->
      <div class="accident-photos" v-if="currentRecord.photos?.length">
        <h4>事故照片</h4>
        <el-image
          v-for="(photo, index) in currentRecord.photos"
          :key="index"
          :src="photo"
          :preview-src-list="currentRecord.photos"
          fit="cover"
          class="accident-photo"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';

// 表格高度
const tableHeight = ref('calc(100vh - 280px)');

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框控制
const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const formRef = ref<FormInstance>();

// 当前查看的记录
const currentRecord = ref<any>({});

// 搜索表单
const searchForm = ref({
  vehicleNumber: '',
  driverName: '',
  level: '',
  status: '',
  dateRange: []
});

// 表单数据
const formData = ref({
  id: '',
  vehicleId: '',
  vehicleNumber: '',
  driverId: '',
  driverName: '',
  accidentTime: '',
  location: '',
  level: '',
  status: 'pending',
  cost: 0,
  responsibility: '',
  description: '',
  process: '',
  remarks: '',
  photos: []
});

// 可用车辆列表
const availableVehicles = ref([
  { id: '1', plateNumber: '鲁H85697' },
  { id: '2', plateNumber: '鲁H67M89' },
  { id: '3', plateNumber: '鲁H2N680' },
  { id: '4', plateNumber: '鲁H1U579' },
  { id: '5', plateNumber: '鲁HK7K11' }
]);

// 可用驾驶员列表
const availableDrivers = ref([
  { id: '1', name: '张志强' },
  { id: '2', name: '李建国' },
  { id: '3', name: '王大明' },
  { id: '4', name: '刘海洋' },
  { id: '5', name: '赵国强' }
]);

// 生成示例数据
const generateAccidentRecords = () => {
  const records = [];
  const locations = [
    '济南市历下区经十路与解放路交叉口',
    '济南市天桥区无影山路与北园路交叉口',
    '济南市槐荫区经二路与纬二路交叉口',
    '济南市市中区英雄山路与经四路交叉口',
    '济南市历城区工业北路与花园路交叉口'
  ];

  // 事故照片示例
  const photoSets = [
    [
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe.zj.gov.cn%2Fart%2F2022%2F4%2F13%2Fart_1229536674_4837160.jpg',
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe.zj.gov.cn%2Fart%2F2022%2F4%2F13%2Fart_1229536674_4837161.jpg',
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fsafe.zj.gov.cn%2Fart%2F2022%2F4%2F13%2Fart_1229536674_4837162.jpg'
    ],
    [
      'https://pics7.baidu.com/feed/63d0f703918fa0ec316c75e51e1976fb9e3f939d.jpeg',
      'https://pics6.baidu.com/feed/63d0f703918fa0ec316c75e51e1976fb9e3f939e.jpeg'
    ],
    [
      'https://pics5.baidu.com/feed/472309f790529822d1e98324cf0971cbb0717e3f.jpeg',
      'https://pics4.baidu.com/feed/472309f790529822d1e98324cf0971cbb0717e40.jpeg',
      'https://pics3.baidu.com/feed/472309f790529822d1e98324cf0971cbb0717e41.jpeg'
    ],
    [
      'https://img0.baidu.com/it/u=1831379088,3147101487&fm=253&fmt=auto&app=120&f=JPEG',
      'https://img1.baidu.com/it/u=1831379088,3147101487&fm=253&fmt=auto&app=120&f=JPEG'
    ],
    [
      'https://img2.baidu.com/it/u=2619193114,3071890484&fm=253&fmt=auto&app=120&f=JPEG',
      'https://img3.baidu.com/it/u=2619193114,3071890484&fm=253&fmt=auto&app=120&f=JPEG',
      'https://img4.baidu.com/it/u=2619193114,3071890484&fm=253&fmt=auto&app=120&f=JPEG'
    ]
  ];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 180)); // 最近半年的记录
    
    records.push({
      id: String(i + 1),
      vehicleId: String(Math.floor(Math.random() * 5) + 1),
      vehicleNumber: availableVehicles.value[Math.floor(Math.random() * 5)].plateNumber,
      driverId: String(Math.floor(Math.random() * 5) + 1),
      driverName: availableDrivers.value[Math.floor(Math.random() * 5)].name,
      accidentTime: date.toISOString().slice(0, 16).replace('T', ' '),
      location: locations[Math.floor(Math.random() * locations.length)],
      level: ['minor', 'normal', 'major'][Math.floor(Math.random() * 3)],
      status: ['pending', 'processing', 'completed'][Math.floor(Math.random() * 3)],
      cost: Math.floor(Math.random() * 50000) + 1000,
      responsibility: ['full', 'major', 'minor', 'none'][Math.floor(Math.random() * 4)],
      description: '车辆在行驶过程中发生碰撞事故，造成车辆不同程度受损。需要进行维修和保险理赔。',
      process: '已联系保险公司，正在进行定损评估。维修厂已完成初步检查，等待配件到货进行维修。',
      remarks: '',
      photos: photoSets[Math.floor(Math.random() * photoSets.length)]
    });
  }
  return records;
};

// 事故记录数据
const accidentRecords = ref(generateAccidentRecords());

// 过滤后的记录
const filteredRecords = computed(() => {
  return accidentRecords.value.filter(record => {
    const matchVehicle = !searchForm.value.vehicleNumber || 
      record.vehicleNumber.includes(searchForm.value.vehicleNumber);
    const matchDriver = !searchForm.value.driverName || 
      record.driverName.includes(searchForm.value.driverName);
    const matchLevel = !searchForm.value.level || 
      record.level === searchForm.value.level;
    const matchStatus = !searchForm.value.status || 
      record.status === searchForm.value.status;
    
    let matchDate = true;
    if (searchForm.value.dateRange?.length === 2) {
      const accidentDate = new Date(record.accidentTime).getTime();
      const startDate = new Date(searchForm.value.dateRange[0]).getTime();
      const endDate = new Date(searchForm.value.dateRange[1]).getTime() + 24 * 60 * 60 * 1000;
      matchDate = accidentDate >= startDate && accidentDate <= endDate;
    }
    
    return matchVehicle && matchDriver && matchLevel && matchStatus && matchDate;
  });
});

// 分页后的记录
const paginatedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredRecords.value.slice(start, end);
});

// 表单验证规则
const rules = {
  vehicleId: [{ required: true, message: '请选择车辆', trigger: ['blur', 'change'] }],
  driverId: [{ required: true, message: '请选择驾驶员', trigger: ['blur', 'change'] }],
  accidentTime: [{ required: true, message: '请选择事故时间', trigger: ['blur', 'change'] }],
  location: [{ required: true, message: '请输入事故地点', trigger: 'blur' }],
  level: [{ required: true, message: '请选择事故等级', trigger: ['blur', 'change'] }],
  status: [{ required: true, message: '请选择处理状态', trigger: ['blur', 'change'] }],
  cost: [{ required: true, message: '请输入损失金额', trigger: 'blur' }],
  responsibility: [{ required: true, message: '请选择责任认定', trigger: ['blur', 'change'] }],
  description: [{ required: true, message: '请输入事故描述', trigger: 'blur' }]
};

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
    level: '',
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
    id: '',
    vehicleId: '',
    vehicleNumber: '',
    driverId: '',
    driverName: '',
    accidentTime: '',
    location: '',
    level: '',
    status: 'pending',
    cost: 0,
    responsibility: '',
    description: '',
    process: '',
    remarks: '',
    photos: []
  };
  dialogVisible.value = true;
  if (formRef.value) {
    formRef.value.clearValidate();
  }
};

// 处理编辑
const handleEdit = (row: any) => {
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
    `确定要删除该事故记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    accidentRecords.value = accidentRecords.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  }).catch(() => {
    // 取消删除
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
          ...formData.value,
          id: String(Date.now()),
          photos: []
        };
        accidentRecords.value.unshift(newRecord);
        ElMessage.success('新增成功');
      } else {
        // 更新记录
        const index = accidentRecords.value.findIndex(item => item.id === formData.value.id);
        if (index !== -1) {
          accidentRecords.value[index] = { ...formData.value };
          ElMessage.success('更新成功');
        }
      }
      dialogVisible.value = false;
    } else {
      console.log('验证失败', fields);
    }
  });
};

// 状态映射
const statusMap = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成'
} as const;

// 等级映射
const levelMap = {
  minor: '轻微',
  normal: '一般',
  major: '重大'
} as const;

// 责任认定映射
const responsibilityMap = {
  full: '全责',
  major: '主责',
  minor: '次责',
  none: '无责'
};

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success'
  };
  return typeMap[status] || 'info';
};

// 获取等级标签类型
const getLevelType = (level: string) => {
  const typeMap: { [key: string]: string } = {
    minor: 'success',
    normal: 'warning',
    major: 'danger'
  };
  return typeMap[level] || 'info';
};

// 获取责任认定标签类型
const getResponsibilityType = (responsibility: string) => {
  const typeMap: { [key: string]: string } = {
    full: 'danger',
    major: 'warning',
    minor: 'info',
    none: 'success'
  };
  return typeMap[responsibility] || 'info';
};
</script>

<style scoped>
.accident-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.accident-card {
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

.accident-photos {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.accident-photo {
  width: 120px;
  height: 120px;
  margin-right: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.accident-photo:hover {
  opacity: 0.8;
}
</style>