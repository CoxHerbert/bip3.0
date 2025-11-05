/** 线材执行单 */
const options = () => {
  return {
    columns: [
      {
        prop: 'jobDesc',
        label: '任务描述',
        type: 'rowText',
        minWidth: 180,
      },
      {
        prop: 'scheduleType',
        label: '调度类型',
        type: 'rowText',
        width: 90,
      },
      {
        prop: 'scheduleConf',
        label: '调度配置',
        type: 'rowTextHide',
        minWidth: 150,
      },
      {
        prop: 'triggerStatus',
        label: '状态',
        type: 'rowText',
        width: 120,
      },
      {
        prop: 'misfireStrategy',
        label: '失败策略',
        type: 'rowTextHide',
        width: 100,
      },
      {
        prop: 'executorRouteStrategy',
        label: '执行路由策略',
        type: 'rowText',
        width: 140,
      },
      {
        prop: 'executorHandler',
        label: '执行处理器',
        type: 'rowText',
        minWidth: 150,
      },
      {
        prop: 'executorParam',
        label: '执行参数',
        type: 'rowTextHide',
        minWidth: 120,
      },
      {
        prop: 'executorBlockStrategy',
        label: '阻塞处理策略',
        type: 'rowTextHide',
        width: 140,
      },
      {
        prop: 'executorTimeout',
        label: '执行超时时间',
        type: 'rowTextHide',
        width: 120,
      },
      {
        prop: 'executorFailRetryCount',
        label: '失败重试次数',
        type: 'rowTextHide',
        width: 120,
      },
      {
        prop: 'author',
        label: '作者',
        type: 'rowText',
        width: 100,
      },
      {
        prop: 'alarmEmail',
        label: '告警邮箱',
        type: 'rowTextHide',
        minWidth: 180,
      },
      {
        prop: 'glueType',
        label: 'GLUE类型',
        type: 'rowTextHide',
        width: 100,
      },
      {
        prop: 'glueRemark',
        label: 'GLUE备注',
        type: 'rowText',
        minWidth: 150,
      },
      {
        prop: 'childJobId',
        label: '子任务ID',
        type: 'rowTextHide',
        minWidth: 120,
      },
      {
        prop: 'triggerStatus',
        label: '触发器状态',
        type: 'rowTextHide',
        width: 120,
      },
      {
        prop: 'addTime',
        label: '添加时间',
        type: 'rowTextHide',
        width: 180,
      },
      {
        prop: 'updateTime',
        label: '更新时间',
        type: 'rowTextHide',
        width: 180,
      },
      {
        prop: 'glueUpdatetime',
        label: 'GLUE更新时间',
        type: 'rowTextHide',
        width: 180,
      },
      {
        prop: 'triggerLastTime',
        label: '上次触发时间',
        type: 'rowTextHide',
        width: 180,
      },
      {
        prop: 'triggerNextTime',
        label: '下次触发时间',
        type: 'rowTextHide',
        width: 180,
      },
      {
        label: '操作',
        prop: 'action',
        type: 'actions',
        slotName: 'action',
        fixed: 'right',
        width: 150,
      },
    ],
    OperatingMode: [
      { label: 'BEAN', value: 'BEAN' },
      { label: 'GLUE(Java)', value: 'GLUE_GROOVY' },
      { label: 'GLUE(Shell)', value: 'GLUE_SHELL' },
      { label: 'GLUE(Python3)', value: 'GLUE_PYTHON' },
      { label: 'GLUE(Python2)', value: 'GLUE_PYTHON2' },
      { label: 'GLUE(Nodejs)', value: 'GLUE_NODEJS' },
      { label: 'GLUE(PowerShell)', value: 'GLUE_POWERSHELL' },
      { label: 'GLUE(PHP)', value: 'GLUE_PHP' },
    ],
    RouteMode: [
      { label: '第一个', value: 'FIRST' },
      { label: '最后一个', value: 'LAST' },
      { label: '轮询', value: 'ROUND' },
      { label: '随机', value: 'RANDOM' },
      { label: '一致性HASH', value: 'CONSISTENT_HASH' },
      { label: '最不经常使用', value: 'LEAST_FREQUENTLY_USED' },
      { label: '最近最久未使用', value: 'LEAST_RECENTLY_USED' },
      { label: '故障转移', value: 'FAILOVER' },
      { label: '忙碌转移', value: 'BUSYOVER' },
      { label: '分片广播', value: 'SHARDING_BROADCAST' },
    ],

    SchedulingType: [
      {
        label: '无',
        value: 'NONE',
      },
      {
        label: 'CRON',
        value: 'CRON',
      },
      {
        label: '固定速率',
        value: 'FIX_RATE',
      },
    ],
    PolicyList: [
      { label: '单机串行', value: 'SERIAL_EXECUTION' },
      { label: '丢弃后续调度', value: 'DISCARD_LATER' },
      { label: '覆盖之前调度', value: 'COVER_EARLY' },
    ],
    misfireStrategy: [
      { label: '忽略', value: 'DO_NOTHING' },
      { label: '立即执行一次', value: 'FIRE_ONCE_NOW' },
    ],
  };
};

export default options;
