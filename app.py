from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from datetime import datetime

app = Flask(__name__)

# Configurações do banco de dados
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'M@vi2101'
app.config['MYSQL_DB'] = 'morimoto'

mysql = MySQL(app)

# Rotas de páginas
@app.route('/')
def sobre():
    return render_template('vendas.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/vendas')
def vendas():
    return render_template('vendas.html')

# Cadastro de produto
@app.route('/api/produtos', methods=['POST'])
def cadastrar_produto():
    data = request.json
    cursor = mysql.connection.cursor()

    cursor.execute("SELECT * FROM produtos WHERE codigo_barras = %s", (data['codigo_barras'],))
    produto_existente = cursor.fetchone()

    if produto_existente:
        cursor.execute("""
            UPDATE produtos
            SET quantidade_fardos = quantidade_fardos + %s,
                total_unidades = total_unidades + %s,
                preco_final_fardo = %s,
                preco_unitario_venda = %s
            WHERE codigo_barras = %s
        """, (
            data['quantidade_fardos'],
            data['total_unidades'],
            data['preco_final_fardo'],
            data['preco_unitario_venda'],
            data['codigo_barras']
        ))
    else:
        cursor.execute("""
            INSERT INTO produtos (
                codigo_barras, nome, quantidade_fardos,
                preco_final_fardo, total_unidades, preco_unitario_venda
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data['codigo_barras'],
            data['nome'],
            data['quantidade_fardos'],
            data['preco_final_fardo'],
            data['total_unidades'],
            data['preco_unitario_venda']
        ))

    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensagem': 'Produto registrado com sucesso!'})

# Listar produtos
@app.route('/api/produtos', methods=['GET'])
def listar_produtos():
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    cursor.close()

    colunas = ['id', 'codigo_barras', 'nome', 'quantidade_fardos', 'preco_final_fardo', 'total_unidades', 'preco_unitario_venda']
    resultado = [dict(zip(colunas, linha)) for linha in produtos]
    return jsonify(resultado)

# Consulta de todos os produtos
@app.route('/api/relatorio', methods=['GET'])
def relatorio_produtos():
    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT id, codigo_barras, nome, quantidade_fardos, preco_final_fardo, total_unidades, preco_unitario_venda
        FROM produtos
        ORDER BY id DESC
    """)
    dados = cursor.fetchall()
    cursor.close()

    colunas = ['id', 'codigo_barras', 'nome', 'quantidade_fardos', 'preco_final_fardo', 'total_unidades', 'preco_unitario_venda']
    resultado = [dict(zip(colunas, linha)) for linha in dados]
    return jsonify(resultado)

# Consulta por código de barras
@app.route('/api/produtos/<int:codigo_barras>')
def buscar_por_codigo(codigo_barras):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos WHERE codigo_barras = %s", (codigo_barras,))
    produto = cursor.fetchone()
    cursor.close()
    if produto:
        return jsonify({
            'id': produto[0],
            'codigo_barras': produto[1],
            'nome': produto[2],
            'quantidade_fardos': produto[3],
            'preco_final_fardo': produto[4],
            'total_unidades': produto[5],
            'preco_unitario_venda': produto[6]
        })
    else:
        return jsonify({'erro': 'Produto não encontrado'}), 404

