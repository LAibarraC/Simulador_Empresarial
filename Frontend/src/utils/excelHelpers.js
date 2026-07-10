export const keyToNum = (key) => {
  if (!key) return -1;
  let n = 0;
  for (let i = 0; i < key.length; i++) n = n * 26 + key.charCodeAt(i) - 64;
  return n - 1;
};

export const getExcelChar = (colIndex) => {
  let letter = "";
  while (colIndex >= 0) {
    letter = String.fromCharCode((colIndex % 26) + 65) + letter;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return letter;
}; 

export const excelToCoords = (cellStr) => {
  if (!cellStr) return null;
  const match = cellStr.trim().toUpperCase().match(/([A-Z]+)(\d+)/);
  if (!match) return null;
  let colStr = match[1], row = parseInt(match[2], 10) - 1, col = 0;
  for (let i = 0; i < colStr.length; i++) col = col * 26 + (colStr.charCodeAt(i) - 64);
  return { r: row, c: col - 1 };
};

/*export const PALETA_COLORES = [
  'rgba(34, 197, 94, 0.4)', 'rgba(59, 130, 246, 0.4)',
  'rgba(245, 158, 11, 0.4)', 'rgba(168, 85, 247, 0.4)',
];*/

export const generarColorAleatorio = (index) => {
  // Cada nueva variable salta 137.5 grados (el Ángulo de Oro)
  // Esto garantiza la máxima separación visual entre colores consecutivos
  const hue = (index * 137.5) % 360; 
  return `hsla(${hue}, 75%, 60%, 0.4)`;
};
