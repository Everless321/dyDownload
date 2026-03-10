import { JSONModel } from './base.js'
import { replaceT, timestamp2Str, filterToList } from './utils.js'
import type { AwemeData } from '../downloader/types.js'

export class UserPostFilter extends JSONModel {
  get statusCode(): number | null {
    return this._getAttrValue('$.status_code')
  }

  get hasAweme(): boolean {
    return Boolean(this._getAttrValue('$.aweme_list'))
  }

  get locateItemCursor(): number | null {
    return this._getAttrValue('$.locate_item_cursor')
  }

  get awemeId(): string[] {
    const ids = this._getListAttrValue<string>('$.aweme_list[*].aweme_id') as string[] | null
    return ids || []
  }

  get awemeType(): number[] | null {
    return this._getListAttrValue('$.aweme_list[*].aweme_type') as number[] | null
  }

  get createTime(): string | string[] {
    const createTimes = this._getListAttrValue<number>('$.aweme_list[*].create_time') as number[] | null
    if (!createTimes) return []
    return timestamp2Str(createTimes.map(String))
  }

  get caption(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_list[*].caption')
    return raw ? replaceT(raw) : null
  }

  get captionRaw(): string | null {
    return this._getAttrValue('$.aweme_list[*].caption')
  }

  get desc(): string[] | null {
    const raw = this._getListAttrValue<string>('$.aweme_list[*].desc') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get descRaw(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].desc') as string[] | null
  }

