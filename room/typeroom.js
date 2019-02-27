const colyseus = require('colyseus');
const wiki = require('wikijs').default;

module.exports = class TypeRoom extends colyseus.Room {

    onInit() {
        this.maxClients = 4;
        this.setState({
            gameStart: false,
            timeToStart: 10,
            playersFinished: 0,
            numPlayers: 0,
            excerpt: '',
            players: {}
        });
        this.clock.setInterval(() => {
            if (this.state.timeToStart === 0) {
                this.state.gameStart = true;
                this.clock.clear();
                this.clock.start();
            } else {
                this.state.timeToStart--;
            }
            if (this.state.timeToStart === 3) {
                this.lock();
            }
        }, 1000);
        this.updateExcerpt();
    }

    onJoin(client) {
        this.state.players[client.sessionId] = {
            playerName: null,
            wpm: 0,
            finished: false,
            playerWordAt: 0,
            charactersTraversed: 0
        }
        this.state.numPlayers++;
        if (this.state.numPlayers === 4) {
            this.lock();
        }
    }

    requestJoin() {
        if (this.state.numPlayers === 4) {
            return false;
        } else {
            return true;
        }
    }

    onMessage(client, data) {
        let player = this.state.players[client.sessionId];
        if (!player.finished) { 
            if (data.name) {
                player.playerName = data.name;
            }
            if (data.wordInput) {
                let word = data.wordInput.replace(/\s/g, '');
                let success = false;
                if (player.playerWordAt < this.state.excerptArray.length) {
                    console.log(word);
                    console.log(this.state.excerptArray[player.playerWordAt]);
                    if (word === this.state.excerptArray[player.playerWordAt]) {
                        player.charactersTraversed += word.length;
                        success = true;
                    }
                    player.playerWordAt++;
                    let numWords = player.charactersTraversed / 4.84; //gets number of words traversed based on average
                    let timeSec = this.clock.elapsedTime / 1000; //time since game started
                    player.wpm = (numWords / timeSec) * 60; //gets words per minute
                    console.log(player.wpm);
                    this.send(client, { success });
                } else {
                    player.finished = true;
                }
            }
        }
    }

    onLeave(client) {
        let player = this.state.players[client.id];
        if (!player.finished) {
            player.wpm = 0;
        }
    }

    generateExcerpt() {
        return wiki()
            .page('Ape')
            .then(page => page.content())
            .then(content => {
                //some text processing based on how wikijs returns the article
                let contentArray = content.split(" ");
                let contentLength = contentArray.length;
                let excerptLength = 50;
                let randomWord = Math.floor(Math.random() * contentLength - excerptLength);
                let excerpt = "";
                let index = randomWord;
                while (!contentArray[index].includes('.')) {
                    index++;
                }
                index++;
                for (let i = index; i < excerptLength + randomWord; i++) {
                    if (!contentArray[i].includes('=')) {
                        excerpt += " " + contentArray[i];
                    }
                    if (i === excerptLength + randomWord - 1) {
                        let index = i;
                        do {
                            index++;
                            if (contentArray[index].includes('=')) {
                                contentArray[index].replace(/=/gi, '');
                            }
                            excerpt += " " + contentArray[index];
                        } while (!contentArray[index].includes('.'));
                    }
                }
                return excerpt;
            })
    }

    updateExcerpt() {
        this.generateExcerpt()
            .then(excerpt => {
                this.state.excerpt = excerpt;
                this.state.excerptArray = excerpt.split(" "); 
                this.state.excerptArray.shift(); //gets rid of an empty char at the beginning
            });
    }
}