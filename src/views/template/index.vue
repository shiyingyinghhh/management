<template>
  <div class="container">
    <a-card class="general-card" title="证书模板">
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
                <a-form-item field="templateName" label="模板名称">
                  <a-input
                    v-model="data.searchForm.templateName"
                    placeholder="请输入模板名称"
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
        <a-col :flex="'86px'" style="text-align: right">
          <a-button type="primary" @click="handle.openDrawer()">
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
        :bordered="false"
        @page-change="handle.onPageChange"
      >
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handle.openDrawer(record)">
            编辑
          </a-button>
          <a-popconfirm
            content="确定要删除这个模板吗？"
            @ok="handle.delete(record)"
          >
            <a-button type="text" status="danger" size="small">
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :visible="data.drawerVisible"
      @cancel="handle.closeDrawer"
      @ok="handle.submit"
      :title="drawerTitle"
      width="500px"
    >
      <a-form
        ref="data.formRef"
        :model="data.form"
        :rules="data.rules"
        @submit="handle.submit"
      >
        <a-form-item field="templateName" label="模板名称">
          <a-input v-model="data.form.templateName" placeholder="请输入模板名称" />
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

const data = reactive({
  searchForm: {
    templateName: '',
  },
  form: {
    id: null,
    templateName: '',
  },
  rules: {
    templateName: [
      { required: true, message: '请输入模板名称' },
      {
        validator: (value, callback) => {
          if (value.trim() === '') {
            callback('模板名称不能为空');
          } else if (data.renderData.some(item => item.templateName === value && item.id !== data.form.id)) {
            callback('模板名称已存在，请输入一个唯一的名称');
          } else {
            callback();
          }
        },
      },
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
  formRef: null,
});

const drawerTitle = computed(() => data.form.id ? '编辑模板' : '新增模板');

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

const handle = {
  search() {
    data.pagination.current = 1;
    handle.fetchData();
  },

  reset() {
    data.searchForm.templateName = '';
    handle.search();
  },

  onPageChange(current) {
    data.pagination.current = current;
    handle.fetchData();
  },

  openDrawer(record) {
    if (record) {
      Object.assign(data.form, record);
    } else {
      Object.assign(data.form, {
        id: null,
        templateName: '',
      });
    }
    data.drawerVisible = true;
  },

  closeDrawer() {
    data.drawerVisible = false;
    data.formRef?.resetFields();
  },

  async submit() {
    try {
      const errors = await data.formRef.validate();
      if (errors) {
        console.error('表单验证失败', errors);
        return;
      }
      const allData = handle.getLocalData();
      if (data.form.id) {
        const index = allData.findIndex(item => item.id === data.form.id);
        if (index !== -1) {
          allData[index] = { ...data.form };
        }
        Message.success('模板更新成功');
      } else {
        const newId = Math.max(...allData.map(item => item.id), 0) + 1;
        allData.push({ ...data.form, id: newId });
        Message.success('模板创建成功');
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
      Message.success('模板删除成功');
      handle.fetchData();
    }
  },

  getLocalData() {
    const storageData = localStorage.getItem('templateData');
    return storageData ? JSON.parse(storageData) : [];
  },

  saveLocalData(storageData) {
    localStorage.setItem('templateData', JSON.stringify(storageData));
  },

  fetchData() {
    data.loading = true;
    const allData = handle.getLocalData();
    const filteredData = allData.filter(item => 
      item.templateName.toLowerCase().includes(data.searchForm.templateName.toLowerCase())
    );
    data.renderData = filteredData.slice(
      (data.pagination.current - 1) * data.pagination.pageSize,
      data.pagination.current * data.pagination.pageSize
    );
    data.pagination.total = filteredData.length;
    data.loading = false;
  },
};

onMounted(() => {
  handle.fetchData();
});
</script>
