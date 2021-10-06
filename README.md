# Blog-Proyect
_API creada con Node js + Express - MongoDB._

_Este proyecto esta desplegado en un servidor heroku con algunos endpoints detallados para su uso._

_https://blog-proyect.herokuapp.com/api-docs/_


## Comenzando 🚀

_Para ejecutar este proyecto es necesario incluir archivo config.env en la raiz del proyecto._

_El archivo debe contar con las siguentes variables NODE_ENV (development/production), PORT (puerto en que se desea ejecutar el servidor),
DATABASE (string de conexion de mongo cloud), DATABASE_LOCAL (string de conexion de mongo local), DATABASE_PASSWORD (password de la base de datos),
JWT_SECRET (string para encriptar signature de token), JWT_EXPIRES_IN (valor de expiracion de token), JWT_COOKIE_EXPIRES_IN (valor de expiracion de cookie)._

_Si se desea ocupar la base de datos local, se debe reemplazar "process.env.DATABASE" por "process.env.DATABASE_LOCAL" en el archivo server.js._

### Pre-requisitos 📋

_Instalar modulos de dependencia._

```
npm install
```

## Develpment mode ⚙️

_Para ejecutar la aplicación en Development mode se debe realizar el siguiente comando:_

```
npm run dev
```

## Production mode ⚙️

_Para ejecutar la aplicación en Production mode se debe realizar el siguiente comando:_

```
npm run prod
```



