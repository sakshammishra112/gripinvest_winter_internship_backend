# 💹 Horizon – Investment Platform

**Horizon** is a **Spring Boot–based backend API** that enables users to:

* **Register** and **log in securely** using **JWT authentication**.  
* **Browse investment products** and create new investments.  
* **Track their portfolio** and **calculate total returns**.  
* **Stream real-time market prices** through the **Finnhub WebSocket API**.  
* Automatically **update account balances** when investments mature via a **cron job** that runs every **5 minutes**.  
* Maintain **transaction logs** to capture **status**, **method**, and any **error messages** for auditing.

---

## 🚀 Features

### 🔐 User & Authentication
- **JWT Authentication**: Secure, **stateless** login and signup flow.  
- **Password Reset with OTP** verification for enhanced account recovery.  
- Passwords are stored using **BCrypt hashing** for strong security.

### 💼 Investments
- **Create new investments** with strict **minimum/maximum validation**.  
- **Automatic balance deduction** when an investment is made.  
- **Scheduled maturity processing** to update balances automatically.  
- **Endpoints** to view the **complete portfolio** and calculate **total returns**.

### 📈 Market Data
- **Real-time price updates** using the **Finnhub WebSocket API**.  
- REST endpoint to **subscribe to live trade data** for **stocks**, **forex**, and **crypto** symbols.

### 🛠️ Product Management
- **Admin-only access** to **add** or **delete products**.  
- The **Add Product** button is visible **only when logged in as an `ADMIN` user**.

### 🤖 AI Integration
- Uses the **Google Gemini API** to generate **personalized portfolio insights** based on a user’s investments.  
- Provides **product recommendations** according to **risk level** (**Low**, **Moderate**, **High**).

### 🌐 Finnhub API
- Integrates the **free Finnhub API** to fetch **real-time company data** and **live market prices**.

---

✅ **Key Highlights**  
- **Stateless Security** with JWT.  
- **Scheduled Cron Jobs** for automated balance updates.  
- **Real-Time Data Streaming** with WebSocket.  
- **AI-driven Insights** for smarter investment decisions.


## 

---

## 🏗️ Tech Stack

| Layer          | Technology |
|----------------|------------|
| Backend        | Spring Boot 3, Spring Security, Spring Data JPA |
| Frontend       | React, TypeScript|
| Database       | MySQL |
| Build Tool     | Maven |
| Real-Time Data | Finnhub WebSocket API |
| Testing        | JUnit 5, Mockito |
| Auth           | JWT (stateless) |

---
## APIs:

- Obtain the token from the **Login** endpoint.

> ✅ All endpoints **require a valid JWT** except:
>
> - `POST /api/register`
> - `POST /api/login`
> - `POST /api/forgot-password`
> - `POST /api/verify-otp`
> - `POST /api/reset-password`
> - `POST /api/check-password-strength`

---

## 🧑‍💻 Users API

| Method | Endpoint                  | Auth        | Description |
|-------:|----------------------------|------------|-------------|
| POST   | `/register`                | ❌         | Register a new user. |
| POST   | `/login`                   | ❌         | Login and receive a JWT token. |
| POST   | `/forgot-password`         | ❌         | Send OTP to email for password reset. |
| POST   | `/verify-otp`              | ❌         | Verify OTP. |
| POST   | `/reset-password`          | ❌         | Reset password using verified OTP. |
| POST   | `/check-password-strength` | ❌         | Check password strength. |
| GET    | `/users`                   | ✅ (ADMIN) | Get all users. |
| GET    | `/users/{id}`              | ✅ (ADMIN) | Get specific user by ID. |
| GET    | `/users/details`           | ✅         | Get logged-in user details. |
| GET    | `/users/balance`           | ✅         | Get logged-in user’s balance. |
| GET    | `/users/getbalance`        | ✅         | Alias for balance endpoint. |
| GET    | `/getEmail/{firstName}`    | ✅ (ADMIN) | Get email by first name. |
| GET    | `/getUser`                 | ✅         | Get full logged-in user entity. |

---

## 💼 Investments API

| Method | Endpoint                             | Auth | Description |
|-------:|---------------------------------------|------|-------------|
| POST   | `/investments`                        | ✅   | Create a new investment. |
| GET    | `/investments/get-portfolio`          | ✅   | Get all investments of logged-in user. |
| GET    | `/investments/total-returns`          | ✅   | Get total returns of logged-in user. |
| GET    | `/investments/investmentById/{id}`    | ✅   | Get investment by ID. |
| GET    | `/investments/investmentOfLoggedUser` | ✅   | Get investments of logged-in user. |
| POST   | `/investments/process-maturity`       | ✅   | Manually trigger maturity process. |

---

## 🏦 Investment Products API

| Method | Endpoint                      | Auth        | Description |
|-------:|--------------------------------|------------|-------------|
| POST   | `/products`                    | ✅ (ADMIN) | Create new investment product. |
| GET    | `/products`                    | ✅         | List all products. |
| GET    | `/products/{id}`               | ✅         | Get product by ID. |
| PUT    | `/products/{id}`               | ✅ (ADMIN) | Update product. |
| DELETE | `/products/{id}`               | ✅ (ADMIN) | Delete product. |
| GET    | `/products/recommend/{risk}`   | ✅         | Recommend products by risk (`low`, `medium`, `high`). |
| GET    | `/products/getIdbyname/{name}` | ✅         | Get product ID by name. |

