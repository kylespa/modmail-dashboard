# Modmail Dashboard

A Vue 3 port of [vap0r1ze's dashboard](https://github.com/Vap0r1ze/DaveDashboard) for [Dragory's modmail bot](https://github.com/dragory/modmailbot). Originally written for the [Dyno fork](https://github.com/flexlabs/modmailbot) of it.

## Installation Instructions
Note: While you can manually modify files yourself, I recommend using either [atlacord](https://github.com/atlacord/modmailbot) (basic) or [Dyno](https://github.com/FlexLabs/modmailbot/tree/dyno) (heavily-modified)'s forks. I 
1. Clone this repository into your bot's **`src`** directory.
2. In the dashboard directory, build the Vue app using **`npm run build`**. Alternatively, my fork has an additional script to take care of building when starting the bot.
2. Add **`redirectPath`**, **`dashAuthRoles[]`**, and **`dashAuthUser[]`** arrays to your bot's config file.
3. Modify your bot's webserver plugin to add API routes. You can use either of the aforementioned forks as a reference.
4. Add **`src/oauth2.js`** to add api. You can use either of the aforementioned forks as a reference.
5. Install **`jsonwebtoken`** and **`superagent`** using your favorite package manager.
6. Start the bot

# Example Preview
![](preview.gif)
