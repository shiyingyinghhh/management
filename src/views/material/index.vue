<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">素材管理</h1>
      <div class="mb-4">
        <label class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
          上传素材
          <input type="file" class="hidden" @change="handleFileUpload" />
        </label>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">素材名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="material in materials" :key="material.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ material.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="downloadMaterial(material)" class="text-blue-600 hover:text-blue-900 mr-2">下载</button>
                <button @click="deleteMaterial(material)" class="text-red-600 hover:text-red-900">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const projectId = route.params.projectId;
  const templateId = route.params.templateId;
  
  const materials = ref([]);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    // 实现文件上传逻辑
  };
  
  const downloadMaterial = (material) => {
    // 实现下载素材的逻辑
  };
  
  const deleteMaterial = (material) => {
    // 实现删除素材的逻辑
  };
  </script>