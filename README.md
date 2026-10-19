# Library Book Management System (EMA3151)

React + Vite frontend for the Library Book Management lab question.

## Features
- List books and search by title, author, category or ISBN
- Add and edit book records
- Delete books
- Show availability/stock information
- Responsive layout and API error messages

## Run
1. Start your existing Spring Boot backend and database.
2. Install Node.js (LTS).
3. In this folder run `npm install`.
4. Copy `.env.example` to `.env.local` and adjust `VITE_API_BASE` if needed.
5. Run `npm run dev` and open the local URL shown by Vite.

The frontend expects the API base URL to be `http://localhost:8080/api` by default.
It calls `GET /books`, `POST /books`, `PUT /books/{id}`, and `DELETE /books/{id}`.
If your backend uses different paths or field names, update `src/api.js` to match its controller/entity.
Some backend actions may require an admin token. This starter intentionally does not hardcode credentials.
