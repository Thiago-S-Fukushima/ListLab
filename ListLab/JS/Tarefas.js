document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');

    // Verificar se o usuário está logado
    const checkLogin = await fetch('http://localhost:3000/task', {
        method: 'GET',
        credentials: 'include',  // Enviar os cookies da sessão
    });

    // Se o usuário não estiver logado, redirecionar para a página de login
    if (!checkLogin.ok) {
        alert('Você precisa estar logado para ver as tarefas.');
        window.location.href = './login.html';  // Redirecionar para a tela de login
        return; // Impede o carregamento das tarefas
    };

    // Função para carregar as tarefas
    async function carregarTarefas() {
        const response = await fetch('http://localhost:3000/task', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const tarefas = await response.json();
            taskList.innerHTML = '';

            tarefas.forEach(tarefa => {
                const li = document.createElement('li');
                const dataObj = new Date(tarefa.created_at);
                const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                li.innerHTML = `<div id='data'><strong>Criada em ${dataFormatada} </strong></div>
                <div>${tarefa.descricao}</div>`;

                if (tarefa.done) {
                    li.style.textDecoration = 'line-through';
                }

                const checkBtn = document.createElement('button');
                checkBtn.className = 'checkBtn'; // <- adiciona classe
                checkBtn.textContent = tarefa.done ? 'Desmarcar' : 'Concluir';
                checkBtn.onclick = async () => {
                    await fetch(`http://localhost:3000/task/${tarefa.id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ done: !tarefa.done }),
                    });
                    carregarTarefas();
                };

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'deleteBtn'; // <- adiciona classe
                deleteBtn.textContent = 'Excluir';
                deleteBtn.onclick = async () => {
                    await fetch(`http://localhost:3000/task/${tarefa.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                    carregarTarefas();
                };

                li.appendChild(checkBtn);
                li.appendChild(deleteBtn);
                taskList.appendChild(li);
            });
        } else {
            alert('Erro ao carregar tarefas!');
        };
    };

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const descricao = document.getElementById('descricao').value;

        await fetch('http://localhost:3000/task', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({descricao}),
        });
        if (descricao) {
            console.log('tarefa criada.');
        } else {
            console.log('Erro ao criar a tarefa.')
        }

        taskForm.reset();
        carregarTarefas();
    });

    logoutBtn.addEventListener('click', async () => {
        await fetch('http://localhost:3000/logout', {
            method: 'POST',
            credentials: 'include',
        });
        window.location.href = 'login.html';
    });

    carregarTarefas();
});

  window.onload = () => {
  fetch('http://localhost:3000/user', {
    credentials: 'include' // importante para enviar cookies
  })
  .then(res => {
    if (!res.ok) throw new Error('Não autenticado');
    return res.json();
  })
  .then(data => {
    const h2 = document.querySelector('h2');
    h2.textContent = `Tarefas - ${data.username}`;
  })
  .catch(err => {
    console.error(err);
    // Se quiser, redireciona para login ou mostra mensagem
  });
};


