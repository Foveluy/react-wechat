const chalk = require('chalk')

module.exports = {
  warn(msg) {
    console.log(chalk.default.yellowBright(`[warn]:${msg}`))
  },
  error(msg) {
    console.log(chalk.default.redBright(`[error]:${msg}`))
  },
  greate(msg) {
    console.log(chalk.default.greenBright(`[info]:${msg}`))
  }
}
