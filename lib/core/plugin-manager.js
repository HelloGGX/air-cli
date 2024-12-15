// lib/core/plugin-manager.js
const fs = require('fs');
const path = require('path');

function loadPlugins(program) {
  const pluginsDir = path.join(__dirname, '../plugins');
  if (!fs.existsSync(pluginsDir)) return;

  const pluginFolders = fs.readdirSync(pluginsDir);

  pluginFolders.forEach(pluginName => {
    const pluginPath = path.join(pluginsDir, pluginName);
    // 只处理文件夹或js文件
    if (fs.statSync(pluginPath).isDirectory()) {
      const pluginEntry = path.join(pluginPath, 'index.js');
      if (fs.existsSync(pluginEntry)) {
        const pluginFn = require(pluginEntry);
        pluginFn(program); // 插件函数接收 program, 实现命令注册
      }
    }
  });
}

module.exports = { loadPlugins };
