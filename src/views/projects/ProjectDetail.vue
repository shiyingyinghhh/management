<template>
  <div>
    <a-descriptions :column="1" title="项目信息">
      <a-descriptions-item label="项目编号">{{ projectNumber }}</a-descriptions-item>
      <a-descriptions-item label="项目名称">{{ projectName }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ creationTime }}</a-descriptions-item>
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
const creationTime = ref('');

onMounted(() => {
  projectNumber.value = route.params.projectNumber;
  // 这里可以添加获取项目详细信息的逻辑
  // 例如：从API获取项目数据
  projectName.value = '示例项目'; // 替换为实际的项目名称
  creationTime.value = '2023-05-20'; // 替换为实际的创建时间
});
</script>

<style scoped>

</style>
