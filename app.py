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

@app.route('/vendas')
def vendas():
    return render_template('vendas.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/relatorio')
def relatorio():
    mes = request.args.get('mes')
    dia = request.args.get('dia')

    cursor = mysql.connection.cursor()

    query = """
        SELECT iv.nome, 
               SUM(iv.quantidade) AS total_quantidade,
               COALESCE(p.preco_custo, 0) AS preco_custo,
               iv.preco_unitario,
               iv.produto_id
        FROM itens_venda iv
        JOIN vendas v ON iv.venda_id = v.id
        JOIN produtos p ON iv.produto_id = p.id
        WHERE 1=1
    """
    params = []
    if mes:
        query += " AND MONTH(v.data_venda) = %s"
        params.append(int(mes))
    if dia:
        query += " AND DAY(v.data_venda) = %s"
        params.append(int(dia))

    query += " GROUP BY iv.nome, p.preco_custo, iv.preco_unitario, iv.produto_id ORDER BY total_quantidade DESC"

    cursor.execute(query, params)
    resultados = cursor.fetchall()

    nomes_produtos = []
    quantidades = []
    custo_total_vendidos = 0
    receita_total_vendas = 0

    for linha in resultados:
        nome = linha[0]
        qtd_vendida = int(linha[1])
        preco_custo = float(linha[2]) if linha[2] is not None else 0.0
        preco_venda = float(linha[3])

        nomes_produtos.append(nome)
        quantidades.append(qtd_vendida)

        custo_total_vendidos += preco_custo * qtd_vendida
        receita_total_vendas += preco_venda * qtd_vendida

    lucro_real = receita_total_vendas - custo_total_vendidos

    # Vendas mensais para gráfico
    cursor.execute("""
        SELECT DATE_FORMAT(data_venda, '%m/%Y') AS mes, 
               SUM(total) AS total_mensal
        FROM vendas
        GROUP BY mes
        ORDER BY STR_TO_DATE(mes, '%m/%Y')
    """)
    resultados_mensais = cursor.fetchall()
    cursor.close()

    meses = [linha[0] for linha in resultados_mensais]
    vendas_mensais = [float(linha[1]) for linha in resultados_mensais]

    return render_template(
        'relatorio.html',
        produtos=nomes_produtos,
        quantidades=quantidades,
        meses=meses,
        vendas_mensais=vendas_mensais,
        mes=mes,
        dia=dia,
        custo_total=custo_total_vendidos,
        total_vendas=receita_total_vendas,
        lucro_previsto=lucro_real
    )
