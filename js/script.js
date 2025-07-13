let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Cargar los productos del .json
fetch('./data/productos.json')
    .then(resp => {
    if (!resp.ok) throw new Error("No se pudo cargar el JSON");
    return resp.json();
    })
    .then(data => {
    productos = data;
    console.log("Productos cargados:", productos);
    activarBotones();
    mostrarCarrito();
    })
    .catch(error => {
    Swal.fire("Error", "Los productos no se pudieron cargar.", "error");
    console.error(error);
    })
    .finally(() => {
    console.log("Carga finalizada.");
});

// Activar los botones para agregar al Carrito
function activarBotones() {
    const botones = document.querySelectorAll(".btn-agregar");
    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const id = parseInt(boton.dataset.id);
            agregarAlCarrito(id);
        });
    });
}

// Agregar los productos al carrito
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const item = carrito.find(p => p.id === id);
    if (item) {
    item.cantidad++;
    } else {
    carrito.push({ ...producto, cantidad: 1 });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
    // Señal de agregado con Toastify
    Toastify({
    text: `${producto.nombre} agregado`,
    duration: 2000,
    style: { background: "#0a0" }
    }).showToast();
}

// Mostrar Carrito
function mostrarCarrito() {
    const cuerpoTabla = document.getElementById("carrito-body");
    cuerpoTabla.innerHTML = "";

    carrito.forEach((item, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.nombre}</td>
        <td>$${item.precio}</td>
        <td>${item.cantidad}</td>
        <td>$${item.precio * item.cantidad}</td>
        <td><button class="btn-eliminar" data-id="${item.id}">Eliminar</button></td>
    `;
    cuerpoTabla.appendChild(fila);
    });

    document.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", eliminarDelCarrito);
    });

    mostrarTotal();
}

// Eliminar item del Carrito
function eliminarDelCarrito(e) {
    const id = parseInt(e.target.dataset.id);
    carrito = carrito.filter(p => p.id !== id);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

// Total con IVA agregado
function mostrarTotal() {
    const subtotal = carrito.reduce((acum, item) => acum + item.precio * item.cantidad, 0);
    const totalConIVA = subtotal * 1.21;
    document.getElementById("total").textContent = `Total con IVA (21%): $${totalConIVA.toFixed(2)}`;
}

// Vaciar
document.getElementById("vaciar").addEventListener("click", () => {
    carrito = [];
    localStorage.clear();
    mostrarCarrito();
    // Señal del carrito vacio
    Toastify({
    text: "Carrito vacío",
    duration: 2500,
    style: { background: "#d00" }
    }).showToast();
});

// Asegurando previo a la Compra
document.getElementById("comprar").addEventListener("click", () => {
    if (carrito.length === 0) {
    Swal.fire("El Carrito Está Vacío", "Agregue minimo un producto antes de comprar.", "warning");
    return;
}

// Confirmacion y Compra
Swal.fire({
    title: "¿Quieres Confirmar Tu Compra?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, Quiero Comprar",
    cancelButtonText: "Cancelar"
    }).then(result => {
    if (result.isConfirmed) {
        // Limpiar el Carrito y el localStorage
        carrito = [];
        localStorage.clear();
        mostrarCarrito();
        // Señal de Compra Completada
        Swal.fire("¡Gracias por tu compra!", "Le estaremos enviando los productos lo antes posible.", "success");
    }
    });
});
