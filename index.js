// Module Imports and instances
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");
const webshot = require("webshot");

// Command Imports
const config = require("./src/config.json");
const blockCommand = require("./commands/block.js");
const removeBlockCommand = require("./commands/removeBlock.js");
const banCommand = require("./commands/ban.js");
const clearCommand = require("./commands/clear.js");
const verifylogs = require("./src/logs.json");



var waitingQueue = [];
var queue = [];
client.on("guildMemberAdd", (member) => {
    try {
        member.user.send({
            embed: {
                color: 0xffff00,
                description: "To verify yourself as a human, write `" + config.prefix + "receive` in the guild to receive your captcha"
            }
        });
    } catch (e) {
        console.log("[DISCORDCAPTCHA-guildMemberAdd] >> " + e)
    }
});


client.on("ready", () => {
    try {
        console.log("Logged in!")
        client.user.setGame(config.streamingGame, config.streamingLink);
    } catch (e) {
        console.log("[DISCORDCAPTCHA-readyEvent] >> " + e);
    }
});

client.on('message', (message) => {
    try {
        if (!message.guild) return;
        let tempQueryFile = JSON.parse(fs.readFileSync("./src/Query.json", "utf8"));
        const file = JSON.parse(fs.readFileSync("./src/config.json", "utf8"));
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();
        var time = new Date();
        if (file.blockedIDs[message.author.id]) {
            if (file.blockedIDs[message.author.id].blocked == "true") {
                message.member.kick();
                console.log(message.member + " was kicked.");
                message.delete();
            }
        }
        if (message.author.id != config.clientid) {
            if (message.content === config.prefix + "receive" || message.content === config.prefix + "verify" || message.content === config.prefix + "captcha") {
                if (message.channel.name === "verify") {
                    if (tempQueryFile.query[message.author.id]) {
                        message.delete();
                        return message.reply(":x:");
                    }
                    if (message.member.roles.has(config.userrole)) {
                        message.author.send({
                            embed: {
                                color: 0xff0000,
                                description: "Already verified on `" + message.guild.name + "`"
                            }
                        });
                    } else {
                        var captcha = Math.floor(Math.random() * 9000) + 1001;
                        var floor = Math.floor(Math.random() * 10000) + 1;
                        var fontFace, fontSize, fontPosition;
                        if (floor < 5000) {
                            fontFace = "Comic Sans MS";
                        } else if (floor >= 5000) {
                            fontFace = "Arial";
                        }
                        var floorx = Math.floor(Math.random() * 10000) + 1;
                        fontSize = Math.floor(Math.random() * 20) + 35;
                        var height = Math.floor(Math.random() * 20) + 10 + "%";
                        var width = Math.floor(Math.random() * 20) + 10 + "%";
                        var fontColor = config.possibleCaptchaColors[Math.floor(Math.random() * 4) + 1];
                        var bgColor = config.possibleCaptchaColors[Math.floor(Math.random() * 4) + 1];
                        var rotate = Math.floor(Math.random() * 70) + 11;
                        var letterSpacing = Math.floor(Math.random() * 30) + 10;
                        var boxWidth = Math.floor(Math.random() * 30) + 30;
                        var boxHeight = Math.floor(Math.random() * 30) + 30;
                        var boxColor = config.possibleCaptchaColors[Math.floor(Math.random() * 4) + 1];
                        var boxBorderSize = Math.floor(Math.random() * 7) + 1 + "px";
                        var boxMarginTop = Math.floor(Math.random() * 70) + 10 + "%";
                        var boxMarginLeft = Math.floor(Math.random() * 70) + 10 + "%";
                        if (Math.random() > Math.random()) {
                            var rbackup = rotate;
                            rotate -= rbackup;
                            rotate -= rbackup;
                        }
                        if (bgColor === fontColor) {
                            fontColor = config.possibleCaptchaColors[Math.floor(Math.random() * 4) + 1];
                        }
                        webshot('<html><body style=\'background-image: url("http://b.reich.io/jjvoab.png");\'><h1 style="font-family:' + fontFace + '; color:' + fontColor + '; font-size:' + fontSize + 'px; position: absolute; top:' + height + ';left:' + width + '; -moz-transform: rotate(' + rotate + 'deg); -ms-transform: rotate(' + rotate + 'deg);-o-transform: rotate(' + rotate + 'deg);-webkit-transform: rotate(' + rotate + 'deg);letter-spacing: ' + letterSpacing + 'px;"><i><del>' + captcha + '</del></i></h1></body></html>', './captchas/' + floor + '.png', {
                            siteType: 'html',
                            screenSize: {
                                width: 500,
                                height: 500
                            }
                        }, function (err) {
                            message.author.send("", {
                                files: ['./captchas/' + floor + ".png"]
                            })
                        });

                        setTimeout(function () {
                            fs.unlinkSync("./captchas/" + floor + ".png");
                        }, 30000);
                        message.author.send({
                            embed: {
                                color: 0x0000ff,
                                description: "Write `!verify` <code> in the guild to write in all channel. \n\n**Verification Bot made by y21#0909**"
                            }
                        });

                        tempQueryFile.query[message.author.id] = {
                            verified: "false"
                        };
                        queue.push(message.author + "x" + captcha);
                        waitingQueue.push(message.author.id);
                        verifylogs[message.author.id] = {
                            inQueue: Date.now(),
                            verifiedAt: false
                        };
                        fs.writeFile("./src/Query.json", JSON.stringify(tempQueryFile));
                        fs.writeFile("./src/logs.json", JSON.stringify(verifylogs));
                    }
                }
            } else if (message.channel.name === "verify" && message.content.includes(config.prefix + "verify")) {
                var input = message.content.substr(8);
                for (i = 0; i < queue.length; i++) {
                    var cpoint = queue[i].indexOf("x");
                }
                cpoint++;
                for (i = 0; i < queue.length; i++) {
                    var oldcaptcha = queue[i].substr(cpoint);
                }
                if (input === oldcaptcha) {
                    if (message.member.roles.has(config.userrole)) {
                        message.author.send({
                            embed: {
                                color: 0xff0000,
                                description: "Already verified on `" + message.guild.name + "`"
                            }
                        });
                    } else {
                        message.author.send({
                            embed: {
                                color: 0x00ff00,
                                description: "Successfully verified on `" + message.guild.name + "`"
                            }
                        });
                        client.channels.find('name', config.chat).send("<@" + message.author.id + "> was successfully verified.");
                        if (tempQueryFile.query[message.author.id])
                            tempQueryFile.query[message.author.id].verified = "true";
                        queue.pop();
                        if (verifylogs[message.author.id]) {
                            if (verifylogs[message.author.id].verifiedAt != false) return;
                            verifylogs[message.author.id].verifiedAt = Date.now();
                        } else {
                            console.log("This ain't looking good.");
                        }
                        message.member.addRole(config.userrole).catch(error => console.log(error));
                        fs.writeFile("./src/Query.json", JSON.stringify(tempQueryFile));
                        fs.writeFile("./src/logs.json", JSON.stringify(verifylogs));
                    }

                } else {
                    if (message.content.toLowerCase() != config.prefix + "verify") {
                        message.author.send("You were kicked from " + message.guild.name + " (WRONG_CAPTCHA)");
                        message.member.kick();
                    }
                }
            }
        }

        // Moderation Commands
        if (message.content.startsWith(config.prefix)) {
            switch (command) {
                case "ban":
                    banCommand(message);
                    break;
                case "block":
                    blockCommand(message, fs, config.prefix);
                    break;
                case "removeBlock":
                    removeBlockCommand(message, fs, config.prefix);
                    break;
                case "clear":
                    clearCommand(message);
                    break;
                case "eval":
                    if (message.author.id === config.ownerid && config.evalAllowed === "true") {
                        message.channel.send(":outbox_tray: Output: ```JavaScript\n" + eval(message.content.substr(6)) + "\n```");
                    }
                    break;
            }
        }


        // API Commands

        if (message.content.startsWith(config.prefix)) {
            switch (command) {
                case "api queries":
                    if (message.author.id === config.ownerid) {
                        const getQueryEntries = require("./api/GetQueryEntries.js");
                        message.channel.send("```js\n" + require("util").inspect(getQueryEntries(fs)) + "\n```");
                    }
                    break;
                case "api querydelete":
                    if (message.author.id === config.ownerid) {
                        require("./api/DeleteQueryEntries.js").all(fs);
                        message.channel.send("Deleted the query.");
                    }
                    break;
            }
        }


        (message.channel.name === "verify" || message.content.startsWith(config.prefix + "verify")) ? message.delete(): null; // Delete Message if channels' name is "verify"
    } catch (e) {
        console.log("[DISCORDCAPTCHA-message] >> " + e);
    }
});
client.login(config.token);
