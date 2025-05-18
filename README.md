# QuizMaster - Telepítési és Konfigurációs Útmutató
## Rendszerkövetelmények

- Node.js (v14 vagy újabb)
- MongoDB (v4.4 vagy újabb)
- npm (Node Package Manager)

#### Backend
- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT for authentication
- Bcrypt for password hashing

## Telepítési Lépések
1. Projekt Klónozása:
   ```bash
   git clone https://github.com/Nvirs/Quiz-Master
   cd projekt elérési mappája
   ```
2. Függőségek Telepítése
   ### Backend függőségek
   ```bash
   cd server
   npm install
   ```
   ### Szükséges npm csomagok:
   - express
   - mongoose
   - jsonwebtoken
   - bcryptjs
   - cors
   - dotenv
3. Környezeti Változók Beállítása
   ### Hozz létre egy .env fájlt a server mappában:
   ```
   MONGODB_URI=mongodb://localhost:27017/quiz_db
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
4. Adatbázis Konfigurálása
   ### Indítsd el a MongoDB szervert:
   ```bash
   mongod
   ```
   #### Az adatbázis automatikusan létrejön az első kapcsolódáskor
5.Alkalmazás Indítása
   ### Backend szerver indítása:
   ```bash
   cd server
   npm start
   ```
   ### Frontend megnyitása:
   Nyisd meg a test.html fájlt egy modern böngészőben

