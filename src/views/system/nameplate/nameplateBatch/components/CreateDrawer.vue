<template>
  <el-drawer
    v-model="visible"
    title="新增铭牌批次"
    class="nf-drawer"
    size="60%"
    @close="handleClose"
    append-to-body
  >
    <div v-loading="loading" class="drawer-container">
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
                    </el-form-item>
                  </el-col>
                </el-row>
              </template>
              <template v-if="group.renderType === 'table'">
                <div class="group-toolbar">
                  <el-button @click="addRow(group.prop)">新增行</el-button>
                </div>
                <el-table
                  border
                  :data="detailData[group.prop]"
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
                          <!-- <dc-view
                            v-else-if="col.type === 'wf-select-dialog'"
                            v-model="scoped.row[col.prop]"
                            :objectName="col.props.objectName"
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
                          <el-input-number
                            v-else-if="col.type === 'number'"
                            v-model="scoped.row[col.prop]"
                            v-bind="col.props"
                            :width="col.width"
                            :placeholder="col.props?.placeholder || `请输入${col.label}`"
                            @change="
                              val => {
                                handleTableItemChange(val, scoped, col);
                              }
                            "
                          />

                          <component
                            v-else
                            :is="col.is"
                            :class="{}"
                            :placeholder="getPlaceholder(col)"
                            v-bind="col.props"
                            v-model="scoped.row[col.prop]"
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
                <!-- </el-form-item> -->
              </template>
            </div>
          </el-form>
        </div>
        <div class="drawer-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import detailPage from '@/mixins/detail-page';
import detailConfig from '../createSubmit';
import logConfig from './log';

export default {
  mixins: [detailPage],
  name: 'CreateDrawer',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'success'],
  data() {
    return {
      detailKey: 'executeItemList',
      columns: [],
      openLog: false,
      dictMaps: {},
      editIndex: -1, // 添加editIndex变量，初始值为-1表示没有行在编辑状态
    };
  },
  computed: {
    visible: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      },
    },
    // allDisabled() {
    //   if (this.pageMode === 'add' || this.pageMode === 'edit' || this.pageMode === 'print') {
    //     return false;
    //   }
    //   return true;
    // },
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData();
      }
    },
  },
  created() {
    // this.initDictData();
  },
  methods: {
    handlePeopleSelector(val, objectName) {
      if (objectName === 'customer') {
        this.detailData.customerId = val.id;
      } else if (objectName === 'nameplateCustomer') {
        this.detailData.nameplateTemplateId = val.id;
        this.detailData.nameplateTemplateType = val.nameplateTypeName;
        this.detailData.nameplateSize = val.nameplateSizeName;
        val.nameplateCustomerDeatilsList.forEach(item => {
          item.nameplateTemplateDetailsType = item.constantType;
          item.nameplateTemplateDetailsColumn = item.nameplateField;
          item.nameplateTemplateDetailsName = item.nameplateName;
          item.nameplateTemplateDetailsVariableExpression = '';
          item.nameplateTemplateDetailsDefaultValue = item.defaultValue;
        });
        this.detailData.nameplateBatchRestructuringDetailsDataVoList =
          val.nameplateCustomerDeatilsList;
      }
    },

    handleTableItemChange(val, scoped, col) {
      if (col.prop === 'projectNumber') {
        console.log(val);
        this.detailData.nameplateBatchRestructuringFlowsDataVoList.forEach(item => {
          item.materialCode = val.number;
          item.materialName = val.name;
          item.deliveryDate = val.etd;
        });
        // this.detailData.nameplateBatchRestructuringFlowsDataVoList = val;
      }
    },

    InitDictData() {
      const { DC_NAMEPLATE_TYPE, DC_NAMEPLATE_SIZE, DC_NAMEPLATE_TYPE_PARAMETER } = this.useCache([
        { key: 'DC_NAMEPLATE_TYPE' },
        { key: 'DC_NAMEPLATE_SIZE' },
        { key: 'DC_NAMEPLATE_TYPE_PARAMETER' },
      ]);
      this.dictMaps.DC_NAMEPLATE_TYPE = DC_NAMEPLATE_TYPE;
      this.dictMaps.DC_NAMEPLATE_SIZE = DC_NAMEPLATE_SIZE;
      this.dictMaps.DC_NAMEPLATE_TYPE_PARAMETER = DC_NAMEPLATE_TYPE_PARAMETER;
      console.log(this.dictMaps);
    },
    /** 初始化数据 **/
    initData() {
      this.InitDictData();
      this.columns = detailConfig().columns;
    },
    /** 新增行 **/
    addRow(groupProp) {
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
          deliveryDate: '',
          startSerialNumber: 0,
          printCount: 0,
          digitCount: 0,
          endSerialNumber: 0,
          qrCode: '',
          printPersonId: 0,
          receivePersonId: 0,
          fileUrl: '',
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
          if (groupProp === 'nameplateBatchRestructuringDetailsDataVoList' || !groupProp) {
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

    /** 关闭抽屉 **/
    handleClose() {
      this.visible = false;
    },

    /** 提交表单 **/
    handleSubmit() {
      console.log(this.columns);
      console.log(this.detailData);
      return;
      this.$refs.formRef.validate(valid => {
        if (valid) {
          this.loading = true;
          // 调用API保存数据
          this.api.mes.moveLabel
            .createNameplateBatch(this.detailData)
            .then(res => {
              if (res.data.code === 200) {
                this.$message.success('新增成功');
                this.visible = false;
                this.$emit('success');
              }
            })
            .catch(err => {
              console.error(err);
              this.$message.error('新增失败');
            })
            .finally(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
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

.form-box {
  flex: 1;
  overflow: auto;
  padding: 20px;
}

.drawer-footer {
  padding: 20px;
  text-align: right;
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
</style>
