// ===============================
// VALIDACIÓN Y REGISTRO DE USUARIO CON BACKEND
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  // --- Referencias a los campos y mensajes ---
  const form = document.getElementById('registerForm');
  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('new-email');
  const passwordInput = document.getElementById('new-password');
  const confirmInput = document.getElementById('confirm-password');
  const errorNombre = document.getElementById('error-nombre');
  const errorEmail = document.getElementById('error-email');
  const errorPassword = document.getElementById('error-password');
  const errorConfirm = document.getElementById('error-confirm');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('password-strength-text');

  // --- Validaciones en tiempo real ---
  nombreInput.addEventListener('input', validateName);
  emailInput.addEventListener('input', validateEmail);
  passwordInput.addEventListener('input', () => {
    validatePassword();
    const score = passwordStrength(passwordInput.value);
    updateStrengthBar(score);
    showStrengthText(score, passwordInput.value);
  });
  confirmInput.addEventListener('input', validateConfirm);

  // --- Validación de nombre ---
  function validateName() {
    const name = nombreInput.value.trim();
    if (!name) {
      errorNombre.textContent = 'El nombre completo es obligatorio.';
      return false;
    }
    if (/\d/.test(name)) {
      errorNombre.textContent = 'No se permiten números en el nombre.';
      return false;
    }
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(name)) {
      errorNombre.textContent = 'No se permiten símbolos en el nombre.';
      return false;
    }
    // Al menos dos palabras, cada una con mayúscula inicial
    const nameRegex = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+$/;
    if (!nameRegex.test(name)) {
      errorNombre.textContent = 'Empieza con mayúscula y solo letras (Ej: Edwin Molina)';
      return false;
    }
    errorNombre.textContent = '';
    return true;
  }

  // --- Validación de correo ---
  function validateEmail() {
    const email = emailInput.value.trim().toLowerCase();
    const validDomains = ['@gmail.com', '@hotmail.com', '@unicatolica.edu.co'];
    if (!email) {
      errorEmail.textContent = 'El correo es obligatorio.';
      return false;
    }
    if (!email.includes('@')) {
      errorEmail.textContent = 'El correo debe contener @';
      return false;
    }
    if (!validDomains.some(d => email.endsWith(d))) {
      errorEmail.textContent = 'Solo se permiten correos @gmail.com, @hotmail.com o institucional.';
      return false;
    }
    errorEmail.textContent = '';
    return true;
  }

  // --- Validación de contraseña ---
  function validatePassword() {
    const password = passwordInput.value;
    if (!password) {
      errorPassword.textContent = 'La contraseña es obligatoria.';
      return false;
    }
    if (password.length < 8) {
      errorPassword.textContent = 'Mínimo 8 caracteres.';
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      errorPassword.textContent = 'Al menos una mayúscula.';
      return false;
    }
    if (!/[a-z]/.test(password)) {
      errorPassword.textContent = 'Al menos una minúscula.';
      return false;
    }
    if (!/[0-9]/.test(password)) {
      errorPassword.textContent = 'Al menos un número.';
      return false;
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errorPassword.textContent = 'Al menos un símbolo.';
      return false;
    }
    errorPassword.textContent = '';
    return true;
  }

  // --- Validación de confirmación de contraseña ---
  function validateConfirm() {
    if (!confirmInput.value) {
      errorConfirm.textContent = 'Confirma tu contraseña.';
      return false;
    }
    if (confirmInput.value !== passwordInput.value) {
      errorConfirm.textContent = 'Las contraseñas no coinciden.';
      return false;
    }
    errorConfirm.textContent = '';
    return true;
  }

  // --- Medidor de fuerza de contraseña ---
  function passwordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }
  function updateStrengthBar(score) {
    const colors = ['#ccc', '#e63946', 'orange', 'gold', 'yellowgreen', 'green'];
    strengthBar.style.width = (score * 20) + '%';
    strengthBar.style.backgroundColor = colors[score] || '#ccc';
  }
  function showStrengthText(score, password) {
    if (!password) {
      strengthText.textContent = '';
      return;
    }
    if (score <= 2) {
      strengthText.textContent = 'Contraseña débil';
      strengthText.style.color = '#e63946';
    } else if (score === 3 || score === 4) {
      strengthText.textContent = 'Contraseña aceptable';
      strengthText.style.color = 'orange';
    } else if (score >= 5) {
      strengthText.textContent = 'Contraseña fuerte';
      strengthText.style.color = 'green';
    }
  }

  // --- Envío final del formulario ---
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const nameOk = validateName();
    const emailOk = validateEmail();
    const passOk = validatePassword();
    const confirmOk = validateConfirm();

    if (!nameOk || !emailOk || !passOk || !confirmOk) return;

    // --- Registro solo con backend ---
    fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombreInput.value.trim(),
        email: emailInput.value.trim().toLowerCase(),
        password: passwordInput.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        const modal = document.getElementById('success-modal');
        const countdown = document.getElementById('countdown');
        let seconds = 3;
        modal.style.display = 'flex';
        countdown.textContent = seconds;
        const interval = setInterval(() => {
          seconds--;
          countdown.textContent = seconds;
          if (seconds === 0) {
            clearInterval(interval);
            window.location.href = "login.html";
          }
        }, 1000);
      } else {
        errorEmail.textContent = data.msg;
      }
    });
  });
});