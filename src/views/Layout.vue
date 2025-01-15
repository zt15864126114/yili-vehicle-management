<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <div class="logo">
        <el-icon :size="32" color="#409EFF"><Van /></el-icon>
        <span>车辆管理系统</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
        router
      >
        <template v-for="item in menuItems" :key="item.path">
          <el-menu-item v-if="!item.children" :index="item.path">
            <el-icon><component :is="iconMap[item.icon as keyof typeof iconMap]" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
          
          <el-sub-menu v-else :index="item.path">
            <template #title>
              <el-icon><component :is="iconMap[item.icon as keyof typeof iconMap]" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item 
              v-for="child in item.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-left">
          <el-icon 
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { menuItems } from '@/config/menu';
import {
  Fold,
  Expand,
  Odometer,
  Van,
  User,
  Tools as Operation,
  Warning as Shield,
  DataLine,
  Setting
} from '@element-plus/icons-vue';

// 图标映射
const iconMap: Record<string, any> = {
  Odometer,
  Van,
  User,
  Operation,
  Shield,
  DataLine,
  Setting
};

const route = useRoute();
const isCollapse = ref(false);
const activeMenu = computed(() => route.path);
const currentRoute = computed(() => {
  const currentMenu = menuItems.find(item => item.path === route.path);
  return currentMenu?.title || '';
});

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background-color: #2b3649;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 12px;
}

.logo span {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style> 