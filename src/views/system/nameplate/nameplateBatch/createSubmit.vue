<template>
  <basic-container class="business-container" v-loading="loading">
    <div class="drawer-container">
      <div v-if="detailData" class="content-box">
        <div class="form-box">
          <el-form
            ref="formRef"
            class="form-main"
            :model="detailData"
            label-suffix=":"
            :label-width="'120px'"
          >
            <div
              v-for="(group, i) in columns"
              class="group-box"
              :class="group.classList + `${expand[group.prop] ? ' ' : ' hide-expand'}`"
              :key="i"
            >
              <div :key="i" class="group-header">
                <span class="group-title"> {{ group.name }}</span>
              </div>
              <template v-if="group.renderType === 'form'">
                <el-row :gutter="20">
                  <el-col :span="12" v-for="(col, index) in group.items">
                    <el-form-item
                      class="form-item-operation-detail"
                      :class="`form-item-${col.prop}`"
                      :label="col.label"
                      :prop="col.prop"
                      :rules="getColumnRules(col)"
                      :key="col.prop"
                    >
                      <el-input
                        v-if="col.type === 'input'"
                        :placeholder="col.props?.placeholder || `请输入${col.label}`"
                        v-bind="col.props"
                        v-model="detailData[col.prop]"
                        clearable
                      />

                      <wf-select-dialog
                        v-else-if="col.type === 'wf-select-dialog'"
                        v-model="detailData[col.prop]"
                        @change="
                          val => {
                            handlePeopleSelector(val, col.props.objectName);
                          }
                        "
                        :objectName="col.props.objectName"
                      />
                      <el-select
                        v-else-if="col.type === 'dict'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placeholder || `请选择${col.label}`"
                        clearable
                      >
                        <el-option
                          v-for="option in dictMaps?.[col.dictKey] || []"
                          :key="option.dictKey"
                          :label="option.label"
                          :value="option.dictKey"
                        />
                      </el-select>
                      <el-select
                        v-else-if="col.type === 'select'"
                        v-model="detailData[col.prop]"
                        :placeholder="col.props?.placeholder || `请选择${col.label}`"
                        clearable
                        @change="handleSelectChangeRes"
                      >
                        <el-option
                          v-for="option in col.options || []"
                          :key="option.value"
                          :label="option.label"
                          :value="option.value"
                        />
                      </el-select>
                      <el-switch
                        v-else-if="col.type === 'switch'"
                        v-model="detailData[col.prop]"
                        :active-value="1"
                        :inactive-value="0"
                      />
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>
              <template v-if="group.renderType === 'table'">
                <div class="group-toolbar">
                  <el-button class="add-row-btn" @click="addRow(group.prop)">新增行</el-button>

                  <!-- <el-popover
                    pplacement="right-start"
                    trigger="hover"
                    effect="light"
                    width="50%"
                    v-if="
                      group.prop == 'nameplateBatchRestructuringDetailsDataVoList' &&
                      nameplateCustomerDeatilsList.length > 0
                    "
                  >
                    <template #default>
                      <nameplate-style-card
                        :nameplateSizeName="detailData.nameplateTemplateType"
                        :nameplateTypeName="detailData.nameplateTemplateType"
                        :isQtcode="detailData.lookQtCode"
                        :nameplateCustomerDeatilsList="nameplateCustomerDeatilsList"
                      />
                    </template>
                    <template #reference>
                      <el-button type="primary"> 铭牌预览</el-button>
                    </template>
                  </el-popover> -->

                  <wf-select-dialogV2
                    v-if="group.prop == 'nameplateBatchRestructuringFlowsDataVoList'"
                    placeholder="请选择关联项目"
                    objectName="CompleteMtoNo"
                    type="input"
                    returnType="object"
                    :multiple="true"
                    :initChangeable="true"
                    :clearable="true"
                    masterKey="id"
                    :useSlot="true"
                    @change="hanleLeaderDevice"
                  >
                    <template #default>
                      <el-button type="primary" @click="checkBatchTypeBeforeAdd" icon="el-icon-plus"
                        >批量新增
                      </el-button>
                    </template>
                  </wf-select-dialogV2>
                </div>
                <div class="table-container-warp">
                  <el-table
                    border
                    :data="detailData[group.prop]"
                    size="small"
                    style="height: 100%"
                    @row-click="row => handleRowClick(row, group.prop)"
                    @selection-change="handleSelectionChange"
                  >
                    <template v-for="(col, i) in group.items">
                      <el-table-column
                        v-if="
                          col.type === 'selection' &&
                          (!col.showFunc ||
                            (col.showFunc && col.showFunc?.call && col.showFunc(detailData)))
                        "
                        type="selection"
                        :fixed="col.fixed"
                        :width="col.width"
                        :min-width="col.minWidth"
                        :key="i"
                        :selectable="col.selectable"
                      >
                      </el-table-column>
                      <el-table-column
                        v-else-if="col.type === 'index'"
                        :key="'index' + i"
                        :prop="col.prop"
                        label="序号"
                        fixed="left"
                        align="center"
                        min-width="80px"
                      >
                        <template #default="scoped">{{ scoped.$index + 1 }}</template>
                      </el-table-column>
                      <el-table-column
                        v-else-if="col.type === 'actions'"
                        :key="'option' + i"
                        :fixed="col.fixed"
                        :label="col.label"
                        :width="col.width ? col.width : 180"
                        :align="col.align ? col.align : 'center'"
                      >
                        <template #default="scoped">
                          <el-button
                            v-for="(btn, j) in col.children"
                            :key="j"
                            link
                            v-show="!btn.showFunc || (btn.showFunc && btn.showFunc(scoped))"
                            type="primary"
                            @click="doAction(btn.action, scoped, group.prop)"
                            >{{ btn.label }}</el-button
                          >
                        </template>
                      </el-table-column>
                      <el-table-column
                        v-else-if="
                          !col.showFunc ||
                          (col.showFunc && col.showFunc?.call && col.showFunc(detailData))
                        "
                        :key="`other-${i}`"
                        :fixed="col.fixed"
                        :width="col.width"
                        align="left"
                        :min-width="col.minWidth"
                        :prop="col.prop"
                        show-overflow-tooltip
                      >
                        <template #header><span v-html="getLabelCode(col)"> </span></template>
                        <template #default="scoped">
                          <template v-if="editIndex === scoped.$index">
                            <el-select
                              class="param-value"
                              :class="{
                                'is-null':
                                  col.required &&
                                  [null, undefined, ''].includes(scoped.row[col.prop]),
                              }"
                              v-if="col.type === 'dict'"
                              v-model="scoped.row[col.prop]"
                              :placeholder="col.props?.placeholder || `请选择${col.label}`"
                              v-bind="col.props"
                              clearable
                              :multiple="col.multiple"
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                            >
                              <!-- 配置里面有withGroup的情况 -->
                              <template v-if="col.withGroup">
                                <el-option-group
                                  v-for="(opGroup, i) in dictMaps?.[col.dictKey] || []"
                                  :key="i"
                                  :label="opGroup[col.labelKey]"
                                >
                                  <el-option
                                    v-for="(option, j) in opGroup.children"
                                    :key="j"
                                    :label="option[col.labelKey]"
                                    :value="option[col.valueKey]"
                                  />
                                </el-option-group>
                              </template>
                              <template v-else>
                                <el-option
                                  v-for="(option, j) in dictMaps?.[col.dictKey] || []"
                                  :key="j"
                                  :label="option[col.labelKey]"
                                  :value="option[col.valueKey]"
                                />
                              </template>
                            </el-select>
                            <el-input
                              v-else-if="col.type === 'input'"
                              :placeholder="col.props?.placeholder || `请输入${col.label}`"
                              v-bind="col.props"
                              v-model="scoped.row[col.prop]"
                              clearable
                            />
                            <dc-select-user
                              v-else-if="col.type === 'dc-select-user'"
                              v-bind="col.props"
                              v-model="scoped.row[col.prop]"
                              @iptTagDataUpdate="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                            />
                            <el-checkbox
                              v-else-if="col.type === 'checkbox'"
                              v-model="scoped.row[col.prop]"
                              v-bind="col.props"
                              @click.stop
                              :true-label="'是'"
                              :false-label="'否'"
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                            />
                            <!-- <dc-view
                              v-else-if="col.type === 'dc-view'"
                              v-model="scoped.row[col.prop]"
                              :objectName="col.objectName"
                              :showKey="col.showKey || 'name'"
                            /> -->
                            <!-- <dc-view
                              v-else-if="col.type === 'dc-view'"
                              v-model="scoped.row[col.prop]"
                              objectName="customer"
                              showKey="fullname"
                            /> -->
                            <wf-select-dialog
                              v-else-if="col.type === 'wf-select-dialog'"
                              v-bind="col.props"
                              v-model="scoped.row[col.prop]"
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                              :objectName="col.props.objectName"
                            />
                            <wf-select-single
                              v-else-if="col.type === 'wf-select-single'"
                              v-bind="col.props"
                              v-model="scoped.row[col.prop]"
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                              :objectName="col.props.objectName"
                            />
                            <el-input-number
                              v-else-if="col.type === 'number'"
                              v-model="scoped.row[col.prop]"
                              v-bind="col.props"
                              style="width: 80px"
                              :width="col.width"
                              :disabled="
                                col.prop === 'startSerialNumber'
                                  ? detailData.nameplateBatchType == 'type1'
                                  : col.props?.disabled || false
                              "
                              :placeholder="col.props?.placeholder || `请输入${col.label}`"
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                            />

                            <component
                              v-else-if="col.is"
                              :is="col.is"
                              :class="{}"
                              :placeholder="getPlaceholder(col)"
                              v-bind="col.props"
                              v-model="scoped.row[col.prop]"
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                            >
                            </component>
                            <span v-else class="text-only">
                              {{ scoped.row[col.prop] || '-' }}
                            </span>
                          </template>
                          <span
                            v-else
                            @click="handleClickCeil(scoped.$index, col.prop)"
                            class="ceil-value"
                          >
                            <span v-if="col.type === 'dict'">
                              {{ getDictLabel(col.dictKey, scoped.row[col.prop]) || '-' }}
                            </span>
                            <dc-view
                              v-else-if="col.type === 'wf-select-dialog'"
                              :modelValue="scoped.row[col.prop]"
                              :objectName="col.props.objectName"
                              type="text"
                            />

                            <el-checkbox
                              v-else-if="col.type === 'checkbox'"
                              v-model="scoped.row[col.prop]"
                              v-bind="col.props"
                              :true-label="'是'"
                              :false-label="'否'"
                              @click.stop
                              @change="
                                val => {
                                  handleTableItemChange(val, scoped, col);
                                }
                              "
                            />
                            <span v-else-if="col?.transVal">
                              {{ col?.transVal(scoped) || '-' }}
                            </span>
                            <span v-else>
                              {{ scoped.row[col.prop] || '-' }}
                            </span>
                          </span>
                        </template>
                      </el-table-column>
                    </template>
                  </el-table>
                  <div
                    class=""
                    style="width: 100%"
                    v-if="group.prop == 'nameplateBatchRestructuringDetailsDataVoList'"
                  >
                    <nameplate-style-card
                      :nameplateTypeName="detailData.nameplateTemplateType"
                      :isQtcode="detailData.lookQtCode"
                      :nameplateCustomerDeatilsList="nameplateCustomerDeatilsList"
                    />
                  </div>
                </div>
                <!-- </el-form-item> -->
              </template>
            </div>
          </el-form>
        </div>
        <div class="drawer-footer">
          <!-- <el-button @click="handleClose">取消</el-button> -->
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </div>
    </div>
  </basic-container>
