<template>
  <div class="menu-layout">
    <el-card>
      <el-table :data="tableData" style="width: 100%" border>
        <!-- <el-table-column label="Id" prop="" width="">
          <template #default="{ row }"> </template>
        </el-table-column>
        <el-table-column label="菜单名称" prop="" width="">
          <template #default="{ row }"> </template>
        </el-table-column>
        <el-table-column label="描述" prop="" width="">
          <template #default="{ row }"> </template>
        </el-table-column>
        <el-table-column label="操作" prop="" width="" align="center">
          <template #default="{ row }"> 
            <el-button type="primary">1</el-button>
            <el-button type="primary">2</el-button>
            <el-button type="primary">3</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const tableData = reactive([
  {
    id: 1,
    code: 'lab:create',
    name: '创建实验室',
    pid: null,
    description: '创建实验室权限',
    type: 1,
    status: 1,
  },
  {
    id: 2,
    code: 'lab:list',
    name: '查看实验室列表',
    pid: null,
    description: '查看实验室列表权限',
  },
])
</script>

<style scoped lang="css"></style>
