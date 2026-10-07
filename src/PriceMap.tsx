import { useEffect, useMemo, useRef, useState } from "react"
import { geocodeMarket, loadKakao } from "./kakao"
import {
  formatPrice,
  kakaoSearchUrl,
  markets,
  priceRange,
  type Shop,
} from "./shops"

export default function PriceMap({
  visibleShops,
  onOpen,
}: {
  visibleShops: Shop[]
  onOpen: (shop: Shop) => void
}) {
  const container = useRef<HTMLDivElement>(null)
  const fitMarkets = useRef<(() => void) | null>(null)
  const key = import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim()
  const [status, setStatus] =
    useState<"preview" | "loading" | "ready" | "error">(
      key ? "loading" : "preview",
    )
  const [retry, setRetry] = useState(0)
  const [missing, setMissing] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const groups = useMemo(
    () =>
      markets
        .map((market) => ({
          market,
          shops: visibleShops.filter((shop) => shop.marketId === market.id),
        }))
        .filter((group) => group.shops.length > 0),
    [visibleShops],
  )
  const activeGroup = groups.find((group) => group.market.id === selected)

  useEffect(() => {
    if (!key || !container.current || groups.length === 0) return
    let cancelled = false
    const overlays: { setMap(map: null): void }[] = []
    let observer: ResizeObserver | undefined
    const element = container.current
    setStatus("loading")
    setMissing(0)
    loadKakao(key)
      .then(async (maps) => {
        const located = await Promise.all(
          groups.map(async (group) => ({
            ...group,
            position: await geocodeMarket(maps, group.market.address),
          })),
        )
        if (cancelled) return
        const valid = located.filter((group) => group.position !== null)
        if (valid.length === 0) throw new Error("시장 위치를 찾지 못했습니다.")
        const map = new maps.Map(element, {
          center: valid[0].position!,
          level: 4,
          scrollwheel: false,
        })
        map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT)
        const bounds = new maps.LatLngBounds()
        valid.forEach(({ market, shops, position }) => {
          bounds.extend(position!)
          // DOM nodes keep text separate from HTML and preserve keyboard activation.
          const bubble = document.createElement("button")
          bubble.type = "button"
          bubble.className = "map-market-pin"
          bubble.setAttribute(
            "aria-label",
            `${market.name}, ${priceRange(shops)}, ${shops.length}개 상품 가격 보기`,
          )
          const name = document.createElement("span")
          name.className = "bubble-market"
          name.textContent = market.name.replace("농수산물시장", "시장").replace("수산시장", "시장").replace(" 직판 판매처", "").replace(" 판매처", "")
          const price = document.createElement("strong")
          price.textContent = priceRange(shops)
          const count = document.createElement("small")
          count.textContent = `${shops.length}곳 · 기록된 가격 보기 ›`
          const shopCount = new Set(shops.map(shop => shop.sellerId)).size
          const badge = document.createElement("small")
          badge.className = "market-count"
          badge.textContent = `${shopCount}곳`
          bubble.append(name, badge)
          bubble.onclick = () => setSelected(market.id)
          overlays.push(
            new maps.CustomOverlay({
              map,
              position: position!,
              content: bubble,
              clickable: true,
              yAnchor: 1,
            }),
          )
        })
        fitMarkets.current = () => {
          if (valid.length > 1) map.setBounds(bounds, 55, 55, 45, 55)
          else map.setCenter(valid[0].position!)
        }
        fitMarkets.current()
        observer = new ResizeObserver(() => {
          map.relayout()
          if (valid.length > 1) map.setBounds(bounds, 55, 55, 45, 55)
          else map.setCenter(valid[0].position!)
        })
        observer.observe(element)
        setMissing(located.length - valid.length)
        setStatus("ready")
      })
      .catch(() => {
        if (!cancelled) setStatus("error")
      })
    return () => {
      cancelled = true
      fitMarkets.current = null
      observer?.disconnect()
      overlays.forEach((overlay) => overlay.setMap(null))
      element.replaceChildren()
    }
  }, [key, groups, retry])

  const showPreview = status === "preview" || status === "error"
  return (
    <section
      className={`price-map ${showPreview ? "preview-mode" : ""}`}
      aria-label="시장별 가격 지도"
    >
      <div className="map-heading">
        <div>
          <span className="eyebrow">
            {showPreview ? "가격 표시 미리보기" : "카카오지도"}
          </span>
          <h3>지도 위에서도, 가격부터</h3>
        </div>
        {status === "ready" && groups.length > 0 ? <button className="map-retry" onClick={() => fitMarkets.current?.()}>전체 위치</button> : <span className="sample-badge">조건 확인</span>}
      </div>
      <div className="map-stage">
        <div
          ref={container}
          className="kakao-canvas"
          aria-label="시장·판매처 주소 기준 지도"
          style={{
            visibility:
              status === "ready" && groups.length ? "visible" : "hidden",
          }}
        />
        {groups.length === 0 ? (
          <div className="map-status">조건에 맞는 판매점이 없어요.</div>
        ) : status === "loading" ? (
          <div className="map-status" role="status">
            시장 위치와 가격을 불러오고 있어요…
          </div>
        ) : showPreview ? (
          <div className="price-preview">
            <p>
              {status === "error"
                ? "지도를 불러오지 못했어요. 아래에서 시장별 가격을 확인하세요."
                : "지도 연결을 준비 중이에요. 말풍선을 눌러 가게별 가격을 확인해보세요."}
            </p>
            <div className="bubble-preview-grid">
              {groups.map(({ market, shops }) => (
                <button
                  key={market.id}
                  className={`price-bubble ${
                    selected === market.id ? "selected" : ""
                  }`}
                  onClick={() => setSelected(market.id)}
                  aria-expanded={selected === market.id}
                >
                  <span className="bubble-market">
                    {market.district} · {market.name}
                  </span>
                  <strong>
                    {priceRange(shops)}
                  </strong>
                  <small>{shops.length}곳 · 기록된 가격 보기 ›</small>
                </button>
              ))}
            </div>
            <small className="preview-disclaimer">
              가격 말풍선의 작동 예시이며, 실제 위치를 나타내는 지도는 아닙니다.
            </small>
            {status === "error" && (
              <button
                className="map-retry"
                onClick={() => setRetry((value) => value + 1)}
              >
                지도 다시 불러오기
              </button>
            )}
          </div>
        ) : null}
      </div>
      {activeGroup && (
        <div className="market-price-panel">
          <div className="market-price-heading">
            <h4>{activeGroup.market.name}</h4>
            <button
              onClick={() => setSelected(null)}
              aria-label="시장별 가격 닫기"
            >
              ×
            </button>
          </div>
          <p>시장·판매처 주소 기준 · 가게별 실내 위치는 상세 정보에서 확인</p>
          {activeGroup.shops.map((shop) => (
            <button
              className="market-price-row"
              key={shop.id}
              onClick={() => onOpen(shop)}
            >
              <span>
                <b>{shop.name}</b>
                <small>{shop.dateLabel}</small>
              </span>
              <strong>
                {shop.perKg === null ? formatPrice(shop.price) : formatPrice(shop.perKg)} <small>/ {shop.perKg === null ? shop.unit : "kg"} ›</small>
              </strong>
            </button>
          ))}
          <a
            href={kakaoSearchUrl(
              `${activeGroup.market.address} ${activeGroup.market.name}`,
            )}
            target="_blank"
            rel="noreferrer"
          >
            카카오맵에서 시장 찾기 ↗
          </a>
        </div>
      )}
      <div className="map-footnote">
        <span>
          {missing > 0
            ? `${missing}개 시장의 위치를 찾지 못했어요. 가게 목록을 이용해주세요.`
            : "시장 표시를 누르면 아래에서 가게별 가격을 볼 수 있어요."}
        </span>
        <small>사용자 제보·후기 당시 가격 · 오늘 가격은 방문 전 확인</small>
      </div>
    </section>
  )
}
