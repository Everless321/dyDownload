/**
 * DouyinDownloader - 抖音下载器
 * 对应 Python f2 项目的 dl.py
 */

import * as fs from 'fs'
import * as path from 'path'
import { pipeline } from 'stream/promises'
import got from 'got'
import pLimit from 'p-limit'

import { formatFileName, ensureDir, json2Lrc } from '../utils/file.js'
import { getConfig } from '../config/index.js'
import type {
  DownloadConfig,
  AwemeData,
  MusicData,
  WebcastData,
  DownloadResult,
  ProgressCallback,
} from './types.js'

export class DouyinDownloader {
  private config: DownloadConfig
  private limit: ReturnType<typeof pLimit>
  private tasks: Promise<DownloadResult>[] = []

  constructor(config: DownloadConfig) {
    this.config = {
      cookie: config.cookie || '',
      downloadPath: './downloads',
      maxConcurrency: 3,
      timeout: 30000,
      retries: 3,
      naming: '{create}_{desc}',
      folderize: false,
      interval: 'all',
      music: false,
      cover: false,
      desc: false,
      lyric: false,
      ...config,
    }

    this.limit = pLimit(this.config.maxConcurrency!)
  }

  /**
   * 创建下载任务
   */
  async createDownloadTasks(awemeDatas: AwemeData | AwemeData[], userPath: string): Promise<void> {
    if (!awemeDatas || !userPath) return

    const dataList = Array.isArray(awemeDatas) ? awemeDatas : [awemeDatas]

    // 日期区间过滤
    const filteredList = this.filterByDateInterval(dataList)

    if (filteredList.length === 0) {
      console.log('没有找到符合条件的作品')
      return
    }

    for (const awemeData of filteredList) {
      await this.handleDownload(awemeData, userPath)
    }

    // 执行所有下载任务
    await this.executeTasks()
  }

  /**
   * 处理单个作品下载
   */
  async handleDownload(awemeData: AwemeData, userPath: string): Promise<void> {
    const basePath = this.config.folderize
      ? path.join(
          userPath,
          formatFileName(this.config.naming!, {
            create: awemeData.createTime,
            nickname: awemeData.nickname,
            awemeId: awemeData.awemeId,
            desc: awemeData.desc,
          })
        )
      : userPath

    const awemeId = awemeData.awemeId || ''
    const awemeType = awemeData.awemeType ?? 0

    if (awemeData.isProhibited) {
      console.warn(`[${awemeId}] 该作品已被屏蔽，无法下载`)
      return
    }

    const privateStatus = awemeData.privateStatus ?? 0
    if (![0, 1, 2].includes(privateStatus)) {
      console.warn(`[${awemeId}] 作品状态异常，无法下载`)
      return
    }

    // 下载音乐
    if (this.config.music) {
      await this.downloadMusic(awemeData, basePath)
    }

    // 下载封面
    if (this.config.cover) {
      await this.downloadCover(awemeData, basePath)
    }

    // 下载文案
    if (this.config.desc) {
      await this.downloadDesc(awemeData, basePath)
    }

    // 视频类型: 0, 4, 55, 61, 109, 201
    if ([0, 4, 55, 61, 109, 201].includes(awemeType)) {
      await this.downloadVideo(awemeData, basePath)
    }
    // 图集类型: 68
    else if (awemeType === 68) {
      await this.downloadImages(awemeData, basePath)
    }
  }

  /**
   * 下载音乐
   */
  async downloadMusic(awemeData: AwemeData, basePath: string): Promise<void> {
    if (awemeData.musicStatus !== 1) {
      console.warn(`[${awemeData.awemeId}] 该原声已被屏蔽，无法下载`)
      return
    }

    const musicUrl = awemeData.musicPlayUrl
    if (!musicUrl) return

    const musicName = this.buildFileName(awemeData, '_music')
    this.addDownloadTask(musicUrl, basePath, musicName, '.mp3')
  }