  get uid(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].author.uid') as string[] | null
  }

  get secUserId(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].author.sec_uid') as string[] | null
  }

  get nickname(): string[] | null {
    const raw = this._getListAttrValue<string>('$.aweme_list[*].author.nickname') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get nicknameRaw(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].author.nickname') as string[] | null
  }

  get authorAvatarThumb(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].author.avatar_thumb.url_list[0]') as string[] | null
  }

  get images(): (string[] | null)[] {
    const imagesList = this._getListAttrValue<Record<string, unknown>[]>('$.aweme_list[*].images') as (Record<string, unknown>[] | null)[] | null
    if (!imagesList) return []

    return imagesList.map(images => {
      if (!images) return null
      return images
        .filter((img): img is Record<string, unknown> =>
          typeof img === 'object' && img !== null && 'url_list' in img
        )
        .map(img => {
          const urlList = img.url_list as string[]
          return urlList?.[0] || null
        })
        .filter((url): url is string => url !== null)
    })
  }

  get imagesVideo(): (string[])[] {
    const imagesVideoList = this._getListAttrValue<Record<string, unknown>[]>('$.aweme_list[*].images') as (Record<string, unknown>[] | null)[] | null
    if (!imagesVideoList) return []

    return imagesVideoList.map(images => {
      if (!images) return []
      return images
        .filter((img): img is Record<string, unknown> =>
          typeof img === 'object' && img !== null && img.video != null
        )
        .map(img => {
          const video = img.video as Record<string, unknown>
          const playAddr = video?.play_addr as Record<string, unknown>
          const urlList = playAddr?.url_list as string[]
          return urlList?.[0] || null
        })
        .filter((url): url is string => url !== null)
    })
  }

  get animatedCover(): (string | null)[] {
    const videos = this._getListAttrValue<Record<string, unknown>>('$.aweme_list[*].video') as Record<string, unknown>[] | null
    if (!videos) return []

    return videos.map(video => {
      if (!video) return null
      const animatedCover = video.animated_cover as Record<string, unknown> | undefined
      if (!animatedCover) return null
      const urlList = animatedCover.url_list as string[] | undefined
      return urlList?.[0] || null
    })
  }

  get dynamicCover(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].video.dynamic_cover.url_list[0]') as string[] | null
  }

  get cover(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].video.origin_cover.url_list[0]') as string[] | null
  }

  get videoPlayAddr(): string[][] | null {
    return this._getListAttrValue('$.aweme_list[*].video.bit_rate[0].play_addr.url_list') as string[][] | null
  }

  get videoBitRate(): number[][] {
    const bitRateData = this._getListAttrValue<Record<string, unknown>[]>('$.aweme_list[*].video.bit_rate') as (Record<string, unknown>[] | null)[] | null
    if (!bitRateData) return []

    return bitRateData.map(aweme => {
      if (!aweme) return []
      if (!Array.isArray(aweme)) {
        return [(aweme as Record<string, unknown>).bit_rate as number || 0]
      }
      return aweme.map(item => (item as Record<string, unknown>).bit_rate as number || 0)
    })
  }

  get videoDuration(): number[] | null {
    return this._getListAttrValue('$.aweme_list[*].video.duration') as number[] | null
  }

  get partSee(): number[] | null {
    return this._getListAttrValue('$.aweme_list[*].status.part_see') as number[] | null
  }

  get privateStatus(): number[] | null {
    return this._getListAttrValue('$.aweme_list[*].status.private_status') as number[] | null
  }

  get isProhibited(): boolean[] | null {
    return this._getListAttrValue('$.aweme_list[*].status.is_prohibited') as boolean[] | null
  }

  get authorDeleted(): boolean[] | null {
    return this._getListAttrValue('$.aweme_list[*].music.author_deleted') as boolean[] | null
  }

  get musicStatus(): number[] | null {
    return this._getListAttrValue('$.aweme_list[*].music.status') as number[] | null
  }

  get musicTitle(): string[] | null {
    const raw = this._getListAttrValue<string>('$.aweme_list[*].music.title') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get musicTitleRaw(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].music.title') as string[] | null
  }

  get musicPlayUrl(): string[] | null {
    return this._getListAttrValue('$.aweme_list[*].music.play_url.url_list[0]') as string[] | null
  }

  get hasMore(): boolean {
    return Boolean(this._getAttrValue('$.has_more'))
  }

  get maxCursor(): number | null {
    return this._getAttrValue('$.max_cursor')
  }

  get minCursor(): number | null {
    return this._getAttrValue('$.min_cursor')
  }

  toList(): Record<string, unknown>[] {
    return filterToList(this, {
      entriesPath: '$.aweme_list',
      excludeFields: [
        'statusCode', 'hasMore', 'maxCursor', 'minCursor', 'hasAweme', 'locateItemCursor'
      ],
      extraFields: ['statusCode', 'hasMore', 'maxCursor', 'minCursor']
    })
  }

  /**
   * 转换为 AwemeData 数组，方便直接传给 downloader
   */
  toAwemeDataList(): AwemeData[] {
    const awemeIds = this.awemeId || []
    const awemeTypes = this.awemeType || []
    const secUserIds = this.secUserId || []
    const nicknames = this.nickname || []
    const uids = this.uid || []
    const descs = this.desc || []
    const descRaws = this.descRaw || []
    const createTimes = this.createTime
    const covers = this.cover || []
    const animatedCovers = this.animatedCover || []
    const dynamicCovers = this.dynamicCover || []
    const videoPlayAddrs = this.videoPlayAddr || []
    const images = this.images || []
    const imagesVideo = this.imagesVideo || []
    const musicPlayUrls = this.musicPlayUrl || []
    const musicStatuses = this.musicStatus || []
    const isProhibiteds = this.isProhibited || []
    const privateStatuses = this.privateStatus || []

    return awemeIds.map((awemeId, i): AwemeData => ({
      awemeId,
      awemeType: awemeTypes[i] ?? 0,
      secUserId: secUserIds[i] ?? '',
      nickname: nicknames[i] ?? '',
      uid: uids[i] ?? '',
      desc: descs[i] ?? '',
      descRaw: descRaws[i] ?? '',
      createTime: Array.isArray(createTimes) ? createTimes[i] : createTimes,
      cover: covers[i] ?? undefined,
      animatedCover: animatedCovers[i] ?? undefined,
      dynamicCover: dynamicCovers[i] ?? undefined,
      videoPlayAddr: videoPlayAddrs[i]?.[0] ?? undefined,
      images: images[i] ?? undefined,
      imagesVideo: imagesVideo[i] ?? undefined,
      musicPlayUrl: musicPlayUrls[i] ?? undefined,
      musicStatus: musicStatuses[i] ?? 0,
      isProhibited: isProhibiteds[i] ?? false,
      privateStatus: privateStatuses[i] ?? 0,
    }))
  }
}

