import type { CameraProfile, LensProfile } from '../types/analysis';

// ─── Dina objektiv ───────────────────────────────────────────────────────────

export const SONY_LENSES: LensProfile[] = [
  {
    id: 'sigma-17-50-f1.8',
    name: 'Sigma 17–50mm f/1.8 DC DN Contemporary',
    focalLengthMm: '17–50',
    maxAperture: 'f/1.8',
    mount: 'Sony E',
    stabilized: false,
    strengths: [
      'Konstant f/1.8 genom hela zoomområdet – unikt för ett zoom',
      'Extremt ljusstark: 25mm-ekvivalent på APS-C ger ~38mm FF-känsla vid f/1.8',
      'Utmärkt skärpa i mitten redan vid f/1.8',
      'Täcker vidvinkel till normalbrännvidd i ett objektiv',
      'Bra för svagt ljus utan att byta objektiv',
    ],
    weaknesses: [
      'Tung och stor (585 g) för APS-C',
      'Kanterna mjuknar vid f/1.8 på vidaste hållet',
      'Ingen OIS – förlitar sig helt på a6700:s IBIS',
      'Nära fokusavstånd är begränsat vid 50mm-änden',
    ],
    bestUseCases: [
      'Gatufoto',
      'Miljöporträtt',
      'Dokumentär',
      'Svagt ljus inomhus',
      'Resa',
      'Arkitektur',
      'Landskap',
    ],
    avoidUseCases: [
      'Telefoto/sport på avstånd',
      'Situationer där vikten är kritisk',
    ],
    sweetSpotAperture: 'f/2.8–f/5.6',
    autofocusNotes:
      'Snabb och tyst RXD-motor. Pålitlig Eye AF och Real-time Tracking på a6700. Något långsammare än Sonys G-serien i extremt svårt ljus.',
    bokehCharacter:
      'Överraskande mjuk bokeh för ett zoom. Rundade highlights. Bäst separation vid 50mm f/1.8.',
    userNotes: '',
  },
  {
    id: 'viltrox-25-f1.7',
    name: 'Viltrox 25mm f/1.7 AF',
    focalLengthMm: 25,
    maxAperture: 'f/1.7',
    mount: 'Sony E',
    stabilized: false,
    strengths: [
      '25mm = ~37mm FF-ekvivalent – klassisk, naturlig brännvidd',
      'Ljusstark f/1.7 till ett lågt pris',
      'Kompakt och lätt – perfekt för diskret fotografering',
      'Bra skärpa i mitten vid f/1.7',
      'Bra för svagt ljus',
    ],
    weaknesses: [
      'AF-motor långsammare och bullrigare än Sony/Sigma',
      'Vinjettning och kanterna mjuknar vid f/1.7',
      'Kromaberration synlig vid f/1.7 i höga kontraster',
      'Bygg- och materialkvalitet under Sony/Sigma-nivå',
    ],
    bestUseCases: [
      'Gatufoto',
      'Svagt ljus',
      'Dokumentär',
      'Miljöporträtt',
      'Vardagsfoto',
    ],
    avoidUseCases: [
      'Snabba rörliga motiv (AF-hastighet)',
      'Situationer där perfekt kantskärpa krävs',
    ],
    sweetSpotAperture: 'f/2.8–f/4',
    autofocusNotes:
      'Funktionell AF men märkbart långsammare och bullrigare än Sigma och Sony. Eye AF fungerar men med viss fördröjning. Undvik vid sport eller snabb gatufoto.',
    bokehCharacter:
      'Mjuk och behaglig vid f/1.7. Lite swirly i kanterna vilket kan vara kreativt.',
    userNotes: '',
  },
  {
    id: 'sony-18-135-oss',
    name: 'Sony 18–135mm f/3.5–5.6 OSS',
    focalLengthMm: '18–135',
    maxAperture: 'f/3.5–5.6',
    mount: 'Sony E',
    stabilized: true,
    strengths: [
      'Extremt mångsidigt: täcker vidvinkel till korttelefoto i ett objektiv',
      'Inbyggd OIS kombinerat med a6700:s IBIS ger utmärkt stabilisering',
      'Relativt liten och lätt för sin räckvidd',
      '135mm-änden ger bra kompressionsmöjligheter',
      'Perfekt resesobjektiv när du vill slippa objektivbyten',
    ],
    weaknesses: [
      'Öppnar bara till f/5.6 vid 135mm – begränsat i svagt ljus',
      'Skärpa och kontrast under Sigma 17–50 och Tamron 70–180',
      'Bokeh kan vara nervös och kantig',
      'Inte optimalt för porträtt med krävande bakgrundsseparation',
    ],
    bestUseCases: [
      'Resa',
      'Zoo och djur',
      'Landskap',
      'Arkitektur',
      'Vardagsfoto',
      'Situationer med begränsat utrymme för objektivbyte',
    ],
    avoidUseCases: [
      'Svagt ljus utan stativ',
      'Porträtt med kräsen bokeh',
    ],
    sweetSpotAperture: 'f/5.6–f/8',
    autofocusNotes:
      'Tillförlitlig AF för de flesta situationer. Inte lika snabb som Sigma eller Sony G-serien. Eye AF fungerar men med viss eftersläpning.',
    bokehCharacter:
      'Hyfsad vid 135mm f/5.6. Kan vara lite kantig. Inte ett objektiv man väljer för bokehn.',
    userNotes: '',
  },
  {
    id: 'tamron-70-180-f2.8',
    name: 'Tamron 70–180mm f/2.8 Di III VC VXD',
    focalLengthMm: '70–180',
    maxAperture: 'f/2.8',
    mount: 'Sony E',
    stabilized: true,
    strengths: [
      'Konstant f/2.8 – utmärkt ljusstyrka för telefoto',
      'Överlägset skarp – en av de bästa i sin klass',
      '70–180mm = ~105–270mm FF-ekvivalent på a6700',
      'Inbyggd VC (OIS) + a6700:s IBIS – dubbel stabilisering',
      'Extraordinärt nära minsta fokusavstånd (0.85m vid 180mm)',
      'Relativt kompakt och lätt för ett f/2.8-telefoto',
      'Snabb och tyst VXD-autofokus',
      'Utmärkt bokeh och bakgrundsseparation',
    ],
    weaknesses: [
      'Inte optimal under 70mm – använd Sigma eller Viltrox istället',
      'Tung nog att märkas vid längre fotosessioner',
    ],
    bestUseCases: [
      'Porträtt',
      'Gatufoto på avstånd',
      'Sport och rörliga motiv',
      'Vilda djur',
      'Detalj och komprimering',
      'Scener där du vill isolera motivet från bakgrunden',
    ],
    avoidUseCases: [
      'Vidvinkel och miljöbilder',
      'Svagt ljus utan IBIS-stöd (håll slutartiden minst 1/brännvidd)',
    ],
    sweetSpotAperture: 'f/2.8–f/4',
    autofocusNotes:
      'VXD-motorn är bland de snabbaste i APS-C-segmentet. Pålitlig Eye AF och Real-time Tracking på a6700. Utmärkt för rörliga motiv.',
    bokehCharacter:
      'Exceptionell – mjuk, creamy och jämn. Rundade highlights. Bland den bästa bokehn du kan få på APS-C.',
    userNotes: '',
  },
];

