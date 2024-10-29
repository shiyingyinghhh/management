<script setup>
import { reactive, ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';



const data = reactive({
  loading: false,
  renderData: [],
  drawerVisible: false,
  searchForm: {
    materialName: '',
  },
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10,
  },
  addForm: {
    materialName: '',
    materialCode: '',
    file: null,
  }
});

const columns = [
  {
    title: '素材编码',
    dataIndex: 'materialCode',
  },
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

const fileList = ref([]);

const formRef = ref(null);

const rules = {
  materialCode: [
    { required: true, message: '请输入素材编码' },
    {
      validator: (value, callback) => {
        if (value) {
          const allData = handle.getLocalData();
          const isCodeExist = allData.some(item => 
            item.materialCode === value
          );
          if (isCodeExist) {
            callback('素材编码已存在，请使用其他编码');
            return;
          }
        }
        callback();
      },
      validateTrigger: ['change', 'input']
    }
  ],
  materialName: [
    { required: true, message: '请输入素材名称' },
    {
      validator: (value, callback) => {
        if (value) {
          const allData = handle.getLocalData();
          const isNameExist = allData.some(item => 
            item.materialName === value
          );
          if (isNameExist) {
            callback('素材名称已存在，请使用其他名称');
            return;
          }
        }
        callback();
      },
      validateTrigger: ['change', 'input']
    }
  ],
  file: [
    { 
      required: true, 
      message: '请选择素材文件',
      validator: (value, callback) => {
        if (!data.addForm.file) {
          callback('请选择素材文件');
          return;
        }
        callback();
      }
    }
  ]
};

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
    data.loading = true;
    const allData = handle.getLocalData();
    const filteredData = allData.filter(item => 
      item.materialName.toLowerCase().includes(data.searchForm.materialName.toLowerCase())
    );
    data.renderData = filteredData.slice(
      (data.pagination.current - 1) * data.pagination.pageSize,
      data.pagination.current * data.pagination.pageSize
    );
    data.pagination.total = filteredData.length;
    data.loading = false;
  },

  search: () => {
    data.pagination.current = 1;
    handle.fetchData();
  },

  reset: () => {
    data.searchForm.materialName = '';
    handle.search();
  },

  onPageChange: (current) => {
    data.pagination.current = current;
    handle.fetchData();
  },


 

  

  // 抽屉相关方法
  openAddDrawer: () => {
    data.addForm = {
      materialName: '',
      materialCode: '',
      file: null,
    };
    fileList.value = [];
    data.drawerVisible = true;
  },

  closeAddDrawer: () => {
    data.drawerVisible = false;
    fileList.value = [];
  },

  confirmAdd: () => {
    formRef.value.validate().then(() => {
      const allData = handle.getLocalData();
      const isNameExist = allData.some(item => 
        item.materialName === data.addForm.materialName
      );
      const isCodeExist = allData.some(item => 
        item.materialCode === data.addForm.materialCode
      );

      if (isNameExist) {
        Message.error('素材名称已存在，请使用其他名称');
        return;
      }
      if (isCodeExist) {
        Message.error('素材编码已存在，请使用其他编码');
        return;
      }

      console.log('Uploading file:', data.addForm.file);
      handle.fileUpload(data.addForm.file, () => {
        data.drawerVisible = false;
        Message.success('素材添加成功');
        handle.fetchData();
      }, (error) => {
        console.error('File upload error:', error);
        Message.error('素材添加失败: ' + error.message);
      });
    }).catch((errors) => {
      console.log('validation errors:', errors);
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

  fileUpload: (file, onSuccess, onError) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const allData = handle.getLocalData();
        
        const isCodeExist = allData.some(item => 
          item.materialCode === data.addForm.materialCode
        );
        
        if (isCodeExist) {
          onError(new Error('素材编码已存在，请使用其他编码'));
          return;
        }

        const newMaterial = {
          id: Date.now(),
          materialCode: data.addForm.materialCode,
          materialName: data.addForm.materialName,
          fileName: file.name,
          fileSize: file.size,
          fileData: e.target.result,
          uploadTime: new Date().toLocaleString()
        };
        allData.push(newMaterial);
        handle.saveLocalData(allData);
        onSuccess();
      };
      reader.onerror = (error) => {
        onError(error);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      onError(error);
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
            :model="data.searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="materialName" label="素材名称">
                  <a-input
                    v-model="data.searchForm.materialName"
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
        :loading="data.loading"
        :pagination="data.pagination"
        :columns="columns"
        :data="data.renderData"
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
        :visible="data.drawerVisible"
        @cancel="handle.closeAddDrawer"
        @ok="handle.confirmAdd"
        title="新增素材"
        width="500px"
      >
        <a-form 
          ref="formRef"
          :model="data.addForm" 
          :rules="rules"
          layout="vertical"
        >
          <a-form-item field="materialCode" label="素材编码" required>
            <a-input 
              v-model="data.addForm.materialCode" 
              placeholder="请输入素材编码" 
              allow-clear
            />
          </a-form-item>
          <a-form-item field="materialName" label="素材名称" required>
            <a-input 
              v-model="data.addForm.materialName" 
              placeholder="请输入素材名称" 
              allow-clear
            />
          </a-form-item>
          <a-form-item field="file" label="上传素材" required>
            <a-upload
              :auto-upload="false"
              :limit="1"  
              :file-list="fileList"
              @change="(files) => {
                fileList.value = files;
                data.addForm.file = files.length > 0 ? files[0].file : null;
              }"
            >
              <template #upload-button>
                <a-button>选择文件</a-button>
              </template>
            </a-upload>
          </a-form-item>
        </a-form>
      </a-drawer>
    </a-card>
  </div>
</template>




