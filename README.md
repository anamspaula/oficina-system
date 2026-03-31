# Oficina System

Sistema completo para gestao de oficina mecânica com backend em Spring Boot (API REST) e frontend em Next.js.

## Visâo geral

O projeto oferece:

- Autenticacao com JWT
- Controle de acesso por perfil (ADMIN e USER)
- Cadastro e manutenção de usuários
- Cadastro de proprietários e veículos
- Criação e consulta de ordens de serviço
- Dashboard operacional no frontend
- Documentação da API com Swagger/OpenAPI

## Arquitetura

- `backend`: API REST, regras de negócio, segurança e persistência
- `frontend`: interface web, autenticação e fluxo operacional/administrativo

## Stack

### Backend

- Java 21
- Spring Boot 4.0.4
- Spring Security
- Spring Data JPA
- PostgreSQL
- Auth0 Java JWT
- Springdoc OpenAPI

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- js-cookie
- lucide-react

## Estrutura do projeto

```text
oficina-system/
  backend/
    pom.xml
    src/main/java/com/oficina/
      config/
      controllers/
      dto/
      entities/
      repositories/
      services/
    src/main/resources/application.properties
  frontend/
    package.json
    src/app/
    src/components/
    src/services/
    context/
```

## Pré-requisitos

- Java 21+
- Maven (ou Maven Wrapper)
- Node.js 20+
- npm
- PostgreSQL

## Configuração do backend

1. Crie o banco no PostgreSQL:

```sql
CREATE DATABASE oficina_db;
```

2. Ajuste o arquivo `backend/src/main/resources/application.properties` conforme o ambiente:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/oficina_db
spring.datasource.username=postgres
spring.datasource.password=123456
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
api.security.token.secret=${JWT_SECRET:minha-chave-secreta-32-caracteres-super-segura}
```

3. Execute o backend:

Windows (Maven Wrapper):

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Linux/Mac (Maven Wrapper):

```bash
cd backend
./mvnw spring-boot:run
```

Com Maven instalado:

```bash
cd backend
mvn spring-boot:run
```

Backend padrao:

- `http://localhost:8080`

Swagger/OpenAPI:

- `http://localhost:8080/swagger-ui.html`
- `http://localhost:8080/v3/api-docs`

## Configuração do frontend

1. Instale as dependências:

```bash
cd frontend
npm install
```

2. Crie o arquivo `.env.local` em `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

3. Execute o frontend:

```bash
cd frontend
npm run dev
```

Frontend padrão:

- `http://localhost:3000`

## Autenticação e segurançaa

- Login em `POST /auth/login`
- Token JWT salvo em:
  - `@Oficina:token` (localStorage)
  - `auth_token` (cookie)
- Regras de acesso no backend:
  - `POST /auth/login`: publico
  - `POST /auth/register`: apenas ADMIN
  - `/admin/**`: apenas ADMIN
  - Demais rotas: autenticadas

## Principais endpoints

### Autenticação

- `POST /auth/login`
- `POST /auth/register` (ADMIN)

### Usuário autenticado

- `GET /user/me`
- `PUT /user/me`
- `GET /user/mechanics`

### Administração de usuários

- `GET /admin/users`
- `GET /admin/users/{id}`
- `PUT /admin/users/{id}`

### Proprietários

- `POST /owners`
- `GET /owners`
- `PUT /owners/{id}`

### Veículos

- `POST /vehicles`
- `GET /vehicles`
- `PUT /vehicles/{id}`

### Ordens de serviço

- `POST /orders`
- `GET /orders`

## Fluxo rápido de execução

1. Suba o PostgreSQL e crie o banco `oficina_db`.
2. Inicie o backend na porta 8080.
3. Inicie o frontend na porta 3000.
4. Acesse `http://localhost:3000/login`.
5. Realize login e use o dashboard para gerir usuários, proprietários, veículos e ordens.

## Scripts úteis

### Backend

```bash
mvn spring-boot:run
mvn test
```

### Frontend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Observações

- Em produção, altere a chave JWT e credenciais do banco.
- Ajuste CORS no backend para os domínios reais do frontend.
- O token possui expiração de 2 horas.

## Melhorias recomendadas

- Docker Compose para banco + backend + frontend
- Seed inicial de usuarios/admin
- Maior cobertura de testes automatizados
- Pipeline CI/CD
- Observabilidade (logs, métricas, tracing)

## Autor

Ana Paula Martins  – Projeto Integrador III - B – PUCGO
