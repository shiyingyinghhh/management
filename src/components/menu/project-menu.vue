<template>
  <div class="menu-wrapper">
    <a-menu
      :style="{ width: '100%', height: '100%' }"
      :defaultOpenKeys="['1']"
      :defaultSelectedKeys="['1_1']"
      :collapsed="collapsed"
      show-collapse-button
      @collapse="handleCollapse"
    >
      <a-sub-menu key="1">
        <template #icon><icon-palette /></template>
        <template #title>资源管理</template>
        <a-menu-item key="1_1" @click="navigateTo('templateManagement')">证书模板</a-menu-item>
        <a-menu-item key="1_2" @click="navigateTo('materialManagement')">模板素材</a-menu-item>
      </a-sub-menu>
      <a-menu-item key="2" @click="navigateTo('certificateManagement')">
        <template #icon><icon-file /></template>
        证书管理
      </a-menu-item>
      <template #collapse-button="{ collapsed }">
        <div class="collapse-button-wrapper">
          <a-button
            class="collapse-button"
            type="text"
            shape="circle"
            @click="() => handleCollapse(!collapsed)"
          >
            <icon-menu-fold v-if="!collapsed" />
            <icon-menu-unfold v-else />
          </a-button>
        </div>
      </template>
    </a-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/store';
import { IconPalette, IconFile, IconMenuFold, IconMenuUnfold } from '@arco-design/web-vue/es/icon';

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();
const collapsed = ref(appStore.menuCollapse);

const handleCollapse = (val) => {
  collapsed.value = val;
  appStore.updateSettings({ menuCollapse: val });
};

const navigateTo = (routeName) => {
  router.push({
    name: routeName,
    params: { projectNumber: route.params.projectNumber }
  });
};
</script>

<style scoped>
.menu-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.collapse-button-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 0;
  text-align: center;
}

:deep(.arco-menu) {
  ::-webkit-scrollbar {
    width: 12px;
    height: 4px;
  }

  ::-webkit-scrollbar-thumb {
    border: 4px solid transparent;
    background-clip: padding-box;
    border-radius: 7px;
    background-color: var(--color-text-4);
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-text-3);
  }
}
</style>
