import type { LightroomAdjustments } from '../types/analysis';

/**
 * Genererar en giltig .xmp-fil (Adobe Camera Raw / Lightroom sidecar-format)
 * från AI-genererade efterbearbetningsförslag.
 *
 * Filen kan dubbelklickas i Lightroom, eller importeras via
 * Foto → Importera inställningar från...
 */
export function generateXmpContent(adjustments: LightroomAdjustments): string {
  const {
    whiteBalanceTemp,
    whiteBalanceTint,
    exposure,
    contrast,
    highlights,
    shadows,
    whites,
    blacks,
    clarity,
    dehaze,
    vibrance,
    saturation,
  } = adjustments;

  // Lightroom/ACR förväntar sig Exposure2012 som en sträng med "+" för positiva värden
  const fmtExposure = (v: number) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2));
  const fmtInt = (v: number) => Math.round(v).toString();

  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Fotocoach 0.8.0">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"
    crs:Version="17.0"
    crs:ProcessVersion="15.4"
    crs:WhiteBalance="Custom"
    crs:Temperature="${fmtInt(whiteBalanceTemp)}"
    crs:Tint="${fmtInt(whiteBalanceTint)}"
    crs:Exposure2012="${fmtExposure(exposure)}"
    crs:Contrast2012="${fmtInt(contrast)}"
    crs:Highlights2012="${fmtInt(highlights)}"
    crs:Shadows2012="${fmtInt(shadows)}"
    crs:Whites2012="${fmtInt(whites)}"
    crs:Blacks2012="${fmtInt(blacks)}"
    crs:Clarity2012="${fmtInt(clarity)}"
    crs:Dehaze="${fmtInt(dehaze)}"
    crs:Vibrance="${fmtInt(vibrance)}"
    crs:Saturation="${fmtInt(saturation)}"
    crs:ConvertToGrayscale="False"
    crs:HasSettings="True">
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

/**
 * Triggar nedladdning av XMP-filen i webbläsaren.
 */
export function downloadXmpFile(adjustments: LightroomAdjustments, filename = 'fotocoach-justeringar.xmp') {
  const content = generateXmpContent(adjustments);
  const blob = new Blob([content], { type: 'application/rdf+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
