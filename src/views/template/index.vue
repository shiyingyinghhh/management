<template>
  <div class="container">
    <a-card class="general-card" title="证书模板管理">
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
                <a-form-item field="templateName" label="模板名称">
                  <a-input
                    v-model="searchForm.templateName"
                    placeholder="请输入模板名称"
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
            content="确定要删除这个模板吗？"
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
        <a-form-item field="templateName" label="模板名称">
          <a-input v-model="form.templateName" placeholder="请输入模板名称" />
        </a-form-item>
        <!-- 添加更多表单项 -->
      </a-form>
    </a-drawer>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchForm = reactive({
  templateName: '',
});

const form = reactive({
  id: null,
  templateName: '',
});

const rules = {
  templateName: [
    { required: true, message: '请输入模板名称' },
    {
      validator: (value, callback) => {
        if (value.trim() === '') {
          callback('模板名称不能为空');
        } else if (renderData.value.some(item => item.templateName === value && item.id !== form.id)) {
          callback('模板名称已存在，请输入一个唯一的名称');
        } else {
          callback();
        }
      },
    },
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
const drawerTitle = computed(() => form.id ? '编辑模板' : '新增模板');
const formRef = ref(null);

const columns = [
  {
    title: '模板名称',
    dataIndex: 'templateName',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
  },
];

// 从localStorage获取数据
const getLocalData = () => {
  const data = localStorage.getItem('templateData');
  return data ? JSON.parse(data) : [];
};

// 保存数据到localStorage
const saveLocalData = (data) => {
  localStorage.setItem('templateData', JSON.stringify(data));
};

// 获取模板列表
const fetchData = () => {
  loading.value = true;
  const allData = getLocalData();
  const filteredData = allData.filter(item => 
    item.templateName.toLowerCase().includes(searchForm.templateName.toLowerCase())
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
  searchForm.templateName = '';
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
      templateName: '',
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
      console.error('表单验证失败', errors);
      return;
    }
    const allData = getLocalData();
    if (form.id) {
      const index = allData.findIndex(item => item.id === form.id);
      if (index !== -1) {
        allData[index] = { ...form };
      }
      Message.success('模板更新成功');
    } else {
      const newId = Math.max(...allData.map(item => item.id), 0) + 1;
      allData.push({ ...form, id: newId });
      Message.success('模板创建成功');
    }
    saveLocalData(allData);
    closeDrawer();
    fetchData();
  } catch (error) {
    console.error('表单提交失败', error);
    Message.error('操作失败，请重试');
  }
};

const handleDelete = (record) => {
  const allData = getLocalData();
  const index = allData.findIndex(item => item.id === record.id);
  if (index !== -1) {
    allData.splice(index, 1);
    saveLocalData(allData);
    Message.success('模板删除成功');
    fetchData();
  }
};

onMounted(() => {
  fetchData();
});
</script>
