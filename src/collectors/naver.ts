import { seafoodCatalog, regions } from '../domain/seafood.ts'
export type SearchCandidate = {
  id: string; seafoodId: string; title: string; summary: string; sourceUrl: string
  bloggerName: string; publishedAt: string | null; collectedAt: string; searchRegions: string[]
  reviewStatus: 'candidate'; source: 'naver-blog'
}
export type CollectionRequest = { seafoodId: string; regions: string[] }
export interface PriceSource { collect(request: CollectionRequest): Promise<SearchCandidate[]> }
type BlogItem = { title: string; description: string; link: string; bloggername?: string; postdate?: string }
const plainText = (value: string) => value.replace(/<[^>]*>/g,'').replace(/&(amp|quot|lt|gt|apos);/g, (_,entity:string)=>({amp:'&',quot:'"',lt:'<',gt:'>',apos:"'"})[entity]!).replace(/&#(\d+);/g,(_,n:string)=>Number(n)<=0x10ffff ? String.fromCodePoint(Number(n)) : '').trim()
const regionTerms: Record<string,string> = {'서울특별시':'서울','경기도':'경기','부산광역시':'부산'}
export class NaverBlogCollector implements PriceSource {
  private credentials: {clientId:string;clientSecret:string}
  private transport: typeof fetch
  constructor(credentials: {clientId:string;clientSecret:string}, transport: typeof fetch = fetch) {
    if (!credentials.clientId.trim() || !credentials.clientSecret.trim()) throw new Error('NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정해주세요.')
    this.credentials=credentials; this.transport=transport
  }
  async collect(request:CollectionRequest): Promise<SearchCandidate[]> {
    const seafood=seafoodCatalog.find(item=>item.id===request.seafoodId)
    if (!seafood) throw new Error('등록되지 않은 수산물입니다.')
    if (!request.regions.length || request.regions.some(region=>!regions.includes(region))) throw new Error('서울특별시·경기도·부산광역시 중 검색 지역을 선택해주세요.')
    const candidates=new Map<string,SearchCandidate>()
    for (const region of [...new Set(request.regions)]) {
      for (const keyword of seafood.keywords) {
        const url=new URL('https://naverapihub.apigw.ntruss.com/search/v1/blog')
        url.search=new URLSearchParams({query:`${regionTerms[region]} ${keyword} 판매 kg 가격`,sort:'date',display:'30'}).toString()
        let response:Response
        try {
          response=await this.transport(url,{headers:{'X-NCP-APIGW-API-KEY-ID':this.credentials.clientId,'X-NCP-APIGW-API-KEY':this.credentials.clientSecret},signal:AbortSignal.timeout(15000)})
        } catch { throw new Error('블로그 검색 연결이 끊겼거나 시간이 초과됐습니다. 잠시 후 다시 실행해주세요.') }
        if (!response.ok) throw new Error(`네이버 검색 실패 (${response.status}). 401·403이면 키와 검색 권한, 429이면 사용 한도를 확인해주세요.`)
        const payload:unknown=await response.json().catch(()=>null)
        if (!payload || typeof payload!=='object' || !('items' in payload) || !Array.isArray(payload.items)) throw new Error('네이버 검색 응답을 확인하지 못했습니다.')
        for (const value of payload.items) {
          if (!value || typeof value!=='object') continue
          const item=value as BlogItem
          if (typeof item.title!=='string' || typeof item.description!=='string' || typeof item.link!=='string') continue
          let link:URL
          try {link=new URL(item.link)} catch {continue}
          if (!['http:','https:'].includes(link.protocol)) continue
          link.hash=''
          const sourceUrl=link.href
          const existing=candidates.get(sourceUrl)
          if (existing) {if (!existing.searchRegions.includes(region)) existing.searchRegions.push(region);continue}
          const date=item.postdate && /^\d{8}$/.test(item.postdate) ? `${item.postdate.slice(0,4)}-${item.postdate.slice(4,6)}-${item.postdate.slice(6,8)}` : null
          candidates.set(sourceUrl,{id:JSON.stringify([seafood.id,sourceUrl]),seafoodId:seafood.id,title:plainText(item.title),summary:plainText(item.description),sourceUrl,bloggerName:plainText(item.bloggername ?? ''),publishedAt:date,collectedAt:new Date().toISOString(),searchRegions:[region],reviewStatus:'candidate',source:'naver-blog'})
        }
      }
    }
    return [...candidates.values()]
  }
}
