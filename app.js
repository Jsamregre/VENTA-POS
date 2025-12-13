// === FECHA ACTUAL ===
const hoy = new Date().toISOString().split('T')[0];
document.getElementById('fecha').innerText = "Fecha: " + hoy;

// === INPUTS ===
const descripcionInput = document.getElementById('descripcion');
const codigoInput = document.getElementById('codigo');
const inicioInput = document.getElementById('inicio');
const retornoInput = document.getElementById('retorno');
const precioInput = document.getElementById('precio');
const vendidosInput = document.getElementById('vendidos');
const totalInput = document.getElementById('total');
const totalDiaInput = document.getElementById('totalDia');
const guardarBtn = document.getElementById('guardarBtn');

let editIndex = null;

// === TOTAL DEL DÍA ===
let totalDia = JSON.parse(localStorage.getItem('totalDia'));
if(!totalDia || totalDia.fecha !== hoy){
    totalDia = {fecha: hoy, total: 0};
    localStorage.setItem('totalDia', JSON.stringify(totalDia));
}
totalDiaInput.value = "$" + totalDia.total.toFixed(2);

// === CALCULAR VENDIDOS Y TOTAL ===
function calcular() {
    const i = Number(inicioInput.value) || 0;
    const r = Number(retornoInput.value) || 0;
    const p = Number(precioInput.value) || 0;

    const vendidos = i - r;
    const total = vendidos * p;

    vendidosInput.value = vendidos > 0 ? vendidos : 0;
    totalInput.value = total > 0 ? total.toFixed(2) : "0.00";
}

[inicioInput, retornoInput, precioInput].forEach(el => el.addEventListener('input', calcular));

// === GUARDAR CIERRE ===
function guardarCierre(){
    const vendidos = Number(vendidosInput.value) || 0;
    const totalActual = Number(totalInput.value) || 0;

    if(vendidos <= 0 || totalActual <= 0) return;

    const data = JSON.parse(localStorage.getItem('cierres')) || [];

    // Si estamos editando, restar el total anterior
    if(editIndex !== null){
        const anterior = data[editIndex];
        totalDia.total -= anterior.total;
        data.splice(editIndex,1);
        editIndex = null;
    }

    const cierre = {
        fecha: hoy,
        descripcion: descripcionInput.value,
        codigo: codigoInput.value,
        vendidos: vendidos,
        total: totalActual
    };

    data.push(cierre);
    localStorage.setItem('cierres', JSON.stringify(data));

    totalDia.total += totalActual;
    localStorage.setItem('totalDia', JSON.stringify(totalDia));
    totalDiaInput.value = "$" + totalDia.total.toFixed(2);

    // Limpiar inputs
    descripcionInput.value = "";
    codigoInput.value = "";
    inicioInput.value = "";
    retornoInput.value = "";
    precioInput.value = "";
    calcular();

    mostrar();
}

// === MOSTRAR VISTA PREVIA ===
function mostrar(){
    const lista = document.getElementById('lista');
    lista.innerHTML = "";
    const data = JSON.parse(localStorage.getItem('cierres')) || [];
    const filtro = document.getElementById('filtroFecha').value;

    data.forEach((c,index) => {
        if(filtro && c.fecha !== filtro) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.fecha}</td>
            <td>${c.descripcion}</td>
            <td>${c.codigo}</td>
            <td>${c.vendidos}</td>
            <td>$${Number(c.total).toFixed(2)}</td>
            <td></td>
        `;

        // Botón Editar
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = 'Editar';
        btn.addEventListener('click', () => editarCierre(index));
        tr.children[5].appendChild(btn);

        lista.appendChild(tr);
    });
}

// === EDITAR REGISTRO ===
function editarCierre(index){
    const data = JSON.parse(localStorage.getItem('cierres')) || [];
    const cierre = data[index];

    descripcionInput.value = cierre.descripcion;
    codigoInput.value = cierre.codigo;
    inicioInput.value = cierre.vendidos;
    retornoInput.value = 0;
    precioInput.value = cierre.total / cierre.vendidos;
    calcular();

    // Restar total antiguo del total del día
    totalDia.total -= cierre.total;
    localStorage.setItem('totalDia', JSON.stringify(totalDia));
    totalDiaInput.value = "$" + totalDia.total.toFixed(2);

    editIndex = index;
}

// === EVENTOS ===
document.getElementById('filtroFecha').addEventListener('change', mostrar);
document.getElementById('toggleDark').addEventListener('click', () =>
    document.body.classList.toggle('dark')
);

guardarBtn.addEventListener('click', guardarCierre);

// === MOSTRAR AL INICIO ===
mostrar();