# Cadastro de produto
@app.route('/api/produtos', methods=['POST'])
def cadastrar_produto():
    try:
        data = request.json
        if not data or not all(k in data for k in ['codigo_barras', 'nome']):
            return jsonify({'erro': 'Dados incompletos'}), 400
            
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM produtos WHERE codigo_barras = %s", (data['codigo_barras'],))
        produto_existente = cursor.fetchone()

        if produto_existente:
            cursor.execute("""
                UPDATE produtos
                SET quantidade_fardos = quantidade_fardos + %s,
                    total_unidades = total_unidades + %s,
                    preco_final_fardo = %s,
                    preco_unitario_venda = %s,
                    preco_custo = %s
                WHERE codigo_barras = %s
            """, (
                data.get('quantidade_fardos', 0),
                data.get('total_unidades', 0),
                data.get('preco_final_fardo', 0),
                data.get('preco_unitario_venda', 0),
                data.get('preco_custo', 0),
                data['codigo_barras']
            ))
        else:
            cursor.execute("""
                INSERT INTO produtos (
                    codigo_barras, nome, quantidade_fardos,
                    preco_final_fardo, total_unidades, preco_unitario_venda, preco_custo
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                data['codigo_barras'],
                data['nome'],
                data.get('quantidade_fardos', 0),
                data.get('preco_final_fardo', 0),
                data.get('total_unidades', 0),
                data.get('preco_unitario_venda', 0),
                data.get('preco_custo', 0)
            ))

        mysql.connection.commit()
        cursor.close()
        return jsonify({'mensagem': 'Produto registrado com sucesso!'})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Listar produtos
@app.route('/api/produtos', methods=['GET'])
def listar_produtos():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM produtos")
        produtos = cursor.fetchall()
        cursor.close()

        colunas = ['id', 'codigo_barras', 'nome', 'quantidade_fardos', 'preco_final_fardo', 'total_unidades', 'preco_unitario_venda', 'preco_custo']
        resultado = [dict(zip(colunas, linha)) for linha in produtos]
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Consulta de todos os produtos para relatório
@app.route('/api/relatorio-produtos', methods=['GET'])
def relatorio_produtos():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("""
            SELECT id, codigo_barras, nome, quantidade_fardos, preco_final_fardo, total_unidades, preco_unitario_venda, preco_custo
            FROM produtos
            ORDER BY id DESC
        """)
        dados = cursor.fetchall()
        cursor.close()

        colunas = ['id', 'codigo_barras', 'nome', 'quantidade_fardos', 'preco_final_fardo', 'total_unidades', 'preco_unitario_venda', 'preco_custo']
        resultado = [dict(zip(colunas, linha)) for linha in dados]
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Consulta por código de barras
@app.route('/api/produtos/<int:codigo_barras>')
def buscar_por_codigo(codigo_barras):
    try:
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
                'preco_unitario_venda': produto[6],
                'preco_custo': produto[7] if len(produto) > 7 else 0
            })
        else:
            return jsonify({'erro': 'Produto não encontrado'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Consulta por ID
@app.route('/api/produtos/id/<int:id>')
def buscar_por_id(id):
    try:
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
                'preco_unitario_venda': produto[6],
                'preco_custo': produto[7] if len(produto) > 7 else 0
            })
        else:
            return jsonify({'erro': 'Produto não encontrado'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Exclusão por ID
@app.route('/api/produtos/<int:id>', methods=['DELETE'])
def excluir_produto(id):
    try:
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
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Exclusão por código de barras
@app.route('/api/produtos/codigo/<int:codigo_barras>', methods=['DELETE'])
def excluir_por_codigo_barras(codigo_barras):
    try:
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
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Verificação por ID + código
@app.route('/api/produtos/verificar/<int:id>/<int:codigo_barras>')
def verificar_produto_por_id_codigo(id, codigo_barras):
    try:
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
                'preco_unitario_venda': produto[6],
                'preco_custo': produto[7] if len(produto) > 7 else 0
            }), 200
        else:
            return jsonify({'erro': 'Produto não encontrado com os dados fornecidos'}), 404
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Atualização por código de barras
@app.route('/api/produtos/codigo/<int:codigo_barras>', methods=['PUT'])
def atualizar_produto_por_codigo(codigo_barras):
    try:
        dados = request.get_json()
        if not dados:
            return jsonify({'erro': 'Dados não fornecidos'}), 400
            
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
                preco_unitario_venda = %s,
                preco_custo = %s
            WHERE codigo_barras = %s
        """, (
            dados.get('nome', produto[2]),
            dados.get('quantidade_fardos', produto[3]),
            dados.get('preco_final_fardo', produto[4]),
            dados.get('total_unidades', produto[5]),
            dados.get('preco_unitario_venda', produto[6]),
            dados.get('preco_custo', produto[7] if len(produto) > 7 else 0),
            codigo_barras
        ))

        mysql.connection.commit()
        cursor.close()
        return jsonify({'mensagem': 'Produto atualizado com sucesso'})
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Finalização de vendas
@app.route('/finalizar-venda', methods=['POST'])
def finalizar_venda():
    try:
        dados = request.get_json()
        if not dados or not all(k in dados for k in ['forma_pagamento', 'total', 'itens']):
            return jsonify({'erro': 'Dados incompletos'}), 400
            
        forma_pagamento = dados['forma_pagamento']
        troco = float(dados.get('troco', 0))
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
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)