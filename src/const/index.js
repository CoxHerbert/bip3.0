import mps from './modules/mps';
import cache from './modules/cache';
import targetType from './modules/targetType';
import roles from './modules/roles';
import plan from './modules/plan';
import templateFile from './modules/templateFile';
import STORAGE_KEY from './key';

export default {
  mps,
  cache,
  targetType,
  roles: roles.roles,
  plan,
  templateFile,
  key: STORAGE_KEY,
};

export { STORAGE_KEY };
