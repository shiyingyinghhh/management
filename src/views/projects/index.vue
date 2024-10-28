<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchForm = reactive({
  projectName: '',
  projectNumber: '',
});

const form = reactive({
  id: null,
  projectNumber: '',
  projectName: '',
  createTime: '', // 新增创建时间字段
});

const rules = {
  projectNumber: [
    { required: true, message: '请输入项目编号' },
    {
      validator: (value, callback) => {
        if (value) {
          const isExist = mockData.value.some(item => item.projectNumber === value && item.id !== form.id);
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
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
  },
];

// 替换原有的 mockData 定义
const STORAGE_KEY = 'projectsMockData';
const mockData = ref([]);

// 添加以下函数来加载和保存数据
const loadMockData = () => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    mockData.value = JSON.parse(storedData);
  } else {
    const now = new Date();
    mockData.value = [
      { id: 1, projectNumber: 'P001', projectName: '项目A', createTime: '2024-03-20 09:30' },
      { id: 2, projectNumber: 'P002', projectName: '项目B', createTime: '2024-03-21 14:20' },
      { id: 3, projectNumber: 'P003', projectName: '项目C', createTime: '2024-03-22 16:45' },
    ];
    saveMockData();
  }
};

const saveMockData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData.value));
};

// 修改 fetchData 函数
const fetchData = () => {
  loading.value = true;
  setTimeout(() => {
    renderData.value = mockData.value.filter(item => 
      item.projectName.includes(searchForm.projectName) &&
      item.projectNumber.includes(searchForm.projectNumber)
    );
    pagination.total = renderData.value.length;
    loading.value = false;
    console.log('Fetched data:', renderData.value); // 添加这行
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
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    Object.assign(form, {
      id: null,
      projectNumber: '',
      projectName: '',
      createTime: formattedDate,
    });
  }
  drawerVisible.value = true;
};

const closeDrawer = () => {
  drawerVisible.value = false;
  formRef.value.resetFields();
};

// 修改 handleSubmit 函数
const handleSubmit = async () => {
  try {
    const errors = await formRef.value.validate();
    if (errors) {
      console.error('表单验证失败', errors);
      return;
    }
    
    console.log('Submitting form:', form);
    
    const isExist = mockData.value.some(item => item.projectNumber === form.projectNumber && item.id !== form.id);
    if (isExist) {
      Message.error('项目编号已存在');
      return;
    }
    
    if (form.id) {
      // 编辑现有项目
      const index = mockData.value.findIndex(item => item.id === form.id);
      if (index !== -1) {
        mockData.value[index] = { ...form };
      }
      Message.success('项目更新成功');
    } else {
      // 新增项目
      const newId = Math.max(...mockData.value.map(item => item.id), 0) + 1;
      const newProject = { ...form, id: newId };
      mockData.value.push(newProject);
      console.log('New project added:', newProject); // 添加这行
      Message.success('项目创建成功');
    }
    saveMockData();
    console.log('Updated mockData:', mockData.value); // 添加这行
    closeDrawer();
    fetchData();
  } catch (error) {
    console.error('表单提交失败', error);
  }
};

// 修改 handleDelete 函数
const handleDelete = (record) => {
  const index = mockData.value.findIndex(item => item.id === record.id);
  if (index !== -1) {
    mockData.value.splice(index, 1);
    saveMockData();
    Message.success('项目删除成功');
    fetchData();
  }
};

const enterProject = (record) => {
  router.push({
    path: `/projects/project/${record.projectNumber}`,
    query: {
      projectName: record.projectName,
      createTime: record.createTime
    }
  });
};

onMounted(() => {
  loadMockData();
  fetchData();
});
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
          <a-button type="text" size="small" @click="enterProject(record)">
            进入项目
          </a-button>
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
        <a-form-item field="createTime" label="创建时间">
          <a-input v-model="form.createTime" readonly />
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>
