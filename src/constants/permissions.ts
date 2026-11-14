/**
 * 权限 code 常量。
 *
 * 后端 permission 表按 code 校验/返回权限，路由 meta 和 v-permission 都引用这里，
 * 不要在模板里散落字符串字面量。改名前先确认后端 permission 表里有同名记录，
 * 否则菜单和按钮都不会出现。
 */
export const PERM = {
  // 路由（type=1）
  userList: 'user:list',
  roleList: 'role:list',
  menuList: 'menu:list',
  labList: 'lab:list',
  labdeviceList: 'labdevice:list',
  labbookList: 'labbook:list',
  aiChat: 'ai:chat',

  // 用户管理按钮（type=2）
  userCreate: 'user:create',
  userUpdate: 'user:update',
  userStatus: 'user:status',
  userDelete: 'user:delete',
  userAssignRole: 'user:assign-role',

  // 角色管理按钮
  roleCreate: 'role:create',
  roleUpdate: 'role:update',
  roleStatus: 'role:status',
  roleDelete: 'role:delete',
  roleAssignPermission: 'role:assign-permission',

  // 菜单管理按钮
  menuCreate: 'menu:create',
  menuUpdate: 'menu:update',
  menuDelete: 'menu:delete',

  // 实验室管理按钮
  labCreate: 'lab:create',
  labUpdate: 'lab:update',
  labDelete: 'lab:delete',
  labImage: 'lab:image',
  labDetail: 'lab:detail',

  // 预约管理按钮
  labbookAccept: 'labbook:accept',
} as const

export type PermissionCode = (typeof PERM)[keyof typeof PERM]
