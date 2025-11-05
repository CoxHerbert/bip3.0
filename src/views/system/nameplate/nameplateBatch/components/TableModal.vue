<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="modal-content">
      <!-- 工作表选择器 -->
      <div class="sheet-selector" v-if="Object.keys(excelData).length > 1">
        <el-select
          v-model="selectedSheet"
          placeholder="选择工作表"
          @change="handleSheetChange"
          style="width: 200px; margin-bottom: 15px"
        >
          <el-option
            v-for="sheetName in Object.keys(excelData)"
            :key="sheetName"
            :label="sheetName"
            :value="sheetName"
          ></el-option>
        </el-select>
      </div>

      <!-- 映射验证提示 -->
      <div class="mapping-validation" v-if="showValidation">
        <el-alert
          :title="validationMessage"
          :type="validationType"
          :closable="false"
          style="margin-top: 10px"
        />
      </div>
      <div class="table-container">
        <el-form ref="formRef" class="form-main" :model="mappedData">
          <!-- :rules="getTableRule(group.items)" -->
          <el-form-item class="form-item-table" :label-width="0">
            <el-table
              :data="mappedData"
              border
              stripe
              @cell-click="handleCellClick"
              style="width: 100%"
              max-height="400"
              :loading="loading"
            >
              <!-- 添加空数据提示 -->
              <template #empty>
                <div class="empty-table">
                  <el-icon class="empty-icon"><Document /></el-icon>
                  <p>暂无数据</p>
                </div>
              </template>
              <template v-for="(col, i) in systemTargetFields">
                <!-- 多选 -->
                <el-table-column
                  v-if="col.type === 'selection'"
                  :key="i"
                  type="selection"
                  :align="col.align"
                  :width="col.width"
                />
                <!-- 序号类型 -->
                <el-table-column
                  v-else-if="col.type === 'index'"
                  :key="'index' + i"
                  label="序号"
                  :align="col.align"
                  :width="col.width"
                  :min-width="col.minWidth"
                >
                  <template #default="{ $index }">
                    {{ $index + 1 }}
                  </template>
                </el-table-column>
                <!-- 普通文字类型 -->
                <el-table-column
                  v-else-if="col.type === 'rowText'"
                  :key="'rowText' + i"
                  :label="col.label"
                  :width="col.width"
                  :min-width="col.minWidth"
                  :prop="col.prop"
                  :align="col.align ? col.align : 'center'"
                  show-overflow-tooltip
                >
                  <template #default="scoped">
                    <span v-if="scoped.row[col.prop] == 0">0</span>
                    <span v-else>
                      {{
                        [null, undefined, ''].includes(scoped.row[col.prop])
                          ? '-'
                          : scoped.row[col.prop]
                      }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column
                  v-else-if="col.type === 'actions'"
                  :key="'option' + i"
                  :fixed="col.fixed"
                  :label="col.label"
                  :width="col.width ? col.width : 180"
                  :min-width="col.minWidth"
                  :align="col.align ? col.align : 'center'"
                >
                  <template #default="scoped">
                    <el-button
                      v-for="(btn, j) in col.children"
                      :key="j"
                      link
                      v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                      type="primary"
                      @click="doAction(btn.action, scoped)"
                      >{{ btn.label }}</el-button
                    >
                  </template>
                </el-table-column>
                <el-table-column
                  v-else
                  :key="`${col.prop || col.type || 'column'}-${i}`"
                  :label="col.label"
                  :width="col.width"
                  :min-width="col.minWidth"
                  :prop="col.prop"
                  :align="col.align ? col.align : 'center'"
                  show-overflow-tooltip
                >
                  <!-- <template #header><span v-html="getLabelCode(col)"> </span></template> -->
                  <template #default="scoped">
                    <div
                      class="cell-box"
                      :class="getCellBoxClass(scoped, col)"
                      @click.stop="handleCellClick(scoped, col)"
                    >
                      <template
                        v-if="
                          coordinate?.rowIndex === scoped.$index &&
                          scoped.cellIndex === coordinate?.cellIndex
                        "
                      >
                        <el-form-item
                          :prop="`${scoped.$index}.${col.prop}`"
                          :label-width="0"
                          :rules="getColumnRules(col, scoped)"
                        >
                          <dc-widget
                            v-model="scoped.row[col.prop]"
                            :data="col"
                            :dictMaps="dictMaps"
                            @change="
                              val => {
                                handleTableItemChange(val, scoped, col);
                              }
                            "
                          >
                          </dc-widget>
                        </el-form-item>
                      </template>
                      <template v-else>
                        <!-- <dc-view
                          v-if="['dc-select-user'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          objectName="user"
                        />
                        <dc-view
                          v-if="['wf-select-isdialog', 'dc-select-dialog'].includes(col.type)"
                          v-model="scoped.row[col.prop]"
                          :objectName="col.props.objectName"
                        />
                        <dc-dict-key
                          v-if="['dict'].includes(col.type)"
                          :value="scoped.row[col.prop]"
                          :options="dictMaps?.[col.dictKey]"
                        /> -->
                        <dc-view-wrapper
                          v-if="col.type === 'wf-select-isdialog' && col.props?.objectName"
                          :ref="`viewRef_${col.prop}_${scoped.$index}`"
                          v-model="scoped.row[col.prop]"
                          :objectName="col.props.objectName"
                          :show-status="true"
                          @match-status-change="
                            status => handleCellStatusChange(scoped.$index, col.prop, status)
                          "
                          @initialized="
                            status => handleCellStatusChange(scoped.$index, col.prop, status)
                          "
                        />
                        <dc-dict-key-wrapper
                          v-else-if="col.type === 'dict' && col.dictKey"
                          :ref="`dictRef_${col.prop}_${scoped.$index}`"
                          :value="scoped.row[col.prop]"
                          :options="dictMaps[col.dictKey]"
                          :show-status="true"
                          @match-status-change="
                            status => handleCellStatusChange(scoped.$index, col.prop, status)
                          "
                          @initialized="
                            status => handleCellStatusChange(scoped.$index, col.prop, status)
                          "
                        />
                        <span v-else>
                          {{
                            [undefined, null, '', ' '].includes(scoped.row[col.prop])
                              ? '-'
                              : scoped.row[col.prop]
                          }}
                        </span>
                        <!-- 添加回显失败标识 -->
                      </template>
                    </div>
                  </template>
                </el-table-column>
              </template>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <!-- 表格展示（直接显示映射后的最终数据） -->

      <!-- 数据统计 -->
      <div class="table-stats" v-if="mappedData.length > 0">
        <p>共 {{ mappedData.length }} 条数据</p>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-if="mappedData.length === 0 && !loading">
        <div class="empty-content">
          <el-icon class="empty-icon"><Document /></el-icon>
          <h3>工作表为空</h3>
          <p>当前工作表中没有数据</p>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button
        type="primary"
        @click="handleConfirm"
        :disabled="!canConfirm"
        :loading="validating"
      >
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import listEditPage from '@/mixins/list-edit-page';
import { Document, WarningFilled } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import Api from '@/api/index';
import options from './TableModal';
import { mapExcelColumnsToSystemFields, generateMappedData } from '@/utils/excelImporter';

export default {
  name: 'TableModal',
  components: {
    Document,
    WarningFilled,
  },
  mixins: [listEditPage],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Excel数据映射与导入',
    },
    width: {
      type: String,
      default: '80%',
    },
    excelData: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    systemTargetFields: {
      type: Array,
      default: () => options().columns,
    },
  },
  emits: ['close', 'cancel', 'confirm', 'update:visible'],
  data() {
    return {
      dialogVisible: false,
      selectedSheet: '',
      tableData: [],
      tableColumns: [],
      fieldMappings: {}, // 存储Excel列到系统字段的映射关系
      mappedData: [], // 直接存储映射后的最终数据
      showValidation: false,
      validationMessage: '',
      validationType: 'info',
      isMappingComplete: false,
      mappingProgress: 0,
      formRef: null,
      dictMaps: {},
      columnMatchStatus: {}, // 存储每列的匹配状态
      allColumnsInitialized: false, // 所有列是否已初始化
      cellMatchStatus: {}, // 存储每个单元格的匹配状态 { rowIndex_prop: boolean }
    };
  },
  computed: {
    canConfirm() {
      if (this.mappedData.length === 0) return false;

      // 验证所有必填系统字段是否已映射
      const requiredFields = this.systemTargetFields.filter(f => f.required).map(f => f.value);
      const mappedFields = Object.values(this.fieldMappings);
      const allRequiredMapped = requiredFields.every(field => mappedFields.includes(field));

      // 显示验证信息
      if (!allRequiredMapped) {
        const missingFields = requiredFields
          .filter(field => !mappedFields.includes(field))
          .map(field => this.systemTargetFields.find(f => f.value === field)?.label);

        this.showValidation = true;
        this.validationType = 'warning';
        this.validationMessage = `缺少必填字段映射：${missingFields.join('、')}`;
        return false;
      }

      // 验证数据完整性
      for (let i = 0; i < this.mappedData.length; i++) {
        const row = this.mappedData[i];
        for (const field of requiredFields) {
          if (row[field] === undefined || row[field] === null || row[field] === '') {
            this.showValidation = true;
            this.validationType = 'error';
            this.validationMessage = `第 ${i + 1} 行的【${
              this.systemTargetFields.find(f => f.value === field)?.label
            }】不能为空`;
            return false;
          }
        }
      }

      // 检查所有单元格是否都匹配成功（显示为绿色）
      // 只有当所有单元格都已初始化时才进行此检查
      if (this.allColumnsInitialized) {
        for (let i = 0; i < this.mappedData.length; i++) {
          for (const col of this.systemTargetFields) {
            // 只检查有状态显示的单元格
            if (
              (col.type === 'wf-select-isdialog' && col.props?.objectName) ||
              (col.type === 'dict' && col.dictKey)
            ) {
              const key = `${i}_${col.prop}`;
              // 如果有任何单元格未匹配成功，则不能确认
              if (this.cellMatchStatus[key] === false) {
                this.showValidation = true;
                this.validationType = 'warning';
                this.validationMessage = `第 ${i + 1} 行的【${col.label}】数据未匹配成功，请检查`;
                return false;
              }
            }
          }
        }
      }

      this.showValidation = false;
      return true;
    },
  },
  watch: {
    visible: {
      handler(newVal) {
        this.dialogVisible = newVal;
      },
      immediate: true,
    },
    dialogVisible(newVal) {
      if (newVal !== this.visible) {
        this.$emit('update:visible', newVal);
      }
    },
    excelData: {
      handler(newVal) {
        if (Object.keys(newVal).length > 0) {
          const sheets = Object.keys(newVal);
          if (sheets.length > 0 && !this.selectedSheet) {
            this.selectedSheet = sheets[0];
            this.updateTableData(this.selectedSheet);
          }
        }
      },
      deep: true,
      immediate: true,
    },
  },
  mounted() {
    const { DC_NAMEPLATE_TYPE, DC_NAMEPLATE_SIZE } = this.useCache([
      { key: 'DC_NAMEPLATE_TYPE' },
      { key: 'DC_NAMEPLATE_SIZE' },
    ]);
    this.dictMaps.DC_NAMEPLATE_TYPE = DC_NAMEPLATE_TYPE;
    this.dictMaps.DC_NAMEPLATE_SIZE = DC_NAMEPLATE_SIZE;
    // 初始化时如果有数据且未选择工作表，则选择第一个工作表
    if (Object.keys(this.excelData).length > 0 && !this.selectedSheet) {
      const sheets = Object.keys(this.excelData);
      this.selectedSheet = sheets[0];
      this.updateTableData(this.selectedSheet);
    }
  },
  methods: {
    // 更新表格数据并直接建立映射关系
    async updateTableData(sheetName) {
      // 重置映射状态
      this.isMappingComplete = false;
      this.mappingProgress = 0;
      const sheetData = this.excelData[sheetName];

      if (!sheetData || sheetData.length === 0) {
        this.tableData = [];
        this.tableColumns = [];
        this.fieldMappings = {};
        this.mappedData = [];
        this.isMappingComplete = true; // 即使没有数据也标记为映射完成
        return;
      }

      this.mappingProgress = 20;

      // 使用 excelImporter.js 中的映射函数
      const mappingResult = mapExcelColumnsToSystemFields(sheetData, this.systemTargetFields);

      this.tableData = mappingResult.tableData;
      this.tableColumns = mappingResult.tableColumns;
      this.fieldMappings = mappingResult.fieldMappings;

      this.mappingProgress = 60;

      // 生成映射后的最终数据（现在是异步的）
      await this.generateMappedData();

      // 标记映射完成
      this.mappingProgress = 100;
      this.isMappingComplete = true;
    },

    async generateMappedData() {
      // 使用 excelImporter.js 中的生成映射数据函数
      const baseMappedData = generateMappedData(
        this.tableData,
        this.fieldMappings,
        this.systemTargetFields
      );

      // 临时存储基础映射数据
      this.mappedData = baseMappedData;

      try {
        // 提取所有专案号
        const moNumbers = baseMappedData
          .map(item => item.moNumber)
          .filter(moNumber => moNumber && moNumber.trim() !== '');

        if (moNumbers.length === 0) {
          console.log('没有有效的专案号，跳过API请求');
          return;
        }

        // 请求后端API获取专案详细信息
        const res = await Api.mes.moveLabel.NameplateBatchByMoList(moNumbers);

        if (res.data.code !== 200) {
          console.error('API请求失败:', res.data.msg || '未知错误');
          return;
        }

        const apiData = res.data.data || [];
        // 将API返回的数据与基础映射数据合并，只保留匹配上的数据
        const finalMappedData = baseMappedData.reduce((result, baseItem) => {
          // 在API数据中查找匹配的专案信息
          const apiItem = apiData.find(apiItem => apiItem.mtoNo === baseItem.moNumber);
          // 如果找到匹配项，合并数据并添加到结果中
          if (apiItem) {
            let obj = {
              materialsCode: apiItem.number,
              materialName: apiItem.name,
              moTime: apiItem.etd,
            };
            result.push({
              ...baseItem,
              ...obj, // 保留原始映射数据
              isApiMatched: true, // 添加匹配标志
            });
          }
          return result;
        }, []);

        // 更新最终映射数据
        this.mappedData = finalMappedData;
        console.log('最终合并后的数据:', finalMappedData);

        // 统计匹配结果
        const matchedCount = finalMappedData.filter(item => item.isApiMatched).length;
        const unmatchedCount = finalMappedData.length - matchedCount;
        console.log(
          `数据匹配完成：共 ${finalMappedData.length} 条，成功匹配 ${matchedCount} 条，未匹配 ${unmatchedCount} 条`
        );
      } catch (error) {
        console.error('请求专案信息时发生错误:', error);
        // 发生错误时仍使用基础映射数据
        this.mappedData = baseMappedData;
      }
    },

    // 处理工作表切换
    handleSheetChange(sheetName) {
      this.updateTableData(sheetName);
    },

    // 处理弹窗关闭
    handleClose() {
      // 重置所有内部数据状态
      this.resetModalData();
      this.$emit('close');
      this.$emit('update:visible', false);
    },

    // 处理取消
    handleCancel() {
      // 重置所有内部数据状态
      this.resetModalData();
      this.$emit('cancel');
      this.$emit('update:visible', false);
    },

    // 处理确认导入
    handleConfirm() {
      // 如果有无效行，显示错误信息并阻止提交
      this.mappedData.forEach((row, index) => {
        row.customerId = row.customerName || null;
        row.assemblerId = row.assemblerName || null;
        row.printerId = row.printerName || null;
      });

      this.$emit('confirm', this.mappedData);
      this.$emit('update:visible', false);
    },

    // 处理单元格点击
    // 重置弹框数据
    resetModalData() {
      this.selectedSheet = '';
      this.tableData = [];
      this.tableColumns = [];
      this.fieldMappings = {};
      this.mappedData = [];
      this.showValidation = false;
      this.validationMessage = '';
      this.validationType = 'info';
      this.isMappingComplete = false;
      this.mappingProgress = 0;
      this.columnMatchStatus = {};
      this.allColumnsInitialized = false;
      this.cellMatchStatus = {};
      this.coordinate = null;
    },

    handleCellClick(scoped, col) {
      if (col?.props && col?.props?.disabled) {
        return;
      }
      this.coordinate = {
        rowIndex: scoped.$index,
        cellIndex: scoped.cellIndex,
      };
    },

    // // 获取单元格样式类
    // getCellBoxClass(scoped, col) {
    //   return {
    //     'cell-editable': col.editable !== false,
    //     'cell-required': col.required,
    //     'cell-invalid': this.isFieldInvalid(scoped, col),
    //   };
    // },

    // // 获取列验证规则
    // getColumnRules(col, scoped) {
    //   const rules = [];
    //   if (col.required) {
    //     rules.push({
    //       required: true,
    //       message: `${col.label}不能为空`,
    //       trigger: 'blur',
    //     });
    //   }
    //   return rules;
    // },

    // 处理表格项变化
    handleTableItemChange(val, scoped, col) {
      if (col.prop === 'customerName') {
        scoped.row.customerId = val.id;
      } else if (col.prop === 'assemblerName') {
        scoped.row.assemblerId = val.id;
      } else if (col.prop === 'printerName') {
        scoped.row.printerId = val.id;
      } else if (col.prop === 'nameplateTypeNameB') {
        scoped.row.nameplateTypeNameB = val.id;
        scoped.row.nameplateTypeNameT = val.nameplateTypeName;
        scoped.row.nameplateSizeNameT = val.nameplateSizeName;
      }
    },

    // 执行操作
    doAction(action, scoped) {
      if (action === 'delete') {
        this.mappedData.splice(scoped.$index, 1);
      }
    },
    // 处理单元格状态变化
    handleCellStatusChange(rowIndex, prop, status) {
      // 使用唯一的键存储单元格状态
      const key = `${rowIndex}_${prop}`;
      this.cellMatchStatus[key] = status;

      // 检查是否所有单元格都已初始化
      this.checkAllCellsInitialized();
    },

    // 检查所有单元格是否都已初始化
    checkAllCellsInitialized() {
      // 计算需要跟踪的单元格总数
      let totalCells = 0;
      this.mappedData.forEach((row, rowIndex) => {
        this.systemTargetFields.forEach(col => {
          if (
            (col.type === 'wf-select-isdialog' && col.props?.objectName) ||
            (col.type === 'dict' && col.dictKey)
          ) {
            totalCells++;
          }
        });
      });

      // 检查是否所有单元格都已初始化
      const initializedCells = Object.keys(this.cellMatchStatus).length;
      this.allColumnsInitialized = initializedCells >= totalCells;
    },
  },
};
</script>

<style scoped>
.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sheet-selector {
  margin-bottom: 15px;
}

.mapping-validation {
  margin-bottom: 15px;
}

.table-container {
  flex: 1;
  overflow: auto;
  margin-bottom: 15px;
}

/* .table-stats {
  text-align: right;
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  flex-direction: column;
  color: #909399;
} */
/* 
.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

.empty-table {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px 0;
  color: #909399;
}

.cell-box {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cell-editable {
  cursor: pointer;
}

.cell-required {
  position: relative;
}

.cell-required::before {
  content: '*';
  color: #f56c6c;
  position: absolute;
  left: -8px;
  top: 0;
} */
/* 
.cell-invalid {
  position: relative;
}

.invalid-icon {
  color: #f56c6c;
  margin-left: 5px;
  font-size: 14px;
}

.form-main {
  height: 100%;
}

.form-item-table {
  margin-bottom: 0;
  height: 100%;
} */
</style>
