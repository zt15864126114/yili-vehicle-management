<template>
  <div class="vehicle-list">
    <el-card class="vehicle-card">
      <template #header>
        <div class="card-header">
          <span>车辆管理</span>
          <el-button type="primary" @click="handleAdd">新增车辆</el-button>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="车牌号">
          <el-input v-model="searchForm.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车辆类型">
          <el-select v-model="searchForm.type" placeholder="请选择车辆类型" clearable>
            <el-option label="货车" value="truck" />
            <el-option label="面包车" value="van" />
            <el-option label="轿车" value="car" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="报废" value="scrapped" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格内容区域 -->
      <div class="table-container">
        <el-table 
          :data="paginatedVehicles" 
          style="width: 100%"
          :height="tableHeight"
        >
          <el-table-column prop="plateNumber" label="车牌号" width="120" />
          <el-table-column prop="type" label="车辆类型" width="100">
            <template #default="{ row }">
              {{ vehicleTypeMap[row.type as keyof typeof vehicleTypeMap] }}
            </template>
          </el-table-column>
          <el-table-column prop="brand" label="品牌型号" width="150" />
          <el-table-column prop="purchaseDate" label="购置日期" width="120" />
          <el-table-column prop="mileage" label="当前里程" width="120">
            <template #default="{ row }">
              {{ row.mileage }} km
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ statusMap[row.status as keyof typeof statusMap] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="nextInspectionDate" label="下次年检" width="120" />
          <el-table-column prop="nextMaintenanceDate" label="下次保养" width="120" />
          <el-table-column label="操作" width="200" fixed="right">
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
          :total="filteredVehicles.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '新增车辆' : '编辑车辆'"
      v-model="dialogVisible"
      width="600px"
    >
      <el-form
        ref="vehicleFormRef"
        :model="vehicleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="vehicleForm.plateNumber" placeholder="请输入车牌号" />
        </el-form-item>
        <el-form-item label="车辆类型" prop="type">
          <el-select v-model="vehicleForm.type" placeholder="请选择车辆类型">
            <el-option label="货车" value="truck" />
            <el-option label="面包车" value="van" />
            <el-option label="轿车" value="car" />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌型号" prop="brand">
          <el-input v-model="vehicleForm.brand" placeholder="请输入品牌型号" />
        </el-form-item>
        <el-form-item label="购置日期" prop="purchaseDate">
          <el-date-picker
            v-model="vehicleForm.purchaseDate"
            type="date"
            placeholder="请选择购置日期"
          />
        </el-form-item>
        <el-form-item label="当前里程" prop="mileage">
          <el-input-number
            v-model="vehicleForm.mileage"
            :min="0"
            :step="1000"
            placeholder="请输入当前里程"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="vehicleForm.status" placeholder="请选择状态">
            <el-option label="正常" value="normal" />
            <el-option label="维修中" value="maintenance" />
            <el-option label="报废" value="scrapped" />
          </el-select>
        </el-form-item>
        <el-form-item label="下次年检" prop="nextInspectionDate">
          <el-date-picker
            v-model="vehicleForm.nextInspectionDate"
            type="date"
            placeholder="请选择下次年检日期"
          />
        </el-form-item>
        <el-form-item label="下次保养" prop="nextMaintenanceDate">
          <el-date-picker
            v-model="vehicleForm.nextMaintenanceDate"
            type="date"
            placeholder="请选择下次保养日期"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="vehicleForm.remarks"
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
import type { FormInstance } from 'element-plus';

// 车辆类型映射
const vehicleTypeMap = {
  truck: '货车',
  van: '面包车',
  car: '轿车'
} as const;

// 状态映射
const statusMap = {
  normal: '正常',
  maintenance: '维修中',
  scrapped: '报废'
} as const;

// 获取状态标签类型
const getStatusType = (status: string) => {
  const typeMap: { [key: string]: string } = {
    normal: 'success',
    maintenance: 'warning',
    scrapped: 'danger'
  };
  return typeMap[status] || 'info';
};

// 搜索表单
const searchForm = ref({
  plateNumber: '',
  type: '',
  status: ''
});