export class UserCollectionFilter extends UserPostFilter {
  override get maxCursor(): number | null {
    return this._getAttrValue('$.cursor')
  }
}

export class UserMixFilter extends UserPostFilter {
  override get maxCursor(): number | null {
    return this._getAttrValue('$.cursor')
  }
}

export class UserLikeFilter extends UserPostFilter {}

export class PostRelatedFilter extends UserPostFilter {}

export class UserCollectsFilter extends JSONModel {
  get maxCursor(): number | null {
    return this._getAttrValue('$.cursor')
  }

  get statusCode(): number | null {
    return this._getAttrValue('$.status_code')
  }

  get collectsTotalNumber(): number | null {
    return this._getAttrValue('$.total_number')
  }

  get hasMore(): boolean {
    return Boolean(this._getAttrValue('$.has_more'))
  }

  get appId(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].app_id') as string[] | null
  }

  get collectsCover(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].collects_cover.url_list[0]') as string[] | null
  }

  get collectsId(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].collects_id') as string[] | null
  }

  get collectsName(): string[] | null {
    const raw = this._getListAttrValue<string>('$.collects_list[*].collects_name') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get collectsNameRaw(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].collects_name') as string[] | null
  }

  get createTime(): string | string[] {
    const createTimes = this._getListAttrValue<number>('$.collects_list[*].create_time') as number[] | null
    if (!createTimes) return []
    return timestamp2Str(createTimes.map(String))
  }

  get followStatus(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].follow_status') as number[] | null
  }

  get followedCount(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].followed_count') as number[] | null
  }

  get isNormalStatus(): boolean[] | null {
    return this._getListAttrValue('$.collects_list[*].is_normal_status') as boolean[] | null
  }

  get itemType(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].item_type') as number[] | null
  }

  get lastCollectTime(): string | string[] {
    const times = this._getListAttrValue<number>('$.collects_list[*].last_collect_time') as number[] | null
    if (!times) return []
    return timestamp2Str(times.map(String))
  }

  get playCount(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].play_count') as number[] | null
  }

  get states(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].states') as number[] | null
  }

  get status(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].status') as number[] | null
  }

  get systemType(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].system_type') as number[] | null
  }

  get totalNumber(): number[] | null {
    return this._getListAttrValue('$.collects_list[*].total_number') as number[] | null
  }

  get userId(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].user_id') as string[] | null
  }

  get nickname(): string[] | null {
    const raw = this._getListAttrValue<string>('$.collects_list[*].user_info.nickname') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get nicknameRaw(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].user_info.nickname') as string[] | null
  }

  get uid(): string[] | null {
    return this._getListAttrValue('$.collects_list[*].user_info.uid') as string[] | null
  }
}

export class UserMusicCollectionFilter extends JSONModel {
  get maxCursor(): number | null {
    return this._getAttrValue('$.cursor')
  }

  get hasMore(): boolean | null {
    return this._getAttrValue('$.has_more')
  }

  get statusCode(): number | null {
    return this._getAttrValue('$.status_code')
  }

  get msg(): string | null {
    return this._getAttrValue('$.msg')
  }

