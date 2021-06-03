//https://eslint.org/docs/developer-guide/nodejs-api  eslint 文档
//https://eslint.vuejs.org/user-guide/#installation   eslint-plugin-vue 文档

// Example .eslintrc.js:
/* module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:vue/vue3-recommended',
    // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
  ],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  }
} */
import eslint from 'eslint'
let CLIEngine = eslint.CLIEngine
export default async function ({ debug, opt }) {
  const cli = new CLIEngine();
  this.on('afterSlim', async function (files) {
    debug('on event afterSlim')
    let hasError = false
    let formatter = cli.getFormatter();
    for (let file of files) {
      if (!/\.(js|vue)$/.test(file.key)) {
        continue
      }
      if (/\.min\.js$/.test(file.key)) {
        continue
      }
      if (/^(node|other|runtime)\//.test(file.key)) {
        debug(`omit ${file.key}`)
        continue
      }

      debug(`check ${file.key}`)

      let report = cli.executeOnText(file.content, file.key)
      if (report.results.length === 0) {
        continue
      }

      if (report.results[0].messages.length !== 0) {
        hasError = true
        // eslint-disable-next-line
        console.log(formatter(report.results));
        CLIEngine.outputFixes(report);
      }

      if (report.results[0].output && file.content !== report.results[0].output) {
        this.config.logger.log(`autofix ${file.key}`)
      }
    }
    //无论是错误还是警告如果不能自动修复都停止运行，如果编辑器有自动保存功能，请先关闭编辑器
    if (hasError) {
      if (opt.errorBreak) {
        this.config.logger.error('请先修复问题', true)
      }
    }
  })
}