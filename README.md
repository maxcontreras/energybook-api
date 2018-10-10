# Energybbook API #

## Getting Started ##
Hey there! This is Energybook API code. Before you start coding follow this instructions to successfully set your environment.

Before we continue make sure to have **NodeJS & NPM** already installed on your computer.

We highly recommend you to take a quick look to these libraries that we're using on our project:

* Loopback NodeJS framework. [docs](https://loopback.io/doc/).
* MongoDB [docs](https://docs.mongodb.com/).
* Socket communication [docs](https://www.npmjs.com/package/engine.io).
* CronJob [docs](https://github.com/kelektiv/node-cron).

## Clone the project ##
First and foremost, clone this repository with a

```
#!javascript
$ git clone https://github.com/maxcontreras/energybook-api.git
```

But you already know that, right?

Once cloned install all required dependencies with `npm install` or `npm i`.

## Setup Zubut docker containers ##
Open your system terminal or cmd.

Run mongo with:

```
#!javascript
$ mongod
```

Run the API code with:

```
#!javascript
$ forever -w server/server.js
```

Look for the following output in your logs:

```
#!javascript
Web server listening at: http://0.0.0.0:3000
Browse your REST API at http://0.0.0.0:3000/explorer
```

## Development work ##
*Last but not least,* here are some insight on how we work as a dev team.

   * As the name suggest the main branch is **development** and every new branch has to be created from there.
   * Always pull the latest changes from the main branch before create a new one.
   * For every ticket you took **create a new branch** and name it after the same ticket number.
   * Once you finished your ticket, pull the latest changes from development, some other team member may have pushed new code.
   * If you finished your ticket and pulled the latest from dev *(as mentioned above)*, create a new pull request **using ticket number & title**, add all other team members to review it & check **"Close source branch after merge"**
   * Try to be specific on how to test & run your pull request. If you need another branch from front-end add the link.
   * Wait for at least **2 approvals** of other team members, once approved, merged it and update your ticket in Jira.

### Other Zubut repositories ###
You might need these links sooner rather than later.

   * [web app](https://github.com/maxcontreras/energybook-api.git).
**Happy coding!**