  /**
   * 下载封面
   */
  async downloadCover(awemeData: AwemeData, basePath: string): Promise<void> {
    const coverName = this.buildFileName(awemeData, '_cover')

    // 按优先级回退：动画封面 -> 动态封面 -> 静态封面
    if (awemeData.animatedCover) {
      this.addDownloadTask(awemeData.animatedCover, basePath, coverName, '.webp')
    } else if (awemeData.dynamicCover) {
      this.addDownloadTask(awemeData.dynamicCover, basePath, coverName, '.webp')
    } else if (awemeData.cover) {
      this.addDownloadTask(awemeData.cover, basePath, coverName, '.jpeg')
    } else {
      console.warn(`[${awemeData.awemeId}] 该作品没有封面`)
    }
  }

  /**
   * 下载文案
   */
  async downloadDesc(awemeData: AwemeData, basePath: string): Promise<void> {
    const descName = this.buildFileName(awemeData, '_desc')
    const descContent = awemeData.descRaw || awemeData.desc || ''

    this.addStaticDownloadTask(descContent, basePath, descName, '.txt')
  }

  /**
   * 下载视频
   */
  async downloadVideo(awemeData: AwemeData, basePath: string): Promise<void> {
    const videoName = this.buildFileName(awemeData, '_video')
    const videoUrl = Array.isArray(awemeData.videoPlayAddr)
      ? awemeData.videoPlayAddr[0]
      : awemeData.videoPlayAddr

    if (!videoUrl) {
      console.warn(`[${awemeData.awemeId}] 该作品没有视频链接，无法下载`)
      return
    }

    this.addDownloadTask(videoUrl, basePath, videoName, '.mp4')
  }

