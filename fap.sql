SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `fap`;
DROP TABLE IF EXISTS `avaliacao`;
DROP TABLE IF EXISTS `candidato`;
DROP TABLE IF EXISTS `pessoa`;
DROP TABLE IF EXISTS `tipoPessoa`;
DROP TABLE IF EXISTS `config`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `avaliacao` (
  `n_id_avaliacao` int PRIMARY KEY AUTO_INCREMENT,
  `s_nome_avaliacao` varchar(255),
  `dt_data_avaliacao` datetime,
  `n_status_avaliacao` int DEFAULT 0
);

CREATE TABLE `candidato` (
  `n_id_candidato` int PRIMARY KEY AUTO_INCREMENT,
  `s_nome_candidato` varchar(255),
  `s_cpf_candidato` varchar(255) UNIQUE,
  `s_email_candidato` varchar(255)
);

CREATE TABLE `fap` (
  `n_id_avaliacao` int,
  `n_id_candidato` int,
  `n_id_pessoa` int,
  `dt_date_fap` datetime,
  `n_nota_fap` int DEFAULT 0,
  `n_resultado_fap` int DEFAULT 0,
  `n_posto1_fap` int DEFAULT 0,
  `n_posto2_fap` int DEFAULT 0,
  `n_posto3_fap` int DEFAULT 0,
  `n_posto4_fap` int DEFAULT 0,
  `n_posto5_fap` int DEFAULT 0,
  `n_posto6_fap` int DEFAULT 0,
  `n_q6_fap` int DEFAULT -1,
  `n_q7_fap` int DEFAULT -1,
  `n_q8_fap` int DEFAULT 0,
  `n_q9_fap` int DEFAULT 0,
  `n_q10_fap` int DEFAULT 0,
  `n_q11_fap` int DEFAULT 0,
  `n_q12_fap` int DEFAULT 0,
  `s_q13_fap` varchar(255),
  `s_q14_fap` varchar(255),
  `s_q15_fap` varchar(255),
  `s_q16_fap` varchar(255),
  `s_relatorio_fap` varchar(255),
  `n_status_fap` int DEFAULT 0,
  PRIMARY KEY (`n_id_avaliacao`, `n_id_candidato`)
);

CREATE TABLE `tipoPessoa` (
  `n_id_tipoPessoa` int PRIMARY KEY AUTO_INCREMENT,
  `s_dsc_tipoPessoa` varchar(255)
);

CREATE TABLE `pessoa` (
  `n_id_pessoa` int PRIMARY KEY AUTO_INCREMENT,
  `n_id_tipoPessoa` int,
  `s_nome_pessoa` varchar(255),
  `s_cpf_pessoa` varchar(255) UNIQUE,
  `s_telefone_pessoa` varchar(255),
  `s_email_pessoa` varchar(255),
  `s_senha_pessoa` varchar(255),
  `s_codredef_pessoa` varchar(255)
);

CREATE TABLE `config` (
  `s_emailDestino_config` varchar(255)
);

ALTER TABLE `fap` ADD FOREIGN KEY (`n_id_avaliacao`) REFERENCES `avaliacao` (`n_id_avaliacao`);

ALTER TABLE `fap` ADD FOREIGN KEY (`n_id_candidato`) REFERENCES `candidato` (`n_id_candidato`);

ALTER TABLE `fap` ADD FOREIGN KEY (`n_id_pessoa`) REFERENCES `pessoa` (`n_id_pessoa`);

ALTER TABLE `pessoa` ADD FOREIGN KEY (`n_id_tipoPessoa`) REFERENCES `tipoPessoa` (`n_id_tipoPessoa`);

-- Disable foreign key checks for INSERT
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO `avaliacao` (`n_id_avaliacao`, `s_nome_avaliacao`, `dt_data_avaliacao`, `n_status_avaliacao`)
VALUES
  (1, 'Senai Centro 4.0', '2030-12-09T00:00:00', 0),
  (2, 'Senai CTTI', '2030-12-09T00:00:00', 0),
  (3, 'Senai EL', '2030-12-09T00:00:00', 0);
INSERT INTO `candidato` (`n_id_candidato`, `s_nome_candidato`, `s_cpf_candidato`, `s_email_candidato`)
VALUES
  (1, 'Rambo', '11111111111', 'rambo@fap.com.br'),
  (2, 'Vam Dame', '22222222222', 'vam@fap.com.br'),
  (3, 'Chuck Norris', '33333333333', 'chuck@fap.com.br'),
  (4, 'Duke', '44444444444', 'duke@fap.com.br'),
  (5, 'Dart Vader', '55555555555', 'dart@fap.com.br'),
  (6, 'Luke Skywalker', '66666666666', 'luke@fap.com.br'),
  (7, 'Batman', '12345678900', 'batman@fap.com.br'),
  (8, 'Spiderman', '14725836900', 'spider@fap.com.br'),
  (9, 'ET', '75315965421', 'et@fap.com.br');
INSERT INTO `fap` (`n_id_avaliacao`, `n_id_candidato`, `n_id_pessoa`)
VALUES
  (1, 1, 1),
  (1, 2, 1),
  (1, 3, 1),
  (1, 4, 2),
  (1, 5, 2),
  (1, 6, 2),
  (2, 1, 1),
  (2, 2, 1);
INSERT INTO `tipoPessoa` (`n_id_tipoPessoa`, `s_dsc_tipoPessoa`)
VALUES
  (1, 'Avaliador'),
  (2, 'Office'),
  (3, 'Administrador');
INSERT INTO `pessoa` (`n_id_pessoa`, `n_id_tipoPessoa`, `s_nome_pessoa`, `s_cpf_pessoa`, `s_telefone_pessoa`, `s_email_pessoa`, `s_senha_pessoa`)
VALUES
  (1, 3, 'Bruno', '11111111111', '31', 'bpinho@fiemg.com.br', '123'),
  (2, 1, 'Frederico', '22222222222', '31', 'fred@email', '123'),
  (3, 1, 'Paulo', '33333333333', '31', 'paulo@email', '123'),
  (4, 1, 'Rodrigo', '44444444444', '31', 'rodrigo@email', '123'),
  (5, 1, 'Sérgio', '55555555555', '31', 'sergio@email', '123');
INSERT INTO `config` (`s_emailDestino_config`)
VALUES
  ('bpinho@fiemg.com.br');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;