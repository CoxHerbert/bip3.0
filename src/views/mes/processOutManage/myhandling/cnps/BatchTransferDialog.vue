<!-- BatchTransferDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1250px"
    align-center
    @close="close"
    @closed="onClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" v-loading="submitting">
      <!-- 供应商（必填：红色*） -->
      <el-form-item label="供应商" prop="supplierNo" required>
        <span style="margin-right: 12px">供应商</span>
        <dcSupplierSelect
          style="width: 260px"
          v-model="form.supplierNo"
          @change="onSupplierChange"
        />
        <span style="margin-left: 12px; color: #888">
          <template v-if="form.supplierName">
            {{ form.supplierNo || '-' }} / {{ form.supplierName || '-' }}
          </template>
        </span>
      </el-form-item>

      <!-- 明细表 -->
      <el-form-item label="转单明细" required>
        <el-table :data="form.items" border height="360px">
          <el-table-column type="index" label="序号" width="60" />

          <el-table-column label="物料编号" min-width="140">
            <template #default="{ row }">
              {{ row.materialNumber || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="物料名称" min-width="140">
            <template #default="{ row }">
              {{ row.materialName || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="版本" width="60">
            <template #default="{ row }">
              {{ row.version || '-' }}
            </template>
          </el-table-column>

          <!-- 工艺：单选（数组形态） -->
          <el-table-column label="工艺" width="180">
            <template #default="{ row }">
              <el-select
                v-model="row.processIds"
                placeholder="请选择工艺"
                clearable
                filterable
                multiple
                :multiple-limit="1"
                :disabled="!row.processes?.length"
                @change="onProcessChange(row)"
              >
                <el-option
                  v-for="p in row.processes || []"
                  :key="p.id"
                  :label="p.processName"
                  :value="p.id"
                />
              </el-select>
            </template>
          </el-table-column>

          <!-- 可转数量：可输入；最大值=所选工艺(plannedQty - issuedQty) -->
          <el-table-column label="可转数量" width="160">
            <template #default="{ row }">
              <el-input-number
                v-model="row.qty"
                :min="maxTransferQty(row) > 0 ? 1 : 0"
                :max="maxTransferQty(row)"
                :step="1"
                :precision="0"
                controls-position="right"
                style="width: 100%"
                :disabled="!hasPickedProcess(row)"
                :placeholder="hasPickedProcess(row) ? '最大 ' + maxTransferQty(row) : '先选择工艺'"
                @change="onQtyChange(row)"
              />
            </template>
          </el-table-column>

          <!-- 单价（万元） -->
          <el-table-column label="单价（万元）" width="140">
            <template #default="{ row }">
              <el-input-number
                v-model="row.unitPrice"
                :min="0.01"
                :step="0.01"
                :precision="2"
                controls-position="right"
                style="width: 100%"
                @change="markDirty(row)"
                :disabled="!hasPickedProcess(row)"
              />
            </template>
          </el-table-column>

          <!-- 总价（万元） = qty * unitPrice -->
          <el-table-column label="总价（万元）" width="140">
            <template #default="{ row }">
              <span>{{ calcLineTotal(row) }}</span>
            </template>
          </el-table-column>

          <!-- 交期：YYYY-MM-DD -->
          <el-table-column label="交期" width="180">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.deliveryTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择日期"
                style="width: 100%"
                @change="markDirty(row)"
                :disabled="!hasPickedProcess(row)"
              />
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="close" :disabled="submitting">取消</el-button>
      <el-button type="primary" @click="onSubmit" :loading="submitting" :disabled="submitting">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="js">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Api from '@/api/index.js'
import dcSupplierSelect from '@/views/mes/processOutManage/outDoc/addOrEdit/dc-supplier-select.vue'

const emit = defineEmits(['submit'])

const visible = ref(false)
const title = ref('批量转单')
const formRef = ref(null)
const submitting = ref(false) // 提交中

/** 默认表单 + 重置 */
const defaultForm = () => ({
  supplierId: undefined,
  supplierNo: '',
  supplierName: '',
  items: []
})
const form = reactive(defaultForm())

const resetForm = () => {
  formRef.value?.clearValidate?.()
  const init = defaultForm()
  Object.keys(form).forEach(k => (form[k] = init[k]))
}

const rules = reactive({
  supplierNo: [{ required: true, message: '请选择供应商', trigger: 'change' }]
})

/** 拉取工艺：按主表 id 聚合 */
async function getTechnologyByMainId(idStr) {
  try {
    const res = await Api.mes.forward.getTechnologyByMainId({ idList: idStr })
    const { code, data } = res.data || {}
    if (code === 200 && data) {
      // data: { [mainId]: Process[] }
      form.items.forEach((row) => {
        row.processes = data[row.id] || []
      })
    }
  } catch (e) {
    console.error('getTechnologyByMainId error:', e)
  }
}

/** 供应商改变：带出 supplierId/Name */
function onSupplierChange(payload) {
  if (payload && typeof payload === 'object') {
    form.supplierId = payload.supplierId || ''
    form.supplierName = payload.supplierName || ''
  } else {
    form.supplierId = ''
    form.supplierName = ''
  }
}

function hasPickedProcess(row) {
  return Array.isArray(row.processIds) && row.processIds.length === 1
}

/** 该行是否具备可提交条件（存在可选工艺列表） */
function isRowEligible(row) {
  return Array.isArray(row.processes) && row.processes.length > 0
}

/** 最大可转数量 = 所选工艺 plannedQty - issuedQty（<0 置 0） */
function maxTransferQty(row) {
  if (!hasPickedProcess(row)) return 0
  const pickedId = row.processIds[0]
  const p = (row.processes || []).find((x) => x.id === pickedId)
  if (!p) return 0
  const planned = Number(p.plannedQty || 0)
  const issued = Number(p.issuedQty || 0)
  const v = planned - issued
  return v > 0 ? Math.floor(v) : 0
}

/** 切换工艺：要求重新输入 qty/单价/交期 */
function onProcessChange(row) {
  if (Array.isArray(row.processIds) && row.processIds.length > 1) {
    row.processIds = [row.processIds[0]]
  }
  row.qty = null
  row.unitPrice = null
  row.deliveryTime = ''
  markDirty(row)
}

/** 输入 qty 时，夹在 [min, max] 内并取整 */
function onQtyChange(row) {
  const max = maxTransferQty(row)
  if (row.qty == null || row.qty === '') return
  let v = Math.floor(Number(row.qty) || 0)
  if (max <= 0) v = 0
  if (v < (max > 0 ? 1 : 0)) v = (max > 0 ? 1 : 0)
  if (v > max) v = max
  row.qty = v
  markDirty(row)
}

/** 行总价 */
function calcLineTotal(row) {
  const qty = Number(row.qty) || 0
  const price = Number(row.unitPrice) || 0
  const total = qty * price
  return total ? total.toFixed(2) : '-'
}

/** 打开弹窗：重置行并拉工艺 */
async function open(rows = [], options = {}) {
  title.value = options.title || '批量转单'

  form.items = (rows || []).map((r) => ({
    ...r,
    processes: r.processes || [],
    processIds: Array.isArray(r.processIds) ? r.processIds.slice(0, 1) : [],
    qty: null,
    unitPrice: null,
    deliveryTime: '',
    _dirty: false
  }))

  const ids = form.items.map((r) => r.id).filter(Boolean).join(',')
  if (ids) await getTechnologyByMainId(ids)

  visible.value = true
  await nextTick()
}

/** 关闭弹窗（隐藏） */
function close() {
  if (submitting.value) return // 提交中避免误关
  visible.value = false
}

/** 动画结束后重置（真正清空） */
function onClosed() {
  resetForm()
}

const markDirty = (row) => (row._dirty = true)

/** 行校验（仅校验可提交行：有 processes 的行） */
function validateRows() {
  const eligible = form.items.filter(isRowEligible)
  if (!eligible.length) {
    ElMessage.error('没有可提交的明细（所有行均无可选工艺）')
    return false
  }
  for (let i = 0; i < eligible.length; i++) {
    const r = eligible[i]
    if (!hasPickedProcess(r)) return rowErr(i, '工艺必选且只能选择 1 个')

    const max = maxTransferQty(r)
    if (max <= 0) return rowErr(i, '该工艺可转数量为 0')

    const qty = Number(r.qty)
    if (!Number.isFinite(qty) || qty < 1) return rowErr(i, '可转数量需 ≥ 1')
    if (qty > max) return rowErr(i, `可转数量不能超过最大值 ${max}`)

    if (!r.unitPrice || r.unitPrice <= 0) return rowErr(i, '单价需大于 0')
    if (!r.deliveryTime) return rowErr(i, '交期必选（YYYY-MM-DD）')
  }
  return true
}
function rowErr(i, msg) {
  ElMessage.error(`第 ${i + 1} 行：${msg}`)
  return false
}

/** 提交（接口：postBatchErpTransfer；交期：YYYY-MM-DD） */
function onSubmit() {
  if (submitting.value) return
  formRef.value?.validate(async (ok) => {
    if (!ok) return
    if (!validateRows()) return

    const eligible = form.items.filter(isRowEligible)
    if (!eligible.length) {
      ElMessage.error('没有可提交的明细')
      return
    }

    const transferOrderList = eligible.map((r) => {
      const qty = Number(r.qty) || 0
      const total = Number((qty * Number(r.unitPrice || 0)).toFixed(2))
      return {
        unitPrice: Number(r.unitPrice),
        totalPrice: total,
        transferQty: qty,
        deliveryTime: r.deliveryTime, // YYYY-MM-DD
        processIds: r.processIds
      }
    })

    const payload = {
      supplierId: form.supplierId,
      supplierNo: form.supplierNo,
      supplierName: form.supplierName,
      transferOrderList
    }

    try {
      submitting.value = true
      const res = await Api.mes.forward.postBatchErpTransfer(payload)
      const { code, success, msg } = res?.data ?? {}
      console.log(res)

      if (code === 200 && success === true) {
        emit('submit', payload)
        close() // 先关闭；真正清空在 @closed 中
        ElMessage.success(msg || '提交成功')
      } else {
        ElMessage.error(msg || '提交失败，请稍后重试')
      }
    } catch (e) {
      console.error(e)
      ElMessage.error('提交失败，请稍后重试')
    } finally {
      submitting.value = false
    }
  })
}

/** 暴露方法 */
defineExpose({ open, close })
</script>

<style scoped>
.table-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.table-toolbar .sum {
  margin-left: auto;
}
</style>
