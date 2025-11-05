/**
 * 合并主数据和子数据
 * @param {Array} mainData - 主数据数组
 * @param {String} subDataKey - 子数据在主数据中的属性名
 * @param {Array} mainDataFields - 主数据字段名数组
 * @param {String} mainIdField - 主数据ID字段名
 * @param {String} detailIdField - 子数据ID字段名
 * @returns {Array} 合并后的数据数组
 */
export function mergeMainAndSubData(
  mainData,
  subDataKey,
  mainDataFields,
  mainIdField = 'id',
  detailIdField = 'id'
) {
  const mergedData = [];

  mainData.forEach(mainItem => {
    // 如果有子数据，则合并
    if (mainItem[subDataKey] && mainItem[subDataKey].length > 0) {
      mainItem[subDataKey].forEach((detailItem, index) => {
        // 创建一个新对象
        let mergedItem;

        // 第一行显示主数据和子数据，包括主表的交货日期
        if (index === 0) {
          mergedItem = {
            ...mainItem,
            ...detailItem,
            deliveryDate1: detailItem.deliveryDate || '',
            // 保留原始ID，用于区分主数据和子数据
            mainId: mainItem[mainIdField],
            detailId: detailItem[detailIdField],
            isFirstRow: true, // 标记为第一行
          };
        } else {
          // 后面的行只显示子数据，主数据字段为空，但deliveryDate使用子表的值
          mergedItem = {
            // 只保留子数据字段
            ...detailItem,
            // 主数据字段设为空，但deliveryDate使用子表的值
            ...Object.fromEntries(mainDataFields.map(field => [field, ''])),
            // 确保子表的deliveryDate字段显示
            // deliveryDate: detailItem.deliveryDate || '',
            deliveryDate1: detailItem.deliveryDate || '',
            // 保留原始ID，用于区分主数据和子数据
            mainId: mainItem[mainIdField],
            detailId: detailItem[detailIdField],
            isFirstRow: false, // 标记为非第一行
          };
        }

        mergedData.push(mergedItem);
      });
    } else {
      // 如果没有子数据，直接添加主数据
      mergedData.push({
        ...mainItem,
        mainId: mainItem[mainIdField],
        detailId: null,
        isFirstRow: true, // 标记为第一行
      });
    }
  });

  return mergedData;
}
