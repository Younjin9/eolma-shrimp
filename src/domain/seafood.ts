export type SeafoodDefinition = { id: string; label: string; liveLabel: string; keywords: string[] }
export const seafoodCatalog: SeafoodDefinition[] = [
  { id: 'shrimp', label: '새우', liveLabel: '활새우', keywords: ['활새우', '활 흰다리새우', '활 대하'] },
  { id: 'gizzard-shad', label: '전어', liveLabel: '활전어', keywords: ['활전어', '전어 활어'] },
  { id: 'yellowtail', label: '방어', liveLabel: '활방어', keywords: ['활방어', '방어 활어'] },
]
export const regions = ['서울특별시', '경기도', '부산광역시']
export type Market = { id: string; name: string; region: string; district: string; address: string }
export type SellerData = { id: string; name: string; marketId: string; location: string; phone?: string; openingHours?: string; visitPurchase: boolean | null; shipping: boolean | null }
export class Seller {
  readonly data: SellerData
  constructor(data: SellerData) { this.data = { ...data } }
}
export type ProductData = { id: string; seafoodId: string; species: string; origin: string; condition: string; size: string }
export class SeafoodProduct {
  readonly data: ProductData
  constructor(data: ProductData) { this.data = { ...data } }
}
export type PriceRecordData = {
  id: string; sellerId: string; productId: string; price: number; weightGrams: number | null; unit: string
  reviewStatus: 'candidate' | 'reviewed'; observedAt?: string | null; publishedAt?: string | null
  sourceLabel: string; dateLabel: string; sourceDescription: string; sourceUrl?: string; note: string
}
export class PriceRecord {
  readonly data: PriceRecordData
  constructor(data: PriceRecordData) { this.data = { ...data } }
  get perKg(): number | null {
    const {price, weightGrams} = this.data
    if (!Number.isFinite(price) || price < 0 || weightGrams === null || !Number.isFinite(weightGrams) || weightGrams <= 0) return null
    const normalized = price * (1000 / weightGrams)
    return Number.isFinite(normalized) ? normalized : null
  }
}
export type PriceListing = SellerData & ProductData & {
  id: string; sellerId: string; productId: string; recordId: string; price: number; perKg: number | null; unit: string
  sourceLabel: string; dateLabel: string; sourceDescription: string; sourceUrl?: string; note: string; comparisonKey: string | null
}
export class PriceComparison {
  static comparableKey(product: SeafoodProduct, record: PriceRecord): string | null {
    const p = product.data
    if (record.data.reviewStatus !== 'reviewed' || record.perKg === null ||
      [p.species,p.origin,p.condition,p.size].some(value => !value.trim() || /미확인|확인 안|모름/.test(value))) return null
    return JSON.stringify([p.seafoodId,p.species,p.origin,p.condition,p.size])
  }
  static sort(items: PriceListing[]): PriceListing[] {
    // Sort within known comparable groups; incomplete quality remains unranked.
    const groups = new Map<string, PriceListing[]>()
    const unknown: PriceListing[] = []
    for (const item of items) {
      if (!item.comparisonKey) { unknown.push(item); continue }
      const group = groups.get(item.comparisonKey) ?? []
      group.push(item); groups.set(item.comparisonKey, group)
    }
    return [...[...groups.values()].flatMap(group=>group.sort((a,b)=>a.perKg!-b.perKg!)), ...unknown]
  }
  static range(items: PriceListing[], format: (value: number)=>string): string {
    if (!items.length) return '가격 정보 없음'
    if (!items[0].comparisonKey || items.some(item=>item.comparisonKey!==items[0].comparisonKey)) return '조건별 가격 보기'
    const prices=items.map(item=>item.perKg!)
    const min=Math.min(...prices), max=Math.max(...prices)
    return min===max ? `${format(min)} / kg` : `${format(min)}~${format(max)} / kg`
  }
}
export class SeafoodRepository {
  readonly markets: Market[]
  readonly sellers: Seller[]
  readonly products: SeafoodProduct[]
  readonly records: PriceRecord[]
  constructor(markets: Market[], sellers: Seller[], products: SeafoodProduct[], records: PriceRecord[]) {
    this.markets=markets; this.sellers=sellers; this.products=products; this.records=records
  }
  listings(filter: { seafoodId: string; region: string }): PriceListing[] {
    const latest = new Map<string, PriceRecord>()
    for (const record of this.records) {
      if (record.data.reviewStatus !== 'reviewed') continue
      const key=JSON.stringify([record.data.sellerId,record.data.productId])
      const previous=latest.get(key)
      // Unknown dates do not override known observation dates; publication dates are never purchase dates.
      const date=(r:PriceRecord)=>{
        const timestamp=Date.parse(r.data.observedAt ?? r.data.publishedAt ?? '')
        return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY
      }
      if (!previous || date(record)>date(previous)) latest.set(key,record)
    }
    const result: PriceListing[]=[]
    for (const record of latest.values()) {
      const seller=this.sellers.find(s=>s.data.id===record.data.sellerId)
      const product=this.products.find(p=>p.data.id===record.data.productId)
      const market=this.markets.find(m=>m.id===seller?.data.marketId)
      if (!seller || !product || !market || market.region!==filter.region || product.data.seafoodId!==filter.seafoodId) continue
      result.push({...seller.data,...product.data,...record.data,
        id:JSON.stringify([seller.data.id,product.data.id]),sellerId:seller.data.id,productId:product.data.id,recordId:record.data.id,
        perKg:record.perKg,comparisonKey:PriceComparison.comparableKey(product,record)})
    }
    return result
  }
}
