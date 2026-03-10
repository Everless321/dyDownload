/**
 * 下载器类型定义
 */

export interface DownloadConfig {
  cookie?: string
  downloadPath?: string
  maxConcurrency?: number
  timeout?: number
  retries?: number
  proxy?: string
  naming?: string
  folderize?: boolean
  interval?: string
  music?: boolean
  cover?: boolean
  desc?: boolean
  lyric?: boolean
}

export interface DownloadTask {
  type: 'video' | 'image' | 'music' | 'cover' | 'desc' | 'live' | 'lyric'
  url: string
  savePath: string
  filename: string
  extension: string
}

export interface AwemeData {
  awemeId?: string
  awemeType?: number
  secUserId?: string
  nickname?: string
  uid?: string
  desc?: string
  descRaw?: string
  caption?: string
  createTime?: string
  cover?: string
  animatedCover?: string
  dynamicCover?: string
  videoPlayAddr?: string | string[]
  images?: string[]
  imagesVideo?: string[]
  musicPlayUrl?: string
  musicStatus?: number
  isProhibited?: boolean
  privateStatus?: number
}

export interface MusicData {
  musicId?: string
  title?: string
  author?: string
  playUrl?: string
  lyricUrl?: string | null
  coverHd?: string
  duration?: number
}

export interface WebcastData {
  roomId?: string
  nickname?: string
  userId?: string
  liveTitle?: string
  m3u8PullUrl?: {
    FULL_HD1?: string
    HD1?: string
    SD1?: string
    SD2?: string
  }
  flvPullUrl?: {
    FULL_HD1?: string
    HD1?: string
    SD1?: string
    SD2?: string
  }
}

export interface DownloadResult {
  success: boolean
  filePath?: string
  error?: string
}

export interface DownloadProgress {
  downloaded: number
  total: number
  percentage: number
  speed: number
}

export type ProgressCallback = (progress: DownloadProgress) => void
