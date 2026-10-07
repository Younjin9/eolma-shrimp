import { repository, markets } from './data/seed.ts'
import { PriceComparison, type PriceListing } from './domain/seafood.ts'
export { repository, markets }
export type Shop = PriceListing
export const marketFor = (shop: Shop) => {
  const market=markets.find(m=>m.id===shop.marketId)
  if (!market) throw new Error('판매처의 시장 정보가 없습니다.')
  return market
}
export const formatPrice = (price: number) => `${price.toLocaleString('ko-KR', {maximumFractionDigits:0})}원`
export const kakaoSearchUrl = (query: string) => `https://map.kakao.com/link/search/${encodeURIComponent(query)}`
export const priceRange = (items: Shop[]) => PriceComparison.range(items,formatPrice)