---

## 📊 Portfolio API

| Method | Endpoint                     | Auth | Description |
|-------:|-------------------------------|------|-------------|
| GET    | `/portfolio/insights`         | ✅   | Personalized portfolio stats + AI insights. |
| GET    | `/portfolio/investingTrends`  | ✅   | General AI investing trends. |

---

## 🧾 Transaction Logs API

| Method | Endpoint              | Auth        | Description |
|-------:|-----------------------|------------|-------------|
| GET    | `/logs/user`          | ✅         | Get logs of logged-in user. |
| GET    | `/logs/admin/{email}` | ✅ (ADMIN) | Get logs of a specific user by email. |

---

## 📈 Finnhub (Market Data) API

| Method | Endpoint                                               | Auth | Description |
|-------:|--------------------------------------------------------|------|-------------|
| GET    | `api/finnhub/company/profile?symbol=AAPL`              | ✅   | Fetch company profile by symbol, ISIN, or CUSIP. |
| GET    | `api/finnhub/lookup?q=monkey&exchange=US`              | ❌   | Fetch compnay symbol by matching names of the company |
| GET    | `/api/finnhub/market-news?category=business`           |  ❌  | Fetch market news. |
---

## 🔧 Example Authentication Flow

1. **Register**
 ```bash
 POST /api/register
 Content-Type: application/json

 {
   "firstName": "Alice",
   "lastName": "Smith",
   "email": "alice@example.com",
   "password": "StrongPass@123"
 }
```

- [PostMan link For API testing](https://web.postman.co/workspace/My-Workspace~4169547d-7ed3-4fc2-85e5-88d8a6c21b6c/collection/40730513-80c6c200-e40d-4431-a5dd-fc2a051dfc0b?action=share&source=copy-link&creator=40730513)

## Note:
- Firstly register(```/api/users/register```) as **ADMIN** when first starting up the backend after setting up the Mysql.
- You can check the table schema here: [schema](https://github.com/sakshammishra112/gripinvest_winter_internship_backend/tree/main/InvestApp2/mysql-init)
- Even though the **CORN** job runs every 5 minutes you can use the api:```localhost:8080/api/investments/process-maturity``` to mature it immediately.
- Insert products with **maturitydate** = 0 for testing, else it will take a long time.

# 🐳 Horizon – Docker Setup Guide

This guide explains how to build and run the **Horizon Investment Platform** using **Docker** and **Docker Compose**.

---

## 🖥️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed (v2+ recommended)
- Project repository cloned to your local machine

---

## 📦 Project Structure (Typical)

```
horizon/
├── InvestApp2/             # Spring Boot application
│   ├── docker-compose.yml
└── frontend/               # Vite/React application
    └── docker-compose.yml

## 🚀 Frontend Setup

The frontend is a **Vite + React** app containerized to run on **port 5173** locally.

### 1️⃣ Build the Docker Image

From the `frontend` directory (or wherever the frontend `docker-compose.yml` is located):

```bash
docker compose up --build
```

This command builds the Docker image defined in the docker-compose.yml.

### 2️⃣ Run the Container

```bash
docker run -p 5173:80 horizon-app
```

- `5173` → Local host port where you'll access the app
- `80` → Container's internal port exposed in the Dockerfile
- `horizon-app` → Name of the image built from the docker-compose.yml or Dockerfile

The frontend will be available at:
👉 **http://localhost:5173**

---

## ⚙️ Backend Setup

The backend is a **Spring Boot** application with **MySQL** as the database.

### 1️⃣ Stop and Remove Existing Containers (Clean Start)

From the `backend` directory:

```bash
docker compose down -v
```

- Stops any running backend containers
- Removes attached volumes (fresh database state)

### 2️⃣ Build & Start the Backend

```bash
docker compose up --build
```

This will:
- Rebuild the backend image
- Start all services defined in the backend docker-compose.yml (API, database, etc.)

The backend API will be accessible at:
👉 **http://localhost:8080**

---

## 🧩 Environment Variables

Ensure `.env` files (if used) contain correct values for:
- Database credentials (e.g., `MYSQL_USER`, `MYSQL_PASSWORD`)
- External API keys (e.g., Finnhub, Gemini)

These values are read by `docker-compose.yml` during build and run.

---

## 🔧 Useful Docker Commands

| Action | Command |
|--------|---------|
| View live logs | `docker compose logs -f` |
| Stop all running services | `docker compose down` |
| Remove containers & volumes | `docker compose down -v` |
| Rebuild and restart | `docker compose up --build` |
| List running containers | `docker ps` |

---

## 📝 Notes

- Make sure ports 5173 (frontend) and 8080 (backend) are not in use by other applications
- For production deployments, consider using environment-specific Docker Compose files
- Always check the logs if services fail to start: `docker compose logs <service-name>`
- If the data base is not populated with miniinvest2.sql, then firstly register as **ADMIN** using the api: ```/api/users/register```

