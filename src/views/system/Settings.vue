<template>
  <div class="settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统设置</span>
          <el-button type="primary" @click="handleSave">保存设置</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 公司信息设置 -->
        <el-tab-pane label="公司信息" name="company">
          <el-form :model="settings.company" label-width="120px">
            <el-form-item label="公司名称">
              <el-input v-model="settings.company.name" />
            </el-form-item>
            <el-form-item label="公司地址">
              <el-input v-model="settings.company.address" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="settings.company.contact" />
            </el-form-item>
<!--            <el-form-item label="公司Logo">-->
<!--              <el-upload-->
<!--                class="avatar-uploader"-->
<!--                action="#"-->
<!--                :show-file-list="false"-->
<!--                :auto-upload="false"-->
<!--              >-->
<!--                <img v-if="settings.company.logo" :src="settings.company.logo" class="avatar">-->
<!--                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>-->
<!--              </el-upload>-->
<!--            </el-form-item>-->
          </el-form>
        </el-tab-pane>

        <!-- 系统参数设置 -->
        <el-tab-pane label="系统参数" name="system">
          <el-form :model="settings.system" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="settings.system.name" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="settings.system.version" disabled />
            </el-form-item>
            <el-form-item label="主题设置">
              <el-select v-model="settings.system.theme">
                <el-option label="浅色" value="light" />
                <el-option label="深色" value="dark" />
              </el-select>
            </el-form-item>
            <el-form-item label="每页显示条数">
              <el-input-number v-model="settings.system.pageSize" :min="10" :max="100" :step="10" />
            </el-form-item>
            <el-form-item label="日期格式">
              <el-select v-model="settings.system.dateFormat">
                <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                <el-option label="YYYY/MM/DD" value="YYYY/MM/DD" />
                <el-option label="DD/MM/YYYY" value="DD/MM/YYYY" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间格式">
              <el-select v-model="settings.system.timeFormat">
                <el-option label="HH:mm:ss" value="HH:mm:ss" />
                <el-option label="HH:mm" value="HH:mm" />
                <el-option label="hh:mm:ss a" value="hh:mm:ss a" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 提醒设置 -->
        <el-tab-pane label="提醒设置" name="notification">
          <el-form :model="settings.notification" label-width="120px">
            <el-form-item label="保养提醒天数">
              <el-input-number v-model="settings.notification.maintenanceReminder" :min="1" :max="30" />
            </el-form-item>
            <el-form-item label="年检提醒天数">
              <el-input-number v-model="settings.notification.inspectionReminder" :min="1" :max="90" />
            </el-form-item>
            <el-form-item label="保险提醒天数">
              <el-input-number v-model="settings.notification.insuranceReminder" :min="1" :max="90" />
            </el-form-item>
            <el-form-item label="证照提醒天数">
              <el-input-number v-model="settings.notification.licenseReminder" :min="1" :max="90" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 备份设置 -->
        <el-tab-pane label="备份设置" name="backup">
          <el-form :model="settings.backup" label-width="120px">
            <el-form-item label="自动备份">
              <el-switch v-model="settings.backup.autoBackup" />
            </el-form-item>
            <el-form-item label="备份时间">
              <el-time-picker v-model="settings.backup.backupTime" format="HH:mm" />
            </el-form-item>
            <el-form-item label="备份保留天数">
              <el-input-number v-model="settings.backup.backupRetention" :min="1" :max="365" />
            </el-form-item>
            <el-form-item label="上次备份时间">
              <el-input v-model="settings.backup.lastBackupTime" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleBackupNow">立即备份</el-button>
              <el-button type="success" @click="handleRestore">恢复数据</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import systemConfigData from '@/mock/systemConfig';

const activeTab = ref('company');
const settings = reactive(systemConfigData.settings);

// 保存设置
const handleSave = () => {
  // 实际项目中这里会调用API保存设置
  ElMessage.success('设置保存成功');
};

// 立即备份
const handleBackupNow = () => {
  ElMessage.success('数据备份已开始，请稍候...');
  setTimeout(() => {
    settings.backup.lastBackupTime = new Date().toISOString();
    ElMessage.success('数据备份完成');
  }, 2000);
};

// 恢复数据
const handleRestore = () => {
  ElMessage.warning('该功能需要在实际项目中实现');
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}
.avatar-uploader:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 