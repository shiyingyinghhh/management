<template>
  <div>
    <h1>项目详情</h1>
    <p>项目编号: {{ projectNumber }}</p>
    <!-- 在这里添加更多项目详情的内容 -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectNumber = ref('');

onMounted(() => {
  projectNumber.value = route.params.projectNumber;
  console.log('项目编号:', projectNumber.value);
  // 在这里可以根据项目编号获取项目详细信息
});
</script>