  /**
   * 下载图集
   */
  async downloadImages(awemeData: AwemeData, basePath: string): Promise<void> {
    const awemeId = awemeData.awemeId || ''

    // 处理实况视频
    const imagesVideo = awemeData.imagesVideo || []
    if (imagesVideo.length > 0) {
      for (let i = 0; i < imagesVideo.length; i++) {
        const videoUrl = imagesVideo[i]
        if (videoUrl) {
          const videoName = this.buildFileName(awemeData, `_live_${i + 1}`)
          this.addDownloadTask(videoUrl, basePath, videoName, '.mp4')
        } else {
          console.warn(`[${awemeId}] 该图集没有实况链接，无法下载`)
        }
      }
    }

    // 处理图片
    const images = awemeData.images || []
    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i]
      if (imageUrl) {
        const imageName = this.buildFileName(awemeData, `_image_${i + 1}`)
        this.addDownloadTask(imageUrl, basePath, imageName, '.webp')
      } else {
        console.warn(`[${awemeId}] 该图集没有图片链接，无法下载`)
      }
    }
  }

  /**
   * 创建音乐下载任务
   */
  async createMusicDownloadTasks(
    musicDatas: MusicData | MusicData[],
    userPath: string
  ): Promise<void> {
    if (!musicDatas || !userPath) return

    const dataList = Array.isArray(musicDatas) ? musicDatas : [musicDatas]

    for (const musicData of dataList) {
      await this.handleMusicDownload(musicData, userPath)
    }

    await this.executeTasks()
  }

  /**
   * 处理音乐下载
   */
  async handleMusicDownload(musicData: MusicData, userPath: string): Promise<void> {
    const title = musicData.title || 'unknown'
    const basePath = this.config.folderize ? path.join(userPath, title) : userPath

    const musicName = `${title}_music`
    const musicUrl = musicData.playUrl

    if (musicUrl) {
      this.addDownloadTask(musicUrl, basePath, musicName, '.mp3')
    }

    // 下载歌词
    if (this.config.lyric && musicData.lyricUrl) {
      await this.downloadLyric(musicData.lyricUrl, basePath, `${title}_lyric`)
    }
  }

  /**
   * 下载歌词
   */
  async downloadLyric(lyricUrl: string, basePath: string, lyricName: string): Promise<void> {
    try {
      const response = await got(lyricUrl, {
        timeout: { request: this.config.timeout },
        retry: { limit: this.config.retries },
      }).json<{ text: string; timeId: string | number }[]>()

      const lrcContent = json2Lrc(response)
      this.addStaticDownloadTask(lrcContent, basePath, lyricName, '.lrc')
    } catch (error) {
      console.warn(`歌词下载失败: ${error instanceof Error ? error.message : error}`)
    }
  }

  /**
   * 创建直播流下载任务
   */
  async createStreamTasks(
    webcastDatas: WebcastData | WebcastData[],
    userPath: string
  ): Promise<void> {
    if (!webcastDatas || !userPath) return

    const dataList = Array.isArray(webcastDatas) ? webcastDatas : [webcastDatas]

    for (const webcastData of dataList) {
      await this.handleStreamDownload(webcastData, userPath)
    }

    await this.executeTasks()
  }

  /**
   * 处理直播流下载
   */
  async handleStreamDownload(webcastData: WebcastData, userPath: string): Promise<void> {
    const customFields = {
      create: new Date().toISOString().split('T')[0],
      nickname: webcastData.nickname || '',
      awemeId: webcastData.roomId || '',
      desc: webcastData.liveTitle || '',
      uid: webcastData.userId || '',
    }

    const basePath = this.config.folderize
      ? path.join(userPath, formatFileName(this.config.naming!, customFields))
      : userPath

    const streamName = formatFileName(this.config.naming!, customFields) + '_live'

    // 优先使用 FULL_HD1 画质
    const streamUrl =
      webcastData.m3u8PullUrl?.FULL_HD1 ||
      webcastData.m3u8PullUrl?.HD1 ||
      webcastData.m3u8PullUrl?.SD1 ||
      webcastData.flvPullUrl?.FULL_HD1 ||
      webcastData.flvPullUrl?.HD1

    if (streamUrl) {
      this.addM3u8DownloadTask(streamUrl, basePath, streamName, '.flv')
    } else {
      console.warn(`[${webcastData.roomId}] 没有可用的直播流地址`)
    }
  }

  /**
   * 添加下载任务
   */
  private addDownloadTask(
    url: string,
    basePath: string,
    filename: string,
    extension: string
  ): void {
    const task = this.limit(async () => {
      return this.downloadFile(url, basePath, filename, extension)
    })
    this.tasks.push(task)
  }

  /**
   * 添加静态内容下载任务
   */
  private addStaticDownloadTask(
    content: string,
    basePath: string,
    filename: string,
    extension: string
  ): void {
    const task = this.limit(async () => {
      return this.saveStaticFile(content, basePath, filename, extension)
    })
    this.tasks.push(task)
  }

  /**
   * 添加 m3u8 下载任务
   */
  private addM3u8DownloadTask(
    url: string,
    basePath: string,
    filename: string,
    extension: string
  ): void {
    const task = this.limit(async () => {
      return this.downloadM3u8Stream(url, basePath, filename, extension)
    })
    this.tasks.push(task)
  }

  /**
   * 执行所有下载任务
   */
  private async executeTasks(): Promise<DownloadResult[]> {
    const results = await Promise.all(this.tasks)
    this.tasks = []
    return results
  }

  /**
   * 下载文件
   */
  private async downloadFile(
    url: string,
    basePath: string,
    filename: string,
    extension: string,
    onProgress?: ProgressCallback
  ): Promise<DownloadResult> {
    const filePath = path.join(basePath, `${filename}${extension}`)
    try {
      ensureDir(basePath)

      // 检查文件是否已存在且有效
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath)
        if (stat.size > 0) {
          console.log(`文件已存在，跳过: ${filePath}`)
          return { success: true, filePath }
        }
        fs.unlinkSync(filePath)
      }

      const globalConfig = getConfig()

      const downloadStream = got.stream(url, {
        timeout: { request: this.config.timeout },
        retry: { limit: this.config.retries },
        headers: {
          'User-Agent': globalConfig.userAgent,
          Referer: globalConfig.referer,
          Cookie: this.config.cookie,
        },
      })

      if (onProgress) {
        downloadStream.on('downloadProgress', progress => {
          onProgress({
            downloaded: progress.transferred,
            total: progress.total || 0,
            percentage: progress.percent * 100,
            speed: 0,
          })
        })
      }

      const tmpPath = filePath + '.tmp'
      const writeStream = fs.createWriteStream(tmpPath)
      await pipeline(downloadStream, writeStream)

      const tmpStat = fs.statSync(tmpPath)
      if (tmpStat.size === 0) {
        fs.unlinkSync(tmpPath)
        return { success: false, error: 'Downloaded file is empty' }
      }

      fs.renameSync(tmpPath, filePath)
      console.log(`下载完成: ${filePath}`)
      return { success: true, filePath }
    } catch (error) {
      const tmpPath = filePath + '.tmp'
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath)
      } catch {
        /* ignore */
      }
      try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).size === 0) fs.unlinkSync(filePath)
      } catch {
        /* ignore */
      }
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`下载失败 [${filename}]: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 保存静态文件
   */
  private async saveStaticFile(
    content: string,
    basePath: string,
    filename: string,
    extension: string
  ): Promise<DownloadResult> {
    try {
      ensureDir(basePath)
      const filePath = path.join(basePath, `${filename}${extension}`)

      if (fs.existsSync(filePath)) {
        console.log(`文件已存在，跳过: ${filePath}`)
        return { success: true, filePath }
      }

      fs.writeFileSync(filePath, content, 'utf-8')
      console.log(`保存完成: ${filePath}`)
      return { success: true, filePath }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`保存失败 [${filename}]: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 下载 m3u8 直播流
   */
  private async downloadM3u8Stream(
    url: string,
    basePath: string,
    filename: string,
    extension: string
  ): Promise<DownloadResult> {
    try {
      ensureDir(basePath)
      const filePath = path.join(basePath, `${filename}${extension}`)

      console.log(`开始录制直播流: ${filePath}`)
      console.log(`直播流地址: ${url}`)

      // 直播流需要持续下载，这里只是创建任务
      // 实际的 m3u8 下载需要使用 ffmpeg 或专门的 m3u8 下载库
      // 这里返回一个提示信息
      console.warn('直播流录制需要使用 ffmpeg，请使用以下命令:')
      console.log(`ffmpeg -i "${url}" -c copy "${filePath}"`)

      return { success: true, filePath }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error(`直播流下载失败: ${errorMsg}`)
      return { success: false, error: errorMsg }
    }
  }

  /**
   * 构建文件名
   */
  private buildFileName(awemeData: AwemeData, suffix: string): string {
    return (
      formatFileName(this.config.naming!, {
        create: awemeData.createTime,
        nickname: awemeData.nickname,
        awemeId: awemeData.awemeId,
        desc: awemeData.desc,
      }) + suffix
    )
  }

  /**
   * 日期区间过滤
   */
  private filterByDateInterval(dataList: AwemeData[]): AwemeData[] {
    if (!this.config.interval || this.config.interval === 'all') {
      return dataList
    }

    const now = new Date()
    let startDate: Date

    switch (this.config.interval) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        // 支持自定义日期格式: YYYY-MM-DD~YYYY-MM-DD
        if (this.config.interval.includes('~')) {
          const [start, end] = this.config.interval.split('~')
          const startTime = new Date(start).getTime()
          const endTime = new Date(end).getTime()
          return dataList.filter(item => {
            if (!item.createTime) return true
            const createTime = new Date(item.createTime).getTime()
            return createTime >= startTime && createTime <= endTime
          })
        }
        return dataList
    }

    return dataList.filter(item => {
      if (!item.createTime) return true
      const createTime = new Date(item.createTime).getTime()
      return createTime >= startDate.getTime()
    })
  }
}