// 车辆列表数据
const vehicles = ref([
  {
    id: '1',
    plateNumber: '鲁H85697',
    type: 'truck',
    brand: '解放J6',
    purchaseDate: '2022-01-01',
    mileage: 50000,
    status: 'normal',
    nextInspectionDate: '2025-12-01',
    nextMaintenanceDate: '2025-06-15',
    remarks: '主要用于原料运输'
  },
  {
    id: '2',
    plateNumber: '鲁H67M89',
    type: 'van',
    brand: '五菱荣光',
    purchaseDate: '2023-03-15',
    mileage: 15000,
    status: 'normal',
    nextInspectionDate: '2026-03-15',
    nextMaintenanceDate: '2024-09-15',
    remarks: '厂区内部通勤'
  },
  {
    id: '3',
    plateNumber: '鲁H2N680',
    type: 'truck',
    brand: '东风天龙',
    purchaseDate: '2021-08-20',
    mileage: 80000,
    status: 'maintenance',
    nextInspectionDate: '2024-08-20',
    nextMaintenanceDate: '2024-02-20',
    remarks: '发动机维修中'
  },
  {
    id: '4',
    plateNumber: '鲁H1U579',
    type: 'car',
    brand: '丰田凯美瑞',
    purchaseDate: '2023-06-10',
    mileage: 12000,
    status: 'normal',
    nextInspectionDate: '2026-06-10',
    nextMaintenanceDate: '2024-06-10',
    remarks: '公务用车'
  },
  {
    id: '5',
    plateNumber: '鲁HK7K11',
    type: 'truck',
    brand: '重汽豪沃',
    purchaseDate: '2020-12-25',
    mileage: 120000,
    status: 'scrapped',
    nextInspectionDate: '2023-12-25',
    nextMaintenanceDate: '2023-12-25',
    remarks: '已达报废标准'
  },
  {
    id: '6',
    plateNumber: '鲁H9M229',
    type: 'van',
    brand: '江铃全顺',
    purchaseDate: '2023-01-05',
    mileage: 25000,
    status: 'normal',
    nextInspectionDate: '2026-01-05',
    nextMaintenanceDate: '2024-07-05',
    remarks: '厂区物资运输'
  },
  {
    id: '7',
    plateNumber: '鲁H3S338',
    type: 'car',
    brand: '别克GL8',
    purchaseDate: '2022-09-15',
    mileage: 35000,
    status: 'normal',
    nextInspectionDate: '2025-09-15',
    nextMaintenanceDate: '2024-03-15',
    remarks: '接待用车'
  },
  {
    id: '8',
    plateNumber: '鲁H4K472',
    type: 'truck',
    brand: '福田欧曼',
    purchaseDate: '2021-05-20',
    mileage: 95000,
    status: 'maintenance',
    nextInspectionDate: '2024-05-20',
    nextMaintenanceDate: '2024-01-20',
    remarks: '正在进行年度保养'
  },
  {
    id: '9',
    plateNumber: '鲁H5N891',
    type: 'truck',
    brand: '解放JH6',
    purchaseDate: '2022-03-10',
    mileage: 65000,
    status: 'normal',
    nextInspectionDate: '2025-03-10',
    nextMaintenanceDate: '2024-03-10',
    remarks: '成品油运输专用'
  },
  {
    id: '10',
    plateNumber: '鲁H6P234',
    type: 'truck',
    brand: '重汽汕德卡',
    purchaseDate: '2023-04-15',
    mileage: 28000,
    status: 'normal',
    nextInspectionDate: '2026-04-15',
    nextMaintenanceDate: '2024-04-15',
    remarks: '大豆运输专用'
  },
  {
    id: '11',
    plateNumber: '鲁H7R567',
    type: 'van',
    brand: '福特全顺',
    purchaseDate: '2023-02-20',
    mileage: 18000,
    status: 'normal',
    nextInspectionDate: '2026-02-20',
    nextMaintenanceDate: '2024-02-20',
    remarks: '样品运送专用'
  },
  {
    id: '12',
    plateNumber: '鲁H8T890',
    type: 'car',
    brand: '奥迪A6L',
    purchaseDate: '2022-11-05',
    mileage: 42000,
    status: 'normal',
    nextInspectionDate: '2025-11-05',
    nextMaintenanceDate: '2024-05-05',
    remarks: '总经理专用车'
  },
  {
    id: '13',
    plateNumber: '鲁H9U123',
    type: 'truck',
    brand: '东风天龙KL',
    purchaseDate: '2022-07-18',
    mileage: 73000,
    status: 'normal',
    nextInspectionDate: '2025-07-18',
    nextMaintenanceDate: '2024-01-18',
    remarks: '粮油运输专用'
  },
  {
    id: '14',
    plateNumber: '鲁H1W456',
    type: 'van',
    brand: '大通V80',
    purchaseDate: '2023-05-25',
    mileage: 13000,
    status: 'normal',
    nextInspectionDate: '2026-05-25',
    nextMaintenanceDate: '2024-05-25',
    remarks: '工具设备运输'
  },
  {
    id: '15',
    plateNumber: '鲁H2X789',
    type: 'truck',
    brand: '解放J7',
    purchaseDate: '2023-01-30',
    mileage: 45000,
    status: 'normal',
    nextInspectionDate: '2026-01-30',
    nextMaintenanceDate: '2024-01-30',
    remarks: '原料运输专用'
  },
  {
    id: '16',
    plateNumber: '鲁H3Y012',
    type: 'car',
    brand: '丰田埃尔法',
    purchaseDate: '2022-12-10',
    mileage: 32000,
    status: 'normal',
    nextInspectionDate: '2025-12-10',
    nextMaintenanceDate: '2024-06-10',
    remarks: '商务接待用车'
  },
  {
    id: '17',
    plateNumber: '鲁H4Z345',
    type: 'truck',
    brand: '重汽豪沃',
    purchaseDate: '2022-06-05',
    mileage: 85000,
    status: 'normal',
    nextInspectionDate: '2025-06-05',
    nextMaintenanceDate: '2024-06-05',
    remarks: '散装油运输'
  },
  {
    id: '18',
    plateNumber: '鲁H5A678',
    type: 'van',
    brand: '江铃特顺',
    purchaseDate: '2023-03-20',
    mileage: 22000,
    status: 'normal',
    nextInspectionDate: '2026-03-20',
    nextMaintenanceDate: '2024-03-20',
    remarks: '零配件配送'
  },
    {
      id: '19',
      plateNumber: '鲁H6B789',
      type: 'van',
      brand: '江铃特顺',
      purchaseDate: '2023-04-15',
      mileage: 25000,
      status: 'normal',
      nextInspectionDate: '2026-04-15',
      nextMaintenanceDate: '2024-04-15',
      remarks: '零配件配送'
    },
    {
      id: '20',
      plateNumber: '鲁H7C890',
      type: 'truck',
      brand: '解放J6',
      purchaseDate: '2023-05-10',
      mileage: 28000,
      status: 'normal',
      nextInspectionDate: '2026-05-10',
      nextMaintenanceDate: '2024-05-10',
      remarks: '原料运输'
    },
    {
      id: '21',
      plateNumber: '鲁H8D901',
      type: 'van',
      brand: '福特全顺',
      purchaseDate: '2023-06-05',
      mileage: 20000,
      status: 'normal',
      nextInspectionDate: '2026-06-05',
      nextMaintenanceDate: '2024-06-05',
      remarks: '市内配送'
    },
    {
      id: '22',
      plateNumber: '鲁H9E012',
      type: 'truck',
      brand: '重汽豪沃',
      purchaseDate: '2023-07-01',
      mileage: 32000,
      status: 'maintenance',
      nextInspectionDate: '2026-07-01',
      nextMaintenanceDate: '2024-07-01',
      remarks: '大宗运输'
    },
    {
      id: '23',
      plateNumber: '鲁H1F123',
      type: 'van',
      brand: '江铃特顺',
      purchaseDate: '2023-07-25',
      mileage: 18000,
      status: 'normal',
      nextInspectionDate: '2026-07-25',
      nextMaintenanceDate: '2024-07-25',
      remarks: '市内配送'
    },
    {
      id: '24',
      plateNumber: '鲁H2G234',
      type: 'truck',
      brand: '东风天龙',
      purchaseDate: '2023-08-15',
      mileage: 30000,
      status: 'normal',
      nextInspectionDate: '2026-08-15',
      nextMaintenanceDate: '2024-08-15',
      remarks: '原料运输'
    },
    {
      id: '25',
      plateNumber: '鲁H3H345',
      type: 'van',
      brand: '福特全顺',
      purchaseDate: '2023-09-10',
      mileage: 15000,
      status: 'normal',
      nextInspectionDate: '2026-09-10',
      nextMaintenanceDate: '2024-09-10',
      remarks: '零配件配送'
    },
    {
      id: '26',
      plateNumber: '鲁H4I456',
      type: 'truck',
      brand: '解放J7',
      purchaseDate: '2023-10-05',
      mileage: 28000,
      status: 'repair',
      nextInspectionDate: '2026-10-05',
      nextMaintenanceDate: '2024-10-05',
      remarks: '大宗运输'
    },
    {
      id: '27',
      plateNumber: '鲁H5J567',
      type: 'van',
      brand: '江铃特顺',
      purchaseDate: '2023-11-01',
      mileage: 12000,
      status: 'normal',
      nextInspectionDate: '2026-11-01',
      nextMaintenanceDate: '2024-11-01',
      remarks: '市内配送'
    },
    {
      id: '28',
      plateNumber: '鲁H6K678',
      type: 'truck',
      brand: '重汽豪沃',
      purchaseDate: '2023-11-25',
      mileage: 25000,
      status: 'normal',
      nextInspectionDate: '2026-11-25',
      nextMaintenanceDate: '2024-11-25',
      remarks: '原料运输'
    },
    {
      id: '29',
      plateNumber: '鲁H7L789',
      type: 'van',
      brand: '福特全顺',
      purchaseDate: '2023-12-20',
      mileage: 10000,
      status: 'normal',
      nextInspectionDate: '2026-12-20',
      nextMaintenanceDate: '2024-12-20',
      remarks: '零配件配送'
    },
    {
      id: '30',
      plateNumber: '鲁H8M890',
      type: 'truck',
      brand: '东风天龙',
      purchaseDate: '2024-01-15',
      mileage: 8000,
      status: 'normal',
      nextInspectionDate: '2027-01-15',
      nextMaintenanceDate: '2024-07-15',
      remarks: '大宗运输'
    },
    {
      id: '31',
      plateNumber: '鲁H9N901',
      type: 'van',
      brand: '江铃特顺',
      purchaseDate: '2024-02-10',
      mileage: 5000,
      status: 'normal',
      nextInspectionDate: '2027-02-10',
      nextMaintenanceDate: '2024-08-10',
      remarks: '市内配送'
    },
    {
      id: '32',
      plateNumber: '鲁H1P012',
      type: 'truck',
      brand: '解放J6',
      purchaseDate: '2024-03-05',
      mileage: 3000,
      status: 'normal',
      nextInspectionDate: '2027-03-05',
      nextMaintenanceDate: '2024-09-05',
      remarks: '原料运输'
    },
    {
      id: '33',
      plateNumber: '鲁H2Q123',
      type: 'van',
      brand: '福特全顺',
      purchaseDate: '2024-03-30',
      mileage: 2000,
      status: 'normal',
      nextInspectionDate: '2027-03-30',
      nextMaintenanceDate: '2024-09-30',
      remarks: '零配件配送'
    },
    {
      id: '34',
      plateNumber: '鲁H3R234',
      type: 'truck',
      brand: '重汽豪沃',
      purchaseDate: '2024-04-25',
      mileage: 1500,
      status: 'normal',
      nextInspectionDate: '2027-04-25',
      nextMaintenanceDate: '2024-10-25',
      remarks: '大宗运输'
    },
    {
      id: '35',
      plateNumber: '鲁H4S345',
      type: 'van',
      brand: '江铃特顺',
      purchaseDate: '2024-05-20',
      mileage: 1000,
      status: 'normal',
      nextInspectionDate: '2027-05-20',
      nextMaintenanceDate: '2024-11-20',
      remarks: '市内配送'
    },
    {
      id: '36',
      plateNumber: '鲁H5T456',
      type: 'truck',
      brand: '东风天龙',
      purchaseDate: '2024-06-15',
      mileage: 800,
      status: 'normal',
      nextInspectionDate: '2027-06-15',
      nextMaintenanceDate: '2024-12-15',
      remarks: '原料运输'
    },
    {
      id: '37',
      plateNumber: '鲁H6U567',
      type: 'van',
      brand: '福特全顺',
      purchaseDate: '2024-07-10',
      mileage: 500,
      status: 'normal',
      nextInspectionDate: '2027-07-10',
      nextMaintenanceDate: '2025-01-10',
      remarks: '零配件配送'
    },
    {
      id: '38',
      plateNumber: '鲁H7V678',
      type: 'truck',
      brand: '解放J7',
      purchaseDate: '2024-08-05',
      mileage: 300,
      status: 'normal',
      nextInspectionDate: '2027-08-05',
      nextMaintenanceDate: '2025-02-05',
      remarks: '大宗运输'
    },
    {
      id: '39',
      plateNumber: '鲁H8W789',
      type: 'van',
      brand: '江铃特顺',
      purchaseDate: '2024-09-01',
      mileage: 100,
      status: 'normal',
      nextInspectionDate: '2027-09-01',
      nextMaintenanceDate: '2025-03-01',
      remarks: '市内配送'
    },
    {
      id: '40',
      plateNumber: '鲁H9X890',
      type: 'truck',
      brand: '重汽豪沃',
      purchaseDate: '2024-09-25',
      mileage: 50,
      status: 'normal',
      nextInspectionDate: '2027-09-25',
      nextMaintenanceDate: '2025-03-25',
      remarks: '原料运输'
    }
]);

