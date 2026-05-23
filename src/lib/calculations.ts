export function calcFatPercent(waist: number, neck: number, height: number): number | null {
  if (waist <= neck || height <= 0 || neck <= 0) return null;
  const val = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  if (!isFinite(val) || val <= 0 || val >= 100) return null;
  return Math.round(val * 10) / 10;
}

export function calcFatLbs(weight: number, fatPercent: number): number {
  return Math.round(weight * (fatPercent / 100) * 10) / 10;
}

export function calcLeanLbs(weight: number, fatLbs: number): number {
  return Math.round((weight - fatLbs) * 10) / 10;
}
