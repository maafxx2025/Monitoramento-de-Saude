# 📁 Estrutura do Diretório Frontend

Este repositório segue uma estrutura organizada para o desenvolvimento do **frontend** da aplicação. Cada tela do sistema possui sua própria pasta, onde são armazenados **arquivos separados para HTML, CSS e JavaScript**.

---

## 📂 Diretórios e Arquivos

<img width="513" height="288" alt="image" src="https://github.com/user-attachments/assets/f3470e51-cd74-41a5-9c40-769b9f6ca377" />


---

## 🧱 Organização por tela

Cada funcionalidade ou página da aplicação deve ter sua própria **pasta dedicada**. Dentro de cada pasta, os seguintes arquivos devem ser criados:

- `arquivo.html`: Contém apenas a estrutura HTML da tela.
- `style.css`: Contém os estilos (CSS) **exclusivos** da tela.
- `script.js` *(opcional)*: Caso haja lógica em JavaScript para a tela, o arquivo deve ser criado **separadamente**.

---

## ❌ Regras de Organização

- **Não é permitido** misturar HTML, CSS e JavaScript no mesmo arquivo.
- Cada tipo de código deve estar **separado em seu respectivo arquivo** dentro da pasta da tela correspondente.
- A separação por pastas visa facilitar a manutenção, escalabilidade e colaboração no projeto.

---

## ✅ Exemplo de uma nova tela

Caso seja criada uma nova tela, por exemplo "perfil", a estrutura deve seguir o mesmo padrão:

<img width="346" height="191" alt="image" src="https://github.com/user-attachments/assets/4ad7fc04-6386-41e9-8dc9-779f02e046ed" />


---

## 📌 Boas práticas

- Utilize nomes de arquivos e pastas descritivos.
- Evite código duplicado entre telas.
- Caso tenha estilos ou scripts compartilhados entre telas, crie uma pasta `assets/` para centralizá-los.

---

👨‍💻 **Colabore com organização!** Esse padrão foi definido para manter o projeto limpo e de fácil entendimento por todos os membros da equipe.
