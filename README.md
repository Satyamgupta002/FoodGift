## FoodGift
### Smart Donation Management Platform for Resource Redistribution
---

## About the Project

FoodGift is a location-aware donation platform that enables users to donate food, clothes, books, toys, and other essentials to nearby NGOs. Using geolocation, it automatically identifies NGOs within the donor's configured service radius, eliminating the need for manual coordination and ensuring faster, more efficient resource distribution.

- Manages the complete donation lifecycle—from donor registration and donation creation to NGO acceptance, OTP-based pickup verification, and successful donation completion.

- Every donation request has a configurable expiry time. Using BullMQ and Redis, FoodGift schedules delayed background expiry jobs to automatically expire unaccepted, unpicked, or cancelled donations, eliminating the need for cron jobs.

- Uses **location-based NGO matching** by converting donor addresses into geographical coordinates and notifying only NGOs operating within the configured service radius.

- Supports secure cloud-based image management through **Cloudinary**, allowing donors to upload donation images efficiently.

- Implements **role-based authentication** with separate donor and NGO accounts, protected routes, and secure password hashing using **bcrypt**.

- Includes **OTP-based pickup verification**, ensuring that donations are marked as picked up only after successful verification, making the donation process more secure and reliable.

- Provides an **in-app notification system** that informs NGOs informed about OTP send by the Donor.

---

## Why FoodGift Stands Out

### 📍 Smart Location-Based NGO Matching

Instead of displaying every donation request to every NGO, FoodGift uses geographical coordinates to identify NGOs within the donor's configured service radius, ensuring only eligible organizations receive requests and improving pickup efficiency.

### ⏳ Automated Donation Expiry Using Background Jobs

Every donation request has a predefined expiry time. Instead of periodically scanning the database with cron jobs, FoodGift uses **BullMQ** and **Redis** to schedule delayed background jobs that automatically expire donations, making the system more scalable and efficient.

### 🔐 OTP-Based Pickup Verification

After an NGO accepts a donation, the donor generates a time-limited OTP that must be verified before marking the donation as picked up, ensuring secure handovers and preventing unauthorized completion.

### 🔔 In-App Notification System

NGOs get the generated OTP directly within the application through a notification system. 

---
## End-to-End System Workflow

The following workflow illustrates how a donation moves through the FoodGift platform from creation to successful pickup.

```text
                     ┌─────────────────────────────┐
                     │       Donor Registers       │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │      Login to System        │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                     ┌─────────────────────────────┐
                     │   Create Donation Request   │
                     └──────────────┬──────────────┘
                                    │
                                    ▼
                ┌─────────────────────────────────────────┐
                │   Upload Donation Image to Cloudinary   │
                └─────────────────┬───────────────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────────────┐
                │ Convert Address → Latitude & Longitude  │
                │      using OpenCage Geocoding API       │
                └─────────────────┬───────────────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────────────┐
                │   Find NGOs within Configured Radius    │
                └─────────────────┬───────────────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────────────┐
                │   Nearby NGOs Receive Donation Request  │
                └─────────────────┬───────────────────────┘
                                  │
                                  ▼
                ┌─────────────────────────────────────────┐
                │      NGO Accepts Donation Request       │
                └─────────────────┬───────────────────────┘
                                  │
                                  ▼
      ┌─────────────────────────────────────────────────────────────┐
      │ Request Status → Accepted                                   │
      │                                                             │
      │ • Donor sees "Accepted"                                     │
      │ • Request removed from all other NGOs                       │
      │ • Accepted request remains visible only to selected NGO     │
      └─────────────────┬───────────────────────────────────────────┘
                        │
                        ▼
         ┌─────────────────────────────────────┐
         │      Donor Generates Pickup OTP     │
         └─────────────────┬───────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │    NGO Receives OTP Notification    │
         └─────────────────┬───────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │     NGO Arrives at Pickup Location  │
         └─────────────────┬───────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │    Donor Shares OTP with NGO        │
         └─────────────────┬───────────────────┘
                           │
                           ▼
         ┌─────────────────────────────────────┐
         │ OTP Verification (Valid for 10 min) │
         └─────────────────┬───────────────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
          OTP Verified        OTP Expired
                 │                   │
                 ▼                   ▼
  Donation Marked Picked Up    Generate New OTP
                 │
                 ▼
      Donation Successfully Completed
```

---
## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React.js** | Building the user interface |
| **Vite** | Fast development server & build tool |
| **Tailwind CSS** | Responsive UI styling |
| **React Router** | Client-side routing |
| **Axios** | HTTP communication with backend |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API development |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **BullMQ** | Background job processing |
| **Redis (Upstash)** | Queue storage for BullMQ |
| **Multer** | File uploads |
| **Cloudinary** | Cloud image storage |
| **OpenCage API** | Address geocoding |

### Development & Deployment

| Technology | Purpose |
|------------|---------|
| **Git** | Version control |
| **GitHub** | Source code hosting |
| **Render** | Backend & frontend deployment |
| **MongoDB Atlas** | Cloud database |
| **Upstash Redis** | Managed Redis service |
| **Cloudinary** | Media storage |

---

## Getting Started

Follow these steps to run the project locally.

### Clone the Repository

```bash
git clone https://github.com/Satyamgupta002/FoodGift.git
cd FoodGift
```
### Install Dependencies

```bash
cd backend
npm install
cd ..
cd frontend
npm install
```
### Environment Variables Setup

Create a `.env` file inside the `backend` directory and fill in environment variables mentioned in .env.example file.

### Start the application
```bash
cd FoodGift
cd backend
npm run dev
```
---
## Live Link
#### https://api-foodgift.onrender.com
---
## Planned Enhancements

- **ML-Based Urgency:** Train a model on real world donation data to predict the urgency of a particular donation so that we can prioritize the request.
  
- **Real-Time Chat:** Enable one-to-one communication between donors and NGOs after a donation request is accepted to simplify coordination during pickup.

- **Socket.IO Based Real-Time Updates:** Implement WebSockets to instantly synchronize donation requests, notifications, and status updates.

- **Message Delivery Status:** Introduce single-tick and double-tick indicators to show whether chat messages have been delivered and received.
---
## Author

**Satyam Gupta**

B.Tech, Electronics & Communication Engineering<br>
MANIT Bhopal

---

## Show Your Support

If you like this project, consider giving it a ⭐ on GitHub!
