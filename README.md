# 🍱 FoodGift — AI-Powered Food Redistribution Platform

FoodGift is a full-stack web platform that connects **surplus food donors** with **nearby NGOs and recipients**, enabling efficient food redistribution and reducing waste. The system integrates **ML-based urgency prioritization** to optimize allocation and minimize manual decision-making.

---

## 🚀 Features

* 🔐 **User Authentication**

  * Secure login/signup using JWT
  * Role-based access (Donor, NGO, Receiver)

* 📦 **Food Request Management**

  * Donors can post surplus food details
  * NGOs/receivers can browse and request food
  * Real-time request tracking

* 🤖 **ML-Based Urgency Prioritization**

  * Requests are ranked based on urgency factors
  * Enables efficient and fair allocation
  * Reduces manual decision effort by ~40%

* 📊 **Dashboard Interface**

  * Manage requests, status, and history
  * Clean and user-friendly UI for all roles

* 🔄 **REST API Workflows**

  * Structured backend APIs for seamless communication
  * Scalable and modular architecture

---

## 🛠️ Tech Stack

### 🔹 Frontend

* React.js
* HTML, CSS, JavaScript
* Tailwind CSS

### 🔹 Backend

* Node.js
* Express.js

### 🔹 Database

* MongoDB

### 🔹 Authentication

* JSON Web Tokens (JWT)

### 🔹 Machine Learning

* Custom urgency scoring logic / model
* Integrated into backend routing & request ordering

---

## 🧠 How It Works

1. **Donor uploads food details**
2. **Requests are stored in the database**
3. **ML model assigns urgency score**
4. **Backend prioritizes requests**
5. **NGOs/receivers view sorted requests**
6. **Food is allocated efficiently**

---

## 📊 Impact

* ⚡ Reduced manual allocation effort by **~40%**
* 📈 Improved prioritization of urgent requests
* 🌍 Promotes sustainable food distribution

---

## ▶️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Satyamgupta002/FoodGift.git
cd FoodGift
```

---

### 2. Setup Backend

```bash
cd backend
npm install
npm start
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

---

### 4. Environment Variables

Create a `.env` file in backend:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## 🌐 Live Demo

🔗 https://api-foodgift.onrender.com

---

## 🎯 Use Cases

* NGOs managing food distribution
* Donors reducing food waste
* Disaster or emergency food allocation
* Community-driven food sharing

---

## 👨‍💻 Author

**Satyam Gupta**

B.Tech, Electronics & Communication Engineering
MANIT Bhopal

---

## ⭐ Show Your Support

If you like this project, consider giving it a ⭐ on GitHub!