// 筛选后的车辆列表
const filteredVehicles = computed(() => {
  return vehicles.value.filter(vehicle => {
    const matchPlateNumber = !searchForm.value.plateNumber || 
      vehicle.plateNumber.includes(searchForm.value.plateNumber);
    const matchType = !searchForm.value.type || 
      vehicle.type === searchForm.value.type;
    const matchStatus = !searchForm.value.status || 
      vehicle.status === searchForm.value.status;
    return matchPlateNumber && matchType && matchStatus;
  });
});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(10);

// 分页后的数据
const paginatedVehicles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredVehicles.value.slice(start, end);
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

// 对话框控制
const dialogVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const vehicleFormRef = ref<FormInstance>();

// 表单数据
const vehicleForm = ref({
  id: '',
  plateNumber: '',
  type: '',
  brand: '',
  purchaseDate: '',
  mileage: 0,
  status: 'normal',
  nextInspectionDate: '',
  nextMaintenanceDate: '',
  remarks: ''
});

// 表单验证规则
const rules = {
  plateNumber: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    { pattern: /^[京津沪渝冀豫云辽黑湘鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5}$/, message: '请输入正确的车牌号格式', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择车辆类型', trigger: 'change' }
  ],
  brand: [
    { required: true, message: '请输入品牌型号', trigger: 'blur' }
  ],
  purchaseDate: [
    { required: true, message: '请选择购置日期', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1; // 搜索后返回第一页
};

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    plateNumber: '',
    type: '',
    status: ''
  };
  currentPage.value = 1; // 重置到第一页
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  vehicleForm.value = {
    id: '',
    plateNumber: '',
    type: '',
    brand: '',
    purchaseDate: '',
    mileage: 0,
    status: 'normal',
    nextInspectionDate: '',
    nextMaintenanceDate: '',
    remarks: ''
  };
  dialogVisible.value = true;
};

