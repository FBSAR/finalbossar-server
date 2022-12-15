# New IP Address for IP Changes that are needed
    * environment.prod
    * AWS Route 53
    * update 'fbs-copy-www' aws ip address (ssh connections on local repository)

# Package.json
Add  "postinstall": "$(yum bin)/pm2 install typecsript" to "scripts" for PM2 package

 

# Using Nodenom with TypeScript files Locally & AWS
** npx nodemon server.ts
    * https://nodejs.dev/en/learn/the-npx-nodejs-package-runner

# Using PM2 with TypeScript files on AWS
** pm2 stop <id#>
** pm2 list
** ./node_modules/.bin/pm2 install typescript
    * Local PM2 installed in node_modules of project needs typescript installed
    * https://github.com/Unitech/pm2/issues/3312
** ./node_modules/.bin/pm2 start server.ts

# 
