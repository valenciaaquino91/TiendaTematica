// =================================================================
// Funcionalidad del carrusel de imágenes (PRINCIPAL - index.html)
// =================================================================
function inicializarCarruselPrincipal() {
    const carruselDeslizadores = document.querySelectorAll('.carrusel-deslizador');
    let indicePrincipalActual = 0;

    function mostrarDeslizadorPrincipal(index) {
        carruselDeslizadores.forEach((deslizador, i) => {
            deslizador.style.opacity = (i === index) ? '1' : '0';
            if (i === 0 && window.location.pathname.endsWith('index.html')) {
                deslizador.style.position = 'relative';
            } else {
                deslizador.style.position = 'absolute';
            }
        });
    }

    function siguienteDeslizadorPrincipal() {
        indicePrincipalActual = (indicePrincipalActual + 1) % carruselDeslizadores.length;
        mostrarDeslizadorPrincipal(indicePrincipalActual);
    }

    if (carruselDeslizadores.length > 0) {
        mostrarDeslizadorPrincipal(indicePrincipalActual);
        setInterval(siguienteDeslizadorPrincipal, 5000); 
    }
}

// =================================================================
// 1. CARRUSELES DE PRODUCTOS (Onepiece.html)
// =================================================================
function inicializarCarruselesProductos() {
    const carruselesContenedores = document.querySelectorAll('.producto-carrusel-contenedor');

    carruselesContenedores.forEach(contenedor => {
        const imagenes = contenedor.querySelectorAll('.producto-imagen-carrusel');
        const prevButton = contenedor.querySelector('.prev');
        const nextButton = contenedor.querySelector('.next');
        let indiceActual = 0;

        function mostrarImagen(index) {
            imagenes.forEach(img => img.classList.remove('activo'));
            if (imagenes[index]) {
                imagenes[index].classList.add('activo');
                imagenes[index].classList.remove('imagen-zoom'); 
                imagenes[index].style.cursor = 'zoom-in';
                imagenes[index].style.setProperty('--zoom-x', '0');
                imagenes[index].style.setProperty('--zoom-y', '0');
            }
        }

        if (imagenes.length > 0) {
            mostrarImagen(indiceActual);
            
            if (prevButton) {
                prevButton.addEventListener('click', () => {
                    indiceActual = (indiceActual - 1 + imagenes.length) % imagenes.length;
                    mostrarImagen(indiceActual);
                });
            }

            if (nextButton) {
                nextButton.addEventListener('click', () => {
                    indiceActual = (indiceActual + 1) % imagenes.length;
                    mostrarImagen(indiceActual);
                });
            }
        }
    });
}

// =================================================================
// 2. ZOOM INTERACTIVO DE IMÁGENES
// =================================================================
function inicializarZoom() {
    document.querySelectorAll('.producto-imagen-carrusel').forEach(img => {
        img.addEventListener('click', function(e) {
            const isZoomed = this.classList.toggle('imagen-zoom');
            
            if (isZoomed) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const offsetX = (x / rect.width - 0.5) * -100;
                const offsetY = (y / rect.height - 0.5) * -100;
                
                this.style.setProperty('--zoom-x', `${offsetX}px`);
                this.style.setProperty('--zoom-y', `${offsetY}px`);
                this.style.cursor = 'zoom-out';
            } else {
                this.style.setProperty('--zoom-x', '0');
                this.style.setProperty('--zoom-y', '0');
                this.style.cursor = 'zoom-in';
            }
        });
    });
}

// =================================================================
// 3. CARRITO DE COMPRAS (Lógica básica usando LocalStorage)
// =================================================================
const modalCarrito = document.getElementById('modalCarrito');
const btnAbrirCarrito = document.getElementById('abrirCarrito');
const btnCerrarCarrito = document.getElementById('cerrarCarritoModal');
const listaCarrito = document.getElementById('listaCarrito');
const totalCarrito = document.getElementById('totalCarrito');
const carritoVacio = document.getElementById('carritoVacio');
// Botón para ir al Checkout
let btnFinalizarCompra; 
if(modalCarrito) {
    // Buscamos el enlace/botón de finalizar compra dentro del modal del carrito
    btnFinalizarCompra = modalCarrito.querySelector('.btn-principal');
}


let carrito = JSON.parse(localStorage.getItem('carritoTienda')) || [];

function guardarCarrito() {
    localStorage.setItem('carritoTienda', JSON.stringify(carrito));
}

