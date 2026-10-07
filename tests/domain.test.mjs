import test from 'node:test'
import assert from 'node:assert/strict'
const domain = await import('../src/domain/seafood.ts').catch(() => ({}))
const record = (overrides = {}) => new domain.PriceRecord({id:'r',sellerId:'s',productId:'p',price:15000,weightGrams:500,unit:'500g',reviewStatus:'reviewed',observedAt:'2026-10-06T12:00:00+09:00',sourceLabel:'제보',dateLabel:'확인 날짜',sourceDescription:'직접 확인',note:'',...overrides})
const product = (overrides = {}) => new domain.SeafoodProduct({id:'p',seafoodId:'shrimp',species:'흰다리새우',origin:'국산',condition:'활새우',size:'30미/kg',...overrides})
test('500g price converts to one kilogram', () => { assert.ok(domain.PriceRecord,'PriceRecord is implemented'); assert.equal(record().perKg,30000) })
test('missing, zero, negative and invalid weights/prices never yield kg price', () => {
 assert.ok(domain.PriceRecord)
 for (const weightGrams of [null,0,-1,NaN,Infinity]) assert.equal(record({weightGrams}).perKg,null)
 for (const price of [-1,NaN,Infinity]) assert.equal(record({price}).perKg,null)
})
test('unknown quality or prepared fish is not comparable with live seafood', () => {
 assert.ok(domain.PriceComparison)
 assert.equal(domain.PriceComparison.comparableKey(product({origin:'원산지 미확인'}),record()),null)
 assert.equal(domain.PriceComparison.comparableKey(product({size:'크기 미확인'}),record()),null)
 assert.notEqual(domain.PriceComparison.comparableKey(product(),record()),domain.PriceComparison.comparableKey(product({condition:'회'}),record()))
 assert.equal(domain.PriceComparison.comparableKey(product(),record({reviewStatus:'candidate'})),null)
})
test('region and seafood selection join multiple products of the same seller and preserve latest price', () => {
 assert.ok(domain.SeafoodRepository)
 const repo = new domain.SeafoodRepository([{id:'m',name:'시장',region:'서울특별시',district:'동작구',address:'서울'}],
 [new domain.Seller({id:'s',name:'가게',marketId:'m',location:'1층',visitPurchase:null,shipping:null})],
 [product(),product({id:'fish',seafoodId:'yellowtail',species:'방어',condition:'활어'})],
 [record({id:'old',observedAt:'2026-10-01T12:00:00+09:00',price:20000}),record(),record({id:'unreviewed',reviewStatus:'candidate',price:1}),record({id:'f',productId:'fish',price:50000,unit:'한 마리',weightGrams:null})])
 assert.equal(repo.listings({seafoodId:'shrimp',region:'서울특별시'}).length,1)
 assert.equal(repo.listings({seafoodId:'shrimp',region:'서울특별시'})[0].price,15000)
 assert.equal(repo.listings({seafoodId:'yellowtail',region:'서울특별시'})[0].perKg,null)
 assert.equal(repo.listings({seafoodId:'shrimp',region:'경기도'}).length,0)
 assert.equal(repo.records.length,4)
})
test('original four shrimp records survive migration without gaining metadata', async () => {
 const data = await import('../src/shops.ts')
 assert.ok(data.repository,'repository is implemented')
 const listings=data.repository.listings({seafoodId:'shrimp',region:'서울특별시'}).filter(x=>x.recordId.startsWith('legacy-'))
 assert.equal(listings.length,4)
 assert.deepEqual(listings.map(x=>x.price),[40000,31000,35000,40000])
 assert.ok(listings.every(x=>x.size==='크기 미확인' && x.shipping===null && x.comparisonKey===null))
 assert.equal(data.repository.listings({seafoodId:'gizzard-shad',region:'서울특별시'}).length,0)
})
test('overflow in kg normalization is excluded',()=>{assert.equal(record({price:1e308,weightGrams:0.0001}).perKg,null)})
test('publication date chooses latest blog record without inventing a purchase date',()=>{
 const repo=new domain.SeafoodRepository([{id:'m',name:'시장',region:'서울특별시',district:'동작구',address:'서울'}],[new domain.Seller({id:'s',name:'가게',marketId:'m',location:'1층',visitPurchase:null,shipping:null})],[product()],
 [record({id:'old',observedAt:null,publishedAt:'2026-09-01',price:20000}),record({id:'new',observedAt:null,publishedAt:'2026-10-01',price:25000}),record({id:'undated',observedAt:null,publishedAt:null,price:10000})])
 assert.equal(repo.listings({seafoodId:'shrimp',region:'서울특별시'})[0].price,25000)
 assert.equal(repo.records[1].data.observedAt,null)
})
test('comparison sorting never ranks mixed quality together and ranges require common quality',()=>{
 const listing=(id,price,comparisonKey)=>({id,price,perKg:price,comparisonKey})
 const items=[listing('large-high',50000,'large'),listing('unknown',10000,null),listing('small',20000,'small'),listing('large-low',40000,'large')]
 assert.deepEqual(domain.PriceComparison.sort(items).map(x=>x.id),['large-low','large-high','small','unknown'])
 assert.equal(domain.PriceComparison.range(items,String),'조건별 가격 보기')
 assert.equal(domain.PriceComparison.range([items[0],items[3]],String),'40000~50000 / kg')
})

test('reviewed local sources cover three regions and keep pickup conditions explicit',async()=>{
 const {repository}=await import('../src/shops.ts')
 const seoul=repository.listings({seafoodId:'shrimp',region:'서울특별시'})
 const gyeonggi=repository.listings({seafoodId:'shrimp',region:'경기도'})
 const busan=repository.listings({seafoodId:'shrimp',region:'부산광역시'})
 assert.equal(seoul.length,6); assert.equal(gyeonggi.length,2); assert.equal(busan.length,1)
 assert.equal(busan[0].perKg,33000); assert.match(busan[0].note,/온라인 주문 후 방문 수령/)
 assert.equal(seoul.find(x=>x.name==='자매수산').perKg,35000)
 assert.ok([...seoul,...gyeonggi,...busan].filter(x=>!x.recordId.startsWith('legacy-')).every(x=>x.sourceUrl && x.condition==='활새우'))
})
