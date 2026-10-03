export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 不影响代码含义的改动（格式化、空格等）
        'refactor', // 重构（既不是新增功能也不是修复 bug）
        'perf', // 性能优化
        'test', // 测试相关
        'build', // 构建系统或外部依赖变更
        'ci', // CI 配置和脚本变更
        'chore', // 其他不修改 src 或测试文件的改动
        'revert', // 回滚提交
      ],
    ],
    'subject-case': [0],
    'header-max-length': [2, 'always', 100],
  },
}
