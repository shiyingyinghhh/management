<template>
  <div>
    <a-descriptions :column="1" title="项目信息">
      <a-descriptions-item label="项目编号">{{ projectNumber }}</a-descriptions-item>
      <a-descriptions-item label="项目名称">{{ projectName }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ createTime }}</a-descriptions-item>
      <!-- 添加更多项目相关信息 -->
    </a-descriptions>
    <!-- 可以添加更多组件，如项目统计、最近活动等 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectNumber = ref('');
const projectName = ref('');
const createTime = ref('');

onMounted(() => {
  // 从路由参数中获取项目信息
  projectNumber.value = route.params.projectNumber;
  projectName.value = route.query.projectName || '';
  createTime.value = route.query.createTime || '';
});
</script>

<style scoped>

</style>