function renderizarCarrito() {
    listaCarrito.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        carritoVacio.style.display = 'block';
        if (btnFinalizarCompra) btnFinalizarCompra.disabled = true;
    } else {
        carritoVacio.style.display = 'none';
        if (btnFinalizarCompra) btnFinalizarCompra.disabled = false;
        
        carrito.forEach((item, index) => {
            const li = document.createElement('li');
            const precio = parseFloat(item.precio);
            total += precio * item.cantidad;
            
            // Se muestra el código del producto (item.id)
            li.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.imagen}" alt="${item.nombre}" 
                          style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    <div>
                        ${item.nombre} (Código: ${item.id || 'N/A'}) (x${item.cantidad})
                        <br>
                        <strong>$${(precio * item.cantidad).toFixed(2)}</strong>
                    </div>
                </div>
                <button data-index="${index}" class="btn-eliminar-item">X</button>
            `;
            listaCarrito.appendChild(li);
        });
    }

    totalCarrito.textContent = `$${total.toFixed(2)}`;
    guardarCarrito();
}

/**
 * 💥 FUNCIÓN CORREGIDA 💥
 * Esta función ahora busca la imagen activa en el carrusel del producto 
 * para asegurar que la ruta de la imagen se guarde en el carrito.
 */
function agregarProductoAlCarrito(event) {
    const productoDiv = event.target.closest('.caja-producto');
    if (!productoDiv) return;

    const nombre = productoDiv.dataset.nombre;
    const precio = productoDiv.dataset.precio.toString();
    const id = productoDiv.dataset.id || 'N/A';
    
    // 🔥 CORRECCIÓN CLAVE:
    // 1. Buscamos la etiqueta <img> que tiene la clase 'activo' (la imagen visible del carrusel).
    const imagenElemento = productoDiv.querySelector('.producto-imagen-carrusel.activo');
    // 2. Obtenemos su atributo 'src'. Usamos una imagen por defecto si no se encuentra.
    const imagen = imagenElemento ? imagenElemento.src : 'Imagenes_de_interfaz/logo_sin_foto.png'; 

    // Buscar si ya existe un item con el mismo nombre (o ID)
    const itemExistente = carrito.find(item => item.nombre === nombre);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        // ✅ Guardamos el objeto con la propiedad 'imagen' y la ruta capturada
        carrito.push({ nombre, precio, cantidad: 1, imagen, id });
    }

    renderizarCarrito();
    alert(`"${nombre}" (Código: ${id}) añadido al carrito.`);
}

function eliminarItemDelCarrito(event) {
    if (event.target.classList.contains('btn-eliminar-item')) {
        const index = parseInt(event.target.dataset.index);
        
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad -= 1;
        } else {
            carrito.splice(index, 1); 
        }
        
        renderizarCarrito();
    }
}

// --- Event Listeners del Carrito ---
if (btnAbrirCarrito && modalCarrito) {
    btnAbrirCarrito.addEventListener('click', (e) => {
        e.preventDefault();
        renderizarCarrito();
        modalCarrito.style.display = 'flex';
        document.body.classList.add('modal-open');
    });
}

if (btnCerrarCarrito && modalCarrito) {
    btnCerrarCarrito.addEventListener('click', () => {
        modalCarrito.style.display = 'none';
        document.body.classList.remove('modal-open');
    });
}

// Event Listener para redirigir a checkout.html
if (btnFinalizarCompra) {
    btnFinalizarCompra.addEventListener('click', () => {
        if (carrito.length > 0) {
            modalCarrito.style.display = 'none';
            document.body.classList.remove('modal-open');
            window.location.href = 'checkout.html'; // Redirección a la página de pago
        } else {
            alert('El carrito está vacío. Agrega productos antes de finalizar la compra.');
        }
    });
}


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-agregar-carrito')) {
        agregarProductoAlCarrito(e);
    }
    eliminarItemDelCarrito(e);
});


// =================================================================
// 4. FUNCIONALIDAD DE BÚSQUEDA (Simple)
// =================================================================
function inicializarBusqueda() {
    const inputBusqueda = document.getElementById('inputBusqueda');
    const botonBusqueda = document.getElementById('botonBusqueda');
    const productos = document.querySelectorAll('.caja-producto');

    function filtrarProductos() {
        const busqueda = inputBusqueda.value.toLowerCase();
        
        productos.forEach(producto => {
            const nombre = producto.dataset.nombre.toLowerCase();
            const descripcionElement = producto.querySelector('.producto-detalles p:last-child');
            const descripcion = descripcionElement ? descripcionElement.textContent.toLowerCase() : '';

            if (nombre.includes(busqueda) || descripcion.includes(busqueda)) {
                producto.style.display = 'block'; 
            } else {
                producto.style.display = 'none';
            }
        });
    }

    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', filtrarProductos);
    }
    if (botonBusqueda) {
        botonBusqueda.addEventListener('click', filtrarProductos);
    }
}


// =================================================================
// 5. FUNCIONALIDAD DEL MODAL y FORMULARIOS (Login/Registro)
// =================================================================
function validarContrasena(contrasena) {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(contrasena);
    const hasLower = /[a-z]/.test(contrasena);
    const hasNumber = /[0-9]/.test(contrasena);
    const hasSpecial = /[^A-Za-z0-9\s]/.test(contrasena); 

    if (contrasena.length === 0) return "";
    if (contrasena.length < minLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
            return "! Asegura que la contraseña cumpla todos los requisitos.";
    }
    return "!! Contraseña segura."; 
}

function inicializarModalesYFormularios() {
    const modal = document.getElementById('modalFormulario');
    const btnAbrirModal = document.getElementById('abrirModalUsuario');
    const btnCerrarModal = document.querySelector('.cerrar-modal');
    const formIngreso = document.getElementById('formularioIngreso');
    const formRegistro = document.getElementById('formularioRegistro');
    const btnAbrirRegistro = document.getElementById('abrirRegistro');
    const btnAbrirIngreso = document.getElementById('abrirIngreso');
    const body = document.body;
    
    // Elementos de Registro
    const inputContrasenaRegistro = document.getElementById('registro-contrasena');
    const mensajeSeguridad = document.getElementById('mensajeSeguridadContrasena');
    
    // Elementos de Mostrar/Ocultar Contraseña
    const togglePasswordRegistro = document.getElementById('togglePasswordRegistro');
    const passwordInputRegistro = document.getElementById('registro-contrasena');
    const togglePasswordLogin = document.getElementById('togglePasswordLogin');
    const passwordInputLogin = document.getElementById('login-contrasena');

    // Lógica de Apertura y Cierre del Modal 
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener('click', (event) => {
            event.preventDefault();
            modal.style.display = 'flex'; 
            body.classList.add('modal-open');
            formIngreso.style.display = 'block';
            formRegistro.style.display = 'none';
        });
    }

    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', () => {
             if (modal) {
                modal.style.display = 'none';
                body.classList.remove('modal-open');
            }
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) { 
            modal.style.display = 'none';
            body.classList.remove('modal-open');
        }
        if (modalCarrito && modalCarrito.style.display === 'flex' && event.target === modalCarrito) {
             modalCarrito.style.display = 'none';
             document.body.classList.remove('modal-open'); 
        }
    });

    // Lógica de Intercambio de Formularios 
    if (btnAbrirRegistro && formIngreso && formRegistro) {
        btnAbrirRegistro.addEventListener('click', (event) => {
            event.preventDefault();
            formIngreso.style.display = 'none';
            formRegistro.style.display = 'block';
        });
    }
    
    if (btnAbrirIngreso && formIngreso && formRegistro) {
        btnAbrirIngreso.addEventListener('click', (event) => {
            event.preventDefault();
            formRegistro.style.display = 'none';
            formIngreso.style.display = 'block';
        });
    }

    // Lógica Mostrar/Ocultar Contraseña
    function setupPasswordToggle(toggleElement, inputElement) {
        if (toggleElement && inputElement) {
            toggleElement.addEventListener('click', function () {
                const type = inputElement.getAttribute('type') === 'password' ? 'text' : 'password';
                inputElement.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }
    }

    setupPasswordToggle(togglePasswordRegistro, passwordInputRegistro);
    setupPasswordToggle(togglePasswordLogin, passwordInputLogin);

    // LÓGICA DE VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL
    if (inputContrasenaRegistro && mensajeSeguridad) {
        inputContrasenaRegistro.addEventListener('input', () => {
            const resultado = validarContrasena(inputContrasenaRegistro.value);
            mensajeSeguridad.textContent = resultado;

            if (resultado.startsWith("!")) { 
                mensajeSeguridad.style.color = 'red';
            } else if (resultado.startsWith("!!")) { 
                    mensajeSeguridad.style.color = '#00CED1'; 
            } else {
                    mensajeSeguridad.textContent = ''; 
            }
        });
    }
}

// =================================================================
// INICIALIZACIÓN DE TODAS LAS FUNCIONES AL CARGAR LA PÁGINA
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarCarruselPrincipal();
    inicializarModalesYFormularios();
    
    // Inicializar funciones específicas solo para la página de productos (Onepiece.html)
    if (document.querySelector('.grid-productos')) {
        inicializarCarruselesProductos();
        inicializarZoom();
        inicializarBusqueda();
    }
    
    renderizarCarrito();
});