// Load up the discord.js library
const Discord = require("discord.js");
const delay = require('delay');
const fs = require('fs');

const client = new Discord.Client();

const config = require("./config.json");
let settings = require("./settings.json");      //server settings
let data = require("./data.json");              //user data

let allowedString = "none";

var interval;
var scheduled;


client.on("ready", () => {
    //get time for logs
    var current = new Date(); 
    var ts = "[" + current.toLocaleString() + "]";

    console.log(ts + `> Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity("v 1.0.0 <3");
    
    return;
});
client.on("guildCreate", guild => {
    //get time for logs
    var current = new Date(); 
    var ts = "[" + current.toLocaleString() + "]";
    var defaultConfig = {
        name: guild.name,
        welcome: "Welcome! :wave:",
        adminRole: "Admin",
        welcomeChannel: "none",
        botChannel: "none",
        allowedRoles: ["None"],
        mutedRole: "none", 
        challengePass: "OFF"
    }
    
    console.log(ts + `> New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);

    if(!settings[guild.id]){
        settings[guild.id] = defaultConfig;
        
        fs.writeFile("./settings.json", JSON.stringify(settngs, null, 2), (err) => {
            if (err) console.log(err);
        });
    }
    
    return;
});
client.on("guildDelete", guild => {
    //get time for logs
    var current = new Date(); 
    var ts = "[" + current.toLocaleString() + "]";

    console.log(ts + `> I have been removed from: ${guild.name} (id: ${guild.id})`);
    delete settings[guild.id];
    
    fs.writeFile("./settings.json", JSON.stringify(settngs, null, 2), (err) => {
            if (err) console.log(err);
        });

    return;
});
client.on("guildMemberAdd", member => {
    //get time for logs
    var current = new Date(); 
    var ts = "[" + current.toLocaleString() + "]";

    console.log(ts + "> User " + member.user.tag + " has joined.");
    member.guild.channels.get(settings[member.guild.id].welcomeChannel).send(settings[member.guild.id].welcome); 
    return;
});
client.on("guildMemberRemove", member => {
    //get time for logs
    var current = new Date(); 
    var ts = "[" + current.toLocaleString() + "]";

    console.log(ts + "> User " + member.user.tag + " has left.");
    delete data[member.user.id];
    
     fs.writeFile("./data.json", JSON.stringify(data, null, 2), (err) => {
            if (err) console.log(err);
        });

    return;
});

