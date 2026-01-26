import { z } from 'zod';

declare const ENDPOINTS: {
    readonly DOUYIN_DOMAIN: "https://www.douyin.com";
    readonly IESDOUYIN_DOMAIN: "https://www.iesdouyin.com";
    readonly LIVE_DOMAIN: "https://live.douyin.com";
    readonly LIVE_DOMAIN2: "https://webcast.amemv.com";
    readonly WEBCAST_WSS_DOMAIN: "wss://webcast5-ws-web-hl.douyin.com";
    readonly LIVE_IM_WSS: "wss://webcast5-ws-web-hl.douyin.com/webcast/im/push/v2/";
    readonly TAB_FEED: "https://www.douyin.com/aweme/v1/web/tab/feed/";
    readonly USER_SHORT_INFO: "https://www.douyin.com/aweme/v1/web/im/user/info/";
    readonly USER_DETAIL: "https://www.douyin.com/aweme/v1/web/user/profile/other/";
    readonly BASE_AWEME: "https://www.douyin.com/aweme/v1/web/aweme/";
    readonly USER_POST: "https://www.douyin.com/aweme/v1/web/aweme/post/";
    readonly SLIDES_AWEME: "https://www.iesdouyin.com/web/api/v2/aweme/slidesinfo/";
    readonly LOCATE_POST: "https://www.douyin.com/aweme/v1/web/locate/post/";
    readonly POST_SEARCH: "https://www.douyin.com/aweme/v1/web/general/search/single/";
    readonly HOME_POST_SEARCH: "https://www.douyin.com/aweme/v1/web/home/search/item/";
    readonly POST_DETAIL: "https://www.douyin.com/aweme/v1/web/aweme/detail/";
    readonly USER_FAVORITE_A: "https://www.douyin.com/aweme/v1/web/aweme/favorite/";
    readonly USER_FAVORITE_B: "https://www.iesdouyin.com/web/api/v2/aweme/like/";
    readonly USER_FOLLOWING: "https://www.douyin.com/aweme/v1/web/user/following/list/";
    readonly USER_FOLLOWER: "https://www.douyin.com/aweme/v1/web/user/follower/list/";
    readonly MIX_AWEME: "https://www.douyin.com/aweme/v1/web/mix/aweme/";
    readonly USER_HISTORY: "https://www.douyin.com/aweme/v1/web/history/read/";
    readonly USER_COLLECTION: "https://www.douyin.com/aweme/v1/web/aweme/listcollection/";
    readonly USER_COLLECTS: "https://www.douyin.com/aweme/v1/web/collects/list/";
    readonly USER_COLLECTS_VIDEO: "https://www.douyin.com/aweme/v1/web/collects/video/list/";
    readonly USER_MUSIC_COLLECTION: "https://www.douyin.com/aweme/v1/web/music/listcollection/";
    readonly FRIEND_FEED: "https://www.douyin.com/aweme/v1/web/familiar/feed/";
    readonly FOLLOW_FEED: "https://www.douyin.com/aweme/v1/web/follow/feed/";
    readonly POST_RELATED: "https://www.douyin.com/aweme/v1/web/aweme/related/";
    readonly FOLLOW_USER_LIVE: "https://www.douyin.com/webcast/web/feed/follow/";
    readonly LIVE_INFO: "https://live.douyin.com/webcast/room/web/enter/";
    readonly LIVE_INFO_ROOM_ID: "https://webcast.amemv.com/webcast/room/reflow/info/";
    readonly LIVE_USER_INFO: "https://live.douyin.com/webcast/user/me/";
    readonly LIVE_IM_FETCH: "https://live.douyin.com/webcast/im/fetch/";
    readonly USER_LIVE_STATUS: "https://live.douyin.com/webcast/distribution/check_user_live_status/";
    readonly SUGGEST_WORDS: "https://www.douyin.com/aweme/v1/web/api/suggest_words/";
    readonly POST_COMMENT: "https://www.douyin.com/aweme/v1/web/comment/list/";
    readonly POST_COMMENT_REPLY: "https://www.douyin.com/aweme/v1/web/comment/list/reply/";
    readonly POST_COMMENT_PUBLISH: "https://www.douyin.com/aweme/v1/web/comment/publish";
    readonly POST_COMMENT_DELETE: "https://www.douyin.com/aweme/v1/web/comment/delete/";
    readonly POST_COMMENT_DIGG: "https://www.douyin.com/aweme/v1/web/comment/digg";
    readonly QUERY_USER: "https://www.douyin.com/aweme/v1/web/query/user/";
    readonly POST_STATS: "https://www.douyin.com/aweme/v2/web/aweme/stats/";
};

interface DouyinUser {
    uid: string;
    secUid: string;
    nickname: string;
    signature: string;
    avatar: string;
    followingCount: number;
    followerCount: number;
    likeCount: number;
    videoCount: number;
}
interface DouyinVideo {
    awemeId: string;
    desc: string;
    createTime: number;
    author: DouyinUser;
    statistics: VideoStatistics;
    video: VideoInfo;
    images?: ImageInfo[];
    isImagePost: boolean;
}
interface VideoStatistics {
    playCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    collectCount: number;
}
interface VideoInfo {
    playAddr: string;
    cover: string;
    duration: number;
    width: number;
    height: number;
}
interface ImageInfo {
    url: string;
    width: number;
    height: number;
}
interface ParsedUrl {
    type: 'video' | 'user' | 'live' | 'unknown';
    id: string;
    originalUrl: string;
}

declare function fetchUserProfile(_secUid: string): Promise<DouyinUser | null>;
declare function fetchVideoDetail(_awemeId: string): Promise<DouyinVideo | null>;
declare function fetchUserPosts(_secUid: string, _maxCursor?: number, _count?: number): Promise<{
    videos: DouyinVideo[];
    hasMore: boolean;
    maxCursor: number;
}>;
declare function fetchUserLikes(_secUid: string, _maxCursor?: number, _count?: number): Promise<{
    videos: DouyinVideo[];
    hasMore: boolean;
    maxCursor: number;
}>;

