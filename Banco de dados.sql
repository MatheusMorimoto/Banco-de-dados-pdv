create database morimoto 
character set utf8mb4 
collate utf8mb4_unicode_ci;

use morimoto;

CREATE TABLE produtos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  codigo_barras VARCHAR(50) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  quantidade_fardos INT NOT NULL,
  preco_final_fardo DECIMAL(10,2) NOT NULL,
  total_unidades INT NOT NULL,
  preco_unitario_venda DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vendas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_venda DATETIME DEFAULT NOW(),
  forma_pagamento VARCHAR(20),
  total DECIMAL(10,2),
  troco DECIMAL(10,2) DEFAULT 0.00
);

CREATE TABLE itens_venda (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venda_id INT,
  produto_id INT,
  nome VARCHAR(100),
  preco_unitario DECIMAL(10,2),
  quantidade INT,
  subtotal DECIMAL(10,2)
);

USE morimoto;
SHOW TABLES;

SELECT * FROM produtos ORDER BY id DESC;