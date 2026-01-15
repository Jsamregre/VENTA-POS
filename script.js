// ================= FECHA =================
const hoy = new Date().toISOString().split("T")[0];
document.getElementById("fecha").innerText = "Fecha: " + hoy;

// ================= INPUTS =================
const descripcionInput = document.getElementById("descripcion");
const codigoInput = document.getElementById("codigo");
const inicioInput = document.getElementById("inicio");
const retornoInput = document.getElementById("retorno");
const precioInput = document.getElementById("precio");
const vendidosInput = document.getElementById("vendidos");
const totalInput = document.getElementById("total");

const totalDiaInput = document.getElementById("totalDia");
const totalGastosInput = document.getElementById("totalGastos");
const efectivoRealInput = document.getElementById("efectivoReal");

// ================= STORAGE =================
let cierres = JSON.parse(localStorage.getItem("cierres")) || [];
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];
let totalDia = JSON.parse(localStorage.getItem("totalDia"));

if (!totalDia || totalDia.fecha !== hoy) {
  totalDia = { fecha: hoy, total: 0 };
  gastos = [];
  localStorage.setItem("gastos", JSON.stringify(gastos));
  localStorage.setItem("totalDia", JSON.stringify(totalDia));
}

// ================= CALCULAR =================
function calcular() {
  const inicio = Number(inicioInput.value) || 0;
  const retorno = Number(retornoInput.value) || 0;
  const precio = Number(precioInput.value) || 0;

  const vendidos = Math.max(inicio - retorno, 0);
  const total = Math.max(vendidos * precio, 0);

  vendidosInput.value = vendidos;
  totalInput.value = total.toFixed(2);
}

[inicioInput, retornoInput, precioInput].forEach((i) =>
  i.addEventListener("input", calcular)
);

// ================= GUARDAR CIERRE =================
document.getElementById("guardarBtn").addEventListener("click", () => {
  const vendidos = Number(vendidosInput.value);
  const total = Number(totalInput.value);

  if (vendidos <= 0 || total <= 0) return;

  cierres.push({
    fecha: hoy,
    descripcion: descripcionInput.value,
    codigo: codigoInput.value,
    vendidos,
    total,
  });

  totalDia.total += total;

  localStorage.setItem("cierres", JSON.stringify(cierres));
  localStorage.setItem("totalDia", JSON.stringify(totalDia));

  descripcionInput.value = "";
  codigoInput.value = "";
  inicioInput.value = "";
  retornoInput.value = "";
  precioInput.value = "";
  calcular();

  actualizarResumen();
  mostrar();
});

// ================= GASTOS =================
document.getElementById("agregarGasto").addEventListener("click", () => {
  const desc = document.getElementById("gastoDesc").value;
  const monto = Number(document.getElementById("gastoMonto").value);

  if (!desc || monto <= 0) return;

  gastos.push({ desc, monto });
  localStorage.setItem("gastos", JSON.stringify(gastos));

  document.getElementById("gastoDesc").value = "";
  document.getElementById("gastoMonto").value = "";

  actualizarResumen();
  mostrar();
});

// ================= MOSTRAR =================
function mostrar() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";
  const filtro = document.getElementById("filtroFecha").value;

  cierres.forEach((c, i) => {
    if (filtro && c.fecha !== filtro) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Venta</td>
      <td>${c.fecha}</td>
      <td>${c.descripcion}</td>
      <td>${c.codigo}</td>
      <td>${c.vendidos}</td>
      <td>$${c.total.toFixed(2)}</td>
      <td><button onclick="eliminarCierre(${i})">Eliminar</button></td>
    `;
    lista.appendChild(tr);
  });

  gastos.forEach((g, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>Gasto</td>
      <td>${hoy}</td>
      <td>${g.desc}</td>
      <td>-</td>
      <td>-</td>
      <td>$${g.monto.toFixed(2)}</td>
      <td><button onclick="eliminarGasto(${i})">Eliminar</button></td>
    `;
    lista.appendChild(tr);
  });
}

// ================= ELIMINAR =================
function eliminarCierre(i) {
  if (!confirm("¿Eliminar cierre?")) return;

  totalDia.total -= cierres[i].total;
  cierres.splice(i, 1);

  localStorage.setItem("cierres", JSON.stringify(cierres));
  localStorage.setItem("totalDia", JSON.stringify(totalDia));

  actualizarResumen();
  mostrar();
}

function eliminarGasto(i) {
  if (!confirm("¿Eliminar gasto?")) return;

  gastos.splice(i, 1);
  localStorage.setItem("gastos", JSON.stringify(gastos));

  actualizarResumen();
  mostrar();
}

// ================= RESUMEN =================
function actualizarResumen() {
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  const efectivo = totalDia.total - totalGastos;

  totalDiaInput.value = "$" + totalDia.total.toFixed(2);
  totalGastosInput.value = "$" + totalGastos.toFixed(2);
  efectivoRealInput.value = "$" + efectivo.toFixed(2);
}

// ================= PDF TOTALMENTE OFFLINE =================
document.getElementById("addCalendar").addEventListener("click", () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Cierre Diario", 105, 15, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Fecha: ${hoy}`, 14, 30);
  doc.text(`Total vendido: $${totalDia.total.toFixed(2)}`, 14, 38);

  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0);
  doc.text(`Gastos del día: $${totalGastos.toFixed(2)}`, 14, 46);

  doc.text(
    `Efectivo real esperado: $${(totalDia.total - totalGastos).toFixed(2)}`,
    14,
    54
  );

  let y = 64;

  // VENTAS
  doc.setFontSize(14);
  doc.text("DETALLE DE VENTAS", 14, y);
  y += 6;

  doc.setFontSize(12);
  cierres.forEach((c) => {
    doc.text(
      `• ${c.descripcion} (${c.codigo}) — ${c.vendidos} vendidos — $${c.total.toFixed(
        2
      )}`,
      14,
      y
    );
    y += 6;

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  // GASTOS
  if (gastos.length) {
    y += 6;
    doc.setFontSize(14);
    doc.text("DETALLE DE GASTOS", 14, y);
    y += 6;

    doc.setFontSize(12);
    gastos.forEach((g) => {
      doc.text(`• ${g.desc}: $${g.monto.toFixed(2)}`, 14, y);
      y += 6;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
  }

  doc.save(`Cierre_${hoy}.pdf`);
});

// ================= UI =================
document
  .getElementById("toggleDark")
  .addEventListener("click", () => document.body.classList.toggle("dark"));

document.getElementById("filtroFecha").addEventListener("change", mostrar);

// ================= INIT =================
mostrar();
actualizarResumen();

    
