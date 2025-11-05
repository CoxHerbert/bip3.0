<template>
  <el-button
    v-if="getButton('wf_print')"
    type="info"
    size="default"
    v-loading="loading"
    @click="$emit('print')"
  >
    {{ getButton('wf_print').name }}
  </el-button>
</template>