declare const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0";
declare const ConfigSchema: z.ZodObject<{
    cookie: z.ZodDefault<z.ZodString>;
    userAgent: z.ZodDefault<z.ZodString>;
    referer: z.ZodDefault<z.ZodString>;
    downloadPath: z.ZodDefault<z.ZodString>;
    maxConcurrency: z.ZodDefault<z.ZodNumber>;
    timeout: z.ZodDefault<z.ZodNumber>;
    retries: z.ZodDefault<z.ZodNumber>;
    proxy: z.ZodOptional<z.ZodString>;
    encryption: z.ZodDefault<z.ZodEnum<["ab", "xb"]>>;
    msToken: z.ZodDefault<z.ZodObject<{
        url: z.ZodString;
        magic: z.ZodNumber;
        version: z.ZodNumber;
        dataType: z.ZodNumber;
        strData: z.ZodString;
        ulr: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        magic: number;
        version: number;
        dataType: number;
        strData: string;
        ulr: string;
    }, {
        url: string;
        magic: number;
        version: number;
        dataType: number;
        strData: string;
        ulr: string;
    }>>;
    ttwid: z.ZodDefault<z.ZodObject<{
        url: z.ZodString;
        data: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        data: string;
    }, {
        url: string;
        data: string;
    }>>;
    webid: z.ZodDefault<z.ZodObject<{
        url: z.ZodString;
        body: z.ZodObject<{
            app_id: z.ZodNumber;
            referer: z.ZodString;
            url: z.ZodString;
            user_agent: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            referer: string;
            url: string;
            app_id: number;
            user_agent: string;
        }, {
            referer: string;
            url: string;
            app_id: number;
            user_agent: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        url: string;
        body: {
            referer: string;
            url: string;
            app_id: number;
            user_agent: string;
        };
    }, {
        url: string;
        body: {
            referer: string;
            url: string;
            app_id: number;
            user_agent: string;
        };
    }>>;
}, "strip", z.ZodTypeAny, {
    cookie: string;
    userAgent: string;
    referer: string;
    downloadPath: string;
    maxConcurrency: number;
    timeout: number;
    retries: number;
    encryption: "ab" | "xb";
    msToken: {
        url: string;
        magic: number;
        version: number;
        dataType: number;
        strData: string;
        ulr: string;
    };
    ttwid: {
        url: string;
        data: string;
    };
    webid: {
        url: string;
        body: {
            referer: string;
            url: string;
            app_id: number;
            user_agent: string;
        };
    };
    proxy?: string | undefined;
}, {
    cookie?: string | undefined;
    userAgent?: string | undefined;
    referer?: string | undefined;
    downloadPath?: string | undefined;
    maxConcurrency?: number | undefined;
    timeout?: number | undefined;
    retries?: number | undefined;
    proxy?: string | undefined;
    encryption?: "ab" | "xb" | undefined;
    msToken?: {
        url: string;
        magic: number;
        version: number;
        dataType: number;
        strData: string;
        ulr: string;
    } | undefined;
    ttwid?: {
        url: string;
        data: string;
    } | undefined;
    webid?: {
        url: string;
        body: {
            referer: string;
            url: string;
            app_id: number;
            user_agent: string;
        };
    } | undefined;
}>;
type Config = z.infer<typeof ConfigSchema>;
declare function getConfig(): Config;
declare function setConfig(config: Partial<Config>): Config;
declare function getUserAgent(): string;
declare function getReferer(): string;
declare function getProxy(): string | undefined;
declare function getEncryption(): 'ab' | 'xb';
declare function getMsTokenConfig(): {
    url: string;
    magic: number;
    version: number;
    dataType: number;
    strData: string;
    ulr: string;
};
declare function getTtwidConfig(): {
    url: string;
    data: string;
};
declare function getWebidConfig(): {
    url: string;
    body: {
        referer: string;
        url: string;
        app_id: number;
        user_agent: string;
    };
};

interface HttpResponse<T = unknown> {
    status: number;
    headers: Headers;
    data: T;
    url: string;
    cookies: Map<string, string>;
}

/**
 * DouyinCrawler - 抖音 API 请求封装
 * 对应 Python f2 项目的 crawler.py
 */

interface DouyinCrawlerConfig {
    cookie: string;
    headers?: Record<string, string>;
    proxies?: {
        http?: string;
        https?: string;
    };
}
declare class DouyinCrawler {
    private headers;
    private userAgent;
    constructor(config: DouyinCrawlerConfig);
    private model2Endpoint;
    private fetchGetJson;
    private fetchPostJson;
    /**
     * 获取用户资料
     */
    fetchUserProfile(secUserId: string): Promise<HttpResponse>;
    /**
     * 获取用户作品列表
     */
    fetchUserPost(secUserId: string, maxCursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取用户喜欢列表
     */
    fetchUserLike(secUserId: string, maxCursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取用户收藏列表
     */
    fetchUserCollection(cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取用户收藏夹列表
     */
    fetchUserCollects(cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取收藏夹作品
     */
    fetchUserCollectsVideo(collectsId: string, cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取用户音乐收藏
     */
    fetchUserMusicCollection(cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取合集作品
     */
    fetchUserMix(mixId: string, cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取朋友作品
     */
    fetchFriendFeed(cursor?: number): Promise<HttpResponse>;
    /**
     * 获取首页 Feed
     */
    fetchPostFeed(count?: number): Promise<HttpResponse>;
    /**
     * 获取关注用户作品
     */
    fetchFollowFeed(cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取相关推荐
     */
    fetchPostRelated(awemeId: string, filterGids?: string, count?: number): Promise<HttpResponse>;
    /**
     * 获取作品详情
     */
    fetchPostDetail(awemeId: string): Promise<HttpResponse>;
    /**
     * 获取作品评论
     */
    fetchPostComment(awemeId: string, cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取评论回复
     */
    fetchPostCommentReply(itemId: string, commentId: string, cursor?: number, count?: number): Promise<HttpResponse>;
    /**
     * 定位作品
     */
    fetchPostLocate(secUserId: string, maxCursor: string, locateItemCursor: string, locateItemId?: string, count?: number): Promise<HttpResponse>;
    /**
     * 获取用户直播信息
     */
    fetchUserLive(webRid: string, roomIdStr: string): Promise<HttpResponse>;
    /**
     * 获取用户直播信息2
     */
    fetchUserLive2(roomId: string): Promise<HttpResponse>;
    /**
     * 获取关注用户直播列表
     */
    fetchFollowingUserLive(): Promise<HttpResponse>;
    /**
     * 获取搜索建议词
     */
    fetchSuggestWords(query: string, count?: number): Promise<HttpResponse>;
    /**
     * 搜索作品
     */
    fetchPostSearch(keyword: string, filterSelected?: string, offset?: number, count?: number): Promise<HttpResponse>;
    /**
     * 主页作品搜索
     */
    fetchHomePostSearch(keyword: string, fromUser: string, offset?: number, count?: number): Promise<HttpResponse>;
    /**
     * 获取用户关注列表
     */
    fetchUserFollowing(secUserId: string, userId?: string, offset?: number, count?: number, sourceType?: number): Promise<HttpResponse>;
    /**
     * 获取用户粉丝列表
     */
    fetchUserFollower(userId: string, secUserId: string, offset?: number, count?: number, sourceType?: number): Promise<HttpResponse>;
    /**
     * 获取直播弹幕初始化数据
     */
    fetchLiveImFetch(roomId: string, userUniqueId: string, cursor?: string, internalExt?: string): Promise<HttpResponse>;
    /**
     * 获取用户直播状态
     */
    fetchUserLiveStatus(userIds: string): Promise<HttpResponse>;
    /**
     * 查询用户
     */
    fetchQueryUser(secUserIds: string): Promise<HttpResponse>;
    /**
     * 获取作品统计
     */
    fetchPostStats(itemId: string, awemeType?: number, playDelta?: number): Promise<HttpResponse>;
}

/**
 * 下载器类型定义
 */
interface DownloadConfig {
    cookie: string;
    downloadPath?: string;
    maxConcurrency?: number;
    timeout?: number;
    retries?: number;
    proxy?: string;
    naming?: string;
    folderize?: boolean;
    interval?: string;
    music?: boolean;
    cover?: boolean;
    desc?: boolean;
    lyric?: boolean;
}
interface DownloadTask {
    type: 'video' | 'image' | 'music' | 'cover' | 'desc' | 'live' | 'lyric';
    url: string;
    savePath: string;
    filename: string;
    extension: string;
}
interface AwemeData {
    awemeId?: string;
    awemeType?: number;
    secUserId?: string;
    nickname?: string;
    uid?: string;
    desc?: string;
    descRaw?: string;
    caption?: string;
    createTime?: string;
    cover?: string;
    animatedCover?: string;
    videoPlayAddr?: string | string[];
    images?: string[];
    imagesVideo?: string[];
    musicPlayUrl?: string;
    musicStatus?: number;
    isProhibited?: boolean;
    privateStatus?: number;
}
interface MusicData {
    musicId?: string;
    title?: string;
    author?: string;
    playUrl?: string;
    lyricUrl?: string | null;
    coverHd?: string;
    duration?: number;
}
interface WebcastData {
    roomId?: string;
    nickname?: string;
    userId?: string;
    liveTitle?: string;
    m3u8PullUrl?: {
        FULL_HD1?: string;
        HD1?: string;
        SD1?: string;
        SD2?: string;
    };
    flvPullUrl?: {
        FULL_HD1?: string;
        HD1?: string;
        SD1?: string;
        SD2?: string;
    };
}
interface DownloadResult {
    success: boolean;
    filePath?: string;
    error?: string;
}
interface DownloadProgress {
    downloaded: number;
    total: number;
    percentage: number;
    speed: number;
}
type ProgressCallback = (progress: DownloadProgress) => void;

/**
 * DouyinDownloader - 抖音下载器
 * 对应 Python f2 项目的 dl.py
 */

declare class DouyinDownloader {
    private config;
    private limit;
    private tasks;
    constructor(config: DownloadConfig);
    /**
     * 创建下载任务
     */
    createDownloadTasks(awemeDatas: AwemeData | AwemeData[], userPath: string): Promise<void>;
    /**
     * 处理单个作品下载
     */
    handleDownload(awemeData: AwemeData, userPath: string): Promise<void>;
    /**
     * 下载音乐
     */
    downloadMusic(awemeData: AwemeData, basePath: string): Promise<void>;
    /**
     * 下载封面
     */
    downloadCover(awemeData: AwemeData, basePath: string): Promise<void>;
    /**
     * 下载文案
     */
    downloadDesc(awemeData: AwemeData, basePath: string): Promise<void>;
    /**
     * 下载视频
     */
    downloadVideo(awemeData: AwemeData, basePath: string): Promise<void>;
    /**
     * 下载图集
     */
    downloadImages(awemeData: AwemeData, basePath: string): Promise<void>;
    /**
     * 创建音乐下载任务
     */
    createMusicDownloadTasks(musicDatas: MusicData | MusicData[], userPath: string): Promise<void>;
    /**
     * 处理音乐下载
     */
    handleMusicDownload(musicData: MusicData, userPath: string): Promise<void>;
    /**
     * 下载歌词
     */
    downloadLyric(lyricUrl: string, basePath: string, lyricName: string): Promise<void>;
    /**
     * 创建直播流下载任务
     */
    createStreamTasks(webcastDatas: WebcastData | WebcastData[], userPath: string): Promise<void>;
    /**
     * 处理直播流下载
     */
    handleStreamDownload(webcastData: WebcastData, userPath: string): Promise<void>;
    /**
     * 添加下载任务
     */
    private addDownloadTask;
    /**
     * 添加静态内容下载任务
     */
    private addStaticDownloadTask;
    /**
     * 添加 m3u8 下载任务
     */
    private addM3u8DownloadTask;
    /**
     * 执行所有下载任务
     */
    private executeTasks;
    /**
     * 下载文件
     */
    private downloadFile;
    /**
     * 保存静态文件
     */
    private saveStaticFile;
    /**
     * 下载 m3u8 直播流
     */
    private downloadM3u8Stream;
    /**
     * 构建文件名
     */
    private buildFileName;
    /**
     * 日期区间过滤
     */
    private filterByDateInterval;
}

declare class JSONModel<T = Record<string, unknown>> {
    protected _data: T;
    private _cache;
    constructor(data: T);
    protected _getAttrValue<R = unknown>(jsonpathExpr: string): R | null;
    protected _getListAttrValue<R = unknown>(jsonpathExpr: string, asJson?: boolean): R[] | string | null;
    toRaw(): T;
    toDict(): Record<string, unknown>;
}

declare function replaceT<T>(obj: T): T;
declare function timestamp2Str(timestamp: string | number | (string | number)[], format?: string, tzOffsetHours?: number): string | string[];
interface FilterToListOptions {
    entriesPath: string;
    excludeFields: string[];
    extraFields?: string[];
}
declare function filterToList<T extends JSONModel>(filterInstance: T, options: FilterToListOptions): Record<string, unknown>[];

declare class UserProfileFilter extends JSONModel {
    get avatarUrl(): string | null;
    get awemeCount(): number | null;
    get city(): string | null;
    get country(): string | null;
    get favoritingCount(): number | null;
    get followerCount(): number | null;
    get followingCount(): number | null;
    get gender(): number | null;
    get ipLocation(): string | null;
    get isBan(): boolean | null;
    get isBlock(): boolean | null;
    get isBlocked(): boolean | null;
    get isStar(): boolean | null;
    get liveStatus(): number | null;
    get mixCount(): number | null;
    get mplatformFollowersCount(): number | null;
    get nickname(): string | null;
    get nicknameRaw(): string | null;
    get roomId(): string | null;
    get schoolName(): string | null;
    get secUserId(): string | null;
    get shortId(): string | null;
    get signature(): string | null;
    get signatureRaw(): string | null;
    get totalFavorited(): number | null;
    get uid(): string | null;
    get uniqueId(): string | null;
    get userAge(): number | null;
}
declare class UserFollowingFilter extends JSONModel {
    get statusCode(): number | null;
    get statusMsg(): string | null;
    get hasMore(): boolean | null;
    get total(): number | null;
    get mixCount(): number | null;
    get offset(): number | null;
    get myselfUserId(): string | null;
    get maxTime(): number | null;
    get minTime(): number | null;
    get avatarLarger(): string[] | null;
    get canComment(): boolean[] | null;
    get canForward(): boolean[] | null;
    get canShare(): boolean[] | null;
    get canShowComment(): boolean[] | null;
    get awemeCount(): number[] | null;
    get backCover(): string[] | null;
    get registerTime(): number[] | null;
    get secondaryPriority(): number[] | null;
    get secondaryText(): string[] | null;
    get secondaryTextRaw(): string[] | null;
    get isBlock(): boolean[] | null;
    get isBlocked(): boolean[] | null;
    get isGovMediaVip(): boolean[] | null;
    get isMixUser(): boolean[] | null;
    get isPhoneBinded(): boolean[] | null;
    get isStar(): boolean[] | null;
    get isTop(): boolean[] | null;
    get isVerified(): boolean[] | null;
    get language(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get relationLabel(): string[] | null;
    get roomId(): string[] | null;
    get secUid(): string[] | null;
    get secret(): boolean[] | null;
    get shortId(): string[] | null;
    get signature(): string[] | null;
    get signatureRaw(): string[] | null;
    get uid(): string[] | null;
    get uniqueId(): string[] | null;
    toList(): Record<string, unknown>[];
}
declare class UserFollowerFilter extends UserFollowingFilter {
    get total(): number | null;
    get avatarLarger(): string[] | null;
    get canComment(): boolean[] | null;
    get canForward(): boolean[] | null;
    get canShare(): boolean[] | null;
    get canShowComment(): boolean[] | null;
    get awemeCount(): number[] | null;
    get backCover(): string[] | null;
    get registerTime(): number[] | null;
    get isBlock(): boolean[] | null;
    get isBlocked(): boolean[] | null;
    get isGovMediaVip(): boolean[] | null;
    get isMixUser(): boolean[] | null;
    get isPhoneBinded(): boolean[] | null;
    get isStar(): boolean[] | null;
    get isTop(): boolean[] | null;
    get isVerified(): boolean[] | null;
    get language(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get relationLabel(): string[] | null;
    get roomId(): string[] | null;
    get secUid(): string[] | null;
    get secret(): boolean[] | null;
    get shortId(): string[] | null;
    get signature(): string[] | null;
    get signatureRaw(): string[] | null;
    get uid(): string[] | null;
    get uniqueId(): string[] | null;
    toList(): Record<string, unknown>[];
}
declare class QueryUserFilter extends JSONModel {
    get statusCode(): number | null;
    get statusMsg(): string | null;
    get browserName(): string | null;
    get createTime(): string;
    get firebaseInstanceId(): string | null;
    get userUniqueId(): string | null;
    get lastTime(): string;
    get userAgent(): string | null;
    get userUid(): string | null;
    get userUidType(): number | null;
}

declare class UserPostFilter extends JSONModel {
    get statusCode(): number | null;
    get hasAweme(): boolean;
    get locateItemCursor(): number | null;
    get awemeId(): string[];
    get awemeType(): number[] | null;
    get createTime(): string | string[];
    get caption(): string | null;
    get captionRaw(): string | null;
    get desc(): string[] | null;
    get descRaw(): string[] | null;
    get uid(): string[] | null;
    get secUserId(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get authorAvatarThumb(): string[] | null;
    get images(): (string[] | null)[];
    get imagesVideo(): (string[])[];
    get animatedCover(): (string | null)[];
    get cover(): string[] | null;
    get videoPlayAddr(): string[][] | null;
    get videoBitRate(): number[][];
    get videoDuration(): number[] | null;
    get partSee(): number[] | null;
    get privateStatus(): number[] | null;
    get isProhibited(): boolean[] | null;
    get authorDeleted(): boolean[] | null;
    get musicStatus(): number[] | null;
    get musicTitle(): string[] | null;
    get musicTitleRaw(): string[] | null;
    get musicPlayUrl(): string[] | null;
    get hasMore(): boolean;
    get maxCursor(): number | null;
    get minCursor(): number | null;
    toList(): Record<string, unknown>[];
    /**
     * 转换为 AwemeData 数组，方便直接传给 downloader
     */
    toAwemeDataList(): AwemeData[];
}
declare class UserCollectionFilter extends UserPostFilter {
    get maxCursor(): number | null;
}
declare class UserMixFilter extends UserPostFilter {
    get maxCursor(): number | null;
}
declare class UserLikeFilter extends UserPostFilter {
}
declare class PostRelatedFilter extends UserPostFilter {
}
declare class UserCollectsFilter extends JSONModel {
    get maxCursor(): number | null;
    get statusCode(): number | null;
    get collectsTotalNumber(): number | null;
    get hasMore(): boolean;
    get appId(): string[] | null;
    get collectsCover(): string[] | null;
    get collectsId(): string[] | null;
    get collectsName(): string[] | null;
    get collectsNameRaw(): string[] | null;
    get createTime(): string | string[];
    get followStatus(): number[] | null;
    get followedCount(): number[] | null;
    get isNormalStatus(): boolean[] | null;
    get itemType(): number[] | null;
    get lastCollectTime(): string | string[];
    get playCount(): number[] | null;
    get states(): number[] | null;
    get status(): number[] | null;
    get systemType(): number[] | null;
    get totalNumber(): number[] | null;
    get userId(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get uid(): string[] | null;
}
declare class UserMusicCollectionFilter extends JSONModel {
    get maxCursor(): number | null;
    get hasMore(): boolean | null;
    get statusCode(): number | null;
    get msg(): string | null;
    get album(): string[] | null;
    get auditionDuration(): number[] | null;
    get duration(): number[] | null;
    get author(): string[] | null;
    get authorRaw(): string[] | null;
    get collectStatus(): number[] | null;
    get musicStatus(): number[] | null;
    get coverHd(): string[] | null;
    get musicId(): string[] | null;
    get mid(): string[] | null;
    get isCommerceMusic(): boolean[] | null;
    get isOriginal(): boolean[] | null;
    get isOriginalSound(): boolean[] | null;
    get lyricType(): number[] | null;
    get lyricUrl(): (string | null)[];
    get playUrl(): string[] | null;
    get title(): string[] | null;
    get titleRaw(): string[] | null;
    get strongBeatUrl(): string[] | null;
    get ownerNickname(): string[] | null;
    get ownerNicknameRaw(): string[] | null;
    get ownerId(): string[] | null;
    get secUid(): string[] | null;
    toList(): Record<string, unknown>[];
}
declare class PostDetailFilter extends JSONModel {
    get apiStatusCode(): number | null;
    get awemeType(): number | null;
    get awemeId(): string | null;
    get nickname(): string | null;
    get nicknameRaw(): string | null;
    get secUserId(): string | null;
    get shortId(): string | null;
    get uid(): string | null;
    get uniqueId(): string | null;
    get canComment(): boolean | null;
    get canForward(): boolean | null;
    get canShare(): boolean | null;
    get canShowComment(): boolean | null;
    get commentGid(): string | null;
    get createTime(): string;
    get caption(): string | null;
    get captionRaw(): string | null;
    get desc(): string | null;
    get descRaw(): string | null;
    get duration(): number | null;
    get isAds(): boolean | null;
    get isStory(): boolean | null;
    get isTop(): boolean | null;
    get partSee(): number | null;
    get privateStatus(): number | null;
    get isDelete(): boolean | null;
    get isProhibited(): boolean | null;
    get mediaType(): number | null;
    get mixDesc(): string | null;
    get mixDescRaw(): string | null;
    get mixCreateTime(): string;
    get mixId(): string | null;
    get mixName(): string | null;
    get mixPicType(): number | null;
    get mixType(): number | null;
    get mixShareUrl(): string | null;
    get mixUpdateTime(): string;
    get isCommerceMusic(): boolean | null;
    get isOriginal(): boolean | null;
    get isOriginalSound(): boolean | null;
    get isPgc(): boolean | null;
    get musicAuthor(): string | null;
    get musicAuthorRaw(): string | null;
    get musicAuthorDeleted(): boolean | null;
    get musicDuration(): number | null;
    get musicId(): string | null;
    get musicMid(): string | null;
    get pgcAuthor(): string | null;
    get pgcAuthorRaw(): string | null;
    get pgcAuthorTitle(): string | null;
    get pgcAuthorTitleRaw(): string | null;
    get pgcMusicType(): number | null;
    get musicStatus(): number | null;
    get musicOwnerHandle(): string | null;
    get musicOwnerHandleRaw(): string | null;
    get musicOwnerId(): string | null;
    get musicOwnerNickname(): string | null;
    get musicOwnerNicknameRaw(): string | null;
    get musicPlayUrl(): string | null;
    get position(): string | null;
    get region(): string | null;
    get seoOcrContent(): string | null;
    get allowDouplus(): boolean | null;
    get downloadSetting(): number | null;
    get allowShare(): boolean | null;
    get admireCount(): number | null;
    get collectCount(): number | null;
    get commentCount(): number | null;
    get diggCount(): number | null;
    get shareCount(): number | null;
    get hashtagIds(): string[] | null;
    get hashtagNames(): string[] | null;
    get animatedCover(): string | null;
    get cover(): string | null;
    get videoBitRate(): number[][];
    get videoPlayAddr(): string[] | null;
    get images(): string[] | null;
    get imagesVideo(): string[] | null;
    /**
     * 转换为 AwemeData，方便直接传给 downloader
     */
    toAwemeData(): AwemeData;
}
declare class PostStatsFilter extends JSONModel {
    get statusCode(): number | null;
    get statusMsg(): string | null;
}

declare class PostCommentFilter extends JSONModel {
    get apiStatusCode(): number | null;
    get hasMore(): boolean | null;
    get total(): number | null;
    get cursor(): number | null;
    get canShare(): boolean[] | null;
    get createTime(): string | string[];
    get commentId(): string[] | null;
    get commentText(): string[] | null;
    get commentTextRaw(): string[] | null;
    get itemCommentTotal(): number[] | null;
    get isHot(): boolean[] | null;
    get diggCount(): number[] | null;
    get userId(): string[] | null;
    get userUniqueId(): string[] | null;
    get secUid(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get replyCommentId(): string[] | null;
    get replyCommentText(): string[] | null;
    get replyCommentTextRaw(): string[] | null;
    get replyCommentTotal(): number[] | null;
    get replyId(): string[] | null;
    get replyToReplyId(): string[] | null;
    toList(): Record<string, unknown>[];
}
declare class PostCommentReplyFilter extends PostCommentFilter {
}

declare class UserLiveFilter extends JSONModel {
    get apiStatusCode(): number | null;
    get roomId(): string | null;
    get liveStatus(): number | null;
    get liveTitle(): string | null;
    get liveTitleRaw(): string | null;
    get cover(): string | null;
    get userCount(): string | null;
    get totalUserCount(): string | null;
    get likeCount(): string | null;
    get flvPullUrl(): Record<string, string> | null;
    get m3u8PullUrl(): Record<string, string> | null;
    get userId(): string | null;
    get secUserId(): string | null;
    get nickname(): string | null;
    get nicknameRaw(): string | null;
    get avatarThumb(): string | null;
    get followStatus(): number | null;
    get partitionId(): string | null;
    get partitionTitle(): string | null;
    get subPartitionId(): string | null;
    get subPartitionTitle(): string | null;
    get chatAuth(): boolean | null;
    get giftAuth(): boolean | null;
    get diggAuth(): boolean | null;
    get shareAuth(): boolean | null;
}
declare class UserLive2Filter extends JSONModel {
    get apiStatusCode(): number | null;
    get roomId(): string | null;
    get webRid(): string | null;
    get liveStatus(): number | null;
    get liveTitle(): string | null;
    get liveTitleRaw(): string | null;
    get userCount(): number | null;
    get createTime(): string;
    get finishTime(): string;
    get cover(): string | null;
    get streamId(): string | null;
    get resolutionName(): string | null;
    get flvPullUrl(): Record<string, string> | null;
    get hlsPullUrl(): Record<string, string> | null;
    get nickname(): string | null;
    get nicknameRaw(): string | null;
    get gender(): string | null;
    get genderRaw(): string | null;
    get signature(): string | null;
    get signatureRaw(): string | null;
    get avatarLarge(): string | null;
    get verified(): boolean | null;
    get city(): string | null;
    get followingCount(): number | null;
    get followerCount(): number | null;
    get secUid(): string | null;
}
declare class UserLiveStatusFilter extends JSONModel {
    get apiStatusCode(): number | null;
    get errorMsg(): string | null;
    get sceneId(): string | null;
    get liveStatus(): number | null;
    get roomId(): number | null;
    get roomIdStr(): string | null;
    get userId(): number | null;
    get userIdStr(): string | null;
}
declare class FollowingUserLiveFilter extends JSONModel {
    get statusCode(): number | null;
    get statusMsg(): string | null;
    get coverType(): number[] | null;
    get isRecommend(): boolean[] | null;
    get tagName(): string[] | null;
    get titleType(): number[] | null;
    get uniqId(): string[] | null;
    get webRid(): string[] | null;
    get cover(): string[] | null;
    get hasCommerceGoods(): boolean[] | null;
    get roomId(): string[] | null;
    get liveTitle(): string[] | null;
    get liveTitleRaw(): string[] | null;
    get liveRoomMode(): number[] | null;
    get mosaicStatus(): number[] | null;
    get userCount(): string[] | null;
    get likeCount(): number[] | null;
    get totalCount(): string[] | null;
    get avatarThumb(): string[] | null;
    get userId(): string[] | null;
    get userSecUid(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get flvPullUrl(): Record<string, string>[] | null;
    get hlsPullUrl(): Record<string, string>[] | null;
    get streamOrientation(): number[] | null;
    toList(): Record<string, unknown>[];
}
declare class LiveImFetchFilter extends JSONModel {
    get statusCode(): number | null;
    get isShowMsg(): boolean | null;
    get msgId(): string | null;
    get roomId(): string | null;
    get internalExt(): string | null;
    get cursor(): string | null;
    get now(): string;
}

declare class FriendFeedFilter extends JSONModel {
    get statusCode(): number | null;
    get statusMsg(): string | null;
    get toast(): string | null;
    get hasMore(): boolean;
    get hasAweme(): boolean;
    get friendUpdateCount(): number | null;
    get cursor(): number | null;
    get level(): number | null;
    get friendFeedType(): number[] | null;
    get friendFeedSource(): string[] | null;
    get avatarLarger(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get secUid(): string[] | null;
    get uid(): string[] | null;
    get awemeId(): string[] | null;
    get awemeType(): number[] | null;
    get caption(): string[] | null;
    get captionRaw(): string[] | null;
    get desc(): string[] | null;
    get descRaw(): string[] | null;
    get recommendReason(): string[] | null;
    get createTime(): string | string[];
    get is24Story(): boolean[] | null;
    get mediaType(): number[] | null;
    get collectCount(): number[] | null;
    get commentCount(): number[] | null;
    get diggCount(): number[] | null;
    get exposureCount(): number[] | null;
    get liveWatchCount(): number[] | null;
    get playCount(): number[] | null;
    get shareCount(): number[] | null;
    get allowShare(): boolean[] | null;
    get privateStatus(): number[] | null;
    get isProhibited(): boolean[] | null;
    get partSee(): number[] | null;
    get animatedCover(): (string | null)[];
    get cover(): string[] | null;
    get images(): (string[] | null)[];
    get imagesVideo(): (string[] | null)[];
    get videoPlayAddr(): string[][] | null;
    get musicId(): string[] | null;
    get musicMid(): string[] | null;
    get musicDuration(): number[] | null;
    get musicPlayUrl(): string[] | null;
    get musicOwnerNickname(): string[] | null;
    get musicOwnerNicknameRaw(): string[] | null;
    get musicSecUid(): string[] | null;
    get musicTitle(): string[] | null;
    get musicTitleRaw(): string[] | null;
    toList(): Record<string, unknown>[];
}

declare class HomePostSearchFilter extends JSONModel {
    get statusCode(): number | null;
    get hasAweme(): boolean;
    get statusMsg(): string | null;
    get hasMore(): boolean | null;
    get cursor(): number | null;
    get homeText(): string | null;
    get searchKeyword(): string | null;
    get searchId(): string;
    get userId(): string[] | null;
    get uniqueId(): string[] | null;
    get secUid(): string[] | null;
    get signature(): string[] | null;
    get signatureRaw(): string[] | null;
    get nickname(): string[] | null;
    get nicknameRaw(): string[] | null;
    get avatarLarger(): string[] | null;
    get awemeType(): number[] | null;
    get awemeId(): string[] | null;
    get caption(): string[] | null;
    get captionRaw(): string[] | null;
    get city(): string[] | null;
    get desc(): string[] | null;
    get descRaw(): string[] | null;
    get images(): (string[] | null)[];
    get imagesVideo(): (string[] | null)[];
    get musicId(): string[] | null;
    get musicIdStr(): string[] | null;
    get musicMid(): string[] | null;
    get musicDuration(): number[] | null;
    get musicPlayUrl(): string[] | null;
    get musicOwnerNickname(): string[] | null;
    get musicOwnerNicknameRaw(): string[] | null;
    get musicSecUid(): string[] | null;
    get musicTitle(): string[] | null;
    get musicTitleRaw(): string[] | null;
    get cover(): string[] | null;
    get dynamicCover(): string[] | null;
    get animatedCover(): (string | null)[];
    get videoPlayAddr(): string[][] | null;
    toList(): Record<string, unknown>[];
}
declare class SuggestWordFilter extends JSONModel {
    get statusMsg(): string | null;
    get suggestWordId(): string[] | null;
    get suggestWord(): string[] | null;
    toList(): Record<string, unknown>[];
}

/**
 * Handler types and interfaces
 */
interface HandlerConfig {
    cookie: string;
    headers?: Record<string, string>;
    proxies?: {
        http?: string;
        https?: string;
    };
    timeout?: number;
    maxCursor?: number;
    pageCounts?: number;
    maxCounts?: number;
    interval?: string;
    url?: string;
    folderize?: boolean;
}
interface PaginationOptions {
    maxCursor?: number;
    minCursor?: number;
    pageCounts?: number;
    maxCounts?: number;
}
interface FetchOptions {
    secUserId?: string;
    userId?: string;
    awemeId?: string;
    mixId?: string;
    collectsId?: string;
    webcastId?: string;
    roomId?: string;
    commentId?: string;
    keyword?: string;
    searchId?: string;
    offset?: number;
    cursor?: number;
    count?: number;
    level?: number;
    pullType?: number;
    sourceType?: number;
    minTime?: number;
    maxTime?: number;
    filterGids?: string;
}
type ModeType = 'one' | 'post' | 'like' | 'music' | 'collection' | 'collects' | 'mix' | 'live' | 'feed' | 'related' | 'friend';
declare const DY_LIVE_STATUS_MAPPING: Record<number, string>;
declare const IGNORE_FIELDS: string[];

/**
 * Mode Handler - 模式处理器
 * 对应 Python f2 项目 handler.py 中的 @mode_handler 装饰器
 */

type ModeHandlerFn<T = unknown> = (...args: unknown[]) => Promise<T> | AsyncGenerator<T, void, unknown>;
interface ModeHandlerConfig {
    mode: ModeType;
    description: string;
    handler: ModeHandlerFn;
}
/**
 * 注册模式处理器
 */
declare function registerModeHandler(config: ModeHandlerConfig): void;
/**
 * 获取模式处理器
 */
declare function getModeHandler(mode: ModeType): ModeHandlerConfig | undefined;
/**
 * 获取所有模式
 */
declare function getAllModes(): ModeType[];
/**
 * 模式处理器装饰器（用于类方法）
 */
declare function modeHandler(mode: ModeType, description?: string): <T extends (...args: unknown[]) => unknown>(_target: unknown, _propertyKey: string, descriptor: TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T>;
/**
 * 模式路由器 - 根据模式执行对应处理器
 */
declare class ModeRouter {
    private handlers;
    register(mode: ModeType, handler: ModeHandlerFn): void;
    execute<T>(mode: ModeType, ...args: unknown[]): Promise<T | null>;
    executeGenerator<T>(mode: ModeType, ...args: unknown[]): AsyncGenerator<T, void, unknown>;
    hasMode(mode: ModeType): boolean;
    getModes(): ModeType[];
}
/**
 * 模式名称映射
 */
declare const MODE_NAMES: Record<ModeType, string>;
/**
 * 获取模式描述
 */
declare function getModeDescription(mode: ModeType): string;
/**
 * 验证模式是否有效
 */
declare function isValidMode(mode: string): mode is ModeType;

/**
 * DouyinHandler - 抖音业务逻辑处理
 * 对应 Python f2 项目的 handler.py
 */

interface HandlerResult<T = Record<string, unknown>> {
    data: T | T[] | null;
    hasMore: boolean;
    cursor?: number;
    maxCursor?: number;
}
declare class DouyinHandler {
    private crawler;
    constructor(config: HandlerConfig);
    /**
     * 获取用户资料
     */
    fetchUserProfile(secUserId: string): Promise<UserProfileFilter>;
    /**
     * 获取单个作品详情
     */
    fetchOneVideo(awemeId: string): Promise<PostDetailFilter>;
    /**
     * 获取用户作品列表（生成器）
     */
    fetchUserPostVideos(secUserId: string, options?: PaginationOptions): AsyncGenerator<UserPostFilter, void, unknown>;
    /**
     * 获取用户喜欢列表（生成器）
     */
    fetchUserLikeVideos(secUserId: string, options?: PaginationOptions): AsyncGenerator<UserLikeFilter, void, unknown>;
    /**
     * 获取用户收藏列表（生成器）
     */
    fetchUserCollectionVideos(options?: PaginationOptions): AsyncGenerator<UserCollectionFilter, void, unknown>;
    /**
     * 获取用户收藏夹列表（生成器）
     */
    fetchUserCollects(options?: PaginationOptions): AsyncGenerator<UserCollectsFilter, void, unknown>;
    /**
     * 获取收藏夹作品（生成器）
     */
    fetchUserCollectsVideos(collectsId: string, options?: PaginationOptions): AsyncGenerator<UserCollectsFilter, void, unknown>;
    /**
     * 获取合集作品（生成器）
     */
    fetchUserMixVideos(mixId: string, options?: PaginationOptions): AsyncGenerator<UserMixFilter, void, unknown>;
    /**
     * 获取用户音乐收藏（生成器）
     */
    fetchUserMusicCollection(options?: PaginationOptions): AsyncGenerator<UserMusicCollectionFilter, void, unknown>;
    /**
     * 获取相关推荐作品（生成器）
     */
    fetchRelatedVideos(awemeId: string, options?: PaginationOptions): AsyncGenerator<PostRelatedFilter, void, unknown>;
    /**
     * 获取朋友作品（生成器）
     */
    fetchFriendFeedVideos(options?: PaginationOptions): AsyncGenerator<FriendFeedFilter, void, unknown>;
    /**
     * 获取用户直播信息
     */
    fetchUserLiveVideos(webRid: string, roomIdStr: string): Promise<UserLiveFilter>;
    /**
     * 获取用户直播信息2
     */
    fetchUserLiveVideos2(roomId: string): Promise<UserLive2Filter>;
    /**
     * 获取直播弹幕
     */
    fetchLiveImFetch(roomId: string, userUniqueId: string, cursor?: string, internalExt?: string): Promise<LiveImFetchFilter>;
    /**
     * 获取用户直播状态
     */
    fetchUserLiveStatus(userIds: string): Promise<UserLiveStatusFilter>;
    /**
     * 获取关注用户直播列表
     */
    fetchFollowingUserLive(): Promise<FollowingUserLiveFilter>;
    /**
     * 获取作品评论（生成器）
     */
    fetchPostComment(awemeId: string, options?: PaginationOptions): AsyncGenerator<PostCommentFilter, void, unknown>;
    /**
     * 获取评论回复（生成器）
     */
    fetchPostCommentReply(itemId: string, commentId: string, options?: PaginationOptions): AsyncGenerator<PostCommentReplyFilter, void, unknown>;
    /**
     * 主页作品搜索（生成器）
     */
    fetchHomePostSearch(keyword: string, fromUser: string, options?: PaginationOptions): AsyncGenerator<HomePostSearchFilter, void, unknown>;
    /**
     * 搜索建议词
     */
    fetchSuggestWords(query: string, count?: number): Promise<SuggestWordFilter>;
    /**
     * 获取用户关注列表（生成器）
     */
    fetchUserFollowing(secUserId: string, userId?: string, options?: PaginationOptions): AsyncGenerator<UserFollowingFilter, void, unknown>;
    /**
     * 获取用户粉丝列表（生成器）
     */
    fetchUserFollower(userId: string, secUserId: string, options?: PaginationOptions): AsyncGenerator<UserFollowerFilter, void, unknown>;
    /**
     * 查询用户
     */
    fetchQueryUser(secUserIds: string): Promise<QueryUserFilter>;
    /**
     * 获取作品统计
     */
    fetchPostStats(itemId: string, awemeType?: number, playDelta?: number): Promise<PostStatsFilter>;
    /**
     * 获取直播状态文本
     */
    getLiveStatusText(status: number): string;
}

declare function parseDouyinUrl(url: string): ParsedUrl;
declare function resolveShortUrl(_shortUrl: string): Promise<string>;
declare function extractAwemeId(url: string): string | null;

declare function genRandomStr(length: number): string;
declare function getTimestamp(): number;
declare function extractValidUrls(input: string): string | null;
declare function extractValidUrls(input: string[]): string[];
declare function splitFilename(filename: string, limits: Record<string, number>): string;
declare function toBase36(num: number): string;
declare function sleep(ms: number): Promise<void>;

declare function genRealMsToken(): Promise<string>;
declare function genFalseMsToken(): string;
declare function genTtwid(): Promise<string>;
declare function genWebid(): Promise<string>;
declare function getMsToken(): Promise<string>;

declare function genVerifyFp(): string;
declare function genSVWebId(): string;

declare function signWithXBogus(params: string, userAgent?: string): string;
declare function signWithABogus(params: string, body?: string, userAgent?: string): string;
declare function signEndpoint(baseEndpoint: string, params: Record<string, unknown>, body?: string): string;
declare function xbogusStr2Endpoint(userAgent: string, endpoint: string): string;
declare function xbogusModel2Endpoint(userAgent: string, baseEndpoint: string, params: Record<string, unknown>): string;
declare function abogusStr2Endpoint(userAgent: string, params: string, body?: string): string;
declare function abogusModel2Endpoint(userAgent: string, baseEndpoint: string, params: Record<string, unknown>, body?: string): string;

type DouyinUrlType = 'user' | 'video' | 'note' | 'mix' | 'live' | 'unknown';
interface ParsedDouyinUrl {
    type: DouyinUrlType;
    url: string;
    id: string | null;
    secUserId: string | null;
    awemeId: string | null;
    mixId: string | null;
    webcastId: string | null;
}
/**
 * 统一解析抖音链接，自动识别类型（会跟随重定向）
 */
declare function resolveDouyinUrl(url: string): Promise<ParsedDouyinUrl>;
declare function getSecUserId(url: string): Promise<string>;
declare function getAllSecUserId(urls: string[]): Promise<string[]>;
declare function getAwemeId(url: string): Promise<string>;
declare function getAllAwemeId(urls: string[]): Promise<string[]>;
declare function getMixId(url: string): Promise<string>;
declare function getAllMixId(urls: string[]): Promise<string[]>;
declare function getWebcastId(url: string): Promise<string>;
declare function getAllWebcastId(urls: string[]): Promise<string[]>;
declare function getRoomId(url: string): Promise<string>;
declare function getAllRoomId(urls: string[]): Promise<string[]>;

interface FormatFileNameOptions {
    create?: string;
    nickname?: string;
    awemeId?: string;
    desc?: string;
    caption?: string;
    uid?: string;
}
declare function formatFileName(namingTemplate: string, awemeData?: FormatFileNameOptions, customFields?: Record<string, string>): string;
interface CreateUserFolderOptions {
    path?: string;
    mode?: string;
}
declare function createUserFolder(options: CreateUserFolderOptions, nickname: string | number): string;
declare function renameUserFolder(oldPath: string, newNickname: string): string;
interface LocalUserData {
    nickname?: string;
}
declare function createOrRenameUserFolder(options: CreateUserFolderOptions, localUserData: LocalUserData, currentNickname: string): string;
interface LrcItem {
    text: string;
    timeId: string | number;
}
declare function json2Lrc(data: LrcItem[]): string;
declare function ensureDir(dirPath: string): void;
declare function fileExists(filePath: string): boolean;
declare function getDownloadPath(basePath: string, filename: string): string;

declare function formatBytes(bytes: number): string;
declare function sanitizeFilename(filename: string): string;
declare function formatTimestamp(timestamp: number): string;

interface XBogusResult {
    params: string;
    xbogus: string;
    userAgent: string;
}
declare function getXBogus(urlParams: string, userAgent?: string): XBogusResult;

declare function generateBrowserFingerprint(platform?: string): string;
interface ABogusResult {
    params: string;
    abogus: string;
    userAgent: string;
    body: string;
}
interface ABogusOptions {
    userAgent?: string;
    fingerprint?: string;
    options?: [number, number, number];
}
declare function getABogus(params: string, body?: string, opts?: ABogusOptions): ABogusResult;

declare function generateMsToken(length?: number): string;

export { type ABogusOptions, type ABogusResult, type AwemeData, type Config, ConfigSchema, type CreateUserFolderOptions, DEFAULT_USER_AGENT, DY_LIVE_STATUS_MAPPING, DouyinCrawler, type DouyinCrawlerConfig, DouyinDownloader, DouyinHandler, type DouyinUrlType, type DouyinUser, type DouyinVideo, type DownloadConfig, type DownloadProgress, type DownloadResult, type DownloadTask, ENDPOINTS, type FetchOptions, FollowingUserLiveFilter, type FormatFileNameOptions, FriendFeedFilter, type HandlerConfig, type HandlerResult, HomePostSearchFilter, IGNORE_FIELDS, type ImageInfo, JSONModel, LiveImFetchFilter, type LocalUserData, type LrcItem, MODE_NAMES, ModeRouter, type ModeType, type MusicData, type PaginationOptions, type ParsedDouyinUrl, type ParsedUrl, PostCommentFilter, PostCommentReplyFilter, PostDetailFilter, PostRelatedFilter, PostStatsFilter, type ProgressCallback, QueryUserFilter, SuggestWordFilter, UserCollectionFilter, UserCollectsFilter, UserFollowerFilter, UserFollowingFilter, UserLikeFilter, UserLive2Filter, UserLiveFilter, UserLiveStatusFilter, UserMixFilter, UserMusicCollectionFilter, UserPostFilter, UserProfileFilter, type VideoInfo, type VideoStatistics, type WebcastData, type XBogusResult, abogusModel2Endpoint, abogusStr2Endpoint, createOrRenameUserFolder, createUserFolder, ensureDir, extractAwemeId, extractValidUrls, fetchUserLikes, fetchUserPosts, fetchUserProfile, fetchVideoDetail, fileExists, filterToList, formatBytes, formatFileName, formatTimestamp, genFalseMsToken, genRandomStr, genRealMsToken, genSVWebId, genTtwid, genVerifyFp, genWebid, generateBrowserFingerprint, generateMsToken, getABogus, getAllAwemeId, getAllMixId, getAllModes, getAllRoomId, getAllSecUserId, getAllWebcastId, getAwemeId, getConfig, getDownloadPath, getEncryption, getMixId, getModeDescription, getModeHandler, getMsToken, getMsTokenConfig, getProxy, getReferer, getRoomId, getSecUserId, getTimestamp, getTtwidConfig, getUserAgent, getWebcastId, getWebidConfig, getXBogus, isValidMode, json2Lrc, modeHandler, parseDouyinUrl, registerModeHandler, renameUserFolder, replaceT, resolveDouyinUrl, resolveShortUrl, sanitizeFilename, setConfig, signEndpoint, signWithABogus, signWithXBogus, sleep, splitFilename, timestamp2Str, toBase36, xbogusModel2Endpoint, xbogusStr2Endpoint };
