# Resourcely

An AI-Powered Full Stack app where managers can manage assignments across projects. He/she can track who is working on which assignment, their capacity, add projects, and when engineer will be available for new projects.<br/>
Built with React + Typescript, tailwind css, shadcn, MongoDb database, Express, Node, Context API, React Hook Form with Zod

---

## Demo Link

[Live Demo](https://resourcely-frontend-green.vercel.app/)

---

## Login

**For Managers**

| Email                                                         | Password    |
| ------------------------------------------------------------- | ----------- |
| [emma.davis@resourcely.com](mailto:emma.davis@resourcely.com) | password123 |
| [alex.brown@resourcely.com](mailto:alex.brown@resourcely.com) | password123 |

**For Engineers**

| Email                                                               | Password    |
| ------------------------------------------------------------------- | ----------- |
| [john.doe@resourcely.com](mailto:john.doe@resourcely.com)           | password123 |
| [jane.smith@resourcely.com](mailto:jane.smith@resourcely.com)       | password123 |
| [mike.wilson@resourcely.com](mailto:mike.wilson@resourcely.com)     | password123 |
| [sarah.johnson@resourcely.com](mailto:sarah.johnson@resourcely.com) | password123 |

---

## Quick Start

```
git clone https://github.com/priyanka-s12/resourcely_frontend.git
cd resourcely_frontend
npm run dev
```

---

## Technologies

- React + Typescript
- Tailwind CSS with Shadcn
- Express.js
- MongoDb
- Node.js
- React Hook Form with Zod
- Context API
- JWT
- React Router
- chart.js for visualisation

---

## Demo Video

Watch a walkthrough (7 minutes) of all major features of this app: [Youtube Video](https://youtu.be/-zj5E84_YY0)

---

## Features

- JWT based authentication
- Login with two roles - Manager & Engineer
- Manager and Engineer Dashboard
- Reports
- Responsive Design
- Restful API

---

## AI tools

- ChatGPT for solving errors
- v0 helped to design pages and code generation
- Cursor IDE used it generates so much boilerplate code
  - I struggled when I used first time as It installed older version of tailwind css and I was unable to figure out errors but with time I understood and I started referring docs to solve that error.
- Yes AI helped to speed up the process but you need to read each line of code to figure out what to keep and what code not to keep as per project demands

---

## API Endpoints

For Authentication: <br/>
POST /api/auth/login <br/>
GET /api/auth/profile <br/>

For Engineers: <br/>
GET /api/engineers <br/>
GET /api/engineers/:id/capacity <br/>

For Projects: <br/>
GET /api/projects <br/>
POST /api/projects <br/>
GET /api/projects/:id <br/>

For Assignments: <br/>
GET /api/assignments <br/>
POST /api/assignments <br/>
PUT /api/assignments/:id <br/>
DELETE /api/assignments/:id <br/>

---

## Github Repos

[Frontend](https://github.com/priyanka-s12/resourcely_frontend)<br/>
[Backend](https://github.com/priyanka-s12/resourcely_backend)

---

## Contact

For bugs or feature request, please reach out to priyanka.sarode057@gmail.com
