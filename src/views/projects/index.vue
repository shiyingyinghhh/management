<script setup>
import { reactive, ref, computed } from 'vue';
import { Message } from '@arco-design/web-vue';

const searchForm = reactive({
  projectName: '',
  projectNumber: '',
});

const form = reactive({
  id: null,
  projectNumber: '',
  projectName: '',
});

const rules = {
  projectNumber: [
    { required: true, message: '请输入项目编号' },
    {
      validator: (value, callback) => {
        if (value) {
          const isExist = mockData.some(item => item.projectNumber === value && item.id !== form.id);
          if (isExist) {
            callback('项目编号已存在');
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
    },
  ],
  projectName: [
    { required: true, message: '请输入项目名称' },
  ],
};

const loading = ref(false);
const renderData = ref([]);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: 10,
});

const drawerVisible = ref(false);
const drawerTitle = computed(() => form.id ? '编辑项目' : '新增项目');
const formRef = ref(null);

const columns = [
  {
    title: '项目编号',
    dataIndex: 'projectNumber',
  },
  {
    title: '项目名称',
    dataIndex: 'projectName',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
  },
];

// 模拟数据
const mockData = [
  { id: 1, projectNumber: 'P001', projectName: '项目A' },
  { id: 2, projectNumber: 'P002', projectName: '项目B' },
  { id: 3, projectNumber: 'P003', projectName: '项目C' },
];

const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    renderData.value = mockData.filter(item => 
      item.projectName.includes(searchForm.projectName) &&
      item.projectNumber.includes(searchForm.projectNumber)
    );
    pagination.total = renderData.value.length;
    loading.value = false;
  }, 1000);
};

const search = () => {
  pagination.current = 1;
  fetchData();
};

const reset = () => {
  searchForm.projectName = '';
  searchForm.projectNumber = '';
  search();
};

const onPageChange = (current) => {
  pagination.current = current;
  fetchData();
};

const openDrawer = (record) => {
  if (record) {
    Object.assign(form, record);
  } else {
    Object.assign(form, {
      id: null,
      projectNumber: '',
      projectName: '',
    });
  }
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  formRef.value.resetFields();
};

const handleSubmit = async () => {
  try {
    const errors = await formRef.value.validate();
    if (errors) {
      // 如果有错误，不执行提交操作
      console.error('表单验证失败', errors);
      return;
    }
    
    // 再次检查项目编号是否唯一
    const isExist = mockData.some(item => item.projectNumber === form.projectNumber && item.id !== form.id);
    if (isExist) {
      Message.error('项目编号已存在');
      return;
    }
    
    if (form.id) {
      const index = mockData.findIndex(item => item.id === form.id);
      if (index !== -1) {
        mockData[index] = { ...form };
      }
      Message.success('项目更新成功');
    } else {
      const newId = Math.max(...mockData.map(item => item.id)) + 1;
      mockData.push({ ...form, id: newId });
      Message.success('项目创建成功');
    }
    closeDrawer();
    fetchData();
  } catch (error) {
    console.error('表单提交失败', error);
  }
};

const handleDelete = (record) => {
  const index = mockData.findIndex(item => item.id === record.id);
  if (index !== -1) {
    mockData.splice(index, 1);
    Message.success('项目删除成功');
    fetchData();
  }
};

fetchData();
</script>

<template>
  <div class="container">
    <a-card class="general-card" title="项目管理">
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
                <a-form-item field="projectName" label="项目名称">
                  <a-input
                    v-model="searchForm.projectName"
                    placeholder="请输入项目名称"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item field="projectNumber" label="项目编号">
                  <a-input
                    v-model="searchForm.projectNumber"
                    placeholder="请输入项目编号"
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
        <!-- <a-divider style="height: 84px" direction="vertical" /> -->
        <a-col :flex="'86px'" style="text-align: right">
          <a-button type="primary" @click="openDrawer()">
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
          <a-button type="text" size="small" @click="openDrawer(record)">
            编辑
          </a-button>
          <a-popconfirm
            content="确定要删除这个项目吗？"
            @ok="handleDelete(record)"
          >
            <a-button type="text" status="danger" size="small">
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :visible="drawerVisible"
      @cancel="closeDrawer"
      @ok="handleSubmit"
      :title="drawerTitle"
      width="500px"
    >
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        @submit="handleSubmit"
      >
        <a-form-item field="projectNumber" label="项目编号">
          <a-input v-model="form.projectNumber" placeholder="请输入项目编号" />
        </a-form-item>
        <a-form-item field="projectName" label="项目名称">
          <a-input v-model="form.projectName" placeholder="请输入项目名称" />
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>
