/**
 * DouyinHandler - 抖音业务逻辑处理
 * 对应 Python f2 项目的 handler.py
 */

import { DouyinCrawler } from '../crawler/douyin.js'
import { getAwemeId, fetchFromSharePage, SharePageDetail } from '../utils/fetcher.js'
import {
  UserProfileFilter,
  UserPostFilter,
  UserLikeFilter,
  UserCollectionFilter,
  UserCollectsFilter,
  UserMixFilter,
  PostDetailFilter,
  PostRelatedFilter,
  PostCommentFilter,
  PostCommentReplyFilter,
  UserLiveFilter,
  UserLive2Filter,
  UserLiveStatusFilter,
  FollowingUserLiveFilter,
  LiveImFetchFilter,
  FriendFeedFilter,
  HomePostSearchFilter,
  SuggestWordFilter,
  UserFollowingFilter,
  UserFollowerFilter,
  UserMusicCollectionFilter,
  QueryUserFilter,
  PostStatsFilter,
} from '../filter/index.js'
import {
  HandlerConfig,
  PaginationOptions,
  DY_LIVE_STATUS_MAPPING,
} from './types.js'

export interface HandlerResult<T = Record<string, unknown>> {
  data: T | T[] | null
  hasMore: boolean
  cursor?: number
  maxCursor?: number
}

export class DouyinHandler {
  private crawler: DouyinCrawler
  private hasCookie: boolean

  constructor(config: HandlerConfig) {
    this.hasCookie = !!config.cookie
    this.crawler = new DouyinCrawler({
      cookie: config.cookie || '',
      headers: config.headers,
      proxies: config.proxies,
    })
  }

