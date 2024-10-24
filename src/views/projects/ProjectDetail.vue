<template>
  <div >
    <h1>项目详情: {{ projectNumber }}</h1>
    
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const projectNumber = ref('');

onMounted(() => {
  projectNumber.value = route.params.projectNumber;
});
</script>

<style scoped>

</style>
