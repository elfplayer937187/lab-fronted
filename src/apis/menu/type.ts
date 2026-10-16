import type { BaseResponse } from '@/apis/common'

/** 权限类型：1-菜单，2-按钮 */
export type MenuType = 1 | 2
/** 状态：0-禁用，1-启用 */
export type MenuStatus = 0 | 1

/**
 * 权限（菜单）实体。
 *
 * 后端没给响应模型，字段是照着 `CreateMenuResponse` 推的（它就是 `CreateMenuRequest`
 * 加一个 id），实际以后端返回为准。
 */
export interface MenuInfo {
  id: number
  /** 权限标识，如 lab:create、user:list */
  code: string
  /** 权限名 */
  name: string
  /** 父级权限 id，顶级菜单为 null */
  pid?: number | null
  /** 描述。后端是必填（没有默认值），只能是空串不能省 */
  description: string
  type: MenuType
  status: MenuStatus
}

/** 菜单树节点：比平铺项多一层 children，叶子节点是空数组而不是 undefined */
export interface MenuTreeNode extends MenuInfo {
  children: MenuTreeNode[]
}

/**
 * 新增 / 编辑菜单共用的请求体，带 id 走更新，不带走新增。
 *
 * 后端更新走 `additionalProperties: false` 的全量覆盖（router 里是逐字段 setattr），
 * 所以编辑时要把 code、name、description、type、status 全都原样带回来；新增时不能带 id。
 */
export interface SaveMenu {
  id?: number
  code: string
  name: string
  pid?: number | null
  description: string
  type: MenuType
  status: MenuStatus
}

/** 平铺列表，后端只返回 status === 1 的节点，不分页、没有包装对象 */
export type MenuListResponse = BaseResponse<MenuInfo[]>
/** 菜单树，同样只含 status === 1 的节点 */
export type MenuTreeResponse = BaseResponse<MenuTreeNode[]>
/** 新增、更新都没有返回体，成功时 data 为 null */
export type MenuSaveResponse = BaseResponse<null>
export type DeleteMenuResponse = BaseResponse<null>