  get album(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].album') as string[] | null
  }

  get auditionDuration(): number[] | null {
    return this._getListAttrValue('$.mc_list[*].audition_duration') as number[] | null
  }

  get duration(): number[] | null {
    return this._getListAttrValue('$.mc_list[*].duration') as number[] | null
  }

  get author(): string[] | null {
    const raw = this._getListAttrValue<string>('$.mc_list[*].author') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get authorRaw(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].author') as string[] | null
  }

  get collectStatus(): number[] | null {
    return this._getListAttrValue('$.mc_list[*].collect_stat') as number[] | null
  }

  get musicStatus(): number[] | null {
    return this._getListAttrValue('$.mc_list[*].music_status') as number[] | null
  }

  get coverHd(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].cover_hd.url_list[0]') as string[] | null
  }

  get musicId(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].id') as string[] | null
  }

  get mid(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].mid') as string[] | null
  }

  get isCommerceMusic(): boolean[] | null {
    return this._getListAttrValue('$.mc_list[*].is_commerce_music') as boolean[] | null
  }

  get isOriginal(): boolean[] | null {
    return this._getListAttrValue('$.mc_list[*].is_original') as boolean[] | null
  }

  get isOriginalSound(): boolean[] | null {
    return this._getListAttrValue('$.mc_list[*].is_original_sound') as boolean[] | null
  }

  get lyricType(): number[] | null {
    return this._getListAttrValue('$.mc_list[*].lyric_type') as number[] | null
  }

  get lyricUrl(): (string | null)[] {
    const data = this._data as { mc_list?: { lyric_url?: string }[] }
    const mcList = data.mc_list || []
    return mcList.map(item => item.lyric_url || null)
  }

  get playUrl(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].play_url.url_list[0]') as string[] | null
  }

  get title(): string[] | null {
    const raw = this._getListAttrValue<string>('$.mc_list[*].title') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get titleRaw(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].title') as string[] | null
  }

  get strongBeatUrl(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].strong_beat_url.url_list[0]') as string[] | null
  }

  get ownerNickname(): string[] | null {
    const raw = this._getListAttrValue<string>('$.mc_list[*].owner_nickname') as string[] | null
    return raw ? replaceT(raw) : null
  }

  get ownerNicknameRaw(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].owner_nickname') as string[] | null
  }

  get ownerId(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].owner_id') as string[] | null
  }

  get secUid(): string[] | null {
    return this._getListAttrValue('$.mc_list[*].sec_uid') as string[] | null
  }

  toList(): Record<string, unknown>[] {
    return filterToList(this, {
      entriesPath: '$.mc_list',
      excludeFields: ['hasMore', 'maxCursor', 'statusCode', 'msg'],
      extraFields: ['hasMore', 'maxCursor', 'statusCode', 'msg']
    })
  }
}

export class PostDetailFilter extends JSONModel {
  get apiStatusCode(): number | null {
    return this._getAttrValue('$.status_code')
  }

  get awemeType(): number | null {
    return this._getAttrValue('$.aweme_detail.aweme_type')
  }

  get awemeId(): string | null {
    return this._getAttrValue('$.aweme_detail.aweme_id')
  }

  get nickname(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.author.nickname')
    return raw ? replaceT(raw) : null
  }

