const form = document.querySelector('.login-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const registerFields = document.getElementById('register-fields');
const submitBtn = document.getElementById('submit-btn');

const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const phoneNumInput = document.getElementById('phone-num');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

let isRegisterMode = false;

// Redirect to home if already logged in
if (getCustomer()) {
    window.location.href = 'pages/home.html';
}

tabLogin?.addEventListener('click', () => {
    isRegisterMode = false;
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    registerFields.style.display = 'none';
    submitBtn.textContent = 'Sign In';
    
    firstNameInput.removeAttribute('required');
    lastNameInput.removeAttribute('required');
    phoneNumInput.removeAttribute('required');
});

tabRegister?.addEventListener('click', () => {
    isRegisterMode = true;
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerFields.style.display = 'flex';
    submitBtn.textContent = 'Create Account';
    
    firstNameInput.setAttribute('required', '');
    lastNameInput.setAttribute('required', '');
    phoneNumInput.setAttribute('required', '');
});

form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
        if (isRegisterMode) {
            const first_name = firstNameInput.value.trim();
            const last_name = lastNameInput.value.trim();
            const phone_num = phoneNumInput.value.trim();

            const result = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ first_name, last_name, email, phone_num, password })
            });

            saveCustomer(result.customer, result.token);
            alert('Account created successfully!');
            window.location.href = 'pages/home.html';
        } else {
            const result = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            saveCustomer(result.customer, result.token);
            window.location.href = 'pages/home.html';
        }
    } catch (err) {
        alert(err.message);
    }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('ServiceWorker registered:', reg))
            .catch(err => console.error('ServiceWorker registration failed:', err));
    });
}
