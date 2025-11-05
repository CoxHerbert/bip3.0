<template>
  <div class="resume-tabs">
    <el-tabs v-model="active" class="tabs" stretch>
      <el-tab-pane label="项目履历" name="project">
        <keep-alive>
          <ProjectResume v-if="active === 'project'" />
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane label="工作履历" name="work">
        <keep-alive>
          <WorkResume v-if="active === 'work'" />
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane label="教育履历" name="edu">
        <keep-alive>
          <EduResume v-if="active === 'edu'" />
        </keep-alive>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProjectResume from './ProjectResume.vue';
import WorkResume from './WorkResume.vue';
import EduResume from './EduResume.vue';

const active = ref('project');
</script>

<style scoped lang="scss">
.resume-tabs {
  height: 100%;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  .tabs :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }
}
</style>
