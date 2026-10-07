import { useMemo, useState } from "react"
import PriceMap from "./PriceMap"
import {
  repository,
  markets,
  marketFor,
  formatPrice,
  kakaoSearchUrl,
  type Shop,
} from "./shops"

import { seafoodCatalog, regions, PriceComparison } from "./domain/seafood"

type IconName = "search" | "pin" | "list" | "map" | "chevron" | "clock" | "info" | "phone" | "route" | "edit" | "camera" | "close" | "check"

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    list: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4" cy="6" r="1" />
        <circle cx="4" cy="12" r="1" />
        <circle cx="4" cy="18" r="1" />
      </>
    ),
    map: (
      <>
        <path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Z" />
        <path d="M8 3v15M16 6v15" />
      </>
    ),
    chevron: <path d="m8 10 4 4 4-4" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.5" />
      </>
    ),
    phone: (
      <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-4-1-1.3 2.2a15 15 0 0 1-9.9-9.9L8 7 7 3Z" />
    ),
    route: (
      <>
        <circle cx="6" cy="19" r="2" />
        <circle cx="18" cy="5" r="2" />
        <path d="M8 19h3a3 3 0 0 0 0-6h2a3 3 0 0 0 3-3V7" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l3.5-.7L20 6.8 17.2 4 4.7 16.5 4 20Z" />
      </>
    ),
    camera: (
      <>
        <path d="M4 7h4l1.5-2h5L16 7h4v12H4V7Z" />
        <circle cx="12" cy="13" r="3" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4 4L19 6" />,
  }

  return (
    <svg
      aria-hidden="true"
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  )
}

function Segmented({
  value,
  onChange,
}: {
  value: "map" | "list"
  onChange: (value: "map" | "list") => void
}) {
  return (
    <div className="segmented" aria-label="보기 방식">
      <button
        className={value === "map" ? "active" : ""}
        onClick={() => onChange("map")}
      >
        <Icon name="map" size={17} /> 지도 보기
      </button>
      <button
        className={value === "list" ? "active" : ""}
        onClick={() => onChange("list")}
      >
        <Icon name="list" size={17} /> 목록 보기
      </button>
    </div>
  )
}

function ShopCard({ shop, onOpen }: { shop: Shop; onOpen: () => void }) {
  return (
    <article
      className="shop-card"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`${shop.name} ${shop.species} ${formatPrice(shop.price)} 상세 보기`}
    >
      <div className="card-topline">
        <div>
          <span className="market-name">{marketFor(shop).name}</span>
          <h3>{shop.name}</h3>
        </div>
        <span
          className={
            shop.sourceLabel === "사용자 제보" ? "fresh-badge" : "warning-badge"
          }
        >
          {shop.sourceLabel}
        </span>
      </div>
      <div className="condition-row">
        <span>{shop.species}</span>
        <i />
        <span>{shop.origin}</span>
        <i />
        <span>{shop.condition}</span>
        <i />
        <span>{shop.size}</span>
      </div>
      <div className="price-row">
        <div>
          <strong>{formatPrice(shop.price)}</strong>
          <span className="unit"> / {shop.unit}</span>
          {shop.perKg !== null && shop.unit !== "1kg" && (
            <span className="converted">
              1kg 환산 {formatPrice(shop.perKg)}
            </span>
          )}
          {shop.perKg === null && <span className="excluded">kg 가격 비교 제외</span>}
        </div>
        <span className="card-arrow">›</span>
      </div>
      {!shop.comparisonKey && <p className="comparison-note">종류·원산지·크기 확인 후 같은 조건끼리 비교할 수 있어요.</p>}
      <div className="checked">
        <Icon name="clock" size={15} /> {shop.dateLabel}
      </div>
    </article>
  )
}

