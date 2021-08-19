//https://eslint.org/docs/developer-guide/nodejs-api  
//https://eslint.vuejs.org/user-guide/#installation  

import { join } from 'path'
import { ESLint } from 'eslint'

export default async function ({ debug, opt: { eslintOpt = {}, abort = 0 } }) {
  const eslint = new ESLint(eslintOpt)

  this.on('afterSlim', async function (files) {

    debug('on event afterSlim')

    let hasError = false
    let hasWarn = false
    let hasFixableError = false
    let hasFixableWarn = false

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

      let report = await eslint.lintText(file.content, { filePath: join(this.config.src, file.key) })
     /**
      * writes code modified by ESLint's autofix feature into its respective file.
      * If any of the modified files don't exist, this method does nothing
      */
      await ESLint.outputFixes(report);

      report = report[0]

      if (report.errorCount + report.fatalErrorCount + report.warningCount > 0) {
        
        if (report.errorCount + report.fatalErrorCount > 0) {
          hasError = true
        }
        if (report.warningCount > 0) {
          hasWarn = true
        }
        if (report.fixableErrorCount) {
          hasFixableError = true
        }
        if (report.fixableWarningCount) {
          hasFixableWarn = true
        }

        const formatter = await eslint.loadFormatter("stylish");
        const resultText = formatter.format([report]);
        console.log(resultText)
      
      }

    }
    if (hasFixableError) {
      console.log(`
    some errors can be automatically repaired,edit config file ${this.isDev() ? 'dev.js' : 'pro.js'}
    plugin: [
      {
        ...
        name: 'eslint',
        opt: {
          eslintOpt: { fix: true }
        }
      }
    ]
     `)
    }
    if (abort === 1 && hasError) {
      this.config.logger.error('fix please!', true)
    }
    if (abort === 2 && (hasError || hasWarn)) {
      this.config.logger.error('fix please! ', true)
    }
  })
}