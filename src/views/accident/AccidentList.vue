<template>
  <div class="accident-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>事故记录管理</span>
          <el-button type="primary" @click="handleAdd">新增事故记录</el-button>
        </div>
      </template>

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
        <el-form-item label="驾驶员">
          <el-select v-model="searchForm.driverId" placeholder="请选择驾驶员" clearable>
            <el-option
              v-for="driver in drivers"
              :key="driver.id"
              :label="driver.name"
              :value="driver.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="事故类型">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="碰撞" value="碰撞" />
            <el-option label="刮蹭" value="刮蹭" />
            <el-option label="追尾" value="追尾" />
            <el-option label="翻车" value="翻车" />
            <el-option label="其他" value="其他" />
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
          />
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
        <el-table-column label="驾驶员" width="100">
          <template #default="{ row }">
            {{ getDriverName(row.driverId) }}
          </template>
        </el-table-column>
        <el-table-column prop="accidentDate" label="事故时间" width="160" />
        <el-table-column prop="location" label="事故地点" width="120" />
        <el-table-column prop="type" label="事故类型" width="100" />
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)">
              {{ getSeverityText(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="responsibility" label="责任认定" width="100">
          <template #default="{ row }">
            <el-tag :type="getResponsibilityType(row.responsibility)">
              {{ row.responsibility }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="总费用" width="120">
          <template #default="{ row }">
            ¥{{ getTotalCost(row).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="保险理赔" width="180">
          <template #default="{ row }">
            <div>{{ row.insuranceClaim.claimNumber }}</div>
            <el-tag size="small" :type="getClaimStatusType(row.insuranceClaim.status)">
              {{ row.insuranceClaim.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button type="success" size="small" @click="handleViewDetail(row)">详情</el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增事故记录' : '编辑事故记录'"
      width="800px"
    >
      <el-form :model="accidentForm" label-width="100px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="车辆">
              <el-select v-model="accidentForm.vehicleId" placeholder="请选择车辆">
                <el-option
                  v-for="vehicle in vehicles"
                  :key="vehicle.id"
                  :label="vehicle.plateNumber"
                  :value="vehicle.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="驾驶员">
              <el-select v-model="accidentForm.driverId" placeholder="请选择驾驶员">
                <el-option
                  v-for="driver in drivers"
                  :key="driver.id"
                  :label="driver.name"
                  :value="driver.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="事故时间">
              <el-date-picker
                v-model="accidentForm.accidentDate"
                type="datetime"
                placeholder="选择时间"
              />
            </el-form-item>
            <el-form-item label="事故地点">
              <el-input v-model="accidentForm.location" />
            </el-form-item>
            <el-form-item label="事故类型">
              <el-select v-model="accidentForm.type" placeholder="请选择类型">
                <el-option label="碰撞" value="碰撞" />
                <el-option label="刮蹭" value="刮蹭" />
                <el-option label="追尾" value="追尾" />
                <el-option label="翻车" value="翻车" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="严重程度">
              <el-select v-model="accidentForm.severity" placeholder="请选择严重程度">
                <el-option label="轻微" value="minor" />
                <el-option label="中等" value="moderate" />
                <el-option label="严重" value="severe" />
              </el-select>
            </el-form-item>
            <el-form-item label="责任认定">
              <el-select v-model="accidentForm.responsibility" placeholder="请选择责任">
                <el-option label="全责" value="全责" />
                <el-option label="主责" value="主责" />
                <el-option label="次责" value="次责" />
                <el-option label="无责" value="无责" />
              </el-select>
            </el-form-item>
            <el-form-item label="事故描述">
              <el-input
                v-model="accidentForm.description"
                type="textarea"
                :rows="3"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="第三方信息" name="thirdParty">
            <el-form-item label="姓名">
              <el-input v-model="accidentForm.thirdParty.name" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="accidentForm.thirdParty.phone" />
            </el-form-item>
            <el-form-item label="车牌号">
              <el-input v-model="accidentForm.thirdParty.plateNumber" />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="费用信息" name="cost">
            <el-form-item label="维修费用">
              <el-input-number
                v-model="accidentForm.cost.repair"
                :min="0"
                :precision="2"
                :step="100"
              />
            </el-form-item>
            <el-form-item label="赔偿费用">
              <el-input-number
                v-model="accidentForm.cost.compensation"
                :min="0"
                :precision="2"
                :step="100"
              />
            </el-form-item>
            <el-form-item label="其他费用">
              <el-input-number
                v-model="accidentForm.cost.other"
                :min="0"
                :precision="2"
                :step="100"
              />
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="保险理赔" name="insurance">
            <el-form-item label="理赔编号">
              <el-input v-model="accidentForm.insuranceClaim.claimNumber" />
            </el-form-item>
            <el-form-item label="理赔金额">
              <el-input-number
                v-model="accidentForm.insuranceClaim.claimAmount"
                :min="0"
                :precision="2"
                :step="100"
              />
            </el-form-item>
            <el-form-item label="理赔状态">
              <el-select v-model="accidentForm.insuranceClaim.status" placeholder="请选择状态">
                <el-option label="待申请" value="待申请" />
                <el-option label="已申请" value="已申请" />
                <el-option label="已赔付" value="已赔付" />
                <el-option label="已驳回" value="已驳回" />
              </el-select>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="附件" name="attachments">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="事故详情"
      width="800px"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="车牌号">
          {{ getVehiclePlateNumber(selectedRecord?.vehicleId) }}
        </el-descriptions-item>
        <el-descriptions-item label="驾驶员">
          {{ getDriverName(selectedRecord?.driverId) }}
        </el-descriptions-item>
        <el-descriptions-item label="事故时间">
          {{ selectedRecord?.accidentDate }}
        </el-descriptions-item>
        <el-descriptions-item label="事故地点">
          {{ selectedRecord?.location }}
        </el-descriptions-item>
        <!-- 其他详情信息... -->
      </el-descriptions>
      
      <el-divider>事故照片</el-divider>
      <el-image-viewer
        v-if="previewVisible"
        :initial-index="previewIndex"
        :url-list="selectedRecord?.attachments?.map((item: Attachment) => item.url) || []"
        @close="previewVisible = false"
      />
      <div class="image-list">
        <el-image
          v-for="(image, index) in selectedRecord?.attachments"
          :key="index"
          :src="image.url"
          :preview-src-list="selectedRecord?.attachments?.map((item: Attachment) => item.url)"
          :initial-index="index"
          fit="cover"
          class="accident-image"
          @click="handlePreviewImage(index)"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import accidentRecordData from '@/mock/accidentRecord';
import vehicleData from '@/mock/vehicle';
import driverData from '@/mock/driver';

// 接口定义
interface Attachment {
  url: string;
  name: string;
  type: string;
}

interface AccidentRecord {
  vehicleId?: string;
  driverId?: string;
  accidentDate: string;
  location: string;
  attachments: Attachment[];
}

// 状态定义
const records = ref(accidentRecordData.records);
const vehicles = ref(vehicleData.vehicles);
const drivers = ref(driverData.drivers);
const dialogVisible = ref(false);
const detailVisible = ref(false);
const dialogType = ref<'add' | 'edit'>('add');
const activeTab = ref('basic');
const selectedRecord = ref<AccidentRecord | null>(null);
const previewVisible = ref(false);
const previewIndex = ref(0);

// 搜索表单
const searchForm = reactive({
  vehicleId: '',
  driverId: '',
  type: '',
  status: '',
  dateRange: [] as string[]
});

// 事故记录表单
const accidentForm = reactive({
  id: '',
  vehicleId: '',
  driverId: '',
  accidentDate: '',
  location: '',
  type: '',
  severity: '',
  description: '',
  responsibility: '',
  thirdParty: {
    name: '',
    phone: '',
    plateNumber: ''
  },
  cost: {
    repair: 0,
    compensation: 0,
    other: 0
  },
  status: '',
  handledBy: '',
  insuranceClaim: {
    claimNumber: '',
    claimAmount: 0,
    status: ''
  },
  attachments: [] as any[]
});

// 计算属性：过滤后的记录
const filteredRecords = computed(() => {
  return records.value.filter((record: { 
    vehicleId: string; 
    driverId: string; 
    type: string; 
    status: string;
    accidentDate: string;
  }) => {
    if (searchForm.vehicleId && record.vehicleId !== searchForm.vehicleId) return false;
    if (searchForm.driverId && record.driverId !== searchForm.driverId) return false;
    if (searchForm.type && record.type !== searchForm.type) return false;
    if (searchForm.status && record.status !== searchForm.status) return false;
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const recordDate = new Date(record.accidentDate);
      const startDate = new Date(searchForm.dateRange[0]);
      const endDate = new Date(searchForm.dateRange[1]);
      if (recordDate < startDate || recordDate > endDate) return false;
    }
    return true;
  });
});

// 获取车牌号
const getVehiclePlateNumber = (id?: string | number) => {
  const vehicle = vehicles.value.find((v: { id: string | number; plateNumber: string }) => v.id === id);
  return vehicle ? vehicle.plateNumber : '-';
};

// 获取驾驶员姓名
const getDriverName = (id?: string | number) => {
  const driver = drivers.value.find((d: { id: string | number; name: string }) => d.id === id);
  return driver ? driver.name : '-';
};

// 获取严重程度样式
const getSeverityType = (severity: string) => {
  const map: Record<string, string> = {
    minor: 'info',
    moderate: 'warning',
    severe: 'danger'
  };
  return map[severity];
};

// 获取严重程度文本
const getSeverityText = (severity: string) => {
  const map: Record<string, string> = {
    minor: '轻微',
    moderate: '中等',
    severe: '严重'
  };
  return map[severity];
};

// 获取责任类型样式
const getResponsibilityType = (responsibility: string) => {
  const map: Record<string, string> = {
    '全责': 'danger',
    '主责': 'warning',
    '次责': 'info',
    '无责': 'success'
  };
  return map[responsibility];
};

// 获取状态样式
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    completed: 'success'
  };
  return map[status];
};

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成'
  };
  return map[status];
};

// 获取理赔状态样式
const getClaimStatusType = (status: string) => {
  const map: Record<string, string> = {
    '待申请': 'info',
    '已申请': 'warning',
    '已赔付': 'success',
    '已驳回': 'danger'
  };
  return map[status];
};

// 计算总费用
const getTotalCost = (record: any) => {
  return record.cost.repair + record.cost.compensation + record.cost.other;
};

// 处理搜索
const handleSearch = () => {
  // 实际项目中这里会调用API
};

// 重置搜索
const resetSearch = () => {
  Object.assign(searchForm, {
    vehicleId: '',
    driverId: '',
    type: '',
    status: '',
    dateRange: []
  });
};

// 处理新增
const handleAdd = () => {
  dialogType.value = 'add';
  dialogVisible.value = true;
  activeTab.value = 'basic';
  Object.assign(accidentForm, {
    id: '',
    vehicleId: '',
    driverId: '',
    accidentDate: '',
    location: '',
    type: '',
    severity: '',
    description: '',
    responsibility: '',
    thirdParty: {
      name: '',
      phone: '',
      plateNumber: ''
    },
    cost: {
      repair: 0,
      compensation: 0,
      other: 0
    },
    status: 'pending',
    handledBy: '',
    insuranceClaim: {
      claimNumber: '',
      claimAmount: 0,
      status: '待申请'
    },
    attachments: []
  });
};

// 处理编辑
const handleEdit = (row: any) => {
  dialogType.value = 'edit';
  dialogVisible.value = true;
  activeTab.value = 'basic';
  Object.assign(accidentForm, JSON.parse(JSON.stringify(row)));
};

// 处理删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该事故记录吗？', '提示', {
    type: 'warning'
  }).then(() => {
    records.value = records.value.filter((item: { id: string | number }) => item.id !== row.id);
    ElMessage.success('删除成功');
  });
};

// 处理查看详情
const handleViewDetail = (row: any) => {
  selectedRecord.value = row;
  detailVisible.value = true;
};

// 处理图片预览
const handlePreviewImage = (index: number) => {
  previewIndex.value = index;
  previewVisible.value = true;
};

// 处理提交
const handleSubmit = () => {
  if (dialogType.value === 'add') {
    const newRecord = {
      ...accidentForm,
      id: String(records.value.length + 1)
    };
    records.value.unshift(newRecord);
    ElMessage.success('新增事故记录成功');
  } else {
    const index = records.value.findIndex((item: { id: string | number }) => item.id === accidentForm.id);
    if (index !== -1) {
      records.value[index] = { ...accidentForm };
      ElMessage.success('更新事故记录成功');
    }
  }
  dialogVisible.value = false;
};

// 处理附件上传
const handleUpload = (file: File) => {
  // 实际项目中这里会调用上传API
  const reader = new FileReader();
  reader.onload = (e) => {
    accidentForm.attachments.push({
      name: file.name,
      url: e.target?.result,
      type: file.type
    });
  };
  reader.readAsDataURL(file);
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.image-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.accident-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
}
</style> 