function DetailSheet({
  shop,
  onClose,
  onExternal,
}: {
  shop: Shop
  onClose: () => void
  onExternal: () => void
}) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <section
        className="sheet detail-sheet"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose} aria-label="닫기">
          <Icon name="close" />
        </button>
        <span className="eyebrow">판매점 상세 · {shop.sourceLabel}</span>
        <h2>{shop.name}</h2>
        <p className="detail-location">
          <Icon name="pin" size={17} /> {marketFor(shop).name} · {shop.location}
        </p>

        <div className="detail-product">
          <div className="detail-price-line">
            <div>
              <span>
                {shop.sourceLabel === "사용자 제보"
                  ? "제보된 가격"
                  : shop.sourceLabel === "판매자 시세" ? "판매자 공지 가격" : "후기에 기록된 가격"}
              </span>
              <strong>{formatPrice(shop.price)}</strong>
              <em>/ {shop.unit}</em>
            </div>
            {shop.perKg !== null && shop.unit !== "1kg" && (
              <b>1kg 환산 {formatPrice(shop.perKg)}</b>
            )}
          </div>
          <dl className="spec-grid">
            <div>
              <dt>종류</dt>
              <dd>{shop.species}</dd>
            </div>
            <div>
              <dt>원산지</dt>
              <dd>{shop.origin}</dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{shop.condition}</dd>
            </div>
            <div>
              <dt>크기</dt>
              <dd>{shop.size}</dd>
            </div>
          </dl>
          <div className="source-row">
            <Icon name="clock" size={16} />
            <span>
              <b>{shop.dateLabel}</b>
            </span>
          </div>
          <p className="source-description">{shop.sourceDescription}</p>
          {shop.sourceUrl && (
            <a
              className="source-link"
              href={shop.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              가격 출처 보기 ↗
            </a>
          )}
          <div className="old-price">
            <Icon name="info" size={16} /> {shop.note}
          </div>
        </div>

        <div className="fee-box">
          <div>
            <span>손질비</span>
            <b>확인 필요</b>
          </div>
          <div>
            <span>포장비</span>
            <b>확인 필요</b>
          </div>
        </div>

        <div className="store-info">
          <h3>이용 정보</h3>
          <dl>
            <div>
              <dt>주소</dt>
              <dd>{marketFor(shop).address}</dd>
            </div>
            <div>
              <dt>영업시간</dt>
              <dd>{shop.openingHours ?? "방문 전 매장에 확인"}</dd>
            </div>
            <div>
              <dt>전화번호</dt>
              <dd>{shop.phone ?? "확인되지 않음"}</dd>
            </div>
            <div>
              <dt>방문 구매 · 택배</dt>
              <dd>방문 {shop.visitPurchase === null ? "확인 필요" : shop.visitPurchase ? "가능" : "불가"} · 택배 {shop.shipping === null ? "확인 필요" : shop.shipping ? "가능" : "불가"}</dd>
            </div>
            <div>
              <dt>포장 · 예약</dt>
              <dd>포장·예약 여부 매장 문의</dd>
            </div>
          </dl>
        </div>

        <div className="detail-actions">
          {shop.phone ? (
            <a href={`tel:${shop.phone}`}>
              <Icon name="phone" />
              전화하기
            </a>
          ) : (
            <button disabled>
              <Icon name="phone" />
              전화 미확인
            </button>
          )}
          <a
            href={kakaoSearchUrl(`${marketFor(shop).region} ${marketFor(shop).name} ${shop.name}`)}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="route" />
            카카오맵 찾기
          </a>
          <button onClick={onExternal}>
            <Icon name="edit" />
            정보 수정 제보
          </button>
        </div>
      </section>
    </div>
  )
}

function ReportSheet({ onClose, shops, seafoodLabel }: { onClose: () => void; shops: Shop[]; seafoodLabel: string }) {
  const [submitted, setSubmitted] = useState(false)
  if (submitted) {
    return (
      <div className="overlay">
        <section className="sheet success-sheet">
          <div className="success-icon">
            <Icon name="check" size={32} />
          </div>
          <h2>제보 양식을 확인했어요</h2>
          <p>
            현재는 제보 화면 미리보기입니다.
            <br />
            입력 내용은 저장하거나 전송하지 않습니다.
          </p>
          <button className="primary-button" onClick={onClose}>
            확인
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <section
        className="sheet report-sheet"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose} aria-label="닫기">
          <Icon name="close" />
        </button>
        <span className="eyebrow">가격 제보 · 미리보기</span>
        <h2>{seafoodLabel} 가격을 알려주세요</h2>
        <p className="sheet-intro">
          아직 제보 저장 기능이 연결되지 않았어요. 아래 양식은 미리보기입니다.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
        >
          <label>
            가게
            <select required defaultValue="">
              <option value="" disabled>
                가게를 선택하세요
              </option>
              {[...new Map(shops.map(s=>[s.sellerId,s])).values()].map((s) => (
                <option key={s.sellerId}>{s.name}</option>
              ))}
            </select>
          </label>
          <div className="field-pair">
            <label>
              새우 종류
              <input required placeholder={`예: ${seafoodLabel === "새우" ? "흰다리새우" : seafoodLabel}`} />
            </label>
            <label>
              상품 상태
              <select>
                <option>{seafoodLabel === "새우" ? "활새우" : "활어"}</option>
                <option>냉장</option>
                <option>냉동</option>
              </select>
            </label>
          </div>
          <div className="field-pair">
            <label>
              금액
              <input required type="number" placeholder="금액 입력" />
            </label>
            <label>
              판매 단위
              <select>
                <option>1kg</option>
                <option>500g</option>
                <option>한 팩</option>
                <option>마리</option>
              </select>
            </label>
          </div>
          <label>
            확인 시각
            <input required type="datetime-local" />
          </label>
          <label>
            확인 방법
            <select>
              <option>직접 방문</option>
              <option>가게에 전화</option>
              <option>판매점 게시물</option>
            </select>
          </label>
          <label className="photo-upload">
            <Icon name="camera" />
            <span>
              <b>사진 추가 (선택)</b>
              <small>가격표나 상품 사진을 올려주세요</small>
            </span>
            <input type="file" accept="image/*" />
          </label>
          <button className="primary-button" type="submit">
            양식 미리보기 완료
          </button>
        </form>
      </section>
    </div>
  )
}

