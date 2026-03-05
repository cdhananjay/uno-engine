import Game, { CardTypes, Colours } from "./../src/index.js";

describe("cards are maintained throughout the game", () => {
    test("game starts with 108 cards", () => {
        expect(startsWith108InitialCards()).toBe(true);
    });

    test("total card strength is maintained throughout the game = 108", () => {
        expect(maintainsTotalCardStrength()).toBe(true);
    });

    test("total number cards are equal throughout the game = 76", () => {
        expect(maintainsTypes(CardTypes.NUMBER, 76)).toBe(true);
    });

    test("total skip cards are equal throughout the game = 8", () => {
        expect(maintainsTypes(CardTypes.SKIP, 8)).toBe(true);
    });

    test("total reverse cards are equal throughout the game = 8", () => {
        expect(maintainsTypes(CardTypes.REVERSE, 8)).toBe(true);
    });

    test("total draw2 cards are equal throughout the game = 8", () => {
        expect(maintainsTypes(CardTypes.DRAW2, 8)).toBe(true);
    });

    test("total draw4 cards are equal throughout the game = 4", () => {
        expect(maintainsTypes(CardTypes.DRAW4, 4)).toBe(true);
    });

    test("total wild cards are equal throughout the game = 4", () => {
        expect(maintainsTypes(CardTypes.WILD, 4)).toBe(true);
    });

    test("RED colours are maintained throughout the game = 25", () => {
        expect(maintainsColour(Colours.RED)).toBe(true);
    });

    test("YELLOW colours are maintained throughout the game = 25", () => {
        expect(maintainsColour(Colours.YELLOW)).toBe(true);
    });

    test("GREEN colours are maintained throughout the game = 25", () => {
        expect(maintainsColour(Colours.GREEN)).toBe(true);
    });

    test("BLUE colours are maintained throughout the game = 25", () => {
        expect(maintainsColour(Colours.BLUE)).toBe(true);
    });

    test("Number cards with their values are maintained throughout the game = 25", () => {
        expect(maintainsNumbers()).toBe(true);
    });
});

function maintainsTotalCardStrength() {
    for (let i = 0; i < 10000; i++) {
        const g = new Game([
            { name: "p1", isBot: true },
            { name: "p2", isBot: true },
            { name: "p3", isBot: true },
        ]);

        let totalCards = g.drawPile.length + g.discardPile.length;
        for (const p of g.players) totalCards += p.hand.length;

        while (!g.isOver) {
            let currTotalCards = g.drawPile.length + g.discardPile.length;
            for (const p of g.players) currTotalCards += p.hand.length;
            if (currTotalCards !== totalCards) return false;

            if (g.currPlayer.isBot) {
                g.playTurn();
            } else throw new Error("player is not a bot");

            currTotalCards = g.drawPile.length + g.discardPile.length;
            for (const p of g.players) currTotalCards += p.hand.length;
            if (currTotalCards !== totalCards) return false;
        }
    }
    return true;
}

function startsWith108InitialCards() {
    for (let i = 0; i < 10000; i++) {
        const g2 = new Game([
            { name: "p1", isBot: true },
            { name: "p2", isBot: true },
            { name: "p3", isBot: true },
        ]);

        let totalCards = g2.drawPile.length + g2.discardPile.length;
        for (const p of g2.players) totalCards += p.hand.length;
        if (totalCards !== 108) return false;
    }
    return true;
}

function maintainsTypes(type: CardTypes, strength: number) {
    for (let i = 0; i < 10000; i++) {
        const g = new Game([
            { name: "p1", isBot: true },
            { name: "p2", isBot: true },
            { name: "p3", isBot: true },
        ]);
        let cards = 0;
        for (const card of g.drawPile) if (card.type === type) cards++;
        for (const card of g.discardPile) if (card.type === type) cards++;
        for (const p of g.players)
            for (const card of p.hand) if (card.type === type) cards++;
        if (cards !== strength) return false;

        while (!g.isOver) {
            let cards = 0;
            for (const card of g.drawPile) if (card.type === type) cards++;
            for (const card of g.discardPile) if (card.type === type) cards++;
            for (const p of g.players)
                for (const card of p.hand) if (card.type === type) cards++;
            if (cards !== strength) return false;

            if (g.currPlayer.isBot) {
                g.playTurn();
            } else throw new Error("player is not a bot");

            cards = 0;
            for (const card of g.drawPile) if (card.type === type) cards++;
            for (const card of g.discardPile) if (card.type === type) cards++;
            for (const p of g.players)
                for (const card of p.hand) if (card.type === type) cards++;
            if (cards !== strength) return false;
        }
    }
    return true;
}

