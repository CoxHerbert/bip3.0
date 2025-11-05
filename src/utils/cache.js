import { ref, toRefs } from 'vue';
import Api from '@/api/index';
import Constant from '@/const/index';
import store from '@/store/index';

/**
 * @param cacheEnum 缓存枚举如需新增MAP或者LIST需前往Constant添加
 * **/
const cacheEnum = Constant.cache;

// 全局缓存
export const useCache = cacheArr => {
  const res = ref({});
  return (() => {
    cacheArr.forEach(async item => {
      res.value[item.key] = [];
      const dict = await store.dispatch('getDict', item.key);
      if (dict) {
        res.value[item.key] = dict;
      } else {
        const cacheObj = cacheEnum[item.key];
        switch (cacheObj?.type) {
          case 'map':
            await getMap(res, { ...cacheObj, key: item.key }, item.keyName);
            break;
          case 'list':
            await getList(res, { ...cacheObj, key: item.key });
            break;
          default:
            await getDict2(res, item.key);
            break;
        }
      }
    });
    return toRefs(res.value);
  })();
};

/** 从store缓存列表中拿到对应的数据 */
function getDictFromStoreDictList(_key, dictList = []) {
  const find = dictList.find(item => item.key === _key);
  return find?.value;
}

/** 同步获取缓存或者枚举（改造：字典类型优先使用/写入 Vuex） */
export const useAsyncCache = cacheArr => {
  return new Promise((resolve, reject) => {
    const res = ref({});

    const promises = cacheArr.reduce((rec, item) => {
      const key = item.key;
      res.value[key] = [];

      const cacheObj = cacheEnum[key];
      const isDictType = !cacheObj?.type || cacheObj.type === 'dict';

      if (isDictType) {
        // 1) 先尝试从 Vuex 的 dict 缓存取
        const cached = getDictFromStoreDictList(key, store.state.dict.dict);
        if (cached && Array.isArray(cached) && cached.length) {
          res.value[key] = cached;
          return rec; // 已命中缓存，跳过请求
        }

        // 2) 再尝试通过 store.dispatch('getDict', key) 拿（你的 store 中很可能会顺便写入 Vuex）
        rec.push(
          (async () => {
            try {
              const dictFromAction = await store.dispatch('getDict', key);
              if (dictFromAction && Array.isArray(dictFromAction) && dictFromAction.length) {
                // 命中：赋值并确保 Vuex 中有
                res.value[key] = dictFromAction;
                // 若你的 setDict 在 action 内已经做了就不需要，但加上也无害
                store.dispatch('setDict', { _key: key, value: dictFromAction });
              } else {
                // 3) 仍未拿到，则回落到本地请求（与 useCache 的默认一致：getDict2）
                await getDict2(res, key); // getDict2 内部已 setDict
              }
            } catch {
              // 失败也回落
              await getDict2(res, key);
            }
          })()
        );
      } else if (cacheObj?.type === 'map') {
        // map 类型保持原逻辑
        rec.push(getMap(res, { ...cacheObj, key }, item.keyName));
      } else if (cacheObj?.type === 'list') {
        // list 类型保持原逻辑
        rec.push(getList(res, { ...cacheObj, key }));
      } else {
        // 兜底：按字典处理（与 useCache 的默认一致：getDict2）
        rec.push(getDict2(res, key));
      }

      return rec;
    }, []);

    if (promises.length > 0) {
      Promise.all(promises)
        .then(() => resolve(res))
        .catch(error => reject(error));
    } else {
      resolve(res);
    }
  });
};

/** 获取多个字典 */
export const getMultipleDict = async codes => {
  const res = await Api.system.dict.getMultipleDict(codes);
  if (res.data.code === 200) {
    return res.data.data;
  }
  return {};
};

// 获取LIST
const getList = async (res, cacheObj) => {
  const resp = await Api.common.getCommonListCache(cacheObj.url);
  res.value[cacheObj.key] = resp.data.data.map(item => {
    return {
      code: cacheObj.key,
      id: item[cacheObj.keys.id],
      label: item[cacheObj.keys.label],
      value: item[cacheObj.keys.id],
      orgCode: item.orgCode,
    };
  });
};

// 获取MAP
const getMap = async (res, cacheObj, keyName) => {
  const resp = await Api.common.getCommonMapCache(cacheObj.url, keyName);
  res.value[cacheObj.key] = resp.data.data;
};

// 获取maps
export const getKeyObject = (maps, key, valueKey) => {
  try {
    if (valueKey) return maps[key][valueKey] || key;
    return maps[key] || key;
  } catch (error) {
    return '';
  }
};

// 获取数组中的某一项
export const findItem = ({ list, id, key }) => {
  if (!Array.isArray(list)) return;
  const item = list.find(item => item.id === id);
  if (item) {
    return item[key] || id;
  } else {
    return item || id;
  }
};

function arrayToTree(data) {
  const map = new Map();
  const tree = [];

  // 先将所有数据存入 Map，键为 id，值为对象本身
  data.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  data.forEach(item => {
    const node = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      // 如果有 parentId，则加入对应的父节点的 children
      map.get(item.parentId).children.push({
        ...node,
        code: node.code,
        id: node.id,
        label: node.dictValue,
        value: node.dictKey,
      });
    } else {
      // 没有 parentId，则是根节点

      tree.push({
        ...node,
        code: node.code,
        id: node.id,
        label: node.dictValue,
        value: node.dictKey,
      });
    }
  });

  return tree;
}

// 获取字典
const getDict2 = async (res, code) => {
  const resp = await Api.system.dict.getDicts(code);
  res.value[code] = arrayToTree2(resp.data.data);
  cleanEmptyChildren(res.value[code]);
  store.dispatch('setDict', { _key: code, value: res.value[code] });
};

function arrayToTree2(data) {
  const map = new Map();
  const tree = [];

  // 先将所有数据存入 Map，键为 id，值为对象本身
  data.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  data.forEach(item => {
    const node = map.get(item.id);
    if (item.parentId && map.has(item.parentId)) {
      // 如果有 parentId，则加入对应的父节点的 children
      map.get(item.parentId).children.push({
        ...node,
        code: node.code,
        id: node.id,
        label: node.dictValue,
        value: node.id,
      });
    } else {
      // 没有 parentId，则是根节点

      tree.push({
        ...node,
        code: node.code,
        id: node.id,
        label: node.dictValue,
        value: node.id,
      });
    }
  });

  return tree;
}

// 递归删除空的 children
function cleanEmptyChildren(nodes) {
  nodes.forEach(node => {
    if (node.children.length === 0) {
      delete node.children;
    } else {
      cleanEmptyChildren(node.children);
    }
  });
}
