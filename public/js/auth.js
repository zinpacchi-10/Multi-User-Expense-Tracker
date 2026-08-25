const form = document.getElementById('auth-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const toggleLink = document.getElementById('toggle-link');
const toggleMsg = document.getElementById('toggle-msg');
const nameGroup = document.getElementById('name-group');
const message = document.getElementById('message');

let isLogin = true;

// Toggle Login/Register
toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;

    if (isLogin) {
        formTitle.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleMsg.textContent = "Don't have an account?";
        toggleLink.textContent = 'Register';
        nameGroup.style.display = 'none';
    } else {
        formTitle.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleMsg.textContent = 'Already have an account?';
        toggleLink.textContent = 'Login';
        nameGroup.style.display = 'block';
    }
    message.textContent = '';
});

// Form Submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;

    try {
        if (isLogin) {
            const data = await apiRequest('/auth/login', 'POST', { email, password });
            setToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            await apiRequest('/auth/register', 'POST', { name, email, password });
            message.style.color = 'green';
            message.textContent = 'Registration successful! Please login.';
            isLogin = true;
            formTitle.textContent = 'Login';
            submitBtn.textContent = 'Login';
            nameGroup.style.display = 'none';
        }
    } catch (err) {
        message.style.color = 'red';
        message.textContent = err.message;
    }
});

// Already logged in check
if (getToken()) {
    window.location.href = 'dashboard.html';
}