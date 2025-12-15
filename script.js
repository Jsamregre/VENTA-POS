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
const guardarBtn = document.getElementById('guardarBtn');

// ===== TOTAL DEL DÍA =====
let totalDia = JSON.parse(localStorage.getItem('totalDia'));
if (!totalDia || totalDia.fecha !== hoy) {
  totalDia = { fecha: hoy, total: 0 };
  localStorage.setItem('totalDia', JSON.stringify(totalDia));
}
totalDiaInput.value = "$" + totalDia.total.toFixed(2);

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

[inicioInput, retornoInput, precioInput].forEach(el =>
  el.addEventListener('input', calcular)
);

// ===== GUARDAR =====
function guardarCierre() {
  const vendidos = Number(vendidosInput.value);
  const total = Number(totalInput.value);
  if (vendidos <= 0 || total <= 0) return;

  let data = JSON.parse(localStorage.getItem('cierres')) || [];

  data.push({
    fecha: hoy,
    descripcion: descripcionInput.value,
    codigo: codigoInput.value,
    vendidos,
    total
  });

  localStorage.setItem('cierres', JSON.stringify(data));

  totalDia.total += total;
  localStorage.setItem('totalDia', JSON.stringify(totalDia));
  totalDiaInput.value = "$" + totalDia.total.toFixed(2);

  descripcionInput.value = "";
  codigoInput.value = "";
  inicioInput.value = "";
  retornoInput.value = "";
  precioInput.value = "";
  calcular();

  mostrar();
}

// ===== MOSTRAR =====
function mostrar() {
  const lista = document.getElementById('lista');
  lista.innerHTML = "";
  const data = JSON.parse(localStorage.getItem('cierres')) || [];
  const filtro = document.getElementById('filtroFecha').value;

  data.forEach((c, index) => {
    if (filtro && c.fecha !== filtro) return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.fecha}</td>
      <td>${c.descripcion}</td>
      <td>${c.codigo}</td>
      <td>${c.vendidos}</td>
      <td>$${c.total.toFixed(2)}</td>
      <td></td>
    `;

    const btn = document.createElement('button');
    btn.textContent = "Eliminar";
    btn.className = "delete-btn";
    btn.addEventListener('click', () => eliminarCierre(index));

    tr.children[5].appendChild(btn);
    lista.appendChild(tr);
  });
}

// ===== ELIMINAR =====
function eliminarCierre(index) {
  let data = JSON.parse(localStorage.getItem('cierres')) || [];
  const cierre = data[index];

  if (!confirm("¿Eliminar este cierre?")) return;

  totalDia.total -= cierre.total;
  if (totalDia.total < 0) totalDia.total = 0;

  localStorage.setItem('totalDia', JSON.stringify(totalDia));
  totalDiaInput.value = "$" + totalDia.total.toFixed(2);

  data.splice(index, 1);
  localStorage.setItem('cierres', JSON.stringify(data));

  mostrar();
}

// ===== CALENDARIO =====
document.getElementById('addCalendar').addEventListener('click', () => {
  const total = totalDia.total.toFixed(2);
  const fecha = hoy.replace(/-/g, '');

  const texto = `Cierre diario\nFecha: ${hoy}\nTotal vendido: $${total}`;
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Cierre Diario&dates=${fecha}/${fecha}&details=${encodeURIComponent(texto)}`;

  window.open(url, '_blank');
});

// ===== EVENTOS =====
guardarBtn.addEventListener('click', guardarCierre);
document.getElementById('filtroFecha').addEventListener('change', mostrar);
document.getElementById('toggleDark').addEventListener('click', () =>
  document.body.classList.toggle('dark')
);

// ===== INICIO =====
mostrar();
    
