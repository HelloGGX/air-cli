// lib/core/index.js
const { Command } = require('commander');
const chalk = require('chalk');
const semver = require('semver');
const program = new Command();
const pkg = require('../../package.json');
const { checkRoot, checkUserHome } = require('../utils/envCheck');
const { loadPlugins } = require('./plugin-manager');

// 1. 全局前置检查
function preChecks() {
  // 检查 Node 版本
  if (!semver.satisfies(process.version, '>=14.0.0')) {
    console.log(chalk.red(`当前 Node 版本(${process.version})过低，需要 >= 14.0.0`));
    process.exit(1);
  }
  // 检查 root 启动
  checkRoot(); 
  // 检查用户主目录
  checkUserHome();
}

// 2. 初始化Commander / 注册命令
function initCommander() {
  program
    .name('mycli')
    .version(pkg.version, '-v, --version', '输出当前版本')
    .description('A high-performance front-end CLI');

  // 动态加载子命令或插件
  loadPlugins(program);

  // 也可手动注册命令
  program
    .command('init <projectName>')
    .description('初始化一个新项目')
    .action((projectName) => {
      require('../commands/init')(projectName);
    });

  program.parse(process.argv);
}

function runCore() {
  preChecks();
  initCommander();
}

runCore();
