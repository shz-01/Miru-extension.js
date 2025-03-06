// ==MiruExtension==
// @name         anfuns
// @version      v0.0.1
// @author       shz
// @lang         zh-cn
// @license      MIT
// @package      anfuns
// @type         bangumi
// @icon         https://bj.bcebos.com/baidu-rmb-video-cover-1/5ee4430fb861be3720fff38c377c0873.png
// @webSite      https://www.anfuns.org/
// ==/MiruExtension==

export default class extends Extension {
  // 动漫列表 Anime List アニメのリスト
  async latest(page) {
    const res = await this.request(`/type/1-${page}.html`)
    const bangumiList = await this.querySelectorAll(res, 'ul[class="hl-vod-list clearfix"] li')
    const bangumi = []
    for (let i = 0; i < bangumiList.length; i++) {
      const title = await this.queryXPath(bangumiList[i].content, '//div[@class="hl-item-title hl-text-site hl-lc-1"]/a').text
      const cover = await this.queryXPath(bangumiList[i].content, '//a[@class="hl-item-thumb hl-lazy"]/@data-original').attr
      const url = await this.queryXPath(bangumiList[i].content, '//a[@class="hl-item-thumb hl-lazy"]/@href').attr
      const update = await this.queryXPath(bangumiList[i].content, '//div[@class="hl-pic-text"]/span').text
      bangumi.push({ title, cover, url, update })
    }
    return bangumi
  }

  // 动漫搜索 Anime Search アニメ検索
  async search(kw, page) {
    const res = await this.request(`/search/page/${page}/wd/${encodeURI(kw)}.html`)
    const bangumiList = await this.queryXPath(res, '//ul[@class="hl-one-list hl-theme-by362695000 clearfix"]/li').allHTML
    const bangumi = []
    for (let i = 0; i < bangumiList.length; i++) {
      const title = await this.queryXPath(bangumiList[i], '//div[@class="hl-item-title hl-text-site hl-lc-2"]/a').text
      const cover = await this.queryXPath(bangumiList[i], '//a[@class="hl-item-thumb hl-lazy"]/@data-original').attr
      const url = await this.queryXPath(bangumiList[i], '//a[@class="hl-item-thumb hl-lazy"]/@href').attr
      const update = await this.queryXPath(bangumiList[i], '//div[@class="hl-pic-text"]/span').text
      bangumi.push({ title, cover, url, update })
    }
    return bangumi;
  }

  // 动漫详情 Anime details アニメの詳細
  async detail(url) {
    const res = await this.request(`${url}`)
    const title = await this.queryXPath(res, '//div[@class="hl-dc-headwrap"]/h2').text
    const cover = await this.queryXPath(res, '//span[@class="hl-item-thumb hl-lazy"]/@data-original').attr
    const desc = await this.queryXPath(res, '//li[@class="hl-col-xs-12 blurb"]').text
    const episodes = await this.queryXPath(res, '//ul[@class="hl-plays-list hl-sort-list clearfix"]/li').allHTML
    const chapter = []
    for (let i = 0; i < episodes.length; i++) {
      chapter.push({
        name: await this.queryXPath(episodes[i], '//li[@class="hl-col-xs-4 hl-col-sm-2"]/a').text,
        url: await this.queryXPath(episodes[i], '//li[@class="hl-col-xs-4 hl-col-sm-2"]/a/@href').attr
      })
    }
    return { title, cover, desc, episodes: [{ title: "播放列表①", urls: chapter }] }
  }

  // 动漫观看 Anime Watch アニメ視聴
  // -- 此模块未完成 --
  async watch(url) {
    const res = await this.request(`${url}`)
    const AnimeURL = await this.querySelectorAll(res, 'div[class="MacPlayer"]')
    console.log(AnimeURL);
    return { type: "mp4", url: AnimeURL }
  }
}
