// ==MiruExtension==
// @name         樱花动漫
// @version      v0.0.1
// @author       shz
// @lang         zh-cn
// @license      MIT
// @package      sakuraAnime
// @type         bangumi
// @icon         https://www.yhdm28.com/upload/site/20241112-1/537557b08fa40391239285cedb233998.png
// @webSite      https://www.yhdm28.com
// ==/MiruExtension==

export default class extends Extension {
  // 动漫列表 Anime List アニメのリスト
  async latest(page) {
    const res = await this.request(`/index.php/vod/show/id/1/page/${page}.html`)
    const bangumiList = await this.querySelectorAll(res, 'ul[class="vodlist vodlist_wi author*qq3626/95/000 clearfix"] li')
    const bangumi = []
    for (let i = 0; i < bangumiList.length; i++) {
      const title = await this.queryXPath(bangumiList[i].content, '//p[@class="vodlist_title"]/a').text
      const cover = 'https://www.yhdm28.com' + await this.queryXPath(bangumiList[i].content, '//a[@class="vodlist_thumb lazyload"]/@data-original').attr
      const url = await this.queryXPath(bangumiList[i].content, '//a[@class="vodlist_thumb lazyload"]/@href').attr
      const update = await this.queryXPath(bangumiList[i].content, '//span[@class="pic_text text_right"]').text
      bangumi.push({ title, cover, url, update })
    }
    return bangumi
  }

  // 动漫搜索 Anime Search アニメ検索
  async search(kw, page) {
    const res = await this.request(`/index.php/vod/search/page/${page}/wd/${encodeURI(kw)}.html`)
    const bangumiList = await this.queryXPath(res, '//ul[@class="vodlist clearfix"]/li').allHTML
    const bangumi = []
    for (let i = 0; i < bangumiList.length; i++) {
      const title = await this.queryXPath(bangumiList[i], '//h4[@class="vodlist_title"]/a').text
      const cover = 'https://www.yhdm28.com' + await this.queryXPath(bangumiList[i], '//a[@class="vodlist_thumb lazyload"]/@data-original').attr
      const url = await this.queryXPath(bangumiList[i], '//a[@class="vodlist_thumb lazyload"]/@href').attr
      const update = await this.queryXPath(bangumiList[i], '//span[@class="pic_text text_right"]').text
      bangumi.push({ title, cover, url, update })
    }
    return bangumi;
  }

  // 动漫详情 Anime details アニメの詳細
  async detail(url) {
    const urlbase = "https://www.yhdm28.com"
    const res = await this.request(`${url}`)
    const title = await this.queryXPath(res, '//h2[@class="title"]').text
    const cover = urlbase + await this.queryXPath(res, '//a[@class="vodlist_thumb lazyload"]/@data-original').attr
    const desc = await this.queryXPath(res, '//div[@class="content_desc full_text clearfix"]/span').text
    const episodes = await this.queryXPath(res, '//div[@class="play_list_box hide show"]/div[@class="playlist_full"]/ul/li').allHTML
    const chapter = []
    for (let i = 0; i < episodes.length; i++) {
      chapter.push({
        name: await this.queryXPath(episodes[i], '//a').text,
        url: await this.queryXPath(episodes[i], '//a/@href').attr
      })
    }
    return { title, cover, desc, episodes: [{ title:"线路一", urls: chapter }] }
  }

  // 动漫观看 Anime Watch アニメ視聴
  async watch(url) {
    const res = await this.request(`${url}`)
    const BaseURL = await this.queryXPath(res, '//div[@class="player_video embed-responsive embed-responsive-16by9 author-qq362695000 clearfix"]').text
    const match = BaseURL.match(/"url":\s*"([^"]+)"/)
    const AnimeURL = match[1].replace(/\\/g, '').toString()
    return { type: "hls", url: AnimeURL }
  }
}
