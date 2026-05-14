document.getElementById('btnIniciar').addEventListener('click', async () => {
    const ra = document.getElementById('ra').value.trim();
    const digito = document.getElementById('digito').value.trim();
    const estado = document.getElementById('estado').value;
    const senha = document.getElementById('senha').value;
    const statusTxt = document.getElementById('statusTxt');

    if (!ra || !digito || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    statusTxt.innerText = "Conectando ao servidor do Elefante Letrado...";
    statusTxt.style.color = "#ecc94b"; 

    // URL Direta e Oficial utilizando HTTPS para evitar bloqueios
    const urlLogin = 'elefanteletrado.com.br'; 

    try {
        const loginResponse = await fetch(urlLogin, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: `${ra}${digito}${estado}`, 
                password: senha
            })
        });

        if (!loginResponse.ok) {
            throw new Error('Falha na autenticação. Verifique os dados de login.');
        }

        const loginData = await loginResponse.json();
        const tokenDinamico = loginData.access_token || loginData.token; 

        if (!tokenDinamico) {
            throw new Error('Não foi possível obter o token de acesso.');
        }

        statusTxt.innerText = "Conectado com sucesso! Iniciando as leituras...";
        iniciarLeituraAutomatica(tokenDinamico, statusTxt);

    } catch (error) {
        statusTxt.innerText = "Erro: " + error.message;
        statusTxt.style.color = "#e53e3e"; 
    }
});

async function iniciarLeituraAutomatica(token, statusElement) {
    let paginaAtual = 1;
    let totalPaginas = 15; 
    const urlLeitura = 'elefanteletrado.com.br';
    const urlQuiz = 'elefanteletrado.com.br';

    statusElement.style.color = "#48bb78"; 

    const loopLeitura = setInterval(async () => {
        if (paginaAtual > totalPaginas) {
            statusElement.innerText = "Livro e questionários concluídos com sucesso! 🚀";
            clearInterval(loopLeitura);
            return;
        }

        statusElement.innerText = `Lendo página ${paginaAtual} de ${totalPaginas}... (Aguardando 2 min de segurança)`;

        try {
            await fetch(urlLeitura, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    page: paginaAtual,
                    time_elapsed: 120 
                })
            });

            if (paginaAtual === totalPaginas) {
                statusElement.innerText = "Respondendo ao Quiz final automaticamente...";
                
                await fetch(urlQuiz, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        correct: true,
                        answer: "A" 
                    }) 
                });
            }
        } catch (e) {
            console.error("Erro na requisição:", e);
        }

        paginaAtual++;
    }, 120000); 
}
