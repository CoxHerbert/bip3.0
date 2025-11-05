import * as XLSX from 'xlsx';

/**
 * 读取Excel文件并解析数据
 * @param {File} file Excel文件对象
 * @returns {Promise<Object>} 解析后的Excel数据，包含多个工作表
 */
export const parseExcelFile = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        // 读取文件内容
        const data = e.target.result;

        // 使用XLSX解析数据
        const workbook = XLSX.read(data, { type: 'array' });

        // 存储所有工作表数据
        const result = {};

        // 遍历所有工作表
        workbook.SheetNames.forEach(sheetName => {
          // 获取工作表
          const worksheet = workbook.Sheets[sheetName];

          // 将工作表转换为JSON数据
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // 如果数据为空，跳过
          if (jsonData.length === 0) return;

          // 获取表头（第一行）
          const headers = jsonData[0];

          // 处理数据行
          const rows = [];
          for (let i = 1; i < jsonData.length; i++) {
            const rowData = {};
            for (let j = 0; j < headers.length; j++) {
              // 使用表头作为键，数据作为值
              rowData[headers[j]] = jsonData[i][j] || '';
            }
            rows.push(rowData);
          }

          // 将处理后的数据存入结果对象
          result[sheetName] = rows;
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = error => {
      reject(error);
    };

    // 以ArrayBuffer方式读取文件
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 获取Excel文件中的工作表名称列表
 * @param {File} file Excel文件对象
 * @returns {Promise<Array<string>>} 工作表名称列表
 */
export const getSheetNames = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        // 读取文件内容
        const data = e.target.result;

        // 使用XLSX解析数据
        const workbook = XLSX.read(data, { type: 'array' });

        // 返回工作表名称列表
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = error => {
      reject(error);
    };

    // 以ArrayBuffer方式读取文件
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 获取指定工作表的数据
 * @param {File} file Excel文件对象
 * @param {string} sheetName 工作表名称
 * @returns {Promise<Array<Object>>} 工作表数据
 */
export const getSheetData = (file, sheetName) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = e => {
      try {
        // 读取文件内容
        const data = e.target.result;

        // 使用XLSX解析数据
        const workbook = XLSX.read(data, { type: 'array' });

        // 检查工作表是否存在
        if (!workbook.SheetNames.includes(sheetName)) {
          reject(new Error(`工作表 "${sheetName}" 不存在`));
          return;
        }

        // 获取工作表
        const worksheet = workbook.Sheets[sheetName];

        // 将工作表转换为JSON数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 如果数据为空
        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        // 获取表头（第一行）
        const headers = jsonData[0];

        // 处理数据行
        const rows = [];
        for (let i = 1; i < jsonData.length; i++) {
          const rowData = {};
          for (let j = 0; j < headers.length; j++) {
            // 使用表头作为键，数据作为值
            rowData[headers[j]] = jsonData[i][j] || '';
          }
          rows.push(rowData);
        }

        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = error => {
      reject(error);
    };

    // 以ArrayBuffer方式读取文件
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 将Excel列与系统字段进行映射
 * @param {Array} sheetData Excel工作表数据
 * @param {Array} systemTargetFields 系统目标字段配置
 * @returns {Object} 包含映射关系和表格列信息的对象
 */
export const mapExcelColumnsToSystemFields = (sheetData, systemTargetFields) => {
  if (!sheetData || sheetData.length === 0) {
    return {
      tableColumns: [],
      fieldMappings: {},
      tableData: [],
    };
  }

  // 保存原始数据
  const tableData = sheetData;

  // 提取Excel列信息
  const firstItem = sheetData[0];
  const tableColumns = Object.keys(firstItem).map(key => ({
    prop: key,
    label: key,
  }));

  // 直接建立映射关系（Excel列名与系统字段label精确匹配）
  const fieldMappings = {};
  tableColumns.forEach(column => {
    const matchedField = systemTargetFields.find(field => field.label === column.label);
    if (matchedField) {
      fieldMappings[column.prop] = matchedField.value;
    }
  });

  return {
    tableColumns,
    fieldMappings,
    tableData,
  };
};

/**
 * 根据映射关系生成映射后的数据
 * @param {Array} tableData Excel表格数据
 * @param {Object} fieldMappings 字段映射关系
 * @param {Array} systemTargetFields 系统目标字段配置
 * @returns {Array} 映射后的数据
 */
export const generateMappedData = (tableData, fieldMappings, systemTargetFields) => {
  if (!tableData || tableData.length === 0) {
    return [];
  }

  const validMappings = Object.entries(fieldMappings);

  // 生成基础映射数据
  const baseMappedData = tableData.map(row => {
    const mappedRow = {};
    // 初始化所有系统字段（未映射的为null）
    systemTargetFields.forEach(field => {
      mappedRow[field.value] = null;
    });
    // 应用映射关系并进行数据转换
    validMappings.forEach(([excelCol, sysField]) => {
      let value = row[excelCol];
      // 针对特定字段进行数据转换
      mappedRow[sysField] = value;
    });
    return mappedRow;
  });

  return baseMappedData;
};