// ─── Sony a6700 ──────────────────────────────────────────────────────────────

export const SONY_A6700: CameraProfile = {
  id: 'sony-a6700',
  brand: 'Sony',
  model: 'α6700',
  sensorSizeMm: 'APS-C (23.5 × 15.6 mm)',
  megapixels: 26,
  nativeIsoRange: 'ISO 100–32000',
  expandedIsoRange: 'ISO 50–102400',
  cleanIsoLimit: 'ISO 3200 (acceptabelt upp till ISO 6400 i RAW)',
  focusSystems: [
    'Fasdetektering (759 AF-punkter)',
    'AI-baserad motivigenkänning',
    'Eye AF – människor, djur, fåglar, insekter, fordon, tåg, flygplan',
    'Real-time Tracking',
    'Zone / Wide / Flexible Spot / Expand Flexible Spot',
  ],
  burstRateFps: 11,
  videoCapabilities: '4K 120p, 4K 60p 10-bit, S-Log3, S-Cinetone, 6K oversampling',
  stabilization: '5-axlig IBIS upp till 5 steg EV-kompensation',
  screenType: 'Vridbar pekskärm 3"',
  bodyWeightGrams: 493,
  notes: [
    'Fotograferar alltid RAW – utnyttja dynamikomfånget maximalt vid efterbearbetning.',
    'Sensorns sweet spot: ISO 100–3200. RAW klarar ISO 6400 bra, ISO 12800 med viss försiktighet.',
    'IBIS kompenserar effektivt ner till ~1/15s vid normalbrännvidd, ~1/focal-length är en bra tumregel.',
    'Eye AF är exceptionellt – aktivera alltid Subject Recognition för porträtt och gatufoto med folk.',
    'AF-C med Real-time Tracking är förstahandsvalet för rörliga motiv.',
    'Tamron 70–180: VC + IBIS ger utmärkt stabilisering – 1/focal-length räcker oftast handhållet, men frys rörelse med minst 1/400s vid 180mm.',
    'Sigma 17–50: f/1.8 ger ofta lite mjuka kanter – f/2.8 ger markant skarpare resultat överallt.',
    'Viltrox 25: bra prime för svagt ljus men AF-hastigheten begränsar vid snabba motiv.',
    'Sony 18–135: OIS + IBIS är en vinnare för handhållet vid 135mm – håll minst 1/100s.',
  ].join(' '),
  lenses: SONY_LENSES,
};

// ─── Hjälpfunktioner ─────────────────────────────────────────────────────────

export function getLensById(id: string): LensProfile | undefined {
  return SONY_LENSES.find((l) => l.id === id);
}

export function getCameraContext(): string {
  return `KAMERA: ${SONY_A6700.brand} ${SONY_A6700.model}
Sensor: ${SONY_A6700.sensorSizeMm} – ${SONY_A6700.megapixels} MP
Filformat: Alltid RAW
ISO rent: ${SONY_A6700.cleanIsoLimit}
Stabilisering: ${SONY_A6700.stabilization}
Autofokus: ${SONY_A6700.focusSystems.join(' | ')}
Kameranotes: ${SONY_A6700.notes}`;
}

export function getLensContext(): string {
  return SONY_LENSES.map((l) =>
    `${l.name} | ${l.focalLengthMm}mm | max ${l.maxAperture} | OIS: ${l.stabilized ? 'ja' : 'nej'} | Sweet spot: ${l.sweetSpotAperture} | Bäst för: ${l.bestUseCases.join(', ')} | AF: ${l.autofocusNotes}`
  ).join('\n');
}
