// LOGIN
const register =  document.getElementById('register');
const loginForm = document.getElementById('loginForm');

if(register) {
    register.addEventListener('click', () => {
      window.location.href = 'cadastro.html';
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        const response =await fetch('http://localhost:3000/login', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body:JSON.stringify({
                username: data.username, 
                senha: data.senha}),
        });

        const msg = await response.text();

        if (response.ok) {
            window.location.href = 'tarefas.html';
        } else {
            document.getElementById('erro').innerText = msg;
        }
    });
};

//CADASTRO
const registerForm = document.getElementById('registerForm');

if(registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        if(data.senha !== data.confirmSenha) {
            document.getElementById('erro').innerText = 'As senhas não coincidem!';
            return;
        }

        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: data.username, senha: data.senha })
        });
        
        const msg = await response.text();
        
        console.log(msg); // Log para depuração
        
        if (response.ok) {
            alert(msg); // Mensagem de sucesso
            window.location.href = 'login.html'; // Redireciona para o login após sucesso
        } else {
            alert(msg); // Mensagem de erro
        }        
    });
}