  /**
   * 获取用户资料
   */
  async fetchUserProfile(secUserId: string): Promise<UserProfileFilter> {
    const response = await this.crawler.fetchUserProfile(secUserId)
    return new UserProfileFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取单个作品详情
   * @param urlOrAwemeId - 作品链接或 aweme_id
   * 如果没有 cookie，会尝试从移动端分享页面获取信息
   */
  async fetchOneVideo(urlOrAwemeId: string): Promise<PostDetailFilter | SharePageDetail> {
    // 判断是 URL 还是 awemeId
    const isUrl = urlOrAwemeId.includes('http') || urlOrAwemeId.includes('douyin.com')
    const awemeId = isUrl ? await getAwemeId(urlOrAwemeId) : urlOrAwemeId

    // 如果有 cookie，使用 API
    if (this.hasCookie) {
      try {
        const response = await this.crawler.fetchPostDetail(awemeId)
        return new PostDetailFilter(response.data as Record<string, unknown>)
      } catch {
        // API 失败，尝试使用分享页面
      }
    }

    // 没有 cookie 或 API 失败，使用移动端分享页面
    const shareDetail = await fetchFromSharePage(awemeId)
    if (shareDetail) {
      return shareDetail
    }

    throw new Error('无法获取视频信息，请检查链接是否有效')
  }

  /**
   * 从移动端分享页面获取视频详情（无需 Cookie）
   * @param urlOrAwemeId - 作品链接或 aweme_id
   */
  async fetchOneVideoFromSharePage(urlOrAwemeId: string): Promise<SharePageDetail | null> {
    const isUrl = urlOrAwemeId.includes('http') || urlOrAwemeId.includes('douyin.com')
    const awemeId = isUrl ? await getAwemeId(urlOrAwemeId) : urlOrAwemeId
    return fetchFromSharePage(awemeId)
  }

  /**
   * 获取用户作品列表（生成器）
   */
  async *fetchUserPostVideos(
    secUserId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<UserPostFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserPost(secUserId, cursor, pageCounts)
      const filter = new UserPostFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.awemeId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取用户喜欢列表（生成器）
   */
  async *fetchUserLikeVideos(
    secUserId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<UserLikeFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserLike(secUserId, cursor, pageCounts)
      const filter = new UserLikeFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.awemeId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取用户收藏列表（生成器）
   */
  async *fetchUserCollectionVideos(
    options: PaginationOptions = {}
  ): AsyncGenerator<UserCollectionFilter, void, unknown> {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = initialCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserCollection(cursor, pageCounts)
      const filter = new UserCollectionFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.awemeId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取用户收藏夹列表（生成器）
   */
  async *fetchUserCollects(options: PaginationOptions = {}): AsyncGenerator<UserCollectsFilter, void, unknown> {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = initialCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserCollects(cursor, pageCounts)
      const filter = new UserCollectsFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.collectsId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取收藏夹作品（生成器）
   */
  async *fetchUserCollectsVideos(
    collectsId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<UserCollectsFilter, void, unknown> {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = initialCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserCollectsVideo(collectsId, cursor, pageCounts)
      const filter = new UserCollectsFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.collectsId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取合集作品（生成器）
   */
  async *fetchUserMixVideos(
    mixId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<UserMixFilter, void, unknown> {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = initialCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserMix(mixId, cursor, pageCounts)
      const filter = new UserMixFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.awemeId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取用户音乐收藏（生成器）
   */
  async *fetchUserMusicCollection(
    options: PaginationOptions = {}
  ): AsyncGenerator<UserMusicCollectionFilter, void, unknown> {
    const { maxCursor: initialCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = initialCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserMusicCollection(cursor, pageCounts)
      const filter = new UserMusicCollectionFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.maxCursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.musicId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取相关推荐作品（生成器）
   */
  async *fetchRelatedVideos(
    awemeId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<PostRelatedFilter, void, unknown> {
    const { maxCounts = 0 } = options
    let filterGids = ''
    let count = 0

    while (true) {
      const response = await this.crawler.fetchPostRelated(awemeId, filterGids, 20)
      const filter = new PostRelatedFilter(response.data as Record<string, unknown>)

      yield filter

      const awemeIds = filter.awemeId
      if (!awemeIds || awemeIds.length === 0) break

      filterGids = awemeIds.join(',')

      count += awemeIds.length
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取朋友作品（生成器）
   */
  async *fetchFriendFeedVideos(options: PaginationOptions = {}): AsyncGenerator<FriendFeedFilter, void, unknown> {
    const { maxCursor = 0, maxCounts = 0 } = options
    let cursor = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchFriendFeed(cursor)
      const filter = new FriendFeedFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.cursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.awemeId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取用户直播信息
   */
  async fetchUserLiveVideos(webRid: string, roomIdStr: string): Promise<UserLiveFilter> {
    const response = await this.crawler.fetchUserLive(webRid, roomIdStr)
    return new UserLiveFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取用户直播信息2
   */
  async fetchUserLiveVideos2(roomId: string): Promise<UserLive2Filter> {
    const response = await this.crawler.fetchUserLive2(roomId)
    return new UserLive2Filter(response.data as Record<string, unknown>)
  }

  /**
   * 获取直播弹幕
   */
  async fetchLiveImFetch(
    roomId: string,
    userUniqueId: string,
    cursor: string = '',
    internalExt: string = ''
  ): Promise<LiveImFetchFilter> {
    const response = await this.crawler.fetchLiveImFetch(roomId, userUniqueId, cursor, internalExt)
    return new LiveImFetchFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取用户直播状态
   */
  async fetchUserLiveStatus(userIds: string): Promise<UserLiveStatusFilter> {
    const response = await this.crawler.fetchUserLiveStatus(userIds)
    return new UserLiveStatusFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取关注用户直播列表
   */
  async fetchFollowingUserLive(): Promise<FollowingUserLiveFilter> {
    const response = await this.crawler.fetchFollowingUserLive()
    return new FollowingUserLiveFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取作品评论（生成器）
   */
  async *fetchPostComment(
    awemeId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<PostCommentFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let cursor = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchPostComment(awemeId, cursor, pageCounts)
      const filter = new PostCommentFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.cursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.commentId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取评论回复（生成器）
   */
  async *fetchPostCommentReply(
    itemId: string,
    commentId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<PostCommentReplyFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 3, maxCounts = 0 } = options
    let cursor = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchPostCommentReply(itemId, commentId, cursor, pageCounts)
      const filter = new PostCommentReplyFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.cursor
      if (newCursor === null || newCursor === cursor) break
      cursor = newCursor

      count += filter.commentId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 主页作品搜索（生成器）
   */
  async *fetchHomePostSearch(
    keyword: string,
    fromUser: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<HomePostSearchFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 10, maxCounts = 0 } = options
    let offset = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchHomePostSearch(keyword, fromUser, offset, pageCounts)
      const filter = new HomePostSearchFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newCursor = filter.cursor
      if (newCursor === null || newCursor === offset) break
      offset = newCursor

      count += filter.awemeId?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 搜索建议词
   */
  async fetchSuggestWords(query: string, count: number = 8): Promise<SuggestWordFilter> {
    const response = await this.crawler.fetchSuggestWords(query, count)
    return new SuggestWordFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取用户关注列表（生成器）
   */
  async *fetchUserFollowing(
    secUserId: string,
    userId: string = '',
    options: PaginationOptions = {}
  ): AsyncGenerator<UserFollowingFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let offset = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserFollowing(secUserId, userId, offset, pageCounts)
      const filter = new UserFollowingFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newOffset = filter.offset
      if (newOffset === null || newOffset === offset) break
      offset = newOffset

      count += filter.secUid?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 获取用户粉丝列表（生成器）
   */
  async *fetchUserFollower(
    userId: string,
    secUserId: string,
    options: PaginationOptions = {}
  ): AsyncGenerator<UserFollowerFilter, void, unknown> {
    const { maxCursor = 0, pageCounts = 20, maxCounts = 0 } = options
    let offset = maxCursor
    let count = 0

    while (true) {
      const response = await this.crawler.fetchUserFollower(userId, secUserId, offset, pageCounts)
      const filter = new UserFollowerFilter(response.data as Record<string, unknown>)

      yield filter

      if (!filter.hasMore) break

      const newOffset = filter.offset
      if (newOffset === null || newOffset === offset) break
      offset = newOffset

      count += filter.secUid?.length || 0
      if (maxCounts > 0 && count >= maxCounts) break
    }
  }

  /**
   * 查询用户
   */
  async fetchQueryUser(secUserIds: string = ''): Promise<QueryUserFilter> {
    const response = await this.crawler.fetchQueryUser(secUserIds)
    return new QueryUserFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取作品统计
   */
  async fetchPostStats(itemId: string, awemeType: number = 0, playDelta: number = 1): Promise<PostStatsFilter> {
    const response = await this.crawler.fetchPostStats(itemId, awemeType, playDelta)
    return new PostStatsFilter(response.data as Record<string, unknown>)
  }

  /**
   * 获取直播状态文本
   */
  getLiveStatusText(status: number): string {
    return DY_LIVE_STATUS_MAPPING[status] || '未知状态'
  }
}

export { DouyinCrawler } from '../crawler/douyin.js'
export type { DouyinCrawlerConfig } from '../crawler/douyin.js'
export type { HandlerConfig, PaginationOptions, FetchOptions, ModeType } from './types.js'
export { DY_LIVE_STATUS_MAPPING, IGNORE_FIELDS } from './types.js'
export {
  ModeRouter,
  modeHandler,
  registerModeHandler,
  getModeHandler,
  getAllModes,
  getModeDescription,
  isValidMode,
  MODE_NAMES,
} from './mode.js'
