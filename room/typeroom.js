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
            excerpt: ''
        });
        this.clock.setInterval(() => {
            if (this.state.timeToStart === 0) {
                this.state.gameStart = true;
                this.clock.start();
            } else {
                this.state.timeToStart--;
            }
        }, 1000);
        this.updateExcerpt();
    }

    onJoin() {
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
        let player = this.playersByClientId.get(client);
        player.wpm = data.wordsFinished / 60;
        if (data.finished === true) {
            this.state.playersFinished++;
            player.finished = true;
            let time = this.clock.elapsedTime;
            player.wpm = 100;
        }
    }

    onLeave(client) {
        let player = this.playersByClientId.get(client);
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
                this.state.excerpt = excerpt
            });
    }
}