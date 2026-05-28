document.addEventListener('DOMContentLoaded', function() {
    const pcbForm = document.getElementById('pcbForm');
    const btnWhatsapp = document.getElementById('btnWhatsapp'); // Capturamos el botón de WhatsApp
    
    // Elementos de la interfaz donde se MUESTRAN los resultados en el resumen
    const resArea = document.getElementById('resArea');
    const resCaras = document.getElementById('resCaras');
    const resSoldadura = document.getElementById('resSoldadura');
    const resPerforaciones = document.getElementById('resPerforaciones');
    const resCost = document.getElementById('resCost'); // Contenedor del costo

    if (pcbForm) {
        // Escuchamos 'change' para reaccionar al instante a inputs numéricos y radio buttons
        pcbForm.addEventListener('change', function() {
            
            // 1. Área total
            const anchoMm = parseFloat(document.getElementById('pcbWidth').value) || 0;
            const altoMm = parseFloat(document.getElementById('pcbHeight').value) || 0;
            const areaCm2 = (anchoMm * altoMm) / 100;
            if (resArea) {
                resArea.innerText = `${areaCm2.toFixed(2)} cm²`;
            }

            // 2. Caras y su precio por cm²
            const inputCaras = document.querySelector('input[name="carasPcb"]:checked');
            let precioPorCm2 = 0.06; // Por defecto: una cara ($0.06)
            
            if (inputCaras && resCaras) {
                const labelCaras = document.querySelector(`label[for="${inputCaras.id}"]`);
                resCaras.innerText = labelCaras ? labelCaras.innerText : '';
                
                // Si el ID o el valor indica doble cara, cambia a $0.13
                if (inputCaras.id.toLowerCase().includes('doble') || inputCaras.value === '2') {
                    precioPorCm2 = 0.13;
                }
            }

            // 3. Soldadura (booleano para el recargo)
            const inputSoldadura = document.querySelector('input[name="soldadura"]:checked');
            let llevaSoldadura = false;
            
            if (inputSoldadura && resSoldadura) {
                const labelSoldadura = document.querySelector(`label[for="${inputSoldadura.id}"]`);
                resSoldadura.innerText = labelSoldadura ? labelSoldadura.innerText : '';
                
                // Validamos si el usuario seleccionó la opción "SI"
                if (inputSoldadura.value.toLowerCase() === 'si' || inputSoldadura.id.toLowerCase().includes('si')) {
                    llevaSoldadura = true;
                }
            }

            // 4. Perforaciones
            const inputHoles = document.getElementById('pcbHoles');
            const perforaciones = inputHoles ? (parseInt(inputHoles.value) || 0) : 0;
            if (resPerforaciones) {
                resPerforaciones.innerText = perforaciones;
            }

            // ==========================================
            // 5. NUEVA FÓRMULA DE COSTO CON 40% DE GANANCIA
            // ==========================================
            if (resCost) {
                if (areaCm2 === 0) {
                    resCost.innerText = "0.00";
                } else {
                    // Costo base del sustrato (Área * precio según caras)
                    const costoMaterial = areaCm2 * precioPorCm2;

                    // Insumo fijo: 1 frasco de ácido férrico
                    const acidoFerrico = 4.00;

                    // Desgaste componentes
                    const desgComponentes = 5.00;

                    // Costo por perforar
                    const costoPerforaciones = perforaciones * 0.02;

                    // Costo adicional si lleva soldadura (0.08 por cada agujero)
                    const costoSoldadura = llevaSoldadura ? (perforaciones * 0.08) : 0;

                    // Suma total del costo de fabricación de la placa
                    const costoProduccion = costoMaterial + acidoFerrico + costoPerforaciones + costoSoldadura + desgComponentes;

                    // Precio final aplicando el 100% de ganancia
                    const precioFinal = costoProduccion * 2;

                    // --- truco de redondeo al 0.10 más cercano ---
                    const precioRedondeado = Math.round(precioFinal * 10) / 10;

                    // Mostramos el resultado forzando dos decimales en el texto
                    resCost.innerText = `${precioRedondeado.toFixed(2)}`;
                }
            }
            // ==========================================

        });

        // Forzar cálculo inicial automático con los valores por defecto del HTML
        pcbForm.dispatchEvent(new Event('change'));
    }

    // ==========================================
    // LÓGICA PARA ENVIAR POR WHATSAPP
    // ==========================================
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', function() {
            // Recolectamos los textos directamente de lo que ya se calculó en la pantalla
            const area = resArea ? resArea.innerText : '0.00 cm²';
            const caras = resCaras ? resCaras.innerText : 'No especificado';
            const soldadura = resSoldadura ? resSoldadura.innerText : 'No especificado';
            const perforaciones = resPerforaciones ? resPerforaciones.innerText : '0';
            const costoTotal = resCost ? resCost.innerText : '0.00';

            // Validamos que haya un cálculo válido antes de enviar
            if (costoTotal === "0.00" || parseFloat(costoTotal) === 0) {
                alert("Por favor, ingresa las dimensiones de la PCB antes de enviar la cotización.");
                return;
            }

            // Construimos el mensaje formateado (usando %0A para los saltos de línea)
            const numeroTelefono = "51942355392";
            const mensaje = `¡Hola! Aquí tienes el resumen de mi cotización de PCB:%0A%0A` +
                            `* *Dimensions / Área:* ${area}%0A` +
                            `* *Tipo de Caras:* ${caras}%0A` +
                            `* *Lleva Soldadura:* ${soldadura}%0A` +
                            `* *Cantidad de Perforaciones:* ${perforaciones}%0A%0A` +
                            `* *Costo Total Estimado:* S/${costoTotal}%0A%0A` +
                            `Quedo atento a la confirmación de mi pedido.`;

            // Creamos el enlace de la API de WhatsApp
            const urlWhatsapp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensaje}`;

            // Abrimos la pestaña/aplicación de WhatsApp
            window.open(urlWhatsapp, '_blank');
        });
    }
});