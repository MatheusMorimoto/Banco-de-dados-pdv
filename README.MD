## PASSO A PASSO PARA A CRIAÇÃO DO FLASK E INTEGRAR COM O MYSQL

1) criei um programa em python chamado ( inicio app.py), inicia o ambiente virtual flask
---

2) ativa o ambiente virtual flask com o comando (D:\Flask_MySQL\projeto_flask\Scripts\activate)
---

3) criar o app.py com o progrma em python:

from flask import Flask

app = Flask(__name__)

@app.route('/')
def home():
    return "Olá, Flask está rodando!"

if __name__ == '__main__':
    app.run(debug=True)

4) execute o comando para iniciar o servidor local:

python app.py

5) crie a pasta chamada: static, na onde vai alocar o css e o javascript

6) drie a pasta chamada: templates, na onde vai estar o html

obs: inicie o pojeto dentro da pasta com o nome.html, sendo o nome(qualquer um que queira)

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Bem-vindo ao Flask</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='style.css') }}">
</head>
<body>
    <h1>Olá, Matheus!</h1>
    <p>Seu app Flask está funcionando!</p>
</body>
</html>

7) depois mude o caminho do app.py com o programa:

from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("cadastro.html")

if __name__ == "__main__":
    app.run(debug=True)

8) no css inicie a estilização:

body {
    font-family: Arial, sans-serif;
    background-color: #f1f1f1;
    text-align: center;
    padding-top: 50px;
}

9) agora instale o vanv com os seguintes passos:

instale o venv criando o ambiente virtual:
python -m venv venv

agora vai ativar o ambiente virtual:
.\venv\Scripts\activate

instale o flask:
pip install flask

agora podendo executar a aplicação feita com o caomando:
flask run - comando do propio flask para executar
python app.py - comando do python para exeutar 

10) para integrar o MySQL ao flask inslao alguns pip:

instalar MySQL - pip install flask-sqlalchemy
gerenciador de pacotes - pip freeze > requirements.txt

com isso vai ser criado o requirements.txt.

11) integrar o flask com o MySQL

pip install flask-mysqldb - para instalar no ambiente virtual

12) salvar os codigos no githab

git status - verificar o que foi atualizado 

git add . - adicionar os arquivos modificados

git commit -m "Atualizações recentes no projeto" - Faça o commit das alterações

git push origin main - Envie para o repositório remoto:


13) redenrizar o ambiente flask

auto-py-to-exe - sso abrirá a interface gráfica do programa.
depois indica na onde esta o app.py