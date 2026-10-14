import request from '@/utils/request'
import type {
  DeleteMenuResponse,
  MenuListResponse,
  MenuSaveResponse,
  MenuTreeResponse,
  SaveMenu,
} from './type'

enum API {
  CREATE_URL = '/menu/create',
  LIST_URL = '/menu/list',
  TREE_URL = '/menu/tree',
  UPDATE_URL = '/menu/update',
  // menuId 走的是路径参数。另外后端这个接口现在是坏的：查菜单用的是 scalars，
  // 拿到的永远是 Result 对象、判不出 None，所以 db.delete 传入的不是映射对象，
  // 任何 id 都会炸（前端收到 500）。接之前先让后端把 scalars 改成 scalar。
  DELETE_URL = '/menu/delete',
}

/**
 * 新增 / 编辑共用一个入口：带了 id 调 PUT /menu/update，没带调 POST /menu/create。
 *
 * id 为 undefined 时 JSON.stringify 会直接丢掉这个键，所以新增那条路不会多送
 * 一个 id 出去。
 */
export const reqSaveMenu = (data: SaveMenu) =>
  data.id
    ? request.put<MenuSaveResponse, MenuSaveResponse>(API.UPDATE_URL, data)
    : request.post<MenuSaveResponse, MenuSaveResponse>(API.CREATE_URL, data)

/** 平铺菜单列表（只含启用项）。要带层级关系用 reqGetMenuTree */
export const reqGetMenuList = () => request.get<MenuListResponse, MenuListResponse>(API.LIST_URL)

/**
 * 菜单树（只含启用项）。
 *
 * 父节点被禁用时子节点会被提成根节点，所以树里的顶层项不一定都是 pid 为 null 的。
 */
export const reqGetMenuTree = () => request.get<MenuTreeResponse, MenuTreeResponse>(API.TREE_URL)

/** 删除菜单。有子菜单时后端回 MENU_NOT_EMPTY(242)，得先删子节点 */
export const reqDeleteMenu = (menuId: number) =>
  request.delete<DeleteMenuResponse, DeleteMenuResponse>(`${API.DELETE_URL}/${menuId}`)