export default function App() {
  const seafoodId = "shrimp"
  const seafood = seafoodCatalog.find(item=>item.id===seafoodId)!
  const [view, setView] = useState<"map" | "list">("map")
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("서울특별시")
  const [district, setDistrict] = useState("전체 지역")
  const [market, setMarket] = useState("전체 시장·동네")
  const [species, setSpecies] = useState("전체 종류")
  const [origin, setOrigin] = useState("전체 원산지")
  const [condition, setCondition] = useState("전체 상태")
  const [size, setSize] = useState("전체 크기")
  const [userOnly, setUserOnly] = useState(false)
  const [sortLow, setSortLow] = useState(true)
  const [listExpanded, setListExpanded] = useState(true)

  const shops = useMemo(()=>repository.listings({seafoodId,region}),[seafoodId,region])
  const regionMarkets = markets.filter(item=>item.region===region)
  const areaShops = useMemo(
    () =>
      shops.filter(
        (shop) =>
          (district === "전체 지역" || marketFor(shop).district === district) &&
          (market === "전체 시장·동네" || marketFor(shop).name === market),
      ),
    [shops, district, market],
  )
  const noData = areaShops.length === 0
  const availableMarkets = regionMarkets.filter(
    (item) => district === "전체 지역" || item.district === district,
  )
  const visibleShops = useMemo(() => {
    if (noData) return []
    let result = areaShops.filter((shop) => {
      const matchesQuery =
        `${shop.name} ${marketFor(shop).name} ${shop.species}`
          .toLowerCase()
          .includes(query.toLowerCase())
      return (
        matchesQuery &&
        (species === "전체 종류" || shop.species === species) &&
        (origin === "전체 원산지" || shop.origin === origin) &&
        (condition === "전체 상태" || shop.condition === condition) &&
        (size === "전체 크기" || shop.size.startsWith(size)) &&
        (!userOnly || shop.sourceLabel === "사용자 제보")
      )
    })
    if (sortLow) result = PriceComparison.sort(result)
    return result
  }, [
    query,
    species,
    origin,
    condition,
    size,
    userOnly,
    sortLow,
    noData,
    areaShops,
  ])

  return (
    <div className="app-shell">
      <header>
        <div className="header-inner">
          <div className="brand">
            <div className="brand-logo"><img src="/shrimp-logo.png" alt="" /></div>
            <div>
              <h1>얼마새우</h1>
              <p>우리 동네 활새우, 어디서 얼마에?</p>
            </div>
          </div>
          <button className="report-button" onClick={() => setReportOpen(true)}>
            <Icon name="edit" size={18} /> 가격 제보
          </button>
        </div>
      </header>

      <main>
        <section className="search-section">
          <label className="search-box">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="지역·시장·가게를 검색해보세요"
            />
          </label>
          <div className="location-selects">
            <label>
              <span>시·도</span>
              <select
                aria-label="시·도"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value)
                  setDistrict("전체 지역")
                  setMarket("전체 시장·동네")
                }}
              >
                {regions.map(item=><option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>시·군·구</span>
              <select
                aria-label="시·군·구"
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value)
                  setMarket("전체 시장·동네")
                }}
              >
                <option>전체 지역</option>
                {[...new Set(regionMarkets.map((item) => item.district))].map(
                    (item) => <option key={item}>{item}</option>,
                  )}
              </select>
            </label>
            <label>
              <span>시장·동네</span>
              <select
                aria-label="시장·동네"
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              >
                <option>전체 시장·동네</option>
                {availableMarkets.map((item) => (
                    <option key={item.id}>{item.name}</option>
                  ))}
              </select>
            </label>
          </div>
        </section>

        <section className="area-summary">
          <div className="area-heading">
            <div>
              <span className="eyebrow">
                {region} · {district}
              </span>
              <h2>
                {market === "전체 시장·동네" ? `우리 동네 ${seafood.liveLabel} 가격` : market}
              </h2>
            </div>
            <span className="sample-badge">제보·공지·후기 가격</span>
          </div>
          <div className="stats">
            <div>
              <strong>{new Set(areaShops.map(item=>item.sellerId)).size}</strong>
              <span>등록 판매점</span>
            </div>
            <i />
            <div>
              <strong>
                {
                  areaShops.filter((shop) => shop.sourceLabel === "사용자 제보")
                    .length
                }
              </strong>
              <span>사용자 제보</span>
            </div>
            <i />
            <div className="transport">
              <Icon name="route" size={18} />
              <span>
                <b>가격 기준</b>제보·글 날짜를 확인해주세요
              </span>
            </div>
          </div>
        </section>

        <section className="filter-section">
          <div className="view-row">
            <Segmented value={view} onChange={setView} />
            <span className="result-count">
              조건에 맞는 판매점 <b>{visibleShops.length}곳</b>
            </span>
          </div>
          <div className="filters">
            <select
              aria-label="새우 종류"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              <option>전체 종류</option>
              {[...new Set(shops.map(item=>item.species))].map(value=><option key={value}>{value}</option>)}
            </select>
            <select aria-label="원산지" value={origin} onChange={(e) => setOrigin(e.target.value)}>
              <option>전체 원산지</option>
              {[...new Set(shops.map(item=>item.origin))].map(value=><option key={value}>{value}</option>)}
            </select>
            <select
              aria-label="상품 상태"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option>전체 상태</option>
              {[...new Set(shops.map(item=>item.condition))].map(value=><option key={value}>{value}</option>)}
            </select>
            <select aria-label="크기" value={size} onChange={(e) => setSize(e.target.value)}>
              <option>전체 크기</option>
              {[...new Set(shops.map(item=>item.size))].map(value=><option key={value}>{value}</option>)}
            </select>
          </div>
          <div className="toggles">
            <label className="check-control">
              <input
                type="checkbox"
                checked={userOnly}
                onChange={(e) => setUserOnly(e.target.checked)}
              />
              <span>
                <Icon name="check" size={13} />
              </span>
              사용자 제보만 보기
            </label>
            <label className="check-control">
              <input
                type="checkbox"
                checked={sortLow}
                onChange={(e) => setSortLow(e.target.checked)}
              />
              <span>
                <Icon name="check" size={13} />
              </span>
              같은 조건 내 가격 낮은 순
            </label>
            <p>
              <Icon name="info" size={14} /> 같은 조건끼리, 중량이 확인된 상품만
              kg 가격으로 비교해요.
            </p>
          </div>
        </section>

        {noData ? (
          <section className="empty-state">
            <div className="empty-illustration">
              <Icon name="map" size={38} />
            </div>
            <h2>아직 등록된 정보가 없어요</h2>
            <p>{region}의 {seafood.liveLabel} 가격은 아직 등록되지 않았어요.<br />자료가 있는 다른 지역을 선택해주세요.</p>
            <button
              className="primary-button small"
              onClick={() => setReportOpen(true)}
            >
              가격 제보하기
            </button>
          </section>
        ) : (
          <section
            className={`content-grid ${view === "list" ? "list-view" : ""}`}
          >
            {view === "map" && (
              <PriceMap visibleShops={visibleShops} onOpen={setSelectedShop} />
            )}
            <div className="shop-list">
              {view === "map" && (
                <button
                  className="mobile-list-toggle"
                  onClick={() => setListExpanded(!listExpanded)}
                >
                  <span>
                    <b>가게 목록</b> {visibleShops.length}곳
                  </span>
                  <Icon name="chevron" />
                </button>
              )}
              <div className={listExpanded ? "cards expanded" : "cards"}>
                {visibleShops.map((shop) => (
                  <ShopCard
                    key={shop.id}
                    shop={shop}
                    onOpen={() => setSelectedShop(shop)}
                  />
                ))}
                {visibleShops.length === 0 && (
                  <div className="no-results">
                    선택한 조건에 맞는 가게가 없어요.
                    <br />
                    필터를 바꿔보세요.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
        <aside className="collection-note"><b>가격 정보 수집</b><p>현재는 검토된 제보·공지·후기 기록을 보여드려요. 블로그 자동 검색은 별도 수집 도구로 준비되어 있으며, 검색 결과는 확인 후 공개합니다.</p></aside>
        <aside className="rules-note">
          <Icon name="info" />
          <div>
            <b>가격을 이렇게 보여드려요</b>
            <p>
              사용자 제보, 판매자 공지, 블로그 후기에 기록된 당시 가격입니다. 글 작성일은
              구매일과 다를 수 있으며, 원산지·크기가 미확인인 상품은 같은 품질로
              단정할 수 없어요. 오늘 가격은 방문 전 매장에 확인해주세요.
            </p>
          </div>
        </aside>
      </main>

      <button className="mobile-report" onClick={() => setReportOpen(true)}>
        <Icon name="edit" /> 가격 제보
      </button>
      {selectedShop && (
        <DetailSheet
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onExternal={() => {
            setSelectedShop(null)
            setReportOpen(true)
          }}
        />
      )}
      {reportOpen && <ReportSheet shops={shops} seafoodLabel={seafood.label} onClose={() => setReportOpen(false)} />}
    </div>
  )
}
