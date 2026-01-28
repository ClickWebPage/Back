# 🔐 Backend CHPC - Sistema de Autenticación y Seguridad

Backend de la tienda online CHPC desarrollado con NestJS, implementando un sistema robusto de autenticación con JWT.

---

## ✨ Características de Seguridad Implementadas

### ✅ Autenticación JWT con Refresh Tokens
- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 días
- Tokens hasheados en base de datos con bcrypt
- Renovación automática de tokens

### ✅ Protección contra Ataques de Fuerza Bruta
- Bloqueo de cuenta tras 5 intentos fallidos
- Bloqueo temporal de 15 minutos
- Contador de intentos por usuario
- Reseteo automático tras login exitoso

### ✅ Seguridad de Contraseñas
- Hasheo con bcrypt (10 rounds)
- Validación de complejidad:
  - Mínimo 6 caracteres
  - Al menos una letra, un número y un carácter especial

### ✅ Validación de Datos
- Validación automática con `class-validator`
- Sanitización de inputs
- Prevención de inyección SQL (Prisma)

### ✅ Control de Acceso por Roles
- Sistema de roles: `cliente`, `admin`, `vendedor`
- Guards personalizados
- Decoradores para control de permisos

---

## 📡 Endpoints de Autenticación

### 🔹 Registro
```http
POST /api/auth/registro
Content-Type: application/json

{
  "nombre_usuario": "usuario123",
  "email": "usuario@example.com",
  "contraseña": "Pass123!@",
  "telefono": "0999123456",
  "direccion": "Manta, Ecuador"
}
```

### 🔹 Login
```http
POST /api/auth/login

{
  "nombre_usuario": "usuario123",
  "contraseña": "Pass123!@"
}
```

### 🔹 Refrescar Token
```http
POST /api/auth/refresh

{
  "refresh_token": "eyJhbGc..."
}
```

### 🔹 Verificar Token
```http
GET /api/auth/verificar
Authorization: Bearer <access_token>
```

### 🔹 Cerrar Sesión
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

---

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
