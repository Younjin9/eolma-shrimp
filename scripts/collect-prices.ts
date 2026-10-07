import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { NaverBlogCollector } from '../src/collectors/naver.ts'
import { seafoodCatalog, regions } from '../src/domain/seafood.ts'
const escape = (text:string) => text.replace(/[&<>"']/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]!)
try {
  const seafoodId=process.argv[2] ?? 'shrimp'
  const selectedRegions=process.argv[3] ? process.argv[3].split(',') : regions
  const collector=new NaverBlogCollector({clientId:process.env.NAVER_CLIENT_ID ?? '',clientSecret:process.env.NAVER_CLIENT_SECRET ?? ''})
  const candidates=await collector.collect({seafoodId,regions:selectedRegions})
  const label=seafoodCatalog.find(item=>item.id===seafoodId)!.label
  const base=resolve('outputs',`${label}_판매글검토_${new Date().toISOString().replace(/[:.]/g,'-')}_${randomUUID().slice(0,8)}`)
  await mkdir(resolve('outputs'),{recursive:true})
  await writeFile(`${base}.json`,JSON.stringify({seafoodId,candidates},null,2),{flag:'wx'})
  const cards=candidates.map(item=>`<article><h2>${escape(item.title)}</h2><p>${escape(item.summary)}</p><p>작성일 ${escape(item.publishedAt ?? '미확인')} · 검색 지역 ${escape(item.searchRegions.join(', '))}</p><p>검색 지역은 매장 소재지를 확인한 정보가 아닙니다.</p><a href="${escape(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">원문 확인 ↗</a><p>확인할 내용: 판매처 주소 / 활어 여부 / 무게와 가격 / 구매일 / 방문 구매 / 택배</p></article>`).join('')
  await writeFile(`${base}.html`,`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(label)} 판매 글 검토</title><style>body{max-width:850px;margin:40px auto;padding:0 20px;font-family:system-ui;background:#f6f7f2;color:#253628}article{background:white;padding:24px;border:1px solid #dde2d8;border-radius:16px;margin:20px 0}p{line-height:1.8}a{color:#286540}</style><h1>${escape(label)} 판매 글 검토 · ${candidates.length}건</h1><p>블로그 검색 제목·요약입니다. 가격·판매처·활어 여부를 확정하지 않았으며 앱에 공개되지 않습니다. 글 작성일과 실제 구매일은 다를 수 있습니다.</p>${cards || '<p>검색 결과가 없습니다.</p>'}</html>`,{flag:'wx'})
  console.log(`검토 후보 ${candidates.length}건을 저장했습니다.\n${base}.html\n${base}.json\n앱 가격에는 자동 반영되지 않습니다.`)
} catch(error) {
  console.error(error instanceof Error ? error.message : '수집 중 오류가 발생했습니다.')
  process.exitCode=1
}
