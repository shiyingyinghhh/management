<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold mb-6">模板管理</h1>
      <button @click="showAddTemplateModal" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
        新增模板
      </button>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">模板名称</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="template in templates" :key="template.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ template.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="editTemplate(template)" class="text-blue-600 hover:text-blue-900 mr-2">编辑</button>
                <button @click="deleteTemplate(template)" class="text-red-600 hover:text-red-900 mr-2">删除</button>
                <button @click="goToMaterials(template)" class="text-green-600 hover:text-green-900">素材管理</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 模态框部分保持不变 -->
    </div>
  </template>
  
  <script setup>
  // 脚本部分保持不变
  </script>