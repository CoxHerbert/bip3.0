<!-- BirthdayReminderDialog.vue -->
<template>
  <el-dialog
    class="birthday-reminder-dialog"
    :model-value="visible"
    :title="title"
    width="900px"
    align-center
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    close-icon="CircleCloseFilled"
    @close="onCancel"
    @closed="onClosed"
  >
    <template #header>
      <div class="header-title">
        {{ title }}
      </div>
    </template>

    <div class="toolbar">
      <el-input
        class="search-input"
        v-model="queryParams.name"
        placeholder="搜索部门人员，输入可进行模糊筛选"
        clearable
        style="width: 100%"
        @input="debouncedSearch"
      >
        <template #prefix>
          <el-icon color="#666666" size="24"><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <div class="table-container" v-loading="loading">
      <el-table v-if="rows.length" :data="rows" height="100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="部门" width="140" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.deptName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="90" />
        <el-table-column label="工号" width="90">
          <template #default="{ row }">
            {{ row.account ?? row.jobnum ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="生日" width="100">
          <template #default="{ row }">
            {{ row.birthday ? dayjs(row.birthday).format('YYYY-MM-DD') : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="是否提醒" width="90">
          <template #default="{ row }">
            <el-switch
              v-model="row.__ui.enable"
              :active-value="true"
              :inactive-value="false"
              active-color="#Beeee3"
              @change="
                () => {
                  ensureDefaults(row);
                  markEdited(row);
                }
              "
            />
          </template>
        </el-table-column>

        <el-table-column label="提醒提前天数" width="140">
          <template #default="{ row }">
            <el-select
              v-model="row.__ui.offsetDays"
              :disabled="!row.__ui.enable"
              placeholder="选择天数"
              @change="() => markEdited(row)"
            >
              <el-option
                v-for="opt in offsetOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column label="提醒时间" width="140">
          <template #default="{ row }">
            <el-time-picker
              v-model="row.__ui.time"
              :disabled="!row.__ui.enable"
              placeholder="选择时间"
              format="HH:mm:ss"
              value-format="HH:mm:ss"
              style="width: 115px"
              @change="() => markEdited(row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无可绑定人员" />
    </div>

    <div class="table-footer">
      <dc-pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.current"
        v-model:limit="queryParams.size"
        @pagination="handlePageChange"
      />
    </div>

    <template #footer>
      <div class="rooter-wrap">
        <el-button type="primary" :loading="submitting" @click="onSubmit">保存</el-button>
        <el-button :disabled="submitting" @click="onCancel">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="js">
import { ref, reactive, computed, watch, getCurrentInstance } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import Api from '@/api'
import dayjs from 'dayjs'

const { proxy } = getCurrentInstance()

/**
 * 字段适配：
 * - 是否提醒：remind (boolean)
 * - 提前天数：advanceDay (int)
 * - 提醒时间：remindTime (string, HH:mm:ss)
 * UI 使用 row.__ui.enable / offsetDays / time；提交时映射回后端字段
 */

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '生日关怀人员提醒' },
  submitFn: { type: Function, default: null },
  submitDiffOnly: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
const title = computed(() => props.title)

const queryParams = reactive({ current: 1, size: 10, name: '' })
const loading = ref(false)
const submitting = ref(false)
const total = ref(0)
const rows = ref([])

/** —— 三份跨页状态 —— */
const baselineMap = new Map()  // id -> row(UI形态)
const seenMap = new Map()      // id -> row(UI形态)
const editedMap = new Map()    // id -> row(UI形态)

/** 兼容旧逻辑保留 snapshot，但不参与跨页 */
const snapshot = ref([])

const offsetOptions = [
  { value: 0, label: '生日当天' },
  { value: 1, label: '生日前一天' },
  { value: 3, label: '生日前三天' },
  { value: 7, label: '生日前七天' },
  { value: 15, label: '生日前十五天' },
  { value: 30, label: '生日前三十天' }
]

/** 统一转为 HH:mm:ss；容错多种输入 */
function normalizeTimeStr(val) {
  if (val === null || val === undefined || val === '') return ''
  // 接受：'HH:mm:ss' | 'HH:mm' | 日期字符串 | Date | 时间戳等
  const tryFormats = [
    'HH:mm:ss',
    'HH:mm',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm'
  ]
  let t
  if (typeof val === 'string') {
    // 先按已知格式解析，失败则尝试 dayjs 兜底
    t = dayjs(val, tryFormats, true)
    if (!t.isValid()) t = dayjs(val)
  } else {
    t = dayjs(val)
  }
  if (!t.isValid()) return ''
  return t.format('HH:mm:ss')
}

function toUIShape(item) {
  const enable     = item?.remind ?? item?.enable ?? false
  const offsetDays = enable ? (item?.advanceDay ?? item?.offsetDays ?? 7) : null
  const timeStrRaw = item?.remindTime ?? item?.time ?? '08:30:00'
  const time       = enable ? (normalizeTimeStr(timeStrRaw) || '08:30:00') : null
  return { ...item, __ui: { enable: !!enable, offsetDays, time } }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/** 翻页合并修改/回显 */
function mergeRowWithEdits(uiRow) {
  const id = uiRow?.id
  if (id == null) return uiRow

  if (!baselineMap.has(id)) {
    baselineMap.set(id, deepClone(uiRow))
  }
  if (editedMap.has(id)) {
    const edited = editedMap.get(id)
    return { ...uiRow, __ui: deepClone(edited.__ui) }
  }
  if (seenMap.has(id)) {
    const seen = seenMap.get(id)
    return { ...uiRow, __ui: deepClone(seen.__ui) }
  }
  return uiRow
}

function markSeen(row) {
  if (row?.id == null) return
  seenMap.set(row.id, deepClone(row))
}

function markEdited(row) {
  if (row?.id == null) return
  ensureDefaults(row)
  editedMap.set(row.id, deepClone(row))
  seenMap.set(row.id, deepClone(row))
}

function ensureDefaults(row) {
  if (row.__ui.enable) {
    if (row.__ui.offsetDays === undefined || row.__ui.offsetDays === null) row.__ui.offsetDays = 7
    if (!row.__ui.time) row.__ui.time = '08:30:00'
    row.__ui.time = normalizeTimeStr(row.__ui.time) || '08:30:00'
  } else {
    row.__ui.offsetDays = null
    row.__ui.time = null
  }
}

let searchTimer = null
function debouncedSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    queryParams.current = 1
    loadData()
  }, 300)
}

async function loadData() {
  loading.value = true
  try {
    const resp = await Api.desk.home.getUserPage(queryParams)
    const { data } = resp?.data ?? resp

    let list = []
    let totalCount = 0
    if (data?.records) {
      list = data.records
      totalCount = Number(data.total || 0)
    } else if (data?.list) {
      list = data.list
      totalCount = Number(data.total || 0)
    } else if (Array.isArray(data)) {
      list = data
      totalCount = data.length
    }

    let pageRows = list.map(toUIShape)
    pageRows = pageRows.map(mergeRowWithEdits)
    pageRows.forEach(markSeen)

    rows.value = pageRows
    snapshot.value = deepClone(pageRows)
    total.value = totalCount
  } catch (e) {
    console.error(e)
    ElMessage.error('用户列表加载失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  loadData()
}

/** 校验：启用时必须有 offsetDays 与秒级时间 */
function validate() {
  for (const r of rows.value) {
    if (r.__ui.enable) {
      if (r.__ui.offsetDays === undefined || r.__ui.offsetDays === null) {
        ElMessage.error(`【${r.name || r.realName || ''}】未选择提醒提前天数`)
        return false
      }
      const t = normalizeTimeStr(r.__ui.time)
      if (!t) {
        ElMessage.error(`【${r.name || r.realName || ''}】未选择提醒时间`)
        return false
      }
      r.__ui.time = t // 归一化为 HH:mm:ss
    }
  }
  return true
}

/** UI -> 服务端字段 */
function toServerShape(row) {
  const id = row?.id
  const template = baselineMap.get(id) || row
  const base = { ...template, ...row }

  const enable = !!base.__ui?.enable
  const adv    = enable ? Number(base.__ui?.offsetDays ?? 7) : null
  const rtime  = enable ? (normalizeTimeStr(base.__ui?.time) || '08:30:00') : null

  base.remind     = enable
  base.advanceDay = adv
  base.remindTime = rtime

  delete base.__ui
  return base
}

/** 三字段对比（秒级） */
function comparableTriple(x) {
  const enable = x?.__ui?.enable ?? x?.remind ?? x?.enable ?? false
  const adv    = enable ? (x?.__ui?.offsetDays ?? x?.advanceDay ?? x?.offsetDays ?? 7) : null
  const time   = enable ? normalizeTimeStr(x?.__ui?.time ?? x?.remindTime ?? x?.time ?? '08:30:00') : null
  return { enable: !!enable, advanceDay: adv, remindTime: time }
}
function isRowChanged(now, old) {
  const a = comparableTriple(now)
  const b = comparableTriple(old || {})
  return a.enable !== b.enable || a.advanceDay !== b.advanceDay || a.remindTime !== b.remindTime
}

/** 返回判定 */
function isRespOk(resp) {
  if (!resp) return false
  const p = resp?.data ?? resp
  return !!(p?.success === true || p?.code === 200 || p?.code === 0 || p?.data?.success === true || p?.data?.code === 200 || p?.data?.code === 0)
}
function respMsg(resp, fallback = '成功') {
  const p = resp?.data ?? resp
  return p?.msg || p?.message || p?.data?.msg || fallback
}

async function doSubmit(payload) {
  if (typeof props.submitFn === 'function') {
    return await props.submitFn(payload)
  }
  return await Api.desk.home.submitCareReminderInfo(payload)
}

/** 提交（支持跨页 diff 或 seen 全量） */
async function onSubmit() {
  if (!validate()) return

  let toSubmit = []

  if (props.submitDiffOnly) {
    for (const [id, editedRow] of editedMap.entries()) {
      const base = baselineMap.get(id)
      if (!base || isRowChanged(editedRow, base)) {
        toSubmit.push(toServerShape(editedRow))
      }
    }
  } else {
    for (const [, seenRow] of seenMap.entries()) {
      toSubmit.push(toServerShape(seenRow))
    }
  }

  if (!toSubmit.length) {
    ElMessage.info('没有需要保存的修改')
    return
  }

  try {
    submitting.value = true
    const resp = await doSubmit(toSubmit)
    if (isRespOk(resp)) {
      ElMessage.success(respMsg(resp, '保存成功'))
      if (props.submitDiffOnly) {
        for (const s of toSubmit) {
          const ui = toUIShape(s)
          baselineMap.set(s.id, deepClone(ui))
          seenMap.set(s.id, deepClone(ui))
          editedMap.delete(s.id)
        }
      } else {
        for (const [, seenRow] of seenMap.entries()) {
          const s = toServerShape(seenRow)
          const ui = toUIShape(s)
          baselineMap.set(seenRow.id, deepClone(ui))
        }
        editedMap.clear()
      }
      emit('success')
      visible.value = false
    } else {
      ElMessage.error(respMsg(resp, '提交失败'))
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('提交异常')
  } finally {
    submitting.value = false
  }
}

function onCancel() {
  if (submitting.value) return
  visible.value = false
}
function onClosed() {
  rows.value = []
  snapshot.value = []
  total.value = 0
  queryParams.current = 1
  queryParams.name = ''
  loading.value = false
  submitting.value = false

  baselineMap.clear()
  seenMap.clear()
  editedMap.clear()
}

watch(
  () => visible.value,
  v => { if (v) loadData() }
)
</script>

<style lang="scss">
.birthday-reminder-dialog {
  display: flex;
  flex-direction: column;
  padding: 0;
  border-radius: 16px;
  height: 818px;
  max-height: 100%;
  .el-dialog {
    &__header {
      padding: 0;
      .header-title {
        padding: 28px 24px;
        font-weight: bold;
        font-size: 18px;
        color: #333333;
        line-height: 18px;
        text-align: left;
        border-bottom: 1px solid #dadbe0;
      }
    }
    &__headerbtn {
      top: 14px;
      .el-dialog__close {
        font-size: 28px;
      }
    }
    &__body {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      padding: 20px 24px;
      max-height: unset;
      .toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 12px;
        .search-input {
          width: 100%;
          height: 48px;
          .el-input__wrapper {
            border-radius: 8px;
          }
          .el-input__inner {
            font-weight: 400;
            font-size: 16px;
            color: #333;
          }
        }
      }
      .table-container {
        flex: 1;
        overflow: hidden;
        margin-bottom: 10px;
        .el-table__header {
          .el-table__cell {
            padding: 15px 0;
          }
          .cell {
            font-weight: 400;
            font-size: 14px;
            color: #666;
          }
        }
        .is-checked {
          .el-switch__core {
            background-color: #beeee3;
            border-color: #beeee3;
          }
          .el-switch__action {
            background-color: #23c69f;
          }
        }
      }
    }
    &__footer {
      padding-top: 0;
      .rooter-wrap {
        padding: 16px 0;
        margin: auto;
        border-top: 1px solid #dadbe0;
        width: calc(100% - 48px);
        display: flex;
        justify-content: center;
        gap: 12px;
      }
    }
  }
}
</style>
