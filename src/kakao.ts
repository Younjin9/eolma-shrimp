// Narrow types for the SDK surface used by this app; no runtime dependency.
export type LatLng = object
export type KakaoMap = {
  addControl(control: object, position: object): void
  setBounds(
    bounds: object,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ): void
  setCenter(position: LatLng): void
  relayout(): void
}
export type KakaoMaps = {
  ZoomControl: new () => object
  ControlPosition: { RIGHT: object }
  load(callback: () => void): void
  LatLng: new (
    lat: number,
    lng: number,
  ) => LatLng
  LatLngBounds: new () => { extend(position: LatLng): void }
  Map: new (
    container: HTMLElement,
    options: { center: LatLng; level: number; scrollwheel?: boolean },
  ) => KakaoMap
  CustomOverlay: new (options: {
    map: KakaoMap
    position: LatLng
    content: HTMLElement
    yAnchor: number
    clickable: boolean
  }) => { setMap(map: KakaoMap | null): void }
  services: {
    Status: { OK: string }
    Geocoder: new () => {
      addressSearch(
        address: string,
        callback: (results: { x: string; y: string }[], status: string) => void,
      ): void
    }
  }
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMaps }
  }
}

let sdkPromise: Promise<KakaoMaps> | undefined
export function loadKakao(key: string): Promise<KakaoMaps> {
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao.maps)
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement("script")
    let settled = false
    const fail = () => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      script.remove()
      sdkPromise = undefined
      reject(new Error("카카오 지도를 불러오지 못했습니다."))
    }
    const timeout = window.setTimeout(fail, 12000)
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=services`
    script.async = true
    script.onerror = fail
    script.onload = () => {
      if (!window.kakao?.maps) {
        fail()
        return
      }
      window.kakao.maps.load(() => {
        if (settled) return
        if (!window.kakao?.maps?.services) {
          fail()
          return
        }
        settled = true
        clearTimeout(timeout)
        resolve(window.kakao.maps)
      })
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}

const coordinates = new Map<string, { lat: number; lng: number }>()
export function geocodeMarket(
  maps: KakaoMaps,
  address: string,
): Promise<LatLng | null> {
  const cached = coordinates.get(address)
  if (cached) return Promise.resolve(new maps.LatLng(cached.lat, cached.lng))
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => resolve(null), 8000)
    new maps.services.Geocoder().addressSearch(address, (results, status) => {
      clearTimeout(timeout)
      const lat = Number(results[0]?.y)
      const lng = Number(results[0]?.x)
      if (
        status !== maps.services.Status.OK ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        resolve(null)
        return
      }
      coordinates.set(address, { lat, lng })
      resolve(new maps.LatLng(lat, lng))
    })
  })
}
