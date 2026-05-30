import type { CameraType } from '../types/settings';

export type MobileLens = {
  id: string;
  name: string;
  focalLengthEquiv: string;   // FF-ekvivalent
  aperture: string;
  opticalZoom: boolean;
  bestFor: string[];
};

export type MobileCamera = {
  id: CameraType;
  brand: string;
  model: string;
  mainSensorMp: number;
  rawSupport: string;
  nightMode: string;
  proMode: string;
  lenses: MobileLens[];
  stabilization: string;
  notes: string;
};

// ─── iPhone 16 ───────────────────────────────────────────────────────────────

export const IPHONE_16: MobileCamera = {
  id: 'iphone-16',
  brand: 'Apple',
  model: 'iPhone 16',
  mainSensorMp: 48,
  rawSupport: 'ProRAW (48MP eller 12MP) via Kamera-appen – aktivera i Inställningar › Kamera › Format',
  nightMode: 'Automatiskt i svagt ljus. Håll telefonen stilla – längre exponering ger bättre resultat',
  proMode: 'Manuell kontroll via tredjeparts-appar (Halide, ProCamera) eller Kamera-appens inbyggda exponerings/fokuskontroll',
  stabilization: 'Sensor-shift OIS på huvudkameran + Action Mode för video',
  notes: [
    'Fotografera alltid i ProRAW för maximal flexibilitet i efterbearbetning.',
    'Använd 1x (26mm eq) för de flesta situationer – huvudkamerans bästa kvalitet.',
    'Använd 2x (52mm eq) för porträtt – mjukare bakgrund, naturligare perspektiv.',
    'Undvik digital zoom bortom 5x – kvaliteten sjunker markant.',
    'Portrait Mode ger AI-genererad bokeh – bäst på 0.5–2m avstånd.',
    'Tryck på motivet för att låsa fokus + exponering (AE/AF Lock).',
    'Använd volymknappen eller sidoknappen som slutare för mer stabil hållning.',
    'Gyllene timme och skymning – iPhone 16 hanterar dynamikomfång extremt bra i RAW.',
    'Håll telefonen plant med gridlinjen för att undvika skev horisont.',
  ].join(' '),
  lenses: [
    {
      id: 'iphone16-ultrawide',
      name: 'Ultravidvinkel',
      focalLengthEquiv: '13mm',
      aperture: 'f/2.2',
      opticalZoom: false,
      bestFor: ['Arkitektur', 'Landskap', 'Trånga utrymmen', 'Grupper'],
    },
    {
      id: 'iphone16-main',
      name: 'Huvudkamera (1x)',
      focalLengthEquiv: '26mm',
      aperture: 'f/1.6',
      opticalZoom: false,
      bestFor: ['Gatufoto', 'Dokumentär', 'Svagt ljus', 'Allround'],
    },
    {
      id: 'iphone16-2x',
      name: '2x zoom (beskuren)',
      focalLengthEquiv: '52mm',
      aperture: 'f/1.6',
      opticalZoom: false,
      bestFor: ['Porträtt', 'Detalj', 'Naturligare perspektiv'],
    },
    {
      id: 'iphone16-5x',
      name: '5x telefoto',
      focalLengthEquiv: '120mm',
      aperture: 'f/2.8',
      opticalZoom: true,
      bestFor: ['Telefoto', 'Komprimering', 'Avståndsmotiv'],
    },
  ],
};

// ─── Samsung S25 ─────────────────────────────────────────────────────────────

export const SAMSUNG_S25: MobileCamera = {
  id: 'samsung-s25',
  brand: 'Samsung',
  model: 'Galaxy S25',
  mainSensorMp: 50,
  rawSupport: 'RAW (Adobe DNG) via Expert RAW-appen eller Pro-läge i kamera-appen',
  nightMode: 'Nattläge med AI-optimering. Expert RAW ger mer kontroll med manuell slutartid',
  proMode: 'Pro-läge inbyggt i kamera-appen: ISO, slutartid, vitbalans, fokus manuellt',
  stabilization: 'OIS på alla linser + VDIS för video',
  notes: [
    'Använd Pro-läge och spara RAW (DNG) för bästa bildkvalitet.',
    'Expert RAW-appen ger maximal kontroll inkl. astrofotografering.',
    '1x (23mm eq) är vidast – bra för miljöbilder och arkitektur.',
    '3x optisk zoom (69mm eq) är ett utmärkt porrettobjektiv.',
    '10x optisk zoom (230mm eq) – håll stadigt, använd självutlösare eller volymknapp.',
    'Bixby-kameran och Scene Optimizer är bra för snabba bilder men ger JPEG.',
    'AI-funktioner som Generative Edit är bra för retusch men inte för råfoto.',
    'Håll ISO så lågt som möjligt – S25 är bra upp till ISO 800 i RAW.',
    'Tryck och håll för AE/AF-lås – viktigt i dynamiska scener.',
  ].join(' '),
  lenses: [
    {
      id: 's25-ultrawide',
      name: 'Ultravidvinkel',
      focalLengthEquiv: '13mm',
      aperture: 'f/2.2',
      opticalZoom: false,
      bestFor: ['Arkitektur', 'Landskap', 'Inomhus', 'Kreativa vinklar'],
    },
    {
      id: 's25-main',
      name: 'Huvudkamera (1x)',
      focalLengthEquiv: '23mm',
      aperture: 'f/1.8',
      opticalZoom: false,
      bestFor: ['Gatufoto', 'Dokumentär', 'Svagt ljus', 'Allround'],
    },
    {
      id: 's25-3x',
      name: '3x optisk zoom',
      focalLengthEquiv: '69mm',
      aperture: 'f/2.4',
      opticalZoom: true,
      bestFor: ['Porträtt', 'Detalj', 'Komprimering', 'Naturligare perspektiv'],
    },
    {
      id: 's25-10x',
      name: '10x optisk zoom',
      focalLengthEquiv: '230mm',
      aperture: 'f/3.5',
      opticalZoom: true,
      bestFor: ['Telefoto', 'Sport', 'Vilda djur', 'Avståndsmotiv'],
    },
  ],
};

// ─── Lookup ───────────────────────────────────────────────────────────────────

export const MOBILE_CAMERAS: MobileCamera[] = [IPHONE_16, SAMSUNG_S25];

export function getMobileCamera(id: CameraType): MobileCamera | undefined {
  return MOBILE_CAMERAS.find((c) => c.id === id);
}

export function getMobileCameraContext(camera: MobileCamera): string {
  return `KAMERA: ${camera.brand} ${camera.model}
Sensor: ${camera.mainSensorMp}MP
RAW-stöd: ${camera.rawSupport}
Nattläge: ${camera.nightMode}
Pro-läge: ${camera.proMode}
Stabilisering: ${camera.stabilization}
Kameranotes: ${camera.notes}`;
}

export function getMobileLensContext(camera: MobileCamera): string {
  return camera.lenses.map((l) =>
    `${l.name} | ${l.focalLengthEquiv} eq | ${l.aperture}${l.opticalZoom ? ' | Optisk zoom' : ''} | Bäst för: ${l.bestFor.join(', ')}`
  ).join('\n');
}
