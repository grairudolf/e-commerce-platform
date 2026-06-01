const form = document.querySelector('.login-form');
const tabs = document.querySelectorAll('.tabs button');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(item => item.classList.remove('active'));
        tab.classList.add('active');
    });
});

form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const [emailInput, passwordInput] = form.querySelectorAll('input');

    try {
        const result = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: emailInput.value.trim(),
                password: passwordInput.value
            })
        });

        saveCustomer(result.customer);
        window.location.href = '../home/home.html';
    } catch (err) {
        alert(err.message);
    }
});
