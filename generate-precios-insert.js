/**
 * Script para sincronizar Inserciones_Precio_unitario.txt con los datos actualizados
 * de ProductNew.txt y PrecioUNew.txt.
 *
 * Operaciones que realiza:
 * 1. ACTUALIZA precios de registros existentes cuyo Precio A difiera en ProductNew.txt.
 *    - Mantiene las proporciones B/A y C/A originales de cada producto.
 * 2. AGREGA los 63 registros nuevos (presentes en PrecioUNew pero no en Inserciones).
 */

const fs = require('fs');
const path = require('path');

const fmt = (n) => parseFloat(n.toFixed(2));
const fmtStr = (n) => n.toFixed(2);

const newFile    = fs.readFileSync(path.join(__dirname, 'PrecioUNew.txt'), 'utf8');
const productFile = fs.readFileSync(path.join(__dirname, 'ProductNew.txt'), 'utf8');
const mainPath   = path.join(__dirname, 'Inserciones_Precio_unitario.txt');

// ============================================================
// 1. Extraer Precio A actualizado de ProductNew.txt
//    Formato: ('codigo', 'producto', 'marca', 'bodega', 'medida', 'existencia', 'precioA')
// ============================================================
const regexProduct = /^\s+\('(\d+)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'([^']*)'\)/gm;
const productPrices = {};
let m;
while ((m = regexProduct.exec(productFile)) !== null) {
  const v = parseFloat(m[2]);
  if (!isNaN(v)) productPrices[m[1]] = v;
}
console.log('Precios actualizados cargados de ProductNew.txt:', Object.keys(productPrices).length);

// ============================================================
// 2. Actualizar precios de registros EXISTENTES en Inserciones_Precio_unitario.txt
//    Formato línea: ('codigo', 'producto', 'medida', 'precioC', 'precioB', 'precioA')
//    Se preservan las proporciones C/A y B/A originales de cada producto.
// ============================================================
let content = fs.readFileSync(mainPath, 'utf8');

const regexLine = /^(\s+)\('(\d+)',(\s*'[^']*'),(\s*'[^']*'),(\s*'([\d.]+)'),(\s*'([\d.]+)'),(\s*'([\d.]+)')\)([,;])/gm;

let actualizados = 0;
let sinCambio = 0;

content = content.replace(regexLine, (match, indent, codigo, producto, medida, _cStr, precioC, _bStr, precioB, _aStr, precioA, terminator) => {
  const newPrecioA = productPrices[codigo];
  if (newPrecioA === undefined) return match; // código no está en ProductNew, sin cambio

  const oldA = parseFloat(precioA);
  if (Math.abs(newPrecioA - oldA) <= 0.001) {
    sinCambio++;
    return match; // diferencia insignificante
  }

  // Calcular nuevos precios manteniendo las proporciones originales
  const oldC = parseFloat(precioC);
  const oldB = parseFloat(precioB);

  let newC, newB;
  if (oldA > 0) {
    newC = fmt(newPrecioA * (oldC / oldA));
    newB = fmt(newPrecioA * (oldB / oldA));
  } else {
    // Si el precio original era 0, aplicar proporciones estándar
    newC = fmt(newPrecioA);
    newB = fmt(newPrecioA * 0.909);
  }

  actualizados++;
  return indent + "('" + codigo + "'," + producto + "," + medida + ", '" + fmtStr(newC) + "', '" + fmtStr(newB) + "', '" + fmtStr(newPrecioA) + "')" + terminator;
});

console.log('Precios actualizados (cambio real):', actualizados);
console.log('Precios sin cambio (igual o diferencia mínima):', sinCambio);

// ============================================================
// 3. Agregar registros NUEVOS (en PrecioUNew pero no en Inserciones)
// ============================================================

// Códigos nuevos identificados (en PrecioUNew pero NO en Inserciones_Precio_unitario)
const newCodes = new Set([
  '3451','3523','3499','3443','3445','3444','3442','3517','3438','3447',
  '3448','3449','3446','3556','3509','3515','3495','3533','3500','36',
  '28400','3441','3498','3507','3506','3497','3514','3501','3510','3504',
  '3454','3503','3508','3521','3435','3436','3452','3437','3793','3516',
  '3522','3519','3529','3527','3531','3528','3532','3526','3524','3794',
  '3525','3440','3530','3534','3511','3513','3518','3520','3439','3496',
  '3502','3450','3555'
]);

// Verificar cuáles ya existen en el contenido actualizado
const codigosYaEnArchivo = new Set();
const regexExistCodes = /^\s+\('(\d+)',/gm;
while ((m = regexExistCodes.exec(content)) !== null) codigosYaEnArchivo.add(m[1]);

const codigosParaAgregar = [...newCodes].filter(c => !codigosYaEnArchivo.has(c));

// Extraer nombre de producto de PrecioUNew.txt para los nuevos
const regexNewNames = /^\s+\('(\d+)',\s*'([^']*)'/gm;
const newData = {};
while ((m = regexNewNames.exec(newFile)) !== null) {
  if (newCodes.has(m[1])) newData[m[1]] = m[2].replace(/'/g, "''");
}

const sortedNew = codigosParaAgregar.sort((a, b) => parseInt(a) - parseInt(b));

if (sortedNew.length > 0) {
  const rawLines = sortedNew.map((codigo) => {
    const producto = newData[codigo] || '';
    const precioA = productPrices[codigo] || 0;
    const precioB = precioA > 0 ? fmtStr(fmt(precioA * 0.909)) : '0.00';
    const pA = fmtStr(precioA);
    return "    ('" + codigo + "', '" + producto + "', 'UNIDAD', '" + pA + "', '" + precioB + "', '" + pA + "')";
  });

  // Quitar ';' final y añadir nuevas líneas
  content = content.trimEnd();
  if (content.endsWith(';')) content = content.slice(0, -1);
  if (!content.endsWith(',')) content += ',';

  const appendChunk = '\n' + rawLines.slice(0, -1).map(l => l + ',').join('\n') + '\n' + rawLines[rawLines.length - 1] + ';';
  content += appendChunk;
  console.log('Registros nuevos agregados:', rawLines.length);
} else {
  console.log('Registros nuevos agregados: 0 (ya existen en el archivo)');
}

// ============================================================
// 4. Guardar archivo actualizado
// ============================================================
fs.writeFileSync(mainPath, content, 'utf8');
console.log('');
console.log('✅ Inserciones_Precio_unitario.txt guardado correctamente.');

// Verificar conteo final
const finalContent = fs.readFileSync(mainPath, 'utf8');
const totalMatches = finalContent.match(/^\s+\('\d+',/gm);
console.log('   Total registros en el archivo: ' + (totalMatches ? totalMatches.length : 0));
console.log('   Termina con:', JSON.stringify(finalContent.trimEnd().slice(-5)));

// ============================================================
// 5. Reporte: registros sin precio disponible en ProductNew
// ============================================================
const sinPrecio = sortedNew.filter(c => !productPrices[c] || productPrices[c] === 0);
if (sinPrecio.length > 0) {
  console.log('');
  console.log('⚠️  Nuevos registros sin precio en ProductNew.txt (quedaron en 0.00): ' + sinPrecio.length);
  sinPrecio.forEach(c => console.log('   - ' + c + ': ' + (newData[c] || 'N/A')));
}