// 处理编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  vehicleForm.value = { 
    id: row.id,  // 添加 id 字段
    plateNumber: row.plateNumber,
    type: row.type,
    brand: row.brand,
    purchaseDate: row.purchaseDate,
    mileage: row.mileage,
    status: row.status,
    nextInspectionDate: row.nextInspectionDate,
    nextMaintenanceDate: row.nextMaintenanceDate,
    remarks: row.remarks
  };
  dialogVisible.value = true;
};

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除车牌号为 ${row.plateNumber} 的车辆记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    vehicles.value = vehicles.value.filter(item => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};

// 处理提交
const handleSubmit = async () => {
  if (!vehicleFormRef.value) return;
  
  await vehicleFormRef.value.validate(valid => {
    if (valid) {
      if (dialogType.value === 'add') {
        // 新增车辆
        const newVehicle = {
          ...vehicleForm.value,
          id: String(Date.now())
        };
        vehicles.value.unshift(newVehicle);
        ElMessage.success('新增车辆成功');
      } else {
        // 编辑车辆
        const index = vehicles.value.findIndex(item => item.id === vehicleForm.value.id);
        if (index !== -1) {
          vehicles.value[index] = { ...vehicleForm.value };
          ElMessage.success('更新车辆信息成功');
        }
      }
      dialogVisible.value = false;
    }
  });
};

// 设置表格高度
const tableHeight = 'calc(100vh - 330px)';
</script>

<style scoped>
.vehicle-list {
  height: 100%;
  padding: 20px;
  background-color: #f0f2f5;
}

.vehicle-card {
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
</style> 