  get nicknameRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.author.nickname')
  }

  get secUserId(): string | null {
    return this._getAttrValue('$.aweme_detail.author.sec_uid')
  }

  get shortId(): string | null {
    return this._getAttrValue('$.aweme_detail.author.short_id')
  }

  get uid(): string | null {
    return this._getAttrValue('$.aweme_detail.author.uid')
  }

  get uniqueId(): string | null {
    return this._getAttrValue('$.aweme_detail.author.unique_id')
  }

  get canComment(): boolean | null {
    return this._getAttrValue('$.aweme_detail.aweme_control.can_comment')
  }

  get canForward(): boolean | null {
    return this._getAttrValue('$.aweme_detail.aweme_control.can_forward')
  }

  get canShare(): boolean | null {
    return this._getAttrValue('$.aweme_detail.aweme_control.can_share')
  }

  get canShowComment(): boolean | null {
    return this._getAttrValue('$.aweme_detail.aweme_control.can_show_comment')
  }

  get commentGid(): string | null {
    return this._getAttrValue('$.aweme_detail.comment_gid')
  }

  get createTime(): string {
    const ts = this._getAttrValue<number>('$.aweme_detail.create_time')
    return timestamp2Str(String(ts)) as string
  }

  get caption(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.caption')
    return raw ? replaceT(raw) : null
  }

  get captionRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.caption')
  }

  get desc(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.desc')
    return raw ? replaceT(raw) : null
  }

  get descRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.desc')
  }

  get duration(): number | null {
    return this._getAttrValue('$.aweme_detail.duration')
  }

  get isAds(): boolean | null {
    return this._getAttrValue('$.aweme_detail.is_ads')
  }

  get isStory(): boolean | null {
    return this._getAttrValue('$.aweme_detail.is_story')
  }

  get isTop(): boolean | null {
    return this._getAttrValue('$.aweme_detail.is_top')
  }

  get partSee(): number | null {
    return this._getAttrValue('$.aweme_detail.status.part_see')
  }

  get privateStatus(): number | null {
    return this._getAttrValue('$.aweme_detail.status.private_status')
  }

  get isDelete(): boolean | null {
    return this._getAttrValue('$.aweme_detail.status.is_delete')
  }

  get isProhibited(): boolean | null {
    return this._getAttrValue('$.aweme_detail.status.is_prohibited')
  }

  get mediaType(): number | null {
    return this._getAttrValue('$.aweme_detail.media_type')
  }

  get mixDesc(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.mix_info.mix_desc')
    return raw ? replaceT(raw) : null
  }

  get mixDescRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.mix_info.mix_desc')
  }

  get mixCreateTime(): string {
    const ts = this._getAttrValue<number>('$.aweme_detail.mix_info.mix_create_time')
    return timestamp2Str(String(ts)) as string
  }

  get mixId(): string | null {
    return this._getAttrValue('$.aweme_detail.mix_info.mix_id')
  }

  get mixName(): string | null {
    return this._getAttrValue('$.aweme_detail.mix_info.mix_name')
  }

  get mixPicType(): number | null {
    return this._getAttrValue('$.aweme_detail.mix_info.mix_pic_type')
  }

  get mixType(): number | null {
    return this._getAttrValue('$.aweme_detail.mix_info.mix_type')
  }

  get mixShareUrl(): string | null {
    return this._getAttrValue('$.aweme_detail.mix_info.mix_share_url')
  }

  get mixUpdateTime(): string {
    const ts = this._getAttrValue<number>('$.aweme_detail.mix_info.mix_update_time')
    return timestamp2Str(String(ts)) as string
  }

  get isCommerceMusic(): boolean | null {
    return this._getAttrValue('$.aweme_detail.music.is_commerce_music')
  }

  get isOriginal(): boolean | null {
    return this._getAttrValue('$.aweme_detail.music.is_original')
  }

  get isOriginalSound(): boolean | null {
    return this._getAttrValue('$.aweme_detail.music.is_original_sound')
  }

  get isPgc(): boolean | null {
    return this._getAttrValue('$.aweme_detail.music.is_pgc')
  }

  get musicAuthor(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.music.author')
    return raw ? replaceT(raw) : null
  }

  get musicAuthorRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.music.author')
  }

  get musicAuthorDeleted(): boolean | null {
    return this._getAttrValue('$.aweme_detail.music.author_deleted')
  }

  get musicDuration(): number | null {
    return this._getAttrValue('$.aweme_detail.music.duration')
  }

  get musicId(): string | null {
    return this._getAttrValue('$.aweme_detail.music.id')
  }

  get musicMid(): string | null {
    return this._getAttrValue('$.aweme_detail.music.mid')
  }

  get pgcAuthor(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.music.matched_pgc_sound.pgc_author')
    return raw ? replaceT(raw) : null
  }

  get pgcAuthorRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.music.matched_pgc_sound.pgc_author')
  }

  get pgcAuthorTitle(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.music.matched_pgc_sound.pgc_author_title')
    return raw ? replaceT(raw) : null
  }

  get pgcAuthorTitleRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.music.matched_pgc_sound.pgc_author_title')
  }

  get pgcMusicType(): number | null {
    return this._getAttrValue('$.aweme_detail.music.matched_pgc_sound.pgc_music_type')
  }

  get musicStatus(): number | null {
    return this._getAttrValue('$.aweme_detail.music.status')
  }

  get musicOwnerHandle(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.music.owner_handle')
    return raw ? replaceT(raw) : null
  }

  get musicOwnerHandleRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.music.owner_handle')
  }

  get musicOwnerId(): string | null {
    return this._getAttrValue('$.aweme_detail.music.owner_id')
  }

  get musicOwnerNickname(): string | null {
    const raw = this._getAttrValue<string>('$.aweme_detail.music.owner_nickname')
    return raw ? replaceT(raw) : null
  }

  get musicOwnerNicknameRaw(): string | null {
    return this._getAttrValue('$.aweme_detail.music.owner_nickname')
  }

  get musicPlayUrl(): string | null {
    return this._getAttrValue('$.aweme_detail.music.play_url.url_list[0]')
  }

  get position(): string | null {
    return this._getAttrValue('$.aweme_detail.position')
  }

  get region(): string | null {
    return this._getAttrValue('$.aweme_detail.region')
  }

  get seoOcrContent(): string | null {
    return this._getAttrValue('$.aweme_detail.seo_info.seo_ocr_content')
  }

  get allowDouplus(): boolean | null {
    return this._getAttrValue('$.aweme_detail.video_control.allow_douplus')
  }

  get downloadSetting(): number | null {
    return this._getAttrValue('$.aweme_detail.video_control.download_setting')
  }

  get allowShare(): boolean | null {
    return this._getAttrValue('$.aweme_detail.video_control.allow_share')
  }

  get admireCount(): number | null {
    return this._getAttrValue('$.aweme_detail.statistics.admire_count')
  }

  get collectCount(): number | null {
    return this._getAttrValue('$.aweme_detail.statistics.collect_count')
  }

  get commentCount(): number | null {
    return this._getAttrValue('$.aweme_detail.statistics.comment_count')
  }

  get diggCount(): number | null {
    return this._getAttrValue('$.aweme_detail.statistics.digg_count')
  }

  get shareCount(): number | null {
    return this._getAttrValue('$.aweme_detail.statistics.share_count')
  }

  get hashtagIds(): string[] | null {
    return this._getListAttrValue('$.aweme_detail.text_extra[*].hashtag_id', true) as string | null
      ? JSON.parse(this._getListAttrValue('$.aweme_detail.text_extra[*].hashtag_id', true) as string)
      : null
  }

  get hashtagNames(): string[] | null {
    return this._getListAttrValue('$.aweme_detail.text_extra[*].hashtag_name', true) as string | null
      ? JSON.parse(this._getListAttrValue('$.aweme_detail.text_extra[*].hashtag_name', true) as string)
      : null
  }

  get animatedCover(): string | null {
    return this._getAttrValue('$.aweme_detail.video.animated_cover.url_list[0]')
  }

  get dynamicCover(): string | null {
    return this._getAttrValue('$.aweme_detail.video.dynamic_cover.url_list[0]')
  }

  get cover(): string | null {
    return this._getAttrValue('$.aweme_detail.video.origin_cover.url_list[0]')
  }

  get videoBitRate(): number[][] {
    const bitRateData = this._getListAttrValue<Record<string, unknown>>('$.aweme_detail.video.bit_rate') as Record<string, unknown>[] | null
    if (!bitRateData) return []

    return bitRateData.map(aweme => {
      if (!aweme) return []
      if (!Array.isArray(aweme)) {
        return [(aweme as Record<string, unknown>).bit_rate as number || 0]
      }
      return aweme.map(item => (item as Record<string, unknown>).bit_rate as number || 0)
    })
  }

  get videoPlayAddr(): string[] | null {
    return this._getAttrValue('$.aweme_detail.video.bit_rate[0].play_addr.url_list')
  }

  get images(): string[] | null {
    return this._getListAttrValue('$.aweme_detail.images[*].url_list[0]') as string[] | null
  }

  get imagesVideo(): string[] | null {
    return this._getListAttrValue('$.aweme_detail.images[*].video.play_addr.url_list[0]') as string[] | null
  }

  /**
   * 转换为 AwemeData，方便直接传给 downloader
   */
  toAwemeData(): AwemeData {
    return {
      awemeId: this.awemeId || '',
      awemeType: this.awemeType || 0,
      secUserId: this.secUserId || '',
      nickname: this.nickname || '',
      uid: this.uid || '',
      desc: this.desc || '',
      descRaw: this.descRaw || '',
      createTime: this.createTime,
      cover: this.cover || undefined,
      animatedCover: this.animatedCover || undefined,
      dynamicCover: this.dynamicCover || undefined,
      videoPlayAddr: this.videoPlayAddr?.[0] || undefined,
      images: this.images || undefined,
      imagesVideo: this.imagesVideo || undefined,
      musicPlayUrl: this.musicPlayUrl || undefined,
      musicStatus: this.musicStatus || 0,
      isProhibited: this.isProhibited || false,
      privateStatus: this.privateStatus || 0,
    }
  }
}

export class PostStatsFilter extends JSONModel {
  get statusCode(): number | null {
    return this._getAttrValue('$.status_code')
  }

  get statusMsg(): string | null {
    return this._getAttrValue('$.status_msg')
  }
}
