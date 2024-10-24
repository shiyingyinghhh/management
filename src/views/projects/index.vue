<script setup>
  // 脚本部分保持不变
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">项目管理</h1>
    <button @click="addProject" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
      新增项目
    </button>
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">项目名称</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="project in projects" :key="project.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ project.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button @click="editProject(project)" class="text-blue-600 hover:text-blue-900 mr-2">编辑</button>
              <button @click="deleteProject(project)" class="text-red-600 hover:text-red-900">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
