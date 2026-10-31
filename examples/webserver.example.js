/*
* src/modules/webserver.js
*/

const express = require("express");
const SSE = require("express-sse");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("../knex");
const path = require("path");
const oauth2 = require("../oauth2");
const config = require("../cfg");
const threads = require("../data/threads");
const { formatters } = require("../formatters");
const { summariseEmbedsAsText } = require("../embedLogging");
const cookieParser = require('cookie-parser');
const constants = require("../utils/constants");
const utils = require("../utils/utils");
const bot = require("../bot");

const THREAD_ID = /^[0-9a-f-]+$/;
const ID = /^\d+$/;

const API_ENDPOINT = "https://discord.com/api/v9";

const THREAD_CATEGORIES = {
  public: "719883529470738523",
  community: config.communityThreadCategoryId,
  admin: config.adminCategoryId
};
var sse;

function notfound(res) {
  res.status(404).send("Page Not Found");
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
async function serveLogs(req, res) {
  const thread = await threads.findById(req.params.threadId);
  if (! thread) return notfound(res);

  let threadMessages = await thread.getThreadMessages();

  threadMessages = threadMessages.map(msg => {
    const embeds = msg.getMetadataValue && msg.getMetadataValue("embeds");
    const forwardedEmbeds = msg.getMetadataValue && msg.getMetadataValue("forwardedEmbeds");
    const embedText = summariseEmbedsAsText(embeds, "User sent an embed");
    const forwardedEmbedText = summariseEmbedsAsText(forwardedEmbeds, "User forwarded an embed");

    if (! embedText && ! forwardedEmbedText) return msg;

    const injected = [msg.body, embedText, forwardedEmbedText].filter(Boolean).join("\n\n");
    msg.body = injected;
    return msg;
  });

  const formatLogResult = await formatters.formatLog(thread, threadMessages, {
    simple: Boolean(req.query.simple),
    verbose: Boolean(req.query.verbose),
  });

  const contentType = formatLogResult.extra && formatLogResult.extra.contentType || "text/plain; charset=UTF-8";

  res.set("Content-Type", contentType);
  res.send(formatLogResult.content);
}


/**
 * @param {express.Request} req
 */
async function viewPrivateThreads(req) {
  // Developers can simulate a normal user's view from the dashboard settings
  if (req.get("X-View-As-User")) return false;
  const user = await oauth2.getAuthUser(req.cookies.token);
  return oauth2.isDashAdmin(user);
}

if (!sse) {
  sse = new SSE();
};

const server = express();
server.use(cookieParser());
server.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net", "https://cdn.discordapp.com"],
    scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
  },
}));
server.use(cors());

server.get(config.redirectPath, oauth2.login);
server.use(oauth2.checkAuth);

server.use(express.static(path.join(__dirname, '../dashboard/dist/')));

server.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.flush = () => undefined;
  next();
});

server.get("/threads", async (req, res) => {
  let { limit: lim, page, user, sort_by, reverse, privacy, status, category } = req.query;
  let limit = parseInt(lim) || 50;

  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  page = parseInt(page) || 0;
  reverse = reverse != null;
  
  let q = knex("threads");

  // Send necessary threads only
  const viewAll = await viewPrivateThreads(req);

  if (!viewAll) {
    q.where("isPrivate", 0);
  } else {
    if (privacy === "private") q.where("isPrivate", 1);
    if (privacy === "public") q.where("isPrivate", 0);
  };
    
  if (status === "open") {
    q.where("status", constants.THREAD_STATUS.OPEN);
  } else if (status === "closed") {
    q.where("status", constants.THREAD_STATUS.CLOSED);
  };

  // Only admins may filter by the admin category
  if (THREAD_CATEGORIES[category] && (category !== "admin" || viewAll)) {
    q.where("category", THREAD_CATEGORIES[category]);
  };

  if (user) {
    q.where("user_id", user);
  } else {
    q.select("*");
  };

  let total = (await q.clone().count())[0]["count(*)"];
  let offset = page * limit;

  if (sort_by) {
    q.orderBy(sort_by, reverse ? "asc" : "desc");
  };

  q.orderBy("created_At", "desc");

  res.json({
    total: total,
    includePrivate: viewAll,
    threads: await q.limit(limit).offset(offset)
  });
});

server.get("/threads/:id", async (req, res) => {
  let thread = await knex("threads").where("id", req.params.id).first();
  if (! thread)
    return notfound(res);

  if (thread.isPrivate) {
    const viewAll = await viewPrivateThreads(req);

    if (! viewAll) {
      return privateThread(res);
    }
  }

  res.json(thread);
});

server.get("/users", async (req, res) => {
  let users = await knex("threads").select("user_id", "user_name")
    .groupBy("user_id").orderBy("created_at", "desc");
  res.json(users.map(u => ({ id: u.user_id, name: u.user_name })));
});

server.get("/logs/:id", async (req, res) => {
  const threadId = req.params.id;
  if (threadId.match(THREAD_ID) === null)
    return notfound(res);

  const thread = await threads.findById(threadId);
  if (! thread)
    return notfound(res);

  if (thread.isPrivate) {
    const viewAll = await viewPrivateThreads(req);

    if (! viewAll) {
      return privateThread(res);
    }
  }

  const logs = await thread.getThreadMessages();
  res.json(logs);
});

server.get("/avatars/:id", async (req, res) => {
  if (!req.params.id) return;
  if (!utils.isSnowflake(req.params.id)) {
    res.set("Cache-Control", "max-age=3600").redirect('https://discordapp.com/assets/dd4dbc0016779df1378e7812eabaa04d.png');
    return;
  }
  const user = bot.users.get(req.params.id) || await bot.getRESTUser(req.params.id).catch(
    /** @param {import('eris').DiscordRESTError | import('eris').DiscordHTTPError} e */
    (e) => {
      if (e.code === 404 || e.code === 10013) {
        res.status(400).send("<pre>400 Bad Request</pre>");
      } else {
        process.emit("unhandledRejection", e);
        res.status(500).send(`<pre>500 Server Error: ${e}</pre>`);
      }
      return null;
    });
  if (! user) return;
  res.set("Cache-Control", "max-age=3600").redirect(user.avatarURL);
});

server.get("/stream", sse.init);

server.get(["/thread/:id", "/settings/:category"], (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard/dist/index.html'));
});

server.on("error", err => {
  console.log("[WARN] Web server error:", err.message);
});

module.exports = (_sse) => {
  sse = _sse;
  return server;
};