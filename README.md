# 元器件库存管理 APP

帮助电子工程师、创客、实验室管理员高效记录和统计元器件库存数量、消耗情况，并提供直观的数据看板。

## 功能模块

| 模块 | 说明 |
|------|------|
| **仪表盘** | 库存概览卡片（种类/总量/总价值/低库存预警）、快速入库/出库、最近动态 |
| **库存管理** | 元器件增删改查、分类筛选、搜索排序、低库存红色预警 |
| **流水记录** | 入库/出库/调整记录，按月份分组，支持类型筛选 |
| **统计看板** | 饼图（分类占比）、柱状图（价值分布）、折线图（采购/消耗趋势）、Top 10 |
| **个人设置** | 分类/存放位置/供应商管理、CSV 数据导出、JSON 导入导出 |
| **全局搜索** | 实时搜索元器件名称/型号/封装，搜索历史记录 |

## 技术栈

- **React 19** + **TypeScript**
- **Vite 5** 构建工具
- **React Router v7** 路由
- **Recharts** 图表库
- **lucide-react** 图标库
- **Electron** 桌面打包
- **localStorage** 数据持久化

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（浏览器访问 http://localhost:5173）
npm run dev

# 构建生产版本
npm run build

# 预览构建产物
npm run preview
```

## Electron 桌面应用

```bash
# 开发模式（同时启动 Vite + Electron）
npm run electron:dev

# 打包为免安装目录（生成 release/win-unpacked/ 下的 .exe）
npm run electron:build:dir

# 打包为 NSIS 安装程序
npm run electron:build:win
```

## 项目结构

```
src/
├── types/index.ts          # TypeScript 类型定义
├── store/AppContext.tsx     # 全局状态管理（Context + Reducer）
├── data/mockData.ts        # 初始演示数据
├── utils/
│   ├── helpers.ts          # 工具函数
│   └── csv.ts              # CSV 导出功能
├── components/             # 通用组件
│   ├── Layout.tsx          # 主布局（侧边导航 + 内容区）
│   ├── NavBar.tsx          # 顶部导航栏
│   ├── SearchBar.tsx       # 搜索输入框
│   ├── Modal.tsx           # 模态框
│   ├── ConfirmDialog.tsx   # 确认对话框
│   ├── SelectModal.tsx     # 选择器弹出面板
│   └── EmptyState.tsx      # 空状态占位
├── pages/                  # 页面组件
│   ├── Dashboard.tsx       # 仪表盘
│   ├── InventoryList.tsx   # 库存列表
│   ├── ComponentForm.tsx   # 新增/编辑元器件
│   ├── ComponentDetail.tsx # 元器件详情
│   ├── TransactionForm.tsx # 入库/出库表单
│   ├── TransactionList.tsx # 流水记录
│   ├── Statistics.tsx      # 统计看板
│   ├── Settings.tsx        # 个人设置
│   └── Search.tsx          # 全局搜索
└── App.tsx                 # 应用入口（路由配置）
```