client.on("message", async message => { 
    if(message.author.bot) return;  //ignore itself and other bots 
    if(settings[message.guild.id].botChannel != "none" && message.channel.id != settings[message.guild.id].botChannel) return;  //if botchannel configged, ignore anything else
    if(message.content.indexOf(config.prefix) !== 0) return;    //check for prefix
  
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    //get time for logs
    var current = new Date(); 
    var ts = "[" + current.toLocaleString() + "]";
    
    /*****BEGIN COMMANDS******/
    
    if(command === "help" || command === "commands"){
        message.channel.send("Server prefix: `" + config.prefix + "`\nUser commands:\n```-ping\n-role <role name>\n-pick <min> <max>\n-roll <size of die>\n-rps <selection>\n-challenge <target> <rps selection> <optional password>\n-points```");
        
        return;
    }
    
    else if(command === "config"){
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        
        var serverID = message.guild.id;
        var serverName = message.guild.name;
        
        
        if (args.length < 2 && args[0] != "-list" && args[0] != "-reset"){  //check correct number of args, print usage if incorrect
            message.channel.send("Usage: " + config.prefix + "config `<property>` `<new value>`\n Use -list to view the server config and -reset to change all back to default");
        }
        
        if(!settings[serverID]){    //if the server doesn't have a config already, make one
            settings[serverID] = defaultConfig;
        }
        
        //begin configuration commands
        if (args[0] === "welcome"){
            var mess = args.slice(1);
            settings[serverID].welcome = mess;
            message.channel.send("`welcome has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        else if (args[0] === "adminRole"){
            settings[serverID].adminRole = args[1];
            message.channel.send("`adminRole has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        else if (args[0] === "welcomeChannel"){
            settings[serverID].welcomeChannel = args[1];
            message.channel.send("`welcomeChannel has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        else if (args[0] === "botChannel"){
            settings[serverID].botChannel = args[1];
            message.channel.send("`botChannel has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        else if (args[0] === "allowedRoles"){
            var list = args.slice(1);
            settings[serverID].allowedRoles = list;
            message.channel.send("`allowedRoles has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
           
            //now update the list for !role
            allowedString = "";
            list.forEach((role) => {
                allowedString = allowedString.concat('- ' + role + '\n')
            });
        }
        else if (args[0] === "mutedRole"){
            settings[serverID].mutedRole = args[1];
            message.channel.send("`mutedRole has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        else if (args[0] === "challengePass"){
            settings[serverID].challengePass = args[1];
            message.channel.send("`challengePass has been updated.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        
        //utility commands
        else if (args[0] === "-reset"){
            settings[serverID] = defaultConfig;
            message.channel.send("`Server config for " + serverName + " has been reset.`");
            console.log("> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        }
        else if (args[0] === "-list"){
            message.channel.send(JSON.stringify(settings, null, 2));
        }
        else{
            message.channel.send("Hmm... I couldn't find that one.");
        }
        
        //write config changes
        fs.writeFile("./settings.json", JSON.stringify(settings, null, 2), (err) => {
            if (err) console.log(err);
        });
        
        console.log(ts + "> Server " + serverID + " has been reconfigured by " + message.author.tag + ".\n> New config: \n" + JSON.stringify(settings[serverID], null, 2));
        return;
    }
    else if(command === "ping") {
        // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
        // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
        const m = await message.channel.send("Pinging....");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
        
        return;
    }
    else if(command === "killbot") {     // This command kills the bot
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");

        message.channel.send("Goodbye, thanks for having me!\n`Bot is now offline.`");
        console.log("> Bot kill command administered by " + message.author.tag);
        await client.destroy();
        console.log("> Bot offline.");
        return;
    }
    else if(command === "reset") {  //basically just resets reminders and scheduled stuff
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        
        message.channel.send('Resetting...');
        console.log(ts + "> Bot reset command administered by " + message.author.tag);
        interval = 0;
        scheduled = 0;
        await client.destroy();
        console.log(ts + "> Bot offline.");
        await client.login(config.token);
        message.channel.send('Back online!');
        return;
    }
    else if(command === "say") {
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        
        const sayMessage = args.join(" ");
        message.delete().catch(O_o=>{}); 
        message.channel.send(sayMessage);
        return;
    }
    else if(command === "kick") {
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");

        // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        
        if(!member)
            return message.reply("Hmmmm... I can\'t find that user!");
        if(!member.kickable) 
            return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");

        let reason = args.slice(1).join(" ");
        if(!reason) reason = "No reason provided.";

        await member.kick(reason)
        .catch(error => message.reply("Sorry, I couldn't kick because of : ${error}"));
        
        message.channel.send(`${member} has been kicked by ${message.author.tag} because: ${reason}`);
        console.log(ts + "> User " + member.user.tag + " has been kicked for: \n>> " + reason + "\n>> Kicked by: " + message.author.tag);

        return;
    }
    else if(command === "mute") {
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        if (args.length < 2 || args[0] === "-help") {
            message.channel.send("Use `"+ config.prefix +"mute <user> <duration, in hours> <optional reason>` to mute a member.");
            return;
        }

        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!member)
            return message.reply("Please mention a valid member of this server");
        
        var time = 1000 * 60 * 60 * args[1]; //convert to hours
        var reason = args.slice(2).join(" ");
        if(!reason) reason = "No reason provided.";
        var muted = settings[message.guild.id].mutedRole;

        let role = message.guild.roles.find(r => r.name === muted);
        if (!role || role === "none") {
            message.channel.send("Hmmm... I can\'t seem to find the appropriate role. Make sure the server is configurated!");
            return;
        }
    
        //message.channel.send("User " + member.user.tag + " had the following roles: " + message.member.roles.map(role => role.name).slice(1).join(", "));
        //var prevRoles = member.roles.map(role => role.name).slice(1).join(", ");
        member.removeRoles(member.roles).catch(console.error);
        
        //mute the person
        member.addRole(role).catch(console.error);
        message.channel.send("`User` <@" + member.id + ">` has been muted for " + args[1] + " hours.\nReason: " + reason + "`");
        console.log(ts + "> User " + member.user.tag + " has been muted for " + args[1] + " hours.\n>> Reason: " + reason + "\n>> Muted by: " + message.author.tag);
        //console.log(">> They had the following roles: " + prevRoles);
        
        //unmute after time's up
        var timer = setTimeout(
            function(){ 
                member.removeRole(role).catch(console.error);
                message.channel.send("`User` <@" + member.id + "> `has been unmuted.`"); 
                console.log(ts + "> User " + member.user.tag + " has been unmuted.");
            }, time);

        return;
    }
    else if(command === "purge") {
        let member = message.author;
        let deletecount = 0;
        
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        
        if (args.length < 1) {      //makes it quicker if trying to delete in bulk
           deleteCount = 100;
        }
        else{
            // get the delete count, as an actual number.
            deleteCount = parseInt(args[0], 10);
        
            if(!deleteCount || deleteCount < 2 || deleteCount > 100)
                return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
        }
        
        const fetched = await message.channel.fetchMessages({limit: deleteCount});
        message.channel.bulkDelete(fetched)
        .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
        
        console.log(ts + "> " + deleteCount + " messages purged from: " + message.channel.name + " by user: " + message.author.tag);
        message.channel.send("`" + deleteCount + " messages have been deleted.`");
        
        await delay(3 * 1000);  //delete after 3 sec
        const once = await message.channel.fetchMessages({limit: 1});    // delete Bot's reply
        message.channel.bulkDelete(once)
        .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
        
        return;
    }   
    else if(command === "role") {
        //grab up to date list
        allowedString = "";
        list = settings[message.guild.id].allowedRoles;
        list.forEach((role) => {
            allowedString = allowedString.concat('- ' + role + '\n')
        });
        
        if (args.length != 1 || args[0] === '-list' || args[0] === '-help') {
            message.channel.send("These are the roles available for self-assign: \n`"+
                allowedString +
                "`\n Use "+ config.prefix +"role `<role_name>` to join a role! Please note: the bot is case-sensitive.");
        }

        // Get the role
        let role = message.guild.roles.find(r => r.name === args[0]);

        //does the role exist in the server?
        if (!role || role === null) {
            message.channel.send("Hmmmm... I can\'t find that role. Check your spelling! I'm case-sensitive ;)");
        }
        //is it allowed to be bot-added?
        if (settings[message.guild.id].allowedRoles.indexOf(role.name) === -1) {
            message.channel.send("Hmmm... you don\'t have permission! \nFor a list of available roles type "+ config.prefix +"role -list");
        }

        //do you have the role already?? if so, remove
        if (message.member.roles.has(role.id)){
            message.member.removeRole(role).catch(console.error);
            message.channel.send("`Role " + role.name + " has been removed.`");
            console.log(ts + "> Role " + role.name + " has been removed voluntarily from user " + message.author.tag);
        }
        else{ //add the role!
            message.member.addRole(role).catch(console.error);
            message.channel.send("`Congrats! You now have role " + role.name +".`");
            console.log(ts + "> Role " + role.name + " has been self-assigned to user " + message.author.tag);
        }

        return;
    }
    else if(command === "remind") {
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        
        if (args[0] === "-stop") {
            message.channel.send("I've stopped your recurring messages.");
            console.log(ts + "> Reminder halted by user " + message.author.tag);
            clearInterval(interval);
            return;
        }
        
        if (args.length < 2) {
            message.channel.send("Use `"+ config.prefix +"remind <minutes> <message>` to set up a recurring message! You may only set one at a time.\nUse `" + config.prefix + "remind -help` for help, and `" + config.prefix +"remind -stop` to stop the reminders.");
            return;
        }
        
        let minutes = args[0];
        let memo = args.slice(1);
        memo = memo.join(" ");
        let time = minutes * 60 * 1000;     //time is in milliseconds for the interval method
        let startDate = Date().toString();
        message.reply("your first message will send in " + minutes + " minute(s)!");
        console.log(ts + "> Reminder set by user " + message.author.tag + ". \n>> Message: " + memo + "\n>> Frequency: " + minutes + " minutes.");
        interval = setInterval(function(){
                        message.channel.send(memo);
                        } , time);
        
    }  
    else if(command === "schedule") {
        if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
            return message.reply("Sorry, you don't have permissions to use this!");
        
        if (args[0] === "-cancel") {
            message.channel.send("I've cancelled your scheduled message.");
            console.log(ts + "> Scheduled message cancelled by user " + message.author.tag);
            clearTimeout(scheduled);
            return;
        }
        
        if (args.length < 2) {
            message.channel.send("Use `"+ config.prefix +"schedule <hours from now to post> <message>` to set up a scheduled message! You may only set one at a time.\nUse `" + config.prefix +"schedule -cancel` to cancel your scheduled message.");
            return;
        }
        
        let hours = args[0];
        let memo = args.slice(1);
        memo = memo.join(" ");
        let time = hours * 60 * 60 * 1000;     //time is in milliseconds
        let startDate = Date().toString();
        message.reply("your message will send in " + hours + " hour(s)!");
        console.log(ts + "> Scheduled message created by user " + message.author.tag + ". \n>> Message: " + memo + "\n>> Occurring in: " + hours + " hours.");
        scheduled = setTimeout(function(){
                        message.channel.send(memo);
                        console.log(ts + "> Scheduled message sent.")
                        } , time);
        
    }  
    else if(command === "pick") {
        if (args.length != 2) {
            message.channel.send("Use `"+ config.prefix +"pick <min> <max>` to pick a random number within the range, inclusive!");
            return;
        }
        var min = Math.ceil(args[0]);
        var max = Math.floor(args[1]);
        var chosen = Math.floor(Math.random() * (max - min + 1)) + min;
        
        message.reply("I picked " + chosen + "!");
    
        return;
    } 
    else if(command === "roll") {
        if (args.length != 1) {
            message.channel.send("Use `"+ config.prefix +"roll <number of faces>` to roll a die!");
            return;
        }
        var min = 1;
        var max = Math.floor(args[0]);
        var chosen = Math.floor(Math.random() * (max - min + 1)) + min;
        message.reply("you rolled a " + chosen + "!");
        
        return;
    }
    else if(command === "rps"){
        const RPS = {
            1: "rock",
            2: "paper",
            3: "scissors"
        }
        
        if (args.length != 1) {
            message.channel.send("Use `"+ config.prefix +"rps <selection>` to play!");
            return;
        }
        
        var player = 0;
        var computer = 0;
        
        //normalize inputs
        if (args[0] === "r" || args[0] === "R" || args[0] === "rock") {
            player = 1;
        }
        else if (args[0] === "p" || args[0] === "P" || args[0] === "paper") {
            player = 2;
        }
        else if (args[0] === "s" || args[0] === "S" || args[0] === "scissors") {
            player = 3;
        }
        else {
            message.channel.send("Hmm... that doesn't seem to be a valid input.");
            return;
        }
        
        //calculate our roll
        computer = Math.floor(Math.random() * (3 - 1 + 1)) + 1;    //picks a number 1 2 or 3
        
        //print what each person picked
        message.channel.send("`You picked: " + RPS[player] + "\nBot picked: " + RPS[computer] + "`");
        
        //compare them and print result
        if (computer - player === 0) {
            message.channel.send("Tie! Let's try again :)");
        }
        if (computer - player === -1 || computer - player === 2){
            message.channel.send("You win! Wow, you're good at this game.");
        }
        if (computer - player === -2 || computer - player === 1) {
            message.channel.send("I win! Maybe you can beat me next time...");
        }
        
        return;
    }
    else if(command === "challenge"){
        //delete message immediately to avoidpassword sharing
        message.delete().catch(O_o=>{});
        
        var player = 0;     //player's choice
        var computer = 0;   //computer's choice
        var target = 0;     //target/ai used
        var ptsAdd = 0;     //points to add
        var winner = 0;     //winner
        var passOn = false;     //is the password on?
        
        var server = message.guild.id;
        var user = message.author.tag;  //create entry in data
        if(!data[message.author.id]){
            data[message.author.id] = {
                name: user
            }
        }
        if(!data[message.author.id][server]){
            data[message.author.id][server] = 0;
        }
        
        const RPS = {
                1: "rock",
                2: "paper",
                3: "scissors"
            };
        const names = {
                1: "Anna",
                2: "Spencer",
                3: "Dan"
            };

        
        if (settings[message.guild.id].challengePass != "OFF"){
            passOn = true;
        }
        if (args.length != 2 && args.length != 3) {
            message.channel.send("Use `"+ config.prefix +"challenge <target> <selection> <optional password>` to play!\nAvailable targets: `Anna` `Spencer` `Dan`");
            return;
        }
        
        else if (passOn){
            if (args.length != 3)
                return message.channel.send("Hmmm.. the password is on. Use `"+ config.prefix +"challenge <target> <selection> <password>` to play!\nAvailable targets: `Anna` `Spencer` `Dan`");
            
            if (args[2] === settings[message.guild.id].challengePass){
                passCorrect = true;
            }
            else {
                console.log(settings[message.guild.id].challengePass);
                console.log(args[2]);
                message.channel.send("Hmmm.. wrong password.");
                return;
            }   
        }
        //else, still run the game, but without point awarding
        
        //normalize inputs: target
        if (args[0] === "anna" || args[0] === "Anna") {
            target = 1;
        }
        else if (args[0] === "spencer" || args[0] === "Spencer") {
            target = 2;
        }
        else if (args[0] === "dan" || args[0] === "Dan") {
            target = 3;
        }
        else {
            message.channel.send("Hmm... try a different target! You can view the available targets by typing `" + config.prefix + "challenge`");
            return;
        }
        
        //normalize choice inputs
        if (args[1] === "r" || args[1] === "R" || args[1] === "rock") {
            player = 1;
        }
        else if (args[1] === "p" || args[1] === "P" || args[1] === "paper") {
            player = 2;
        }
        else if (args[1] === "s" || args[1] === "S" || args[1] === "scissors") {
            player = 3;
        }
        else {
            message.channel.send("Hmm... that doesn't seem to be a valid selection. Choose r, p, or s!");
            return;
        }

        //calculate our roll. We're using percentages here for easy balance math
        var min = 1;
        var max = 100;
        var rando = Math.floor(Math.random() * (max - min + 1)) + min;
        
        //weighted rolls
        if (target === 1){ 
            if (rando < 34){
                computer = 1;
            }
            else if (rando < 67){
                computer = 2;
            }
            else{
                computer = 3;
            }
        }
        if (target === 2){
            if (rando < 31){
                computer = 1;
            }
            else if (rando < 56){
                computer = 2;
            }
            else{
                computer = 3;
            }
        }
        if (target === 3){
            if (rando < 41){
                computer = 1;
            }
            else if (rando < 71){
                computer = 2;
            }
            else{
                computer = 3;
            }
        }
        
        //compare choices and determine winner, points awarded
        if (computer - player === 0) {  //draw
            if (passOn) ptsAdd = 1; 
            winner = "No one";
        }
        else if (computer - player === -1 || computer - player === 2){       //player wins
            if (passOn) ptsAdd = 2;  
            winner = message.author.tag;
        }
        else if (computer - player === -2 || computer - player === 1) {      //player loses
            if (passOn) ptsAdd = 0;
            winner = names[target];
        }
        
        //update data file
        data[message.author.id][server] = data[message.author.id][server] + ptsAdd; //add points to system
        data[message.author.id].name = message.author.tag;  //update this because people change a lot
        
        //write changes
        fs.writeFile("./data.json", JSON.stringify(data, null, 2), (err) => {
            if (err) console.log(err);
        });
        
        //print message
        if (!(passOn)) message.channel.send("`Password is off, no points awarded.`");
        
        var currPts = data[message.author.id][server];
        message.channel.send("```" + message.author.tag + " has challenged " + names[target] + "!\n"+ message.author.tag + " chose " + RPS[player] + "...\n" + names[target] + " chose " + RPS[computer] + "!\n--" + winner + " wins!--\n" + message.author.tag + " now has " + currPts + " points.```");
        
        console.log(ts + "> " + message.author.tag + " challenged " + names[target] + " and now has " + currPts + " points.\n>> Delta: " + ptsAdd);
        
        return;
    }
    else if(command === "points"){
        var member;
        var server = message.guild.id;
        
        if (args[0] === "-help") {
            message.channel.send("Use `"+ config.prefix +"points <optional user>` to view your or another member's points.");
            return;
        }
        
        if (args.length === 1){
            if(!message.member.roles.some(r=>[settings[message.guild.id].adminRole].includes(r.name)) )
                return message.reply("Sorry, you don't have permissions to use this!");
            else{
                member = message.mentions.members.first() || message.guild.members.get(args[0]);
                
                if(!member)
                    return message.reply("Please mention a valid member of this server.");
                else{
                    if(!data[member.id][server]){
                        message.channel.send("That user has no points on this server!");
                    }
                    else{
                        var pts = data[member.id][server];
                        message.channel.send("`User " + member.user.tag + " has " + pts + " points.`");
                    }
                }
            }
        }
        else if (args.length === 0){
            if(!data[message.author.id][server]){
                message.channel.send("You have no points on this server! Challenge someone to a game of RPS using `" + config.prefix + "challenge`.");
            }
            else{
                var pts = data[message.author.id][server];
                message.channel.send("You have `" + pts + "` points.");
            }
        }
        else{
            message.channel.send("Use `"+ config.prefix +"points <optional user>` to view your or another member's points.");
            return;
        }
        
        return;
    }
    else if(command === "leaderboard"){
        if (args.length != 0 || args[0] === "-help") {
            message.channel.send("Use `"+ config.prefix +"leaderboard` to view the leaderboard.");
            return;
        }
        
        var server = message.guild.id;
        var arr = [];
        for (var key in data) {
            // skip loop if the property is from prototype
            if (!data.hasOwnProperty(key)) continue;

            var obj = data[key];
            for (var prop in obj) {
                // skip loop if the property is from prototype
                if(!obj.hasOwnProperty(prop)) continue;

                if (prop != server) continue;
                else{
                    arr.push([("<@" + key + ">"), obj[prop]]);
                }
            }
        }
    
        arr.sort(compareSecondColumn);
        function compareSecondColumn(a, b) {
            if (a[1] === b[1]) {
                return 0;
            }
            else {
                return b[1]-a[1];
            }
        }

        message.channel.send("Top 3 Users: \n");
        for(var z = 0; z < 3; z++) {
            message.channel.send((z+1) + ". " + arr[z] + " points");
        }
    
    }
    
    else{
        return message.channel.send("Hmmm... can't find that command. Try `" + config.prefix + "help` to see a list of user commands.");
    }
    
    /*****END COMMANDS******/
});
client.login(config.token);