# pis-grupo06

Para iniciar el proyecto 

Crear archivo .env en la carpeta backend con: FRONTEND_ORIGIN=http://localhost:5173
crear archivo .env en la carpeta frontend con: VITE_API_URL=http://localhost:3000
Empezar a correr postgresql
Pararse en la carpeta backend y correr bundle install --gemfile
Deben crear la BD (Desde la carpeta /backend), para eso corren: rails db:create
Luego corren: rails db:migrate
El back se levanta con: rails s
Pararse en la carpeta frontend y correr: npm install
El front se levanta con: npm run dev


Las versiones que se usaron en momento de creación son 
Ruby → 3.4.5
Rails → 8.0.2.1
npm → 10.9.2