function maintainsColour(colour: Colours) {
    for (let i = 0; i < 10000; i++) {
        const g = new Game([
            { name: "p1", isBot: true },
            { name: "p2", isBot: true },
            { name: "p3", isBot: true },
        ]);
        let cards = 0;
        for (const card of g.drawPile)
            if (card.colour !== undefined && card.colour === colour) cards++;
        for (const card of g.discardPile)
            if (card.colour !== undefined && card.colour === colour) cards++;
        for (const p of g.players)
            for (const card of p.hand)
                if (card.colour !== undefined && card.colour === colour)
                    cards++;
        if (cards !== 25) return false;

        while (!g.isOver) {
            let cards = 0;
            for (const card of g.drawPile)
                if (card.colour !== undefined && card.colour === colour)
                    cards++;
            for (const card of g.discardPile)
                if (card.colour !== undefined && card.colour === colour)
                    cards++;
            for (const p of g.players)
                for (const card of p.hand)
                    if (card.colour !== undefined && card.colour === colour)
                        cards++;
            if (cards !== 25) return false;

            if (g.currPlayer.isBot) {
                g.playTurn();
            } else throw new Error("player is not a bot");

            cards = 0;
            for (const card of g.drawPile)
                if (card.colour !== undefined && card.colour === colour)
                    cards++;
            for (const card of g.discardPile)
                if (card.colour !== undefined && card.colour === colour)
                    cards++;
            for (const p of g.players)
                for (const card of p.hand)
                    if (card.colour !== undefined && card.colour === colour)
                        cards++;
            if (cards !== 25) return false;
        }
    }
    return true;
}

function maintainsNumbers() {
    for (let i = 0; i < 10000; i++) {
        const g = new Game([
            { name: "p1", isBot: true },
            { name: "p2", isBot: true },
            { name: "p3", isBot: true },
        ]);
        let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (const card of g.drawPile)
            if (card.type === CardTypes.NUMBER) arr[card.value!]++;
        for (const card of g.discardPile)
            if (card.type === CardTypes.NUMBER) arr[card.value!]++;
        for (const p of g.players)
            for (const card of p.hand)
                if (card.type === CardTypes.NUMBER) arr[card.value!]++;
        if (arr[0] !== 4) return false;
        for (let i = 1; i <= 9; i++) if (arr[i] !== 8) return false;

        while (!g.isOver) {
            let arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (const card of g.drawPile)
                if (card.type === CardTypes.NUMBER) arr[card.value!]++;
            for (const card of g.discardPile)
                if (card.type === CardTypes.NUMBER) arr[card.value!]++;
            for (const p of g.players)
                for (const card of p.hand)
                    if (card.type === CardTypes.NUMBER) arr[card.value!]++;
            if (arr[0] !== 4) return false;
            for (let i = 1; i <= 9; i++) if (arr[i] !== 8) return false;

            if (g.currPlayer.isBot) {
                g.playTurn();
            } else throw new Error("player is not a bot");

            arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for (const card of g.drawPile)
                if (card.type === CardTypes.NUMBER) arr[card.value!]++;
            for (const card of g.discardPile)
                if (card.type === CardTypes.NUMBER) arr[card.value!]++;
            for (const p of g.players)
                for (const card of p.hand)
                    if (card.type === CardTypes.NUMBER) arr[card.value!]++;
            if (arr[0] !== 4) return false;
            for (let i = 1; i <= 9; i++) if (arr[i] !== 8) return false;
        }
    }
    return true;
}
