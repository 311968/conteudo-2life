#!/bin/bash
# Conteudo Negocio Enxuto com IA — instalacao no servidor da aluna
# by Alessandra Camilo
set -e

verde() { printf "\033[0;32m%s\033[0m\n" "$1"; }
ouro()  { printf "\033[0;33m%s\033[0m\n" "$1"; }
erro()  { printf "\033[0;31m%s\033[0m\n" "$1"; }

# Este app nao mora no seu computador: ele mora num servidor, no ar, com endereco proprio.
if [ "$(uname)" = "Darwin" ]; then
  echo
  erro "Opa. Este comando nao roda no seu Mac."
  echo
  ouro "O Conteudo Negocio Enxuto e um app que fica NO AR, num servidor seu."
  ouro "Diferente das skills, que moram no seu computador."
  echo
  echo "  O caminho e:"
  echo "  1. Contrate uma VPS (a Hostinger serve, a partir de uns R\$35 por mes)"
  echo "  2. Aponte um dominio ou subdominio seu para o IP dela"
  echo "  3. Entre no servidor:   ssh root@SEU_IP"
  echo "  4. La dentro, cole este mesmo comando de novo"
  echo
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  erro "Rode como root. No seu servidor:  sudo bash"
  exit 1
fi

echo
ouro "Baixando o app..."
cd /root
rm -rf conteudo-neia conteudo-neia.tar.gz
curl -fsSL https://ia.imersaonegocioenxutocomia.com/install/conteudo-neia.tar.gz -o conteudo-neia.tar.gz
tar -xzf conteudo-neia.tar.gz
verde "  baixado"

cd conteudo-neia
bash instalar.sh
