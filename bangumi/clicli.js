// ==MiruExtension==
// @name         clicli
// @version      v0.0.1
// @author       shz
// @lang         zh-cn
// @license      MIT
// @package      clicli
// @type         bangumi
// @icon         https://www.clicli.pro/upload/mxprocms/20241031-1/3b497dacfbaaa13c9a4ef5bd3760c9ac.png
// @webSite      https://www.clicli.pro
// ==/MiruExtension==

export default class extends Extension {
  // 动漫列表 Anime List アニメのリスト
  async latest(page) {
    const res = await this.request(`/show/id/1/page/${page}.html`)
    const bangumiList = await this.querySelectorAll(res, 'div[class="module-items module-poster-items-base "] a')
    const bangumi = []
    for (let i = 0; i < bangumiList.length; i++) {
      const title = await this.queryXPath(bangumiList[i].content, '//div[@class="module-poster-item-title"]').text
      const cover = await this.queryXPath(bangumiList[i].content, '//img[@class="lazy lazyload"]/@data-original').attr
      const url = await this.queryXPath(bangumiList[i].content, '//a[@class="module-poster-item module-item"]/@href').attr
      const update = await this.queryXPath(bangumiList[i].content, '//div[@class="module-item-note"]').text
      bangumi.push({ title, cover, url, update })
    }
    return bangumi
  }

  // 动漫筛选 Anime Filter アニメのフィルタ
  async createFilter() {
    const filter = {
      years: { 
        title: "年份", 
        max: 1, 
        min: 0, 
        default: "", 
        options: { 
          "2000": "2000", "2001": "2001", "2002": "2002", "2003": "2003", "2004": "2004", "2005": "2005", "2006": "2006", "2007": "2007", "2008": "2008", "2009": "2009",
          "2010": "2010", "2011": "2011", "2012": "2012", "2013": "2013", "2014": "2014", "2015": "2015", "2016": "2016", "2017": "2017", "2018": "2018", "2019": "2019",
          "2020": "2020", "2021": "2021", "2022": "2022", "2023": "2023", "2024": "2024"
        }                                                                     
      },
      letters: { 
        title: "字母", 
        max: 1, 
        min: 0, 
        default: "", 
        options: { 
          "A": "A", "B": "B", "C": "C", "D": "D", "E": "E", "F": "F", "G": "G", "H": "H", "I": "I", "J": "J", "K": "K", "L": "L", "M": "M", 
          "N": "N", "O": "O", "P": "P", "Q": "Q", "R": "R", "S": "S", "T": "T", "U": "U", "V": "V", "W": "W", "X": "X", "Y": "Y", "Z": "Z", "0": "0-9" 
        }
      },
      sorts: { title: "排序", max: 1, min: 0, default: "", options: { "time": "时间排序", "hits": "人气排序", "score": "评分排序" } }
    }
    return filter
  }

  // 动漫搜索及过滤 Anime Search and filter アニメの検索とフィルタリング
  async search(kw, page, filter) {
    if(kw) {
      const res = await this.request(`/search/page/${page}/wd/${encodeURI(kw)}.html`)
      const bangumiList = await this.queryXPath(res, '//div[@class="module-items module-card-items"]/div').allHTML
      const bangumi = []
      for (let i = 0; i < bangumiList.length; i++) {
        const title = await this.queryXPath(bangumiList[i], '//div[@class="module-card-item-title"]/a/strong').text
        const coverMath = await this.queryXPath(bangumiList[i], '//img[@class="lazy lazyload"]/@data-original').attr
        const cover = coverMath.split('url=')[1]
        const url = await this.queryXPath(bangumiList[i], '//a[@class="module-card-item-poster"]/@href').attr
        const update = await this.queryXPath(bangumiList[i], '//div[@class="module-item-note"]').text
        bangumi.push({ title, cover, url, update })
      }
      return bangumi
    } else {
      const sort = filter?.sorts
      const letter = filter?.letters
      const year = filter?.years
      const filterRes = await this.request(`/show/by/${sort}/id/1/page/${page}/letter/${letter}/year/${year}.html`)
      const bangumiList = await this.querySelectorAll(filterRes, 'div[class="module-items module-poster-items-base "] a')
      const bangumi = []
      for (let i = 0; i < bangumiList.length; i++) {
        const title = await this.queryXPath(bangumiList[i].content, '//div[@class="module-poster-item-title"]').text
        const cover = await this.queryXPath(bangumiList[i].content, '//img[@class="lazy lazyload"]/@data-original').attr
        const url = await this.queryXPath(bangumiList[i].content, '//a[@class="module-poster-item module-item"]/@href').attr
        const update = await this.queryXPath(bangumiList[i].content, '//div[@class="module-item-note"]').text
        bangumi.push({ title, cover, url, update })
      }
      return bangumi
    }
  }

  // 动漫详情 Anime details アニメの詳細
  async detail(url) {
    const res = await this.request(`${url}`)
    const title = await this.queryXPath(res, '//div[@class="module-info-heading"]/h1').text
    const coverMath = await this.queryXPath(res, '//img[@class="ls-is-cached lazy lazyload"]/@data-original').attr
    const cover = coverMath.split('url=')[1]
    const desc = await this.queryXPath(res, '//div[@class="module-info-introduction-content"]/p').text
    const episodes = await this.queryXPath(res, '//div[@class="module-play-list-content  module-play-list-larger "]/a').allHTML
    const chapter = []
    for (let i = 0; i < episodes.length; i++) {
      chapter.push({
        name: await this.queryXPath(episodes[i], '//a[@class="module-play-list-link"]/span').text,
        url: await this.queryXPath(episodes[i], '//a[@class="module-play-list-link"]/@href').attr
      })
    }
    return { title, cover, desc, episodes: [{ title: "S线(卡顿换线路→)", urls: chapter }] }
  }

  // 动漫观看 Anime Watch アニメ視聴
  async watch(url) {
    const res = await this.request(`${url}`)
    const UserID = url.toString().split('/')[2]
    const urlBase = await this.queryXPath(res, '//div[@class="player-box-main"]').text
    const urlrequest = `/addons/dp/player/dp.php?key=0&from=&id=${UserID}&api=&url=` + JSON.parse(urlBase.slice(urlBase.indexOf('{'))).url.toString() + `&jump=`
    const res2 = await this.request(urlrequest)
    const VideoURL = await this.queryXPath(res2, '//body/script').text
    const URLMatch = VideoURL.match(/"url":\s*"([^"]+)"/)
    const AnimeURL = URLMatch[1].toString()
    return { type: "mp4", url: AnimeURL }
  }
}
