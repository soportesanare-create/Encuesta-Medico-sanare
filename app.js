const firebaseConfig = {
  apiKey: "AIzaSyBju6s1bZCNQakcLltJE5jefHf-iWciO5w",
  authDomain: "encuesta-sanare.firebaseapp.com",
  projectId: "encuesta-sanare",
  storageBucket: "encuesta-sanare.firebasestorage.app",
  messagingSenderId: "201767412624",
  appId: "1:201767412624:web:d868b0d8574520b7c2c915"
};

// Inicializar Firebase (usando la versión "compat" para que funcione al abrir el archivo localmente)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const modal = document.getElementById('successModal');
    const closeModalBtn = document.getElementById('closeModal');
    const finalScoreEl = document.getElementById('finalScore');
    const submitBtn = form.querySelector('.btn-submit');
    const btnWhatsappModal = document.getElementById('btnWhatsappModal');

    let currentWhatsappUrl = "";

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Deshabilitar el botón para evitar envíos dobles
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Enviando...';

        // Obtener valores
        const doctorName = document.getElementById('doctorName').value.trim();
        const q1 = parseFloat(document.querySelector('input[name="q1"]:checked').value);
        const q2 = parseFloat(document.querySelector('input[name="q2"]:checked').value);
        const q3 = parseFloat(document.querySelector('input[name="q3"]:checked').value);
        const q4 = parseFloat(document.querySelector('input[name="q4"]:checked').value);
        const q5 = parseFloat(document.querySelector('input[name="q5"]:checked').value);

        // Calcular calificación del 5 al 10
        let totalScore = q1 + q2 + q3 + q4 + q5;
        totalScore = Math.round(totalScore * 10) / 10;

        try {
            // Guardar en Firebase Firestore (Sin "await" para que no bloquee la pantalla si hay restricciones en archivos locales)
            db.collection("encuestas_resultados").add({
                doctorName: doctorName,
                q1: q1,
                q2: q2,
                q3: q3,
                q4: q4,
                q5: q5,
                calificacion_final: totalScore,
                fecha: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log("¡Encuesta guardada en Firebase exitosamente!");
            }).catch((error) => {
                console.error("Error al guardar en Firebase: ", error);
            });

            // Mostrar puntuación en el modal
            finalScoreEl.textContent = totalScore;

            // Formatear mensaje para WhatsApp
            const phoneNumber = "525669998773";
            const message = `*Nueva Evaluación de Servicio y Seguridad*%0A%0A*Médico:* ${doctorName}%0A*Calificación Final:* ${totalScore}/10%0A%0A_Enviado desde el portal de encuestas Sanare._`;
            currentWhatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

            // Mostrar modal
            modal.classList.remove('hidden');

            // Intento de redirección automática segura para móviles
            setTimeout(() => {
                window.location.href = currentWhatsappUrl;
            }, 2500);

        } catch (error) {
            console.error("Error en la ejecución de la encuesta: ", error);
            alert("Hubo un error al procesar la encuesta. Por favor, revise la consola.");
        } finally {
            // Restaurar el botón
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'Enviar Resultados';
        }
    });

    btnWhatsappModal.addEventListener('click', () => {
        if(currentWhatsappUrl) {
            window.location.href = currentWhatsappUrl;
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
