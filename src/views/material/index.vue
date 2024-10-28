<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const renderData = ref([]);
const drawerVisible = ref(false);
const fileInput = ref(null);

const searchForm = reactive({
  materialName: '',
});

const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
});

const addForm = reactive({
  materialName: '',
  file: null,
});

const columns = [
  {
    title: '素材名称',
    dataIndex: 'materialName',
  },
  {
    title: '文件名称',
    dataIndex: 'fileName',
  },
  {
    title: '文件大小',
    dataIndex: 'fileSize',
    render: ({ record }) => `${(record.fileSize / 1024).toFixed(2)} KB`,
  },
  {
    title: '上传时间',
    dataIndex: 'uploadTime',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
  },
];

const handle = {
  // 本地存储相关方法
  getLocalData: () => {
    const data = localStorage.getItem('materialData');
    return data ? JSON.parse(data) : [];
  },

  saveLocalData: (data) => {
    localStorage.setItem('materialData', JSON.stringify(data));
  },

  // 数据获取和搜索相关方法
  fetchData: () => {
    loading.value = true;
    const allData = handle.getLocalData();
    const filteredData = allData.filter(item => 
      item.materialName.toLowerCase().includes(searchForm.materialName.toLowerCase())
    );
    renderData.value = filteredData.slice(
      (pagination.current - 1) * pagination.pageSize,
      pagination.current * pagination.pageSize
    );
    pagination.total = filteredData.length;
    loading.value = false;
  },

  search: () => {
    pagination.current = 1;
    handle.fetchData();
  },

  reset: () => {
    searchForm.materialName = '';
    handle.search();
  },

  onPageChange: (current) => {
    pagination.current = current;
    handle.fetchData();
  },

  // 文件上传相关方法
  triggerFileInput: () => {
    fileInput.value.click();
  },

  fileChange: (event) => {
    const file = event.target.files[0];
    if (file) {
      addForm.file = file;
      Message.success('素材选择成功');
    } else {
      addForm.file = null;
      Message.error('素材选择失败');
    }
    event.target.value = '';
  },

  fileUpload: (fileObj, onSuccess, onError) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const allData = handle.getLocalData();
        const newId = Math.max(...allData.map(item => item.id || 0), 0) + 1;
        const newFile = {
          id: newId,
          fileName: fileObj.name,
          materialName: addForm.materialName,
          uploadTime: new Date().toLocaleString(),
          fileData: event.target.result,
          fileSize: fileObj.size
        };
        allData.push(newFile);
        handle.saveLocalData(allData);
        onSuccess();
      } catch (error) {
        console.error('上传失败:', error);
        onError(error);
      }
    };

    reader.onerror = (error) => {
      console.error('素材读取失败:', error);
      onError(error);
    };

    reader.readAsDataURL(fileObj);
  },

  // 抽屉相关方法
  openAddDrawer: () => {
    addForm.materialName = '';
    addForm.file = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    drawerVisible.value = true;
  },

  closeAddDrawer: () => {
    drawerVisible.value = false;
  },

  confirmAdd: () => {
    if (!addForm.materialName.trim()) {
      Message.error('请输入素材名称');
      return;
    }
    if (!addForm.file) {
      Message.error('请选择素材');
      return;
    }
    console.log('Uploading file:', addForm.file);
    handle.fileUpload(addForm.file, () => {
      drawerVisible.value = false;
      Message.success('素材添加成功');
      handle.fetchData();
    }, (error) => {
      console.error('File upload error:', error);
      Message.error('素材添加失败: ' + error.message);
    });
  },

  // 操作相关方法
  download: (record) => {
    const link = document.createElement('a');
    link.href = record.fileData;
    link.download = record.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  delete: (record) => {
    const allData = handle.getLocalData();
    const index = allData.findIndex(item => item.id === record.id);
    if (index !== -1) {
      allData.splice(index, 1);
      handle.saveLocalData(allData);
      Message.success('素材删除成功');
      handle.fetchData();
    }
  },
};

// 初始化
onMounted(() => {
  handle.fetchData();
});
</script>

<template>
  <div class="container">
    <a-card class="general-card" title="模板素材">
      <a-row class="mb-4">
        <a-col :flex="1">
          <a-form
            :model="searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="materialName" label="素材名称">
                  <a-input
                    v-model="searchForm.materialName"
                    placeholder="请输入素材名称"
                    class="w-full"
                    allow-clear="true"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space>
                  <a-button type="primary" @click="handle.search">
                    <template #icon>
                      <icon-search />
                    </template>
                    搜索
                  </a-button>
                  <a-button @click="handle.reset">
                    <template #icon>
                      <icon-refresh />
                    </template>
                    重置
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :flex="'86px'" class="text-right">
          <a-button type="primary" @click="handle.openAddDrawer">
            <template #icon>
              <icon-plus />
            </template>
            新增
          </a-button>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="renderData"
        class="mt-4"
        :bordered="false"
        @page-change="handle.onPageChange"
      >
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handle.download(record)">
            下载
          </a-button>
          <a-popconfirm
            content="确定要删除这个素材吗？"
            @ok="handle.delete(record)"
          >
            <a-button type="text" status="danger" size="small">
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>

      <!-- 新增素材抽屉 -->
      <a-drawer
        :visible="drawerVisible"
        @cancel="handle.closeAddDrawer"
        @ok="handle.confirmAdd"
        title="新增素材"
        width="500px"
      >
        <a-form 
          :model="addForm" 
          :label-col-props="{ span: 6 }" 
          :wrapper-col-props="{ span: 18 }"
        >
          <a-form-item field="materialName" label="素材名称" required>
            <a-input v-model="addForm.materialName" placeholder="请输入素材名称" class="w-full" />
          </a-form-item>
          <a-form-item field="file" label="上传素材" required>
            <div class="flex items-center gap-2">
              <input 
                type="file" 
                @change="handle.fileChange" 
                ref="fileInput" 
                class="hidden" 
                accept="image/*,.pdf"
              />
              <a-button @click="handle.triggerFileInput">
                {{ addForm.file ? '重新选择' : '选择素材' }}
              </a-button>
              <span v-if="addForm.file" class="text-gray-600">
                {{ addForm.file.name }}
              </span>
            </div>  
          </a-form-item>
        </a-form>
      </a-drawer>
    </a-card>
  </div>
</template>



