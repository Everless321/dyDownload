# dyDownload

抖音视频/图集下载器 - Node.js/TypeScript 实现

基于 [Johnserf-Seed/f2](https://github.com/Johnserf-Seed/f2) Python 项目重写的 Node.js 版本。

## 功能特性

- 单个作品下载（视频/图集）
- 用户主页作品批量下载
- 支持下载封面、音乐、文案
- 直播流下载（FLV/M3U8）
- 并发下载控制
- 自定义文件命名模板
- CLI 命令行工具
- 完整的 TypeScript 类型支持

## 安装

```bash
# 克隆项目
git clone https://github.com/Everless321/dyDownload.git
cd dyDownload

# 安装依赖
npm install

# 编译
npm run build
```

## CLI 使用

```bash
# 下载单个作品
npx dy download "https://v.douyin.com/xxx" -c "your_cookie" -o ./downloads

# 下载用户主页作品
npx dy user "https://www.douyin.com/user/xxx" -c "your_cookie" -n 10

# 查看帮助
npx dy --help
npx dy download --help
npx dy user --help
```

### 命令选项

| 选项 | 说明 |
|------|------|
| `-o, --output <path>` | 下载目录 (默认: ./downloads) |
| `-c, --cookie <cookie>` | Cookie (必需) |
| `-n, --number <count>` | 下载数量，0表示全部 (仅 user 命令) |
| `--cover` | 下载封面 |
| `--music` | 下载音乐 |
| `--desc` | 下载文案 |

## 程序化调用

### 下载单个作品

```typescript
import { getAwemeId, DouyinHandler, DouyinDownloader } from 'dy-downloader'

const cookie = 'your_cookie'
const videoUrl = 'https://v.douyin.com/xxx'

// 解析作品 ID
const awemeId = await getAwemeId(videoUrl)

// 获取作品详情
const handler = new DouyinHandler({ cookie })
const postDetail = await handler.fetchOneVideo(awemeId)

// 下载
const downloader = new DouyinDownloader({
  cookie,
  downloadPath: './downloads',
  naming: '{nickname}_{aweme_id}',
  cover: true,
  music: true,
  desc: true,
})

await downloader.createDownloadTasks(postDetail.toAwemeData(), './downloads')
```

### 批量下载用户作品

```typescript
import { getSecUserId, DouyinHandler, DouyinDownloader } from 'dy-downloader'

const cookie = 'your_cookie'
const userUrl = 'https://www.douyin.com/user/xxx'

// 解析用户 ID
const secUserId = await getSecUserId(userUrl)

const handler = new DouyinHandler({ cookie })
const downloader = new DouyinDownloader({
  cookie,
  downloadPath: './downloads',
  naming: '{nickname}_{aweme_id}',
})

// 遍历用户作品
for await (const postFilter of handler.fetchUserPostVideos(secUserId, { maxCounts: 10 })) {
  const awemeList = postFilter.toAwemeDataList()

  for (const awemeData of awemeList) {
    await downloader.createDownloadTasks(awemeData, './downloads')
  }
}
```

### 获取用户资料

```typescript
import { getSecUserId, DouyinHandler } from 'dy-downloader'

const handler = new DouyinHandler({ cookie: 'your_cookie' })
const secUserId = await getSecUserId('https://www.douyin.com/user/xxx')
const profile = await handler.fetchUserProfile(secUserId)

console.log(profile.nickname)
console.log(profile.followerCount)
console.log(profile.totalFavorited)
```

## 项目结构

```
src/
├── algorithm/          # 签名算法 (X-Bogus, A-Bogus)
├── api/                # API 端点定义
├── cli/                # CLI 命令行工具
├── client/             # HTTP 客户端
├── config/             # 配置管理
├── crawler/            # API 请求封装
├── downloader/         # 下载器
├── errors/             # 错误处理
├── filter/             # 数据过滤器 (JSONPath)
├── handler/            # 业务逻辑处理
├── model/              # 数据模型
└── utils/              # 工具函数

examples/
├── test-download.ts        # 单作品下载测试
├── test-user-download.ts   # 用户作品下载测试
└── test-user-profile.ts    # 用户信息获取测试
```

## 开发

```bash
# 开发模式
npm run dev

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 运行测试
npm run test
```

## API 参考

### DouyinHandler

| 方法 | 说明 |
|------|------|
| `fetchUserProfile(secUserId)` | 获取用户资料 |
| `fetchOneVideo(awemeId)` | 获取单个作品详情 |
| `fetchUserPostVideos(secUserId, options)` | 获取用户作品列表 (生成器) |
| `fetchUserLikeVideos(secUserId, options)` | 获取用户喜欢列表 (生成器) |
| `fetchUserCollectionVideos(secUserId, options)` | 获取用户收藏 (生成器) |
| `fetchPostComment(awemeId, options)` | 获取作品评论 (生成器) |
| `fetchUserFollowing(secUserId, options)` | 获取关注列表 (生成器) |
| `fetchUserFollower(secUserId, options)` | 获取粉丝列表 (生成器) |

### DouyinDownloader

| 方法 | 说明 |
|------|------|
| `createDownloadTasks(awemeData, path)` | 创建作品下载任务 |
| `createMusicDownloadTasks(musicData, path)` | 创建音乐下载任务 |
| `createStreamTasks(webcastData, path)` | 创建直播流下载任务 |

### 工具函数

| 函数 | 说明 |
|------|------|
| `getAwemeId(url)` | 从链接解析作品 ID |
| `getSecUserId(url)` | 从链接解析用户 ID |
| `getMixId(url)` | 从链接解析合集 ID |
| `getWebcastId(url)` | 从链接解析直播间 ID |

## 获取 Cookie

1. 打开浏览器访问 [抖音网页版](https://www.douyin.com/)
2. 登录账号
3. 打开开发者工具 (F12)
4. 切换到 Network 标签
5. 刷新页面，找到任意请求
6. 复制请求头中的 Cookie 值

## 注意事项

- 请遵守抖音的使用条款
- 本项目仅供学习交流使用
- 请勿用于商业用途
- Cookie 请妥善保管，不要泄露

## License

MIT
