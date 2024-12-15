// lib/commands/init.js
const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const { spawnSync } = require('child_process');
const ora = require('ora');

async function initCommand(projectName) {
  // 1. 交互：选择项目类型
  const { projectType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: '请选择所要创建项目的类型',
      choices: [
        { name: '物料库', value: 'material' },
        { name: '主题库', value: 'theme' },
        { name: '中后台模板', value: 'admin' },
        { name: 'vue项目模板', value: 'vue' }
      ]
    }
  ]);

  // 2. 根据 projectType 分支收集额外信息
  let finalAnswers = {};
  if (projectType === 'material') {
    finalAnswers = await promptBlock();
  } else if (projectType === 'theme') {
    finalAnswers = await promptTheme();
  } else if (projectType === 'admin') {
    finalAnswers = await promptAdmin();
  } else if (projectType === 'vue') {
    finalAnswers = await promptVue();
  }

  // 3. 拷贝模板文件
  const targetDir = path.resolve(process.cwd(), projectName);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  console.log(chalk.cyan(`\n正在初始化项目于: ${targetDir}`));
  const spinner = ora('拷贝模板中...').start();
  try {
    await copyTemplateFiles(projectType, targetDir);
    await updatePackageJson(targetDir, finalAnswers);
    spinner.succeed('✔ 模板拷贝 & 适配完成');
  } catch (e) {
    spinner.fail('模板拷贝失败: ' + e.message);
    process.exit(1);
  }

  // 4. 安装依赖（可选）
  console.log(chalk.yellow(`\n正在安装项目依赖，这可能需要几分钟时间，请耐心等待...`));
  installDependencies(targetDir);
  console.log(chalk.green(`\n项目初始化完成，祝你开发顺利！`));
}

async function promptBlock() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'npmName',
      message: '请输入NPM包名：'
    },
    {
      type: 'input',
      name: 'title',
      message: '请输入物料标题：'
    },
    {
      type: 'input',
      name: 'description',
      message: '请描述你的物料：'
    },
    {
      type: 'input',
      name: 'version',
      message: '请输入NPM包版本号',
      default: '0.1.0'
    },
    {
      type: 'checkbox',
      name: 'keywords',
      message: '请选择物料的关键词（可多选）',
      choices: [
        { name: '数据展示', value: '数据展示' },
        { name: '信息展示', value: '信息展示' },
        { name: '表格', value: '表格' },
        { name: '表单', value: '表单' },
        { name: '筛选', value: '筛选' },
        { name: '弹出框', value: '弹出框' },
        { name: '编辑器', value: '编辑器' },
        { name: '[自定义输入]', value: 'custom' }
      ]
    }
  ]);

  // 如果用户勾选了“自定义输入”
  if (answers.keywords.includes('custom')) {
    const { customKeywords } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customKeywords',
        message: '输入新值(多个值用逗号分隔)：'
      }
    ]);
    const extra = customKeywords
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    // 去除 'custom'，并合并自定义关键字
    answers.keywords = answers.keywords
      .filter(k => k !== 'custom')
      .concat(extra);
  }

  return answers;
}

async function promptTheme() {
  // 主题库的交互逻辑 ...
  return {};
}

async function promptAdmin() {
  // 中后台模板的交互逻辑 ...
  return {};
}

async function promptVue() {
  // Vue项目模板的交互逻辑 ...
  return {};
}

// 拷贝本地模板 (也可以做远程下载)
async function copyTemplateFiles(projectType, dest) {
    // 假设 templates/material / templates/theme / ...
    const templateDir = path.join(__dirname, '..', 'templates', projectType);
    await fs.copy(templateDir, dest);
  }

// 适配模板内容（可替换package.json字段、写入meta信息等）
async function updatePackageJson(destPath, answers) {
  // 示例：在目标目录的 package.json 里写入 NPM 名、描述等
  const pkgJsonPath = path.join(destPath, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkgObj = JSON.parse(await fs.readFile(pkgJsonPath, 'utf-8'));
    if (answers.npmName) pkgObj.name = answers.npmName;
    if (answers.version) pkgObj.version = answers.version;
    if (answers.description) pkgObj.description = answers.description;
    // 物料库的 keywords
    if (answers.keywords) pkgObj.keywords = answers.keywords;

    await fs.writeFile(pkgJsonPath, JSON.stringify(pkgObj, null, 2));
  }
}

// 安装依赖
function installDependencies(destPath) {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['install'], {
    cwd: destPath,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    console.log(chalk.red(`依赖安装失败，请自行到项目目录执行 npm install。`));
  }
}

module.exports = initCommand;
