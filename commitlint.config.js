// commitlint.config.js
module.exports = {
  // 使用 conventional 规则体系
  extends: ['@commitlint/config-conventional'],

  // 自定义提交类型（你可以用中文团队规范）
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 bug
        'docs', // 文档
        'style', // 代码格式
        'refactor', // 重构
        'test', // 测试
        'chore', // 构建/杂项
        'perf', // 性能
        'ci', // CI
        'revert', // 回滚
        'wip', // 开发中
      ],
    ],

    // type 必须存在
    'type-empty': [2, 'never'],

    // subject 必须存在
    'subject-empty': [2, 'never'],

    // subject 不能以大写开头（避免 "Add" 这种）
    'subject-case': [0],

    // header 最大长度
    'header-max-length': [2, 'always', 72],
  },
};
