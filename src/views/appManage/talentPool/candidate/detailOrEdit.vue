<template>
  <div class="page-container">
    <div class="content-card left-content"><leftContent ref="leftContentRef" /></div>
    <div class="content-card middle-content"><middleContent /></div>
    <div class="content-card right-content"><rightContent @update="onUpdate" /></div>
  </div>
</template>
<script setup>
import leftContent from './cnps/left-content/index.vue';
import middleContent from './cnps/middle-content/index.vue';
import rightContent from './cnps/right-content/index.vue';

const leftContentRef = ref(null);

function onUpdate() {
  leftContentRef.value.fetchDetail();
}
</script>
<style lang="scss" scoped>
.page-container {
  display: flex;
  gap: 8px;
  width: 100%;
  height: 100%;
  .content-card {
    background-color: #fff;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .left-content {
    flex: 1;
  }
  .middle-content {
    flex: 2;
  }
  .right-content {
    flex: 1;
  }
}
</style>
