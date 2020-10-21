// 项目发布阶段需要用到的babel插件
const proPlugins = []
if (process.env.NODE_ENV === 'production') {
  proPlugins.push('transform-remove-console')
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布项目时的插件数组，使用展开运算符，将数组内容拆分出来
    ...proPlugins
  ]
}
