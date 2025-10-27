document.addEventListener('DOMContentLoaded', inicializarCheckout);

const COSTO_ENVIO = 5.00; // Define un costo de envío fijo

function inicializarCheckout() {
    const carrito = JSON.parse(localStorage.getItem('carritoTienda')) || [];
    
    // Si el carrito está vacío, redirige.
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Serás redirigido a la página principal.');
        window.location.href = 'index.html';
        return; 
    }

    renderizarResumen(carrito);
    configurarEnvioDePedido(carrito);
}

// -------------------------------------------------------------------------
// PASO 1: Renderizar el Resumen y Calcular Totales (Visual)
// -------------------------------------------------------------------------
function renderizarResumen(carrito) {
    const listaResumen = document.getElementById('listaResumenProductos');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    const envioEl = document.getElementById('checkoutEnvio');
    const btnConfirmar = document.getElementById('btnConfirmarPedido');
    
    let subtotal = 0;
    listaResumen.innerHTML = ''; // Limpiar la lista

    carrito.forEach(item => {
        const precio = parseFloat(item.precio);
        const totalItem = precio * item.cantidad;
        subtotal += totalItem;

        const li = document.createElement('li');
        li.classList.add('resumen-item');
        
        // ✅ CORRECCIÓN: Se usa item.imagen para la URL
        li.innerHTML = `
            <div class="item-imagen">
                <img src="${item.imagen}" alt="${item.nombre}">
            </div>
            <div class="item-detalles-compacto">
                <p class="item-nombre">${item.nombre}</p>
                <p class="item-datos">Cód: ${item.id || 'N/A'} | $${precio.toFixed(2)} x ${item.cantidad}</p>
            </div>
            <div class="item-total-compacto">
                <strong>$${totalItem.toFixed(2)}</strong>
            </div>
        `;
        listaResumen.appendChild(li);
    });

    const totalFinal = subtotal + COSTO_ENVIO;

    // Mostrar los totales en la UI
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    envioEl.textContent = `$${COSTO_ENVIO.toFixed(2)}`;
    totalEl.textContent = `$${totalFinal.toFixed(2)}`;
    
    // Actualizar el texto del botón de pago
    btnConfirmar.textContent = `Confirmar Pedido y Pago de $${totalFinal.toFixed(2)}`;

    // Guardar el total en el campo oculto
    document.getElementById('totalCompraInput').value = `$${totalFinal.toFixed(2)}`;
}

// -------------------------------------------------------------------------
// PASO 2: Configurar el Envío de Pedido a Formspree (Texto Conciso)
// -------------------------------------------------------------------------
function configurarEnvioDePedido(carrito) {
    const formulario = document.getElementById('formularioCheckout');
    const detallePedidoInput = document.getElementById('detallePedidoInput');

    // 1. Crear el detalle del pedido en una línea por producto (MÁS CORTO)
    let detalleTexto = '--- DETALLE DE PRODUCTOS (Cód | Cant | Total) ---\n';
    
    carrito.forEach(item => {
        const precio = parseFloat(item.precio);
        const totalItem = precio * item.cantidad;
        
        // Formato conciso: Nombre (Cód: P1) x2 = $50.00
        detalleTexto += `${item.nombre} (Cód: ${item.id || 'N/A'}) x${item.cantidad} = $${totalItem.toFixed(2)}\n`;
    });
    
    // 2. Añadir totales al detalle
    const subtotal = carrito.reduce((sum, item) => sum + parseFloat(item.precio) * item.cantidad, 0);
    const totalFinal = subtotal + COSTO_ENVIO;

    detalleTexto += `\n------------------------------------\n`;
    detalleTexto += `SUBTOTAL: $${subtotal.toFixed(2)}\n`;
    detalleTexto += `COSTO ENVÍO: $${COSTO_ENVIO.toFixed(2)}\n`;
    detalleTexto += `TOTAL FINAL: $${totalFinal.toFixed(2)}\n`;
    detalleTexto += `------------------------------------\n`;


    // 3. Insertar el detalle completo en el campo oculto
    detallePedidoInput.value = detalleTexto;
    
    // Manejar el evento de envío del formulario
    formulario.addEventListener('submit', function(e) {
        // Después de enviar a Formspree, limpia el carrito
        localStorage.removeItem('carritoTienda');
        alert('¡Pedido confirmado! Revisa tu WhatsApp para la confirmación.');
    });
}