# Consulta por ID
@app.route('/api/produtos/id/<int:id>')
def buscar_por_id(id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos WHERE id = %s", (id,))
    produto = cursor.fetchone()
    cursor.close()
    if produto:
        return jsonify({
            'id': produto[0],
            'codigo_barras': produto[1],
            'nome': produto[2],
            'quantidade_fardos': produto[3],
            'preco_final_fardo': produto[4],
            'total_unidades': produto[5],
            'preco_unitario_venda': produto[6]
        })
    else:
        return jsonify({'erro': 'Produto não encontrado'}), 404

# Exclusão por ID
@app.route('/api/produtos/<int:id>', methods=['DELETE'])
def excluir_produto(id):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos WHERE id = %s", (id,))
    produto = cursor.fetchone()

    if produto:
        cursor.execute("DELETE FROM produtos WHERE id = %s", (id,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'mensagem': 'Produto excluído com sucesso'}), 200
    else:
        cursor.close()
        return jsonify({'erro': 'Produto não encontrado'}), 404

# Exclusão por código de barras
@app.route('/api/produtos/codigo/<int:codigo_barras>', methods=['DELETE'])
def excluir_por_codigo_barras(codigo_barras):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos WHERE codigo_barras = %s", (codigo_barras,))
    produto = cursor.fetchone()

    if produto:
        cursor.execute("DELETE FROM produtos WHERE codigo_barras = %s", (codigo_barras,))
        mysql.connection.commit()
        cursor.close()
        return jsonify({'mensagem': 'Produto excluído com sucesso pelo código de barras'}), 200
    else:
        cursor.close()
        return jsonify({'erro': 'Produto não encontrado com esse código de barras'}), 404

# Verificação por ID + código
@app.route('/api/produtos/verificar/<int:id>/<int:codigo_barras>')
def verificar_produto_por_id_codigo(id, codigo_barras):
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos WHERE id = %s AND codigo_barras = %s", (id, codigo_barras))
    produto = cursor.fetchone()
    cursor.close()
    if produto:
        return jsonify({
            'id': produto[0],
            'codigo_barras': produto[1],
            'nome': produto[2],
            'quantidade_fardos': produto[3],
            'preco_final_fardo': produto[4],
            'total_unidades': produto[5],
            'preco_unitario_venda': produto[6]
        }), 200
    else:
        return jsonify({'erro': 'Produto não encontrado com os dados fornecidos'}), 404

# Atualização por código de barras
@app.route('/api/produtos/codigo/<int:codigo_barras>', methods=['PUT'])
def atualizar_produto_por_codigo(codigo_barras):
    dados = request.get_json()
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM produtos WHERE codigo_barras = %s", (codigo_barras,))
    produto = cursor.fetchone()

    if not produto:
        cursor.close()
        return jsonify({'erro': 'Produto não encontrado'}), 404

    cursor.execute("""
        UPDATE produtos
        SET nome = %s,
            quantidade_fardos = %s,
            preco_final_fardo = %s,
            total_unidades = %s,
            preco_unitario_venda = %s
        WHERE codigo_barras = %s
    """, (
        dados['nome'],
        dados['quantidade_fardos'],
        dados['preco_final_fardo'],
        dados['total_unidades'],
        dados['preco_unitario_venda'],
        codigo_barras
    ))

    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensagem': 'Produto atualizado com sucesso'})

# Finalização de vendas
@app.route('/finalizar-venda', methods=['POST'])
def finalizar_venda():
    dados = request.get_json()
    forma_pagamento = dados['forma_pagamento']
    troco = float(dados['troco'])
    total = float(dados['total'])
    itens = dados['itens']

    cursor = mysql.connection.cursor()
    cursor.execute("""
        INSERT INTO vendas (data_venda, forma_pagamento, total, troco)
        VALUES (%s, %s, %s, %s)
    """, (datetime.now(), forma_pagamento, total, troco))
    venda_id = cursor.lastrowid

    for item in itens:
        cursor.execute("""
            INSERT INTO itens_venda (venda_id, produto_id, nome, preco_unitario, quantidade, subtotal)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            venda_id,
            item['produto_id'],
            item['nome'],
            float(item['preco_unitario']),
                        int(item['quantidade']),
            float(item['subtotal'])
        ))

        # Atualiza o estoque do produto vendido
        cursor.execute("""
            UPDATE produtos
            SET total_unidades = total_unidades - %s
            WHERE id = %s
        """, (
            item['quantidade'],
            item['produto_id']
        ))

    mysql.connection.commit()
    cursor.close()
    return jsonify({'mensagem': 'Venda registrada com sucesso!', 'venda_id': venda_id})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", ssl_context=("cert.pem", "key.pem"))