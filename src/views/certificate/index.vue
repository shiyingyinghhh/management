<template>
  <div class="container">
    <a-card class="general-card" title="证书管理">
      <a-row>
        <a-col :flex="1">
          <a-form
            :model="data.searchForm"
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label-align="left"
          >
            <a-row :gutter="16">
              <a-col :span="8">
                <a-form-item field="certificateName" label="证书名称">
                  <a-input
                    v-model="data.searchForm.certificateName"
                    placeholder="请输入证书名称"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="status" label="状态">
                  <a-select v-model="data.searchForm.status" placeholder="请选择状态">
                    <a-option value="pending">待发送</a-option>
                    <a-option value="sent">已发送</a-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-space>
                  <a-button type="primary" @click="handle.search">
                    <template #icon><icon-search /></template>
                    搜索
                  </a-button>
                  <a-button @click="handle.reset">
                    <template #icon><icon-refresh /></template>
                    重置
                  </a-button>
                </a-space>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
        <a-col :flex="'86px'" style="text-align: right">
          <a-button type="primary" @click="handle.openDrawer()">
            <template #icon><icon-plus /></template>
            新增证书
          </a-button>
        </a-col>
      </a-row>
      <a-table
        row-key="id"
        :loading="data.loading"
        :pagination="data.pagination"
        :columns="columns"
        :data="data.renderData"
        :bordered="false"
        @page-change="handle.onPageChange"
      >
        <template #status="{ record }">
          <a-tag :color="record.status === 'sent' ? 'green' : 'orange'">
            {{ record.status === 'sent' ? '已发送' : '待发送' }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handle.openDrawer(record)">
              编辑
            </a-button>
            <a-button type="text" size="small" @click="handle.downloadCertificate(record)">
              下载
            </a-button>
            <a-button 
              type="text" 
              size="small" 
              status="success" 
              @click="handle.sendEmail(record)"
              :disabled="record.status === 'sent'"
            >
              发送邮件
            </a-button>
            <a-popconfirm
              content="确定要删除这个证书吗？"
              @ok="handle.delete(record)"
            >
              <a-button type="text" status="danger" size="small">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :visible="data.drawerVisible"
      @cancel="handle.closeDrawer"
      @ok="handle.submit"
      :title="drawerTitle"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="data.form"
        :rules="data.rules"
        layout="vertical"
        @submit="handle.submit"
      >
        <a-form-item field="certificateName" label="证书名称">
          <a-input v-model="data.form.certificateName" placeholder="请输入证书名称" />
        </a-form-item>
        <a-form-item field="recipientName" label="接收人姓名">
          <a-input v-model="data.form.recipientName" placeholder="请输入接收人姓名" />
        </a-form-item>
        <a-form-item field="recipientEmail" label="接收人邮箱">
          <a-input v-model="data.form.recipientEmail" placeholder="请输入接收人邮箱" />
        </a-form-item>
        <a-form-item field="certificateFile" label="证书文件">
          <a-upload
            :file-list="data.form.certificateFile"
            @change="handle.onFileChange"
            :custom-request="handle.customUpload"
            :limit="1"
            :show-file-list="true"
            accept=".pdf"
            :auto-upload="true"
            @before-upload="handle.beforeUpload"
          >
            <template #upload-button>
              <a-button v-if="!data.form.certificateFile.length">
                <icon-upload /> 上传证书
              </a-button>
            </template>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const formRef = ref(null);

const data = reactive({
  searchForm: {
    certificateName: '',
    status: '',
  },
  form: {
    id: null,
    certificateName: '',
    recipientName: '',
    recipientEmail: '',
    certificateFile: [],
    status: 'pending',
  },
  rules: {
    certificateName: [
      { required: true, message: '请输入证书名称' }
    ],
    recipientName: [
      { required: true, message: '请输入接收人姓名' }
    ],
    recipientEmail: [
      { required: true, message: '请输入接收人邮箱' },
      // { 
      //   validator: (value, callback) => {
      //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      //     if (!emailRegex.test(value)) {
      //       callback('请输入有效的邮箱地址');
      //     }
      //     callback();
      //   }
      // }
    ],
    certificateFile: [
      { required: true, message: '请上传证书文件' }
    ],
  },
  loading: false,
  renderData: [],
  pagination: {
    total: 0,
    current: 1,
    pageSize: 10,
  },
  drawerVisible: false,
});

const drawerTitle = computed(() => data.form.id ? '编辑证书' : '新增证书');

const columns = [
  {
    title: '证书名称',
    dataIndex: 'certificateName',
  },
  {
    title: '接收人',
    dataIndex: 'recipientName',
  },
  {
    title: '邮箱',
    dataIndex: 'recipientEmail',
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
  },
];

const handle = {
  search() {
    data.pagination.current = 1;
    handle.fetchData();
  },

  reset() {
    data.searchForm.certificateName = '';
    data.searchForm.status = '';
    handle.search();
  },

  onPageChange(current) {
    data.pagination.current = current;
    handle.fetchData();
  },

  openDrawer(record) {
    if (record) {
      Object.assign(data.form, {
        ...record,
        certificateFile: record.certificateFile || []
      });
    } else {
      Object.assign(data.form, {
        id: null,
        certificateName: '',
        recipientName: '',
        recipientEmail: '',
        certificateFile: [],
        status: 'pending',
      });
    }
    data.drawerVisible = true;
  },

  closeDrawer() {
    data.drawerVisible = false;
    formRef.value?.resetFields();
  },

  async submit() {
    try {
      await formRef.value.validate();
      const allData = handle.getLocalData();
      const formData = {
        ...data.form,
        certificateFile: data.form.certificateFile.map(file => ({
          uid: file.uid,
          name: file.name,
          url: file.url,
          status: file.status
        }))
      };

      if (data.form.id) {
        const index = allData.findIndex(item => item.id === data.form.id);
        if (index !== -1) {
          allData[index] = { ...formData };
        }
        Message.success('证书更新成功');
      } else {
        const newId = allData.length > 0 ? Math.max(...allData.map(item => item.id)) + 1 : 1;
        allData.push({ ...formData, id: newId });
        Message.success('证书创建成功');
      }
      handle.saveLocalData(allData);
      handle.closeDrawer();
      handle.fetchData();
    } catch (error) {
      console.error('表单提交失败', error);
      Message.error('操作失败，请重试');
    }
  },

  delete(record) {
    const allData = handle.getLocalData();
    const index = allData.findIndex(item => item.id === record.id);
    if (index !== -1) {
      allData.splice(index, 1);
      handle.saveLocalData(allData);
      Message.success('证书删除成功');
      handle.fetchData();
    }
  },

  getLocalData() {
    const storageData = localStorage.getItem('certificateData');
    return storageData ? JSON.parse(storageData) : [];
  },

  saveLocalData(storageData) {
    localStorage.setItem('certificateData', JSON.stringify(storageData));
  },

  fetchData() {
    data.loading = true;
    const allData = handle.getLocalData();
    let filteredData = allData;

    // 按证书名称筛选
    if (data.searchForm.certificateName) {
      filteredData = filteredData.filter(item => 
        item.certificateName.toLowerCase().includes(data.searchForm.certificateName.toLowerCase())
      );
    }

    // 按状态筛选
    if (data.searchForm.status) {
      filteredData = filteredData.filter(item => 
        item.status === data.searchForm.status
      );
    }

    data.renderData = filteredData.slice(
      (data.pagination.current - 1) * data.pagination.pageSize,
      data.pagination.current * data.pagination.pageSize
    );
    data.pagination.total = filteredData.length;
    data.loading = false;
  },

  async downloadCertificate(record) {
    try {
      if (record.certificateFile && record.certificateFile.length > 0) {
        const file = record.certificateFile[0];
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Message.success('证书下载成功');
      } else {
        Message.error('未找到证书文件');
      }
    } catch (error) {
      console.error('下载失败:', error);
      Message.error('下载失败，请重试');
    }
  },

  async sendEmail(record) {
    try {
      // 这里实现发送邮件的逻辑
      const allData = handle.getLocalData();
      const index = allData.findIndex(item => item.id === record.id);
      if (index !== -1) {
        allData[index].status = 'sent';
        handle.saveLocalData(allData);
        handle.fetchData();
      }
      Message.success('邮件发送成功');
    } catch (error) {
      Message.error('邮件发送失败，请重试');
    }
  },

  beforeUpload(file) {
    // 检查文件对象
    if (!file || typeof file !== 'object') {
      Message.error('无效的文件对象');
      return false;
    }

    // 检查文件类型
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      Message.error('只能上传 PDF 文件！');
      return false;
    }

    // 检查文件大小
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      Message.error('文件必须小于 10MB！');
      return false;
    }

    return true;
  },

  customUpload(options) {
    const { fileItem, onProgress, onSuccess, onError } = options;
    
    try {
      const file = fileItem.file;  // 获取真实的文件对象
      
      if (!handle.beforeUpload(file)) {
        onError(new Error('文件验证失败'));
        return;
      }

      const reader = new FileReader();
      
      reader.onload = () => {
        const fileData = {
          uid: Date.now(),
          name: file.name,
          url: reader.result,
          status: 'done',
          size: file.size,
          type: file.type
        };
        
        onProgress({ percent: 100 });
        onSuccess(fileData);
        
        // 更新表单数据
        data.form.certificateFile = [fileData];
        Message.success('文件上传成功');
      };

      reader.onerror = (error) => {
        console.error('File reading error:', error);
        onError(error);
        Message.error('文件读取失败');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
      Message.error('文件上传失败');
    }
  },

  onFileChange(fileList) {
    console.log('onFileChange:', fileList);
    data.form.certificateFile = fileList;
  },
};

onMounted(() => {
  handle.fetchData();
});
</script>

<style scoped>
.upload-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0;
}

:deep(.arco-upload-list-item) {
  margin-top: 8px;
}

:deep(.arco-upload-list) {  
  margin-top: 8px;
}

:deep(.arco-upload-list-item-name) {
  color: rgb(var(--primary-6));
}
</style>

