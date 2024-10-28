<template>
  <div class="container">
    <a-card class="general-card" title="模板素材管理">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="fileName" label="文件名称">
                  <a-input
                    v-model="searchForm.fileName"
                    placeholder="请输入文件名称"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space>
                  <a-button type="primary" @click="search">
                    <template #icon>
                      <icon-search />
                    </template>
                    搜索
                  </a-button>
                  <a-button @click="reset">
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
        <a-col :flex="'86px'" style="text-align: right">
          <a-button type="primary" @click="openAddDrawer">
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
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handleDownload(record)">
            下载
          </a-button>
          <a-popconfirm
            content="确定要删除这个素材吗？"
            @ok="handleDelete(record)"
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
        @cancel="closeAddDrawer"
        @ok="confirmAdd"
        title="新增素材"
        width="500px"
      >
        <a-form :model="addForm" :label-col-props="{ span: 6 }" :wrapper-col-props="{ span: 18 }">
          <a-form-item field="materialName" label="素材名称" required>
            <a-input v-model="addForm.materialName" placeholder="请输入素材名称" />
          </a-form-item>
          <a-form-item field="file" label="上传文件" required>
            <input type="file" @change="handleFileChange" ref="fileInput" style="display: none;" />
            <a-button @click="triggerFileInput">选择文件</a-button>
            <div v-if="addForm.fileName" style="margin-left: 10px;">已选择: {{ addForm.fileName }}</div>
          </a-form-item>
        </a-form>
      </a-drawer>
    </a-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchForm = reactive({
  fileName: '',
});

const loading = ref(false);
const renderData = ref([]);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
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

// 从localStorage获取数据
const getLocalData = () => {
  const data = localStorage.getItem('materialData');
  return data ? JSON.parse(data) : [];
};

// 保存数据到localStorage
const saveLocalData = (data) => {
  localStorage.setItem('materialData', JSON.stringify(data));
};

// 获取素材列表
const fetchData = () => {
  loading.value = true;
  const allData = getLocalData();
  const filteredData = allData.filter(item => 
    item.fileName.toLowerCase().includes(searchForm.fileName.toLowerCase())
  );
  renderData.value = filteredData.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );
  pagination.total = filteredData.length;
  loading.value = false;
};

const search = () => {
  pagination.current = 1;
  fetchData();
};

const reset = () => {
  searchForm.fileName = '';
  search();
};

const onPageChange = (current) => {
  pagination.current = current;
  fetchData();
};

const drawerVisible = ref(false);
const addForm = reactive({
  materialName: '',
  fileName: '',
  file: null,
});

const openAddDrawer = () => {
  addForm.materialName = '';
  addForm.fileName = '';
  addForm.file = null;
  drawerVisible.value = true;
};

const closeAddDrawer = () => {
  drawerVisible.value = false;
};

const fileInput = ref(null);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log('Selected file:', file);
    addForm.fileName = file.name;
    addForm.file = file;
    Message.success('素材选择成功');
  } else {
    console.error('No file selected');
    Message.error('素材选择失败');
  }
};

const confirmAdd = () => {
  if (!addForm.materialName.trim()) {
    Message.error('请输入素材名称');
    return;
  }
  if (!addForm.file) {
    Message.error('请选择素材');
    return;
  }
  console.log('Uploading file:', addForm.file);
  handleFileUpload(addForm.file, () => {
    drawerVisible.value = false;
    Message.success('素材添加成功');
    fetchData();
  }, (error) => {
    console.error('File upload error:', error);
    Message.error('素材添加失败: ' + error.message);
  });
};

const handleFileUpload = (fileObj, onSuccess, onError) => {
  const reader = new FileReader();
  
  reader.onload = (event) => {
    try {
      const allData = getLocalData();
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
      saveLocalData(allData);
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
};

const handleDownload = (record) => {
  const link = document.createElement('a');
  link.href = record.fileData;
  link.download = record.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const handleDelete = (record) => {
  const allData = getLocalData();
  const index = allData.findIndex(item => item.id === record.id);
  if (index !== -1) {
    allData.splice(index, 1);
    saveLocalData(allData);
    Message.success('素材删除成功');
    fetchData();
  }
};

onMounted(() => {
  fetchData();
});
</script>

