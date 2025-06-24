import os
import subprocess
import sys

# Caminho desejado e nome do projeto
caminho = r"D:\Flask_MySQL"
nome_projeto = "projeto_flask"
caminho_completo = os.path.join(caminho, nome_projeto)

def criar_ambiente_virtual():
    print(f"Criando ambiente virtual em: {caminho_completo}")
    os.makedirs(caminho, exist_ok=True)
    subprocess.run([sys.executable, "-m", "venv", caminho_completo])

def instalar_flask():
    pip_path = os.path.join(caminho_completo, "Scripts", "pip.exe")
    print("Instalando Flask...")
    subprocess.run([pip_path, "install", "flask"])

def main():
    criar_ambiente_virtual()
    instalar_flask()
    print("\nAmbiente Flask criado com sucesso em:", caminho_completo)

if __name__ == "__main__":
    main()