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
      debug(file.key)
      if (!this.fs.existsSync(file.path)) {
        debug(`omit ${file.key}`)
      }

      let report = cli.executeOnText(file.content, file.key)
      if (report.results.length === 0) {
        continue
      }
      debug(`check ${file.key}`)
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