#RESET BANCO SEM DADOS

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

INSERT INTO `tipoPessoa` (`n_id_tipoPessoa`, `s_dsc_tipoPessoa`)
VALUES
  (1, 'Avaliador'),
  (2, 'Gestor'),
  (3, 'Root');
INSERT INTO `pessoa` (`n_id_pessoa`, `n_id_tipoPessoa`, `s_nome_pessoa`, `s_cpf_pessoa`, `s_telefone_pessoa`, `s_email_pessoa`, `s_senha_pessoa`)
VALUES
  (1, 3, 'Bruno', '11111111111', '31', 'bpinho@fiemg.com.br', '26@cp13#BjT');
INSERT INTO `config` (`s_emailDestino_config`)
VALUES
  ('bpinho@fiemg.com.br');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;