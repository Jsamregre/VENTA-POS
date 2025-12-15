// ===== FECHA =====
const hoy = new Date().toISOString().split('T')[0];
document.getElementById('fecha').innerText = "Fecha: " + hoy;

// ===== INPUTS =====
const descripcionInput = document.getElementById('descripcion');
const codigoInput = document.getElementById('codigo');
const inicioInput = document.getElementById('inicio');
const retornoInput = document.getElementById('retorno');
const precioInput = document.getElementById('precio');
const vendidosInput = document.getElementById('vendidos');
const totalInput = document.getElementById('total');

const totalDiaInput = document.getElementById('totalDia');
const totalGastosInput = document.getElementById('totalGastos');
const efectivoRealInput = document.getElementById('efectivoReal');

// ===== STORAGE BASE =====
let cierres = JSON.parse(localStorage.getItem('cierres')) || [];
let gastos = JSON.parse(localStorage.getItem('gastos')) || [];

// ===== TOTAL DEL DÍA =====
let totalDia = JSON.parse(localStorage.getItem('totalDia'));
if (!totalDia || totalDia.fecha !== hoy) {
  totalDia = { fecha: hoy, total: 0 };
  gastos = [];
  localStorage.setItem('gastos', JSON.stringify(gastos));
  localStorage.setItem('totalDia', JSON.stringify(totalDia));
}

// ===== CALCULAR =====
function calcular() {
  const inicio = Number(inicioInput.value) || 0;
  const retorno = Number(retornoInput.value) || 0;
  const precio = Number(precioInput.value) || 0;

  const vendidos = inicio - retorno;
  const total = vendidos * precio;

  vendidosInput.value = vendidos > 0 ? vendidos : 0;
  totalInput.value = total > 0 ? total.toFixed(2) : "0.00";
}

[inicioInput, retornoInput, precioInput].forEach(i =>
  i.addEventListener('input', calcular)
);

// ===== GUARDAR CIERRE =====
document.getElementById('guardarBtn').addEventListener('click', () => {
  const vendidos = Number(vendidosInput.value);
  const total = Number(totalInput.value);
  if (vendidos <= 0 || total <= 0) return;

  cierres.push({
    fecha: hoy,
    descripcion: descripcionInput.value,
    codigo: codigoInput.value,
    vendidos,
    total
  });

  totalDia.total += total;

  localStorage.setItem('cierres', JSON.stringify(cierres));
  localStorage.setItem('totalDia', JSON.stringify(totalDia));

  descripcionInput.value = "";
  codigoInput.value = "";
  inicioInput.value = "";
  retornoInput.value = "";
  precioInput.value = "";
  calcular();

  actualizarResumen();
  mostrar();
});

// ===== MOSTRAR CIERRES =====
function mostrar() {
  const lista = document.getElementById('lista');
  lista.innerHTML = "";
  const filtro = document.getElementById('filtroFecha').value;

  cierres.forEach((c, i) => {
    if (filtro && c.fecha !== filtro) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.fecha}</td>
      <td>${c.descripcion}</td>
      <td>${c.codigo}</td>
      <td>${c.vendidos}</td>
      <td>$${c.total.toFixed(2)}</td>
      <td><button onclick="eliminarCierre(${i})">Eliminar</button></td>
    `;
    lista.appendChild(tr);
  });
}

// ===== ELIMINAR CIERRE =====
function eliminarCierre(i) {
  if (!confirm("¿Eliminar cierre?")) return;

  totalDia.total -= cierres[i].total;
  cierres.splice(i, 1);

  localStorage.setItem('cierres', JSON.stringify(cierres));
  localStorage.setItem('totalDia', JSON.stringify(totalDia));

  actualizarResumen();
  mostrar();
}

// ===== GASTOS =====
document.getElementById('agregarGasto').addEventListener('click', () => {
  const desc = document.getElementById('gastoDesc').value;
  const monto = Number(document.getElementById('gastoMonto').value);
  if (!desc || monto <= 0) return;

  gastos.push({ desc, monto });
  localStorage.setItem('gastos', JSON.stringify(gastos));

  document.getElementById('gastoDesc').value = "";
  document.getElementById('gastoMonto').value = "";

  mostrarGastos();
  actualizarResumen();
});

function mostrarGastos() {
  const ul = document.getElementById('listaGastos');
  ul.innerHTML = "";

  gastos.forEach((g, i) => {
    const li = document.createElement('li');
    li.innerHTML = `${g.desc} - $${g.monto.toFixed(2)}
      <button onclick="eliminarGasto(${i})">❌</button>`;
    ul.appendChild(li);
  });
}

function eliminarGasto(i) {
  gastos.splice(i, 1);
  localStorage.setItem('gastos', JSON.stringify(gastos));
  mostrarGastos();
  actualizarResumen();
}

// ===== RESUMEN =====
function actualizarResumen() {
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const efectivo = totalDia.total - totalGastos;

  totalDiaInput.value = "$" + totalDia.total.toFixed(2);
  totalGastosInput.value = "$" + totalGastos.toFixed(2);
  efectivoRealInput.value = "$" + efectivo.toFixed(2);
}

// ===== CALENDARIO =====
document.getElementById('addCalendar').addEventListener('click', () => {
  const fecha = hoy.replace(/-/g, '');
  const totalVendido = totalDiaInput.value;
  const totalGastos = totalGastosInput.value;
  const efectivoReal = efectivoRealInput.value;

  const texto = `
Cierre diario
Fecha: ${hoy}

Total vendido: ${totalVendido}
Gastos del día: ${totalGastos}
Efectivo real esperado: ${efectivoReal}
  `;

  const url = `https://www.google.com/calendar/render?action=TEMPLATE
&text=Cierre Diario
&dates=${fecha}/${fecha}
&details=${encodeURIComponent(texto)}`.replace(/\s+/g, '');

  window.open(url, '_blank');
});

// ===== UI =====
document.getElementById('toggleDark')
  .addEventListener('click', () => document.body.classList.toggle('dark'));

document.getElementById('filtroFecha')
  .addEventListener('change', mostrar);

// ===== INIT =====
mostrar();
mostrarGastos();
actualizarResumen();
  
