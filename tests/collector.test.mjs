import test from 'node:test'
import assert from 'node:assert/strict'
const module = await import('../src/collectors/naver.ts').catch(()=>({}))
const response = { lastBuildDate:'Wed, 07 Oct 2026 11:00:00 +0900',total:2,start:1,display:2,items:[
 {title:'<b>활새우</b> &amp; 가격',link:'https://blog.naver.com/seller/1',description:'서울 1kg 30,000원',bloggername:'판매점',bloggerlink:'https://blog.naver.com/seller',postdate:'20261001'},
 {title:'같은 글',link:'https://blog.naver.com/seller/1',description:'가격',bloggername:'판매점',bloggerlink:'https://blog.naver.com/seller',postdate:'20261001'},
] }
test('official blog results stay unpublished and regions are search hints, not seller locations', async()=>{
 assert.ok(module.NaverBlogCollector,'collector is implemented')
 const requests=[]
 const collector=new module.NaverBlogCollector({clientId:'id',clientSecret:'secret'},async(url,init)=>{requests.push({url,init});return new Response(JSON.stringify(response),{status:200})})
 const candidates=await collector.collect({seafoodId:'shrimp',regions:['서울특별시','경기도']})
 assert.equal(candidates.length,1)
 assert.equal(candidates[0].title,'활새우 & 가격')
 assert.equal(candidates[0].reviewStatus,'candidate')
 assert.equal(candidates[0].publishedAt,'2026-10-01')
 assert.deepEqual(candidates[0].searchRegions,['서울특별시','경기도'])
 assert.equal(candidates[0].sellerId,undefined)
 assert.equal(candidates[0].price,undefined)
 assert.equal(new URL(requests[0].url).origin,'https://naverapihub.apigw.ntruss.com')
 assert.match(new URL(requests[0].url).searchParams.get('query'),/서울 활새우/)
 assert.equal(requests[0].init.headers['X-NCP-APIGW-API-KEY'],'secret')
})
test('fish queries follow seafood configuration instead of shrimp terms',async()=>{
 assert.ok(module.NaverBlogCollector)
 const queries=[]
 const collector=new module.NaverBlogCollector({clientId:'id',clientSecret:'secret'},async(url)=>{queries.push(new URL(url).searchParams.get('query'));return new Response(JSON.stringify({...response,items:[]}))})
 await collector.collect({seafoodId:'yellowtail',regions:['부산광역시']})
 assert.ok(queries.every(q=>q.includes('부산') && q.includes('방어') && !q.includes('새우')))
})
test('missing credentials, unknown regions and HTTP failures stop with actionable errors',async()=>{
 assert.ok(module.NaverBlogCollector)
 assert.throws(()=>new module.NaverBlogCollector({clientId:'',clientSecret:''}),/NAVER_CLIENT_ID/)
 const collector=new module.NaverBlogCollector({clientId:'id',clientSecret:'secret'},async()=>new Response('{}',{status:403}))
 await assert.rejects(()=>collector.collect({seafoodId:'shrimp',regions:['unknown']}),/지역/)
 await assert.rejects(()=>collector.collect({seafoodId:'unknown',regions:['서울특별시']}),/수산물/)
 await assert.rejects(()=>collector.collect({seafoodId:'shrimp',regions:['서울특별시']}),/403/)
})
test('malformed result and unsafe links never become review candidates',async()=>{
 assert.ok(module.NaverBlogCollector)
 const bad=new module.NaverBlogCollector({clientId:'id',clientSecret:'secret'},async()=>new Response('{}'))
 await assert.rejects(()=>bad.collect({seafoodId:'shrimp',regions:['서울특별시']}),/응답/)
 const collector=new module.NaverBlogCollector({clientId:'id',clientSecret:'secret'},async()=>new Response(JSON.stringify({...response,items:[{...response.items[0],link:'javascript:alert(1)'}]})))
 assert.deepEqual(await collector.collect({seafoodId:'shrimp',regions:['서울특별시']}),[])
})
