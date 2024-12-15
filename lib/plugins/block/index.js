module.exports = function(program) {
    program
      .command('block:add <componentName>')
      .description('添加一个物料组件')
      .action((componentName) => {
        console.log(`添加物料组件: ${componentName}`);
        // ... 实际逻辑
      });
  };
  