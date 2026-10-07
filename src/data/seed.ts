import {reviewedMarkets, reviewedSellers, reviewedProducts, reviewedRecords} from './reviewed-shrimp-2026-10-07.ts'
import {Seller, SeafoodProduct, PriceRecord, SeafoodRepository} from '../domain/seafood.ts'
export const markets = [...reviewedMarkets,
  {
    "id": "noryangjin",
    "name": "노량진수산시장",
    "district": "동작구",
    "address": "서울 동작구 노들로 674",
    "region": "서울특별시"
  },
  {
    "id": "garak",
    "name": "가락시장",
    "district": "송파구",
    "address": "서울 송파구 양재대로 932",
    "region": "서울특별시"
  },
  {
    "id": "gangseo",
    "name": "강서수산시장",
    "district": "강서구",
    "address": "서울 강서구 강서도매시장로 130",
    "region": "서울특별시"
  }
]
const sellers = [
  {
    "id": "1",
    "name": "성일수산",
    "marketId": "noryangjin",
    "location": "시장 내 점포 위치 확인 필요",
    "visitPurchase": null,
    "shipping": null
  },
  {
    "id": "2",
    "name": "영재수산",
    "marketId": "garak",
    "location": "가락몰 판매동 1층 C-10호",
    "visitPurchase": null,
    "shipping": null
  },
  {
    "id": "3",
    "name": "흥한수산",
    "marketId": "gangseo",
    "location": "후기 기준 B-24호 · 점포 위치 문의 권장",
    "phone": "02-2666-4032",
    "visitPurchase": null,
    "shipping": null
  },
  {
    "id": "4",
    "name": "부부전복",
    "marketId": "noryangjin",
    "location": "1층 120호 · 후기 기준",
    "phone": "02-2254-7318",
    "visitPurchase": null,
    "shipping": null
  }
]
const products = [
  {
    "id": "shrimp-1",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "원산지 미확인",
    "condition": "활새우",
    "size": "크기 미확인"
  },
  {
    "id": "shrimp-2",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "원산지 미확인",
    "condition": "활새우",
    "size": "크기 미확인"
  },
  {
    "id": "shrimp-3",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "원산지 미확인",
    "condition": "활새우",
    "size": "크기 미확인"
  },
  {
    "id": "shrimp-4",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "원산지 미확인",
    "condition": "활새우",
    "size": "크기 미확인"
  }
]
const records = [
  {
    "id": "legacy-1",
    "sellerId": "1",
    "productId": "shrimp-1",
    "price": 40000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": "2026-09-25T00:00:00+09:00",
    "publishedAt": null,
    "sourceLabel": "사용자 제보",
    "dateLabel": "가격 확인 2026.09.25",
    "sourceDescription": "사용자가 직접 알려준 활새우 1kg 가격입니다.",
    "note": "물량에 따라 약 1,000~2,000원 변동할 수 있어요. 방문 전 가격을 확인해주세요."
  },
  {
    "id": "legacy-2",
    "sellerId": "2",
    "productId": "shrimp-2",
    "price": 31000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-09-21",
    "sourceLabel": "블로그 · 일부 협찬",
    "dateLabel": "글 작성 2026.09.21",
    "sourceDescription": "후기에 1kg 31,000원, 500g 15,500원이 명시되어 있어요. 실제 구매일은 확인되지 않았습니다.",
    "sourceUrl": "https://superchart.com/ko/@tongin-morning-basket/garak-market-jeongwangcham-engawa-shrimp-ramen/",
    "note": "9월 20일 다른 후기에는 1kg 32,000원으로 나옵니다. 날짜와 구매 조건에 따라 차이가 있어요."
  },
  {
    "id": "legacy-3",
    "sellerId": "3",
    "productId": "shrimp-3",
    "price": 35000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": null,
    "sourceLabel": "블로그 · 날짜 재확인",
    "dateLabel": "글 표시 09.14 · 연도 미확인",
    "sourceDescription": "다이닝코드에 수집된 예쨩의 내돈내산 후기에서 활새우 1kg 35,000원을 확인했어요. 원문 작성 연도와 구매일은 검증되지 않았습니다.",
    "sourceUrl": "https://www.diningcode.com/profile.php?rid=NkepoOncdaiw",
    "note": "블로그 발췌 기준 가격입니다. 매장 소개와 후기의 호수가 달라 방문 전 위치도 확인해주세요."
  },
  {
    "id": "legacy-4",
    "sellerId": "4",
    "productId": "shrimp-4",
    "price": 40000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-07-17",
    "sourceLabel": "블로그 구매 후기",
    "dateLabel": "글 표시 2026.07.17",
    "sourceDescription": "다이닝코드에 수집된 겟냥이의 후기입니다. 제목에 ‘26년 7월 시세정보’, 본문에 활새우 1kg 40,000원 구매가 명시되어 있어요. 정확한 구매일은 미확인입니다.",
    "sourceUrl": "https://www.diningcode.com/profile.php?rid=jHl1mcIYXnbU",
    "note": "7월 구매 당시 가격입니다. 현재 시세와 차이가 있을 수 있어요."
  }
] as const
export const repository = new SeafoodRepository(markets, [...sellers,...reviewedSellers].map(s=>new Seller(s)), [...products,...reviewedProducts].map(p=>new SeafoodProduct(p)), [...records,...reviewedRecords].map(r=>new PriceRecord(r)))
