import type { Market, SellerData, ProductData, PriceRecordData } from '../domain/seafood.ts'
export const reviewedMarkets: Market[] = [
  {
    "id": "mapo",
    "name": "마포농수산물시장",
    "region": "서울특별시",
    "district": "마포구",
    "address": "서울 마포구 월드컵로 235"
  },
  {
    "id": "siheung",
    "name": "시흥 은행동 판매처",
    "region": "경기도",
    "district": "시흥시",
    "address": "경기 시흥시 은계로142번길 7-7"
  },
  {
    "id": "gimpo",
    "name": "김포 직판 판매처",
    "region": "경기도",
    "district": "김포시",
    "address": "경기 김포시 김포대로 1466-34"
  },
  {
    "id": "busan",
    "name": "광안리 직판 판매처",
    "region": "부산광역시",
    "district": "수영구",
    "address": "부산 수영구 광안해변로 326"
  }
]
export const reviewedSellers: SellerData[] = [
  {
    "id": "sister",
    "name": "자매수산",
    "marketId": "noryangjin",
    "location": "1층 냉동 42·43호 · 승객용 엘리베이터 4호기 옆",
    "visitPurchase": true,
    "shipping": null,
    "openingHours": "판매자 공지 08:00~20:00 · 방문 전 확인",
    "phone": "010-8589-5873"
  },
  {
    "id": "yeonan",
    "name": "연안수산",
    "marketId": "mapo",
    "location": "시장 1층 3205호",
    "visitPurchase": true,
    "shipping": null,
    "openingHours": "방문 전 매장에 확인"
  },
  {
    "id": "yujin",
    "name": "유진수산",
    "marketId": "siheung",
    "location": "은계로142번길 7-7 · 카츠오모이 건물",
    "visitPurchase": true,
    "shipping": true,
    "openingHours": "방문 전 확인 · 월요일 매장 식사 휴무, 포장 가능(후기)"
  },
  {
    "id": "daesin",
    "name": "대신식자재마트",
    "marketId": "gimpo",
    "location": "김포대로 1466-34",
    "visitPurchase": true,
    "shipping": null,
    "openingHours": "방문 전 매장에 확인",
    "phone": "031-996-4378"
  },
  {
    "id": "jimin",
    "name": "지민수산",
    "marketId": "busan",
    "location": "광안해변로 326 · 1층",
    "visitPurchase": true,
    "shipping": true,
    "openingHours": "후기 09:00~18:00 · 시작 시간 확인 필요",
    "phone": "051-751-2020"
  }
]
export const reviewedProducts: ProductData[] = [
  {
    "id": "reviewed-sister",
    "seafoodId": "shrimp",
    "species": "흰다리새우(양식)",
    "origin": "국내산",
    "condition": "활새우",
    "size": "27~30마리/kg"
  },
  {
    "id": "reviewed-yeonan",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "원산지 미확인",
    "condition": "활새우",
    "size": "크기 미확인"
  },
  {
    "id": "reviewed-yujin",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "국내산(신안 직송)",
    "condition": "활새우",
    "size": "크기 미확인"
  },
  {
    "id": "reviewed-daesin",
    "seafoodId": "shrimp",
    "species": "종류 미확인",
    "origin": "국내산(강화도)",
    "condition": "활새우",
    "size": "크기 미확인"
  },
  {
    "id": "reviewed-jimin",
    "seafoodId": "shrimp",
    "species": "흰다리새우",
    "origin": "원산지 미확인",
    "condition": "활새우",
    "size": "크기 미확인"
  }
]
export const reviewedRecords: PriceRecordData[] = [
  {
    "id": "reviewed-sister-2026-10-07",
    "sellerId": "sister",
    "productId": "reviewed-sister",
    "price": 35000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-10-07",
    "sourceLabel": "판매자 시세",
    "dateLabel": "판매자 공지 2026.10.07",
    "sourceDescription": "판매자 당일 공지에 활 흰다리새우 1kg 35,000원이 명시되어 있습니다.",
    "sourceUrl": "https://blog.naver.com/sisterseafood/224433792470",
    "note": "생물 새우 700g 상자 상품과 구분했습니다. 현재 재고와 가격은 전화로 확인해주세요."
  },
  {
    "id": "reviewed-yeonan-2026-10-06",
    "sellerId": "yeonan",
    "productId": "reviewed-yeonan",
    "price": 38000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-10-06",
    "sourceLabel": "블로그 · 시세 언급",
    "dateLabel": "글 작성 2026.10.06",
    "sourceDescription": "후기에 별도로 언급된 활새우 1kg 시세입니다. 실제 구매한 자연산 대하 가격과 구분했습니다.",
    "sourceUrl": "https://blog.naver.com/marigold1018/224433376563",
    "note": "월드컵경기장역 1번 출구 약 200m(후기). 글 작성일 기준이며 실제 시세 확인일은 미확인입니다."
  },
  {
    "id": "reviewed-yujin-2026-10-05",
    "sellerId": "yujin",
    "productId": "reviewed-yujin",
    "price": 35000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-10-05",
    "sourceLabel": "블로그 구매 후기",
    "dateLabel": "글 작성 2026.10.05",
    "sourceDescription": "살아 있는 왕새우 1kg을 포장한 후기에서 35,000원을 확인했습니다. 실제 구매일은 미확인입니다.",
    "sourceUrl": "https://blog.naver.com/hani_way/224432030793",
    "note": "소금구이 50,000원과 구분했습니다. 전국 택배 가능(후기); 활 상태 배송 여부와 비용 문의. 전용 주차장 없음(후기)."
  },
  {
    "id": "reviewed-daesin-2026-10-04",
    "sellerId": "daesin",
    "productId": "reviewed-daesin",
    "price": 35000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-10-04",
    "sourceLabel": "블로그 구매 후기",
    "dateLabel": "글 작성 2026.10.04",
    "sourceDescription": "매장 활새우 구매 후기에 강화도 왕새우 1kg 35,000원이 명시되어 있습니다. 실제 구매일은 미확인입니다.",
    "sourceUrl": "https://blog.naver.com/ygienie/224430851205",
    "note": "넓은 주차장 있음(후기). 방문 전 활새우 입고 시간과 재고를 확인해주세요. 9월 29일 다른 후기의 38,000원은 별도 조건의 과거 참고 가격입니다."
  },
  {
    "id": "reviewed-jimin-2026-10-07",
    "sellerId": "jimin",
    "productId": "reviewed-jimin",
    "price": 33000,
    "weightGrams": 1000,
    "unit": "1kg",
    "reviewStatus": "reviewed",
    "observedAt": null,
    "publishedAt": "2026-10-07",
    "sourceLabel": "블로그 · 방문 수령",
    "dateLabel": "글 작성 2026.10.07",
    "sourceDescription": "온라인에서 주문한 활 흰다리새우를 매장에서 수령한 후기입니다. 기본 판매 가격은 1kg 33,000원입니다.",
    "sourceUrl": "https://blog.naver.com/glass_zzang/224433898152",
    "note": "온라인 주문 후 방문 수령 기준; 현장 직접구매 가격은 미확인입니다. 쿠폰 적용 29,700원은 비교 금액에서 제외. 택배비 4,000원(후기), 활 상태 도착 여부 문의. 매장 앞 주차 가능, 대중교통 접근은 불편하다는 후기입니다."
  }
]
