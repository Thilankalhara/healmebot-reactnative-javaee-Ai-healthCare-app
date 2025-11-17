# Heal Me Bot

**🚫 Proprietary Project – All Rights Reserved**

This project, **Heal Me Bot**, including all code, assets, documentation, and associated materials, is the exclusive property of **Thilan Kalhara**.

You **MAY NOT**:

- Copy, reproduce, or distribute this project or its code
- Modify, adapt, or create derivative works
- Use it for commercial purposes
- Claim it as your own

without explicit written permission from the author.

For permissions or inquiries, contact: **thilanKalhara8@gmail.com**

---

## About

**Heal Me Bot** is a personal health assistant app that allows users to:

- Input personal health data (age, height, weight, health issues)  
- Receive AI-generated health and meal suggestions  
- Generate a personalized PDF health report for offline reference  

---

## Features

- **Personalized AI Suggestions** – Get health advice based on user metrics.  
- **PDF Report Generation** – Save or share reports offline.  
- **User Data Storage** – Store user name and preferences securely.
- **Daily usage limitations** - user could able to genarate 10 pdf per day  
- **Modern UI** – Splash screen, animated transitions, and user-friendly interface.  
- **Social Links** – Connect via Discord, LinkedIn, or GitHub.  

---

## Screenshots

![Splash Screen](../screenshots/splash.png)  
![Home Screen](../screenshots/home.png)  
![Input Screen](../screenshots/input.png)  
![Report Screen1](../screenshots/report1.png)
![Report Screen2](../assets/screenshots/report2.png)    
![Save PDF](../screenshots/pdf.png) 

---

## Authors

[@Thilankalhara](https://github.com/Thilankalhara)

## License

See the [LICENSE](./LICENSE) file for full copyright and usage terms.

## Installation

1. Clone the repository:  

```bash
git clone https://github.com/Thilankalhara/healmebot-reactnative-javaee-Ai-healthCare-app.git

---

## Project Overview

**Heal Me Bot** allows users to:

- Enter personal health data (age, height, weight, health issues)  
- Receive AI-generated meal and health suggestions  
- Generate a personalized PDF report  
- Store user data locally for later reference  

It uses a **Java EE backend** (servlets) and a **React Native frontend**.

---

## Frontend Setup

## Base URL

In `api.ts`, update the `BASE_URL` to match your backend server:

```ts
export const BASE_URL = 'http://YOUR_LOCAL_IP:8080/HealMeBot';
// or use Ngrok
export const BASE_URL = 'https://YOUR_NGROK_URL/HealMeBot';