</template>

<script>
import detailPage from '@/mixins/detail-page';
import detailConfig from './createSubmit';
import NameplateStyleCard from '@/views/system/nameplate/nameplateTemplate/components/NameplateStyleCard.vue';
import WfSelectDialogV2 from '@/views/plugin/workflow/components/custom-fields/wf-select-dialogV2/index.vue';
// import logConfig from './log';

export default {
  mixins: [detailPage],
  name: 'CreateDrawer',
  components: {
    NameplateStyleCard,
    WfSelectDialogV2,
  },
  data() {
    return {
      detailKey: 'executeItemList',
      columns: [],
      openLog: false,
      // detailData: {},
      dictMaps: {},
      // nameplateCustomerDeatilsList: [], // 注释掉原来的数据属性
      editIndex: -1, // 添加editIndex变量，初始值为-1表示没有行在编辑状态
    };
  },
  // 添加计算属性
  computed: {
    nameplateCustomerDeatilsList() {
      // 从nameplateBatchRestructuringDetailsDataVoList动态生成nameplateCustomerDeatilsList
      if (!this.detailData || !this.detailData.nameplateBatchRestructuringDetailsDataVoList) {
        return [];
      }
      return this.detailData.nameplateBatchRestructuringDetailsDataVoList.map(item => ({
        constantType: item.nameplateTemplateDetailsType,
        nameplateField: item.nameplateTemplateDetailsColumn,
        nameplateName: item.nameplateTemplateDetailsName,
        defaultValue: item.nameplateTemplateDetailsDefaultValue,
        isSn: item.nameplateTemplateDetailsIsSn,
        nameplateSort: item.nameplateTemplateDetailsSort,
        isDeleted: '0', // 添加默认值，确保组件正常显示
      }));
    },
  },
  created() {
    this.initData();
    this.detailData.lookQtCode = 1;
    if (this.$route.query.id) {
      this.api.mes.moveLabel
        .queryAllById({
          id: this.$route.query.id,
        })
        .then(res => {
          const { code, data } = res.data;
          if (code === 200) {
            console.log('data', data);

            // 基本信息字段映射 - 确保与createSubmit.js中的字段匹配
            this.detailData = {
              nameplateBatchType: data.nameplateBatchType || '',
              nameplateTypeNameB: data.nameplateTypeNameB || data.nameplateTemplateName || '',
              nameplateTemplateType: data.nameplateTypeNameT || '',
              nameplateSize: data.nameplateSizeNameT || '',
              lookQtCode: 1,
              // 其他基本信息字段...
            };
            console.log(data.nameplateBatchDeatilsFlowList);
            // 流程信息列表映射 - 确保与createSubmit.js中的表格字段匹配
            // if (data.nameplateBatchDeatilsFlowList.length > 0) {
            this.detailData.nameplateBatchRestructuringFlowsDataVoList =
              data.nameplateBatchDeatilsFlowList.map(flow => ({
                projectNumber: flow.moNumber || '',
                printPersonId: data.printerId || '',
                receivePersonId: data.assemblerId || '',
                customerId: flow.customerId || data.customerId || '',
                deliveryDate: data.moTime || '',
                // startSerialNumber: data.beginNumber || 1,
                // printCount: data.printCount || 1,
                // digitCount: data.printerDigits || 1,
                // endSerialNumber: data.overNumber || 1,
                // qrCode: data.qrCode || '',
                materialCode: data.materialsCode || '',
                materialName: data.materialsName || '',
                // 其他流程信息字段...
              }));

            console.log(this.detailData.nameplateBatchRestructuringFlowsDataVoList);
            // } else {
            //   this.detailData.nameplateBatchRestructuringFlowsDataVoList = [];
            // }

            // 铭牌详情列表映射 - 确保与createSubmit.js中的表格字段匹配
            if (data.nameplateBatchDeatilsList) {
              this.detailData.nameplateBatchRestructuringDetailsDataVoList =
                data.nameplateBatchDeatilsList.map(item => ({
                  nameplateTemplateDetailsType: item.constantType || '',
                  nameplateTemplateDetailsColumn: item.nameplateField || '',
                  nameplateTemplateDetailsName: item.nameplateName || '',
                  nameplateTemplateDetailsVariableExpression: '',
                  nameplateTemplateDetailsDefaultValue: item.defaultValue || '',
                  nameplateTemplateDetailsIsSn: item.isSn || false,
                  nameplateTemplateDetailsSort: item.nameplateSort || 0,
                  // 其他详情字段...
                }));
            } else {
              this.detailData.nameplateBatchRestructuringDetailsDataVoList = [];
            }
          }
        });
    }
  },
  watch: {
    'detailData.nameplateBatchType': {
      handler(newVal, oldVal) {
        // 如果批次类型被清空，清空流程信息
        if (oldVal !== newVal) {
          if (!this.$route.query.id) {
            this.detailData.nameplateBatchRestructuringFlowsDataVoList = [];
          }
        }
      },
      deep: true,
    },
  },
  methods: {
    validateNameplateBatch(nameplateBatch) {
      // 检验开始序号不能小于0
      if (nameplateBatch.getBeginNumber() < 0) {
        throw new Error('开始序号不能小于0');
      }
      // 检验非法数值（开始序号+数量超出最大可生成范围）
      const maxAvailable = Math.pow(10, nameplateBatch.getPrinterDigits()) - 1;
      const total = nameplateBatch.getBeginNumber() + nameplateBatch.getPrinterCount() - 1;
      if (total > maxAvailable) {
        throw new Error('开始序号+数量超出最大可生成范围');
      }
    },

    // 检查批次类型是否为空
    checkBatchTypeBeforeAdd() {
      if (!this.detailData.nameplateBatchType) {
        this.$message.warning('请先选择批次类型');
        return false;
      }
      return true;
    },
    handleSelectChangeRes(val) {
      if (this.$route.query.id) {
        if (val == 'type1') {
          let item = this.detailData.nameplateBatchRestructuringFlowsDataVoList[0];
          console.log(item);
          this.getbatchList(
            {
              moNumber: item.projectNumber,
              materialCode: item.materialCode,
              materialName: item.materialName,
              currentPage: 1,
              size: 999,
              // customerId: this.detailData.customerName,
            },
            item
          );
        } else {
          this.detailData.nameplateBatchRestructuringFlowsDataVoList[0].startSerialNumber = 1;
        }
      }
    },
    hanleLeaderDevice(val) {
      // 检查批次类型是否为空
      if (!this.checkBatchTypeBeforeAdd()) {
        return;
      }
      // 确保val是数组
      const selectedItems = Array.isArray(val) ? val : [val];
      console.log(selectedItems);
      // 处理字段映射
      const processedItems = selectedItems.map(item => {
        // 创建新对象，保留原有属性
        const processedItem = { ...item };
        // 进行字段转换
        processedItem.materialCode = item.number;
        processedItem.materialName = item.name;
        processedItem.deliveryDate = item.date.split(' ')[0];
        processedItem.projectNumber = item.billNo;
        processedItem.customerId = item.customerId.toString();
        processedItem.printPersonId = '1844537392948925835';
        processedItem.startSerialNumber = 0;
        processedItem.printCount = 0;
        processedItem.digitCount = 0;
        processedItem.endSerialNumber = 0;
        processedItem.qrCode =
          'EW' +
          (item.date.split(' ')[0] || '').replace(/-/g, '') +
          (item.billNo || '').slice(0, 5);

        // 处理特定条件下的额外逻辑
        if (this.detailData.nameplateBatchType == 'type1') {
          this.getbatchList(
            {
              moNumber: item.billNo,
              materialCode: item.number,
              materialName: item.name,
              currentPage: 1,
              size: 999,
              // customerId: this.detailData.customerName,
            },
            processedItem
          );
        }

        return processedItem;
      });

      console.log(processedItems);

      // 去重处理：基于materialCode和projectNumber组合判断唯一性
      let uniqueProcessedItems = [...processedItems];

      // 更新到detailData，保留用户已手动添加的行，并避免添加重复数据
      if (
        this.detailData.nameplateBatchRestructuringFlowsDataVoList &&
        this.detailData.nameplateBatchRestructuringFlowsDataVoList.length > 0
      ) {
        // 过滤出不重复的新数据（不在现有列表中的数据）
        uniqueProcessedItems = processedItems.filter(newItem => {
          const exists = this.detailData.nameplateBatchRestructuringFlowsDataVoList.some(
            existingItem =>
              existingItem.materialCode === newItem.materialCode &&
              existingItem.projectNumber === newItem.projectNumber
          );
          return !exists;
        });

        // 如果有不重复的数据才添加
        if (uniqueProcessedItems.length > 0) {
          this.detailData.nameplateBatchRestructuringFlowsDataVoList = [
            ...this.detailData.nameplateBatchRestructuringFlowsDataVoList,
            ...uniqueProcessedItems,
          ];

          // 如果有重复项被过滤掉，给出提示
          if (uniqueProcessedItems.length < processedItems.length) {
            this.$message.warning(
              `已过滤${processedItems.length - uniqueProcessedItems.length}条重复数据`
            );
          }
        } else {
          // 如果所有数据都重复，则提示用户
          this.$message.warning('所选数据有重复，未添加');
        }
      } else {
        // 如果没有现有数据，则直接赋值
        this.detailData.nameplateBatchRestructuringFlowsDataVoList = processedItems;
      }
    },
    handlePeopleSelector(val, objectName) {
      if (objectName === 'customer') {
        this.detailData.customerId = val.id;
      } else if (objectName === 'nameplateCustomer') {
        // 不再直接设置nameplateCustomerDeatilsList，而是通过计算属性自动生成
        // this.nameplateCustomerDeatilsList = val.nameplateCustomerDeatilsList;

        this.detailData.nameplateTemplateId = val.id;
        this.detailData.nameplateTemplateType = val.nameplateTypeName;
        this.detailData.nameplateSize = val.nameplateSizeName;
        const nameplateCustomerlsList = val.nameplateCustomerDeatilsList.map(item => ({
          nameplateTemplateDetailsType: item.constantType,
          nameplateTemplateDetailsColumn: item.nameplateField,
          nameplateTemplateDetailsName: item.nameplateName,
          nameplateTemplateDetailsVariableExpression: '',
          nameplateTemplateDetailsDefaultValue: item.defaultValue,
          nameplateTemplateDetailsIsSn: item.isSn,
          nameplateTemplateDetailsSort: item.nameplateSort,
        }));

        // 只设置nameplateBatchRestructuringDetailsDataVoList
        this.detailData.nameplateBatchRestructuringDetailsDataVoList = nameplateCustomerlsList;
      }
    },

    // 新增打印(流水递增)
    getbatchList(params, row) {
      console.log(row);
      this.api.mes.moveLabel.batchList(params).then(res => {
        if (res.data.data.records.length > 0) {
          const newStartSerialNumber =
            Number(res.data.data.records[0].beginNumber) +
            Number(res.data.data.records[0].printerCount);

          row.startSerialNumber = newStartSerialNumber;
          // row.printCount = res.data.data.records[0].printerCount;

          row.endSerialNumber = row.printCount + newStartSerialNumber - 1;
        } else {
          row.startSerialNumber = 1;
          row.endSerialNumber = row.printCount + 1 - 1;
        }

        // this.$forceUpdate();
      });
    },
    handleTableItemChange(val, scoped, col) {
      const currentIndex = scoped.$index;

      const row = this.detailData.nameplateBatchRestructuringFlowsDataVoList[currentIndex];
      console.log(row);
      if (col.prop === 'projectNumber') {
        console.log(val);

        // 检查 projectNumber 是否重复
        if (val && val.id) {
          const idNumber = val.id;
          const isDuplicate = this.detailData.nameplateBatchRestructuringFlowsDataVoList.some(
            (item, index) => index !== currentIndex && item.id === idNumber
          );

          if (isDuplicate) {
            this.$message.warning('项目号已存在，不能添加重复的项目号');
            // 清空当前行的 projectNumber 相关字段
            row.projectNumber = '';
            row.materialCode = '';
            row.materialName = '';
            row.deliveryDate = '';
            row.qrCode = '';
            return;
          }
        }

        // 只更新当前行，而不是所有行
        if (this.detailData.nameplateBatchRestructuringFlowsDataVoList && row) {
          row.materialCode = val.number;
          row.materialName = val.name;
          row.deliveryDate = val.date.split(' ')[0];
          row.customerId = val.customerId.toString();
          row.projectNumber = val.billNo;
          row.qrCode =
            'EW' + (row.deliveryDate || '').replace(/-/g, '') + row.projectNumber.slice(0, 5);
          if (this.detailData.nameplateBatchType == 'type1') {
            this.getbatchList(
              {
                moNumber: row.projectNumber,
                materialCode: row.materialCode,
                materialName: row.materialName,
                currentPage: 1,
                size: 999,
                // customerId: this.detailData.customerName,
              },
              row
            );
          }
        }
      } else if (col.prop === 'printCount') {
        console.log(33333);
        row.endSerialNumber = row.printCount + row.startSerialNumber - 1;
      } else if (col.prop === 'startSerialNumber') {
        // 当 startSerialNumber 变化时，更新 endSerialNumber
        row.endSerialNumber = row.printCount + row.startSerialNumber - 1;
        this.updateQrCode(row);
      } else if (col.prop === 'deliveryDate') {
        this.updateQrCode(row);
      } else if (col.prop === 'digitCount') {
        // 当 digitCount 变化时，更新二维码
        this.updateQrCode(row);
      } else if (col.type === 'checkbox') {
        // 处理checkbox类型的变化
        row[col.prop] = val;
        // 强制更新视图，确保checkbox状态立即更新
        this.$forceUpdate();
      }
    },
    // 更新二维码的方法
    updateQrCode(row) {
      // 确保开始序号和位数都有值
      if (
        row.startSerialNumber !== undefined &&
        row.startSerialNumber !== null &&
        row.digitCount !== undefined &&
        row.digitCount !== null &&
        row.digitCount > 0
      ) {
        // 将开始序号格式化为指定位数的字符串，不足位数前面补0
        const formattedStartSerial = String(row.startSerialNumber).padStart(row.digitCount, '0');
        // 拼接二维码：EW + 项目号(前7位) + 交货日期(去掉-) + 格式化后的开始序号
        row.qrCode =
          'EW' +
          +(row.deliveryDate || '').replace(/-/g, '') +
          (row.projectNumber ? row.projectNumber.slice(0, 5) : '') +
          formattedStartSerial;
      } else if (row.projectNumber) {
        // 如果没有开始序号或位数，则使用原来的逻辑
        row.qrCode =
          'EW' + (row.deliveryDate || '').replace(/-/g, '') + row.projectNumber.slice(0, 5);
      }
    },
    InitDictData() {
      const {
        DC_NAMEPLATE_TYPE,
        DC_NAMEPLATE_SIZE,
        DC_NAMEPLATE_TYPE_PARAMETER,
        DC_NAMEPLATE_EXPRESSION,
      } = this.useCache([
        { key: 'DC_NAMEPLATE_TYPE' },
        { key: 'DC_NAMEPLATE_SIZE' },
        { key: 'DC_NAMEPLATE_TYPE_PARAMETER' },
        { key: 'DC_NAMEPLATE_EXPRESSION' },
      ]);
      this.dictMaps.DC_NAMEPLATE_TYPE = DC_NAMEPLATE_TYPE;
      this.dictMaps.DC_NAMEPLATE_SIZE = DC_NAMEPLATE_SIZE;
      this.dictMaps.DC_NAMEPLATE_TYPE_PARAMETER = DC_NAMEPLATE_TYPE_PARAMETER;
      this.dictMaps.DC_NAMEPLATE_EXPRESSION = DC_NAMEPLATE_EXPRESSION;
      console.log(this.dictMaps);
    },
    /** 初始化数据 **/
    initData() {
      this.InitDictData();
      this.columns = detailConfig().columns;
    },
    /** 新增行 **/
    addRow(groupProp) {
      // 如果是流程信息表格，需要先检查批次类型是否为空
      if (groupProp === 'nameplateBatchRestructuringFlowsDataVoList') {
        if (!this.detailData.nameplateBatchType) {
          this.$message.warning('请先选择批次类型');
          return;
        }
      }
      // 根据传入的groupProp判断是哪个表格
      if (groupProp === 'nameplateBatchRestructuringDetailsDataVoList' || !groupProp) {
        // 铭牌详情表格
        if (!this.detailData.nameplateBatchRestructuringDetailsDataVoList) {
          this.detailData.nameplateBatchRestructuringDetailsDataVoList = [];
        }

        // 添加新行，初始化为空对象
        this.detailData.nameplateBatchRestructuringDetailsDataVoList.push({
          nameplateTemplateDetailsType: '',
          nameplateTemplateDetailsColumn: '',
          nameplateTemplateDetailsName: '',
          nameplateTemplateDetailsIsSn: '否',
          nameplateTemplateDetailsVariableExpression: '',
          nameplateTemplateDetailsDefaultValue: '',
          nameplateTemplateDetailsFinalValue: '',
          nameplateTemplateDetailsSort: 0,
        });

        // 设置editIndex为新添加行的索引，使其进入编辑模式
        this.editIndex = this.detailData.nameplateBatchRestructuringDetailsDataVoList.length - 1;
      } else if (groupProp === 'nameplateBatchRestructuringFlowsDataVoList') {
        // 流程信息表格
        if (!this.detailData.nameplateBatchRestructuringFlowsDataVoList) {
          this.detailData.nameplateBatchRestructuringFlowsDataVoList = [];
        }

        // 添加新行，初始化为空对象
        this.detailData.nameplateBatchRestructuringFlowsDataVoList.push({
          projectNumber: '',
          materialCode: '',
          materialName: '',
          deliveryDate: new Date().toISOString().slice(0, 10),
          startSerialNumber: 0,
          printCount: 0,
          digitCount: 0,
          endSerialNumber: 0,
          qrCode: '',
          customerId: '',
          printPersonId: '1844537392948925835',
          receivePersonId: 0,
        });

        // 设置editIndex为新添加行的索引，使其进入编辑模式
        this.editIndex = this.detailData.nameplateBatchRestructuringFlowsDataVoList.length - 1;
      }
    },

    /** 删除行 **/
    deleteRow(scope, groupProp) {
      const { $index } = scope;
      this.$confirm('确认删除该行数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 根据groupProp判断是哪个表格
          if (groupProp === 'nameplateBatchRestructuringDetailsDataVoList') {
            // 铭牌详情表格
            this.detailData.nameplateBatchRestructuringDetailsDataVoList.splice($index, 1);
          } else if (groupProp === 'nameplateBatchRestructuringFlowsDataVoList') {
            // 流程信息表格
            this.detailData.nameplateBatchRestructuringFlowsDataVoList.splice($index, 1);
          }
          this.$message.success('删除成功');
        })
        .catch(() => {
          this.$message.info('已取消删除');
        });
    },

    /** 页面操作 **/
    doAction(action, scope, groupProp) {
      if (action === 'delete') {
        this.deleteRow(scope, groupProp);
      }
    },

    /** 行点击 **/
    handleRowClick(row, groupProp) {
      if (this.pageMode !== 'look') {
        // 根据groupProp判断是哪个表格
        let tableData = [];
        if (groupProp === 'nameplateBatchRestructuringDetailsDataVoList' || !groupProp) {
          // 铭牌详情表格
          tableData = this.detailData.nameplateBatchRestructuringDetailsDataVoList || [];
        } else if (groupProp === 'nameplateBatchRestructuringFlowsDataVoList') {
          // 流程信息表格
          tableData = this.detailData.nameplateBatchRestructuringFlowsDataVoList || [];
        }
        const index = tableData.findIndex(item => item === row);
        this.editIndex = index;
      }
    },

    /** 提交表单 **/
    handleSubmit() {
      // console.log(this.columns);
      // console.log(this.detailData);
      // return;
      // 表单验证
      this.$refs.formRef.validate(valid => {
        if (!valid) {
          this.$message.error('请填写必填项');
          return false;
        }

        // 验证铭牌详情表格
        const detailsList = this.detailData.nameplateBatchRestructuringDetailsDataVoList || [];
        if (detailsList.length === 0) {
          this.$message.error('铭牌详情不能为空');
          return false;
        }

        // 验证流程信息表格
        const flowsList = this.detailData.nameplateBatchRestructuringFlowsDataVoList || [];
        if (flowsList.length === 0) {
          this.$message.error('流程信息不能为空');
          return false;
        }

        // 验证流程信息表格中的必填项
        for (let i = 0; i < flowsList.length; i++) {
          const row = flowsList[i];
          if (!row.projectNumber) {
            this.$message.error(`第${i + 1}行专案号不能为空`);
            return false;
          }
          if (!row.customerId) {
            this.$message.error(`第${i + 1}行客户不能为空`);
            return false;
          }
          if (!row.printPersonId) {
            this.$message.error(`第${i + 1}行打印人不能为空`);
            return false;
          }
          if (!row.receivePersonId) {
            this.$message.error(`第${i + 1}行接收人不能为空`);
            return false;
          }
          if (!row.printCount || row.printCount <= 0) {
            this.$message.error(`第${i + 1}行打印数量必须大于0`);
            return false;
          }
          if (!row.digitCount || row.digitCount <= 0) {
            this.$message.error(`第${i + 1}行位数必须大于0`);
            return false;
          }
          if (!row.startSerialNumber || row.startSerialNumber <= 0) {
            this.$message.error(`第${i + 1}行开始序号必须大于0`);
            return false;
          }
        }

        // 验证铭牌详情表格中的必填项
        for (let i = 0; i < detailsList.length; i++) {
          const row = detailsList[i];
          if (!row.nameplateTemplateDetailsType) {
            this.$message.error(`第${i + 1}行铭牌分类不能为空`);
            return false;
          }
        }

        console.log(this.detailData);
        // return;
        // 所有验证通过，提交表单
        this.loading = true;
        // 调用API保存数据
        this.api.mes.moveLabel
          .nameplateBatchRestructuringData(this.detailData)
          .then(res => {
            if (res.data.code === 200) {
              //   this.$message.success('新增成功');

              console.log(res.data.data);
              //   return;
              this.startBatch(res.data.data);
            } else {
              this.loading = false;
              this.$message.error(res.data.msg || '新增失败');
            }
          })
          .catch(err => {
            console.error(err);
            this.loading = false;
            this.$message.error('新增失败');
          })
          .finally(() => {
            // this.loading = false;
          });
      });
    },

    // 提交
    startBatch(data) {
      this.loading = true;
      this.api.mes.moveLabel
        .startBatchRestructuringData(data)
        .then(res => {
          if (res.data.code === 200) {
            this.$message.success('发起流程成功');
            this.detailData = {};
            this.nameplateCustomerDeatilsList = [];
            this.$router.push({
              path: '/system/nameplate/nameplateBatch/index',
            });
            this.loading = false;
          } else {
            this.$message.error(res.data.msg || '发起流程失败');
            this.loading = false;
          }
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
          this.$message.error('发起流程失败');
        })
        .finally(() => {
          //   this.loading = false;
        });
    },

    /** 初始化数据 **/
    show() {
      // 确保在新增模式下，detailData中的nameplateBatchRestructuringDetailsDataVoList初始化为空数组
      if (!this.detailData.nameplateBatchRestructuringDetailsDataVoList) {
        this.detailData.nameplateBatchRestructuringDetailsDataVoList = [];
      }
    },
    /** 获取字典标签 **/
    getDictLabel(dictKey, value) {
      if (!value) return '-';
      const dictList = this.dictMaps[dictKey] || [];
      const dictItem = dictList.find(item => item.dictKey === value || item.value === value);
      return dictItem ? dictItem.label : value;
    },
    /** 获取专案号标签 **/
    getProjectNumberLabel(value) {
      if (!value) return '-';
      // 这里可以根据实际需求处理专案号的显示逻辑
      // 例如，如果专案号有对应的字典数据，可以在这里查找并返回标签
      // 目前先直接返回值，后续可以根据实际需求修改
      return value;
    },
  },
};
</script>

<style scoped lang="scss">
.drawer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.table-container-warp {
  display: flex;
  justify-content: space-between;
}

.form-box {
  flex: 1;
  overflow: auto;
  padding: 20px;
  margin-bottom: 50px;
}

.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 0;
  text-align: center;
  z-index: 1000;
  background: #fff;

  border-top: 1px solid #eee;
}

.group-box {
  margin-bottom: 20px;
}

.group-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  .group-title {
    padding-left: 5px;
    border-left: 5px solid #f78431;
  }
}
.group-toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
}
.add-row-btn {
  margin-right: 8px;
}
.el-button {
  margin-left: 0;
}
</style>
