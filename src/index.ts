export enum Colours {
    RED = 1,
    YELLOW,
    GREEN,
    BLUE,
}

export enum CardTypes {
    NUMBER = 1,
    SKIP,
    REVERSE,
    DRAW2,
    DRAW4,
    WILD,
}

export default class Game {
    private _isReversed: boolean = false;
    private readonly _players: Player[] = [];
    private readonly _drawPile: Card[] = [];
    private readonly _discardPile: Card[] = [];
    private _wildColour: Colours = Colours.RED;
    private _currPlayerIndex: number = 0;

    /**
     * Create a new game with given players.
     * @param players
     * @throws error if array size is less than 2 or more than 10
     */
    constructor(players: (string | { name: string; isBot: boolean })[]) {
        if (players.length < 2 || players.length > 10)
            throw new Error("a game can only have 2 to 10 players");

        for (const p of players)
            if (typeof p === "string") this._players.push(new Player(p));
            else this._players.push(new Player(p.name, p.isBot));

        this.fill(this._drawPile);
        this.shuffle(this._drawPile);
        this.distribute();
    }

    /**
     * @return an array consisting of all the players in the game
     */
    public get players() {
        return this._players;
    }

    /**
     * @return an array consisting of cards in draw pile
     */
    public get drawPile() {
        return this._drawPile;
    }

    /**
     * @return an array consisting of cards in discard pile
     */
    public get discardPile() {
        return this._discardPile;
    }

    /**
     * @return current player’s index in players array
     */
    public get currPlayerIndex() {
        return this._currPlayerIndex;
    }

    /**
     * @return current player object, equivalent of `this.players[this.currPlayer]`
     */
    public get currPlayer() {
        const player = this._players[this._currPlayerIndex];
        if (!player) throw new Error("Invalid current player index");
        return player;
    }

    /**
     * @return  index of player in the player’s array whose turn is next
     */
    public get nextPlayerIndex() {
        if (this._isReversed) {
            if (this._currPlayerIndex === 0) return this._players.length - 1;
            else return this._currPlayerIndex - 1;
        } else {
            if (this._currPlayerIndex === this._players.length - 1) return 0;
            else return this._currPlayerIndex + 1;
        }
    }

    /**
     * @return false if current player index moves from start to end of the player’s array, true otherwise
     */
    public get isReversed() {
        return this._isReversed;
    }

    /**
     * @return Returns: current player’s playable cards
     *
     * Playable Cards:
     * A card is playable if it follows any of the given conditions:
     *
     *     1. is Draw4 / Wild card
     *     2. discard pile top card is NOT Draw4 or Wild && card matches the discard pile top card
     *          by Colour, Number, Type (applicable only to Skip, Reverse, Draw2)
     *     3. discard pile top card is Draw4 or Wild && card matches the wild colour
     *
     * Wild colour: when player play’s a wild / draw4 card, player can choose a colour to set as wild colour
     */
    public get playableCards() {
        return this.currPlayer.hand.filter((card) => this.isPlayable(card));
    }

    /**
     * playTurn
     *
     *     -if no playable cards : current player draws a card
     *     -else if current player is a bot: choose random card and random colour (if required) and play it
     *     -else if only 1 playable card available which is NOT of type wild or draw4 :
     *          that card is played regardless of params given, return
     *     -else the given card and wildColour (if needed) are played
     * @param card card to play out of the `game.playableCards`, ignored if current player is a bot or no or 1 playable card
     * @param wildColour colour to set as the wildColour, ignored if card is not of type Wild or Draw4 or player is a bot
     * @throws error error if required parameters are not provided by players with `isBot = false`
     */
    public playTurn(card?: Card, wildColour?: Colours) {
        const playableCards = this.playableCards; // <=== this is just to reduce total calls

        /* =========== IMPORTANT ===========
            while doing performAction(card) then discardCard(this.currPlayer, card) :
            it might happen that card was skip and performAction changes
            currPlayerIndex to nextPlayerIndex, i.e. this.currPlayer changes
            so discardCard would discard from some other player
            hence we keep reference to the player whose turn is going on before doing anything

            other way around this would be just doing discardCard before performAction,
            but then I won't be able to write this! jk, this feels more safe
         */
        const player = this.currPlayer; // <=== keeping reference of the curr player

        if (playableCards.length === 0) {
            this.drawCard(player);
            this._currPlayerIndex = this.nextPlayerIndex;
            return;
        }

        if (this.currPlayer.isBot) {
            const index = Math.floor(Math.random() * playableCards.length);
            const cardToDiscard = playableCards[index]!;
            if (
                cardToDiscard.type === CardTypes.WILD ||
                cardToDiscard.type === CardTypes.DRAW4
            ) {
                wildColour = Math.floor(Math.random() * 4 + 1);
                this.performAction(cardToDiscard, wildColour);
            } else this.performAction(cardToDiscard);
            this.discardCard(player, cardToDiscard);
            this._currPlayerIndex = this.nextPlayerIndex;
            return;
        }

        if (playableCards.length === 1) {
            const cardToDiscard = playableCards[0]!;
            if (
                cardToDiscard.type === CardTypes.WILD ||
                cardToDiscard.type === CardTypes.DRAW4
            ) {
                if (wildColour !== undefined)
                    this.performAction(cardToDiscard, wildColour);
            } else throw new Error("colour not provided for wild card");
            this.discardCard(player, cardToDiscard);
            this._currPlayerIndex = this.nextPlayerIndex;
            return;
        } else {
            if (!card) throw new Error("card not provided to play");
            if (this.playableCards.indexOf(card) === -1)
                throw new Error("given card not playable");
            const cardToDiscard = card;
            if (
                cardToDiscard.type === CardTypes.WILD ||
                cardToDiscard.type === CardTypes.DRAW4
            ) {
                if (wildColour !== undefined)
                    this.performAction(cardToDiscard, wildColour);
            } else throw new Error("colour not provided for wild card");
            this.discardCard(player, cardToDiscard);
            this._currPlayerIndex = this.nextPlayerIndex;
            return;
        }
    }

    //==========================private methods below this==================================

    /** fills the given pile with the 108 uno cards
     * @param pile array which would be filled with cards
     * @private
     */
    private fill(pile: Card[]) {
        // Numbers : two copies of each 1 to 9 per colour, one 0 per colour = 19 × 4 colours = 76 Number cards
        for (let count = 0; count < 2; count++)
            for (let value = 1; value <= 9; value++)
                for (let colour = Colours.RED; colour <= Colours.BLUE; colour++)
                    pile.push(new Card(CardTypes.NUMBER, colour, value));

        for (let colour = Colours.RED; colour <= Colours.BLUE; colour++)
            pile.push(new Card(CardTypes.NUMBER, colour, 0));

        // Skip : two per colour = 2 × 4 colours = 8 Skip cards
        for (let count = 0; count < 2; count++)
            for (let colour = Colours.RED; colour <= Colours.BLUE; colour++)
                pile.push(new Card(CardTypes.REVERSE, colour));

        // Reverse: two per colour = 2 × 4 colours = 8 Reverse cards
        for (let count = 0; count < 2; count++)
            for (let colour = Colours.RED; colour <= Colours.BLUE; colour++)
                pile.push(new Card(CardTypes.SKIP, colour));

        // Draw2 : two per colour = 2 × 4 colours = 8 Draw2 cards
        for (let count = 0; count < 2; count++)
            for (let colour = Colours.RED; colour <= Colours.BLUE; colour++)
                pile.push(new Card(CardTypes.DRAW2, colour));

        // Draw4 : 4 initially uncoloured (gets coloured when discarded) = 4 Draw4 cards
        for (let count = 0; count < 4; count++)
            pile.push(new Card(CardTypes.DRAW4));

        // Wild : 4 initially uncoloured (gets coloured when discarded) = 4 Wild cards
        for (let count = 0; count < 4; count++)
            pile.push(new Card(CardTypes.WILD));
    }

    /**
     * shuffles the provided array with Fisher–Yates Shuffle (Knuth Shuffle) algorithm
     * @param pile array of cards which will be shuffled
     * @private
     */
    private shuffle(pile: Card[]) {
        for (let i = pile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = pile[j]!;
            pile[j] = pile[i]!;
            pile[i] = temp!;
        }
    }

    /**
     * moves 7 cards from the draw pile to each player's hand, then moves 1 card from draw pile to discard pile
     * @private
     */
    private distribute() {
        const initialCardsPerPlayer = 7;
        for (let count = 0; count < initialCardsPerPlayer; count++)
            for (const player of this._players)
                player.hand.push(this._drawPile.pop()!);
        this._discardPile.push(this._drawPile.pop()!);
    }

    /**
     * moves the last card in drawPile array to player's hand
     *
     *      -Note: top card of draw pile is actually the end of the draw pile array,
     *          i.e. the last element in draw pile. See it as a stack.
     *      -Note: When the draw pile runs out, all cards from discard pile except the top card are added to draw pile.
     *          So there is always a card available to draw provided the discard pile is not empty.
     * @param player player whose hand, the drawPile array's last card would be moved
     * @private
     * @throws error error if both discard pile and draw pile and empty.
     */
    private drawCard(player: Player) {
        const drawPileTopCard = this._drawPile.pop();
        if (drawPileTopCard) player.hand.push(drawPileTopCard);
        // When the draw pile runs out, all cards from discard pile except the top card are added to draw pile
        else {
            const discardPileTopCard = this._discardPile.pop();
            if (!discardPileTopCard)
                throw new Error(
                    "how did we come soo far? both discard pile and draw pile are empty",
                );
            this.shuffle(this._discardPile);
            while (this._discardPile.length > 0) {
                this._drawPile.push(this._discardPile.pop()!);
            }
            this._discardPile.push(discardPileTopCard);
        }
    }

    /**
     * moves the card from the current player's hand onto the top of discard pile.
     *
     *          Note: top card of discard pile is actually the end of the discard pile array,
     *          i.e. the last element in discard pile. See it as a stack.
     * @param player player from whose hand the provided card would be moved to discard pile
     * @param card the card to move from current player's hand and added to discard pile
     * @private
     * @throws error error if provided card was not found with current player
     */
    private discardCard(player: Player, card: Card) {
        const index = player.hand.indexOf(card);
        if (index === -1)
            throw new Error(
                `provided card ${card.toString()} was not found with current player \n${player.toString()}`,
            );
        this._discardPile.push(card);
        player.hand.splice(index, 1);
    }

    /**
     *
     *  *Playable Cards*:
     * A card is playable if it follows any of the given conditions:
     * 1. is Draw4 / Wild card
     * 2. discard pile top card is NOT Draw4 or Wild && card matches the discard pile top card by
     *      Colour, Number, Type (applicable only to Skip, Reverse, Draw2)
     * 3. discard pile top card is Draw4 or Wild && card matches the *wild colour*
     *
     * *Wild colour:* when player play's a wild / draw4 card, player can choose a colour to set as wild colour
     *
     * @param card a card to check if it is playable
     * @private
     * @return true if provided card is playable, else false
     */
    private isPlayable(card: Card) {
        const discardPileTopCard =
            this._discardPile[this._discardPile.length - 1];
        if (!discardPileTopCard)
            throw new Error("discard pile is empty, this should never happen");
        if (card.type === CardTypes.WILD || card.type === CardTypes.DRAW4)
            return true;
        // below this line, card is never wild or draw4
        if (discardPileTopCard.type === CardTypes.NUMBER)
            return (
                card.type === CardTypes.NUMBER &&
                (card.value === discardPileTopCard.value ||
                    card.colour === discardPileTopCard.colour)
            );
        else if (discardPileTopCard.type === CardTypes.SKIP)
            return (
                card.type === CardTypes.SKIP ||
                card.colour === discardPileTopCard.colour
            );
        else if (discardPileTopCard.type === CardTypes.REVERSE)
            return (
                card.type === CardTypes.REVERSE ||
                card.colour === discardPileTopCard.colour
            );
        else if (discardPileTopCard.type === CardTypes.DRAW2)
            return (
                card.type === CardTypes.DRAW2 ||
                card.colour === discardPileTopCard.colour
            );
        // discardPileTopCard.type is wild or draw4
        else return card.colour === this._wildColour;
    }

    /** Performs the following action based upton the parameters provided
     * - Skip: Next player loses their turn.
     * - Reverse: Direction of play flips.
     * - Draw2: Next player draws 2 cards.
     * - Draw4: Acts as Wild card, then next player draws 4 cards.
     * - Wild: Current player makes a colour choice, the chosen colour is now the wild colour.
     * @param card the card based upon whose type the action is performed
     * @param wildColour ignored if card type is not draw4 or wild, `this.wildColour` is set to provided wildColour
     * @private
     */
    private performAction(card: Card, wildColour?: Colours) {
        if (card.type === CardTypes.SKIP)
            this._currPlayerIndex = this.nextPlayerIndex;
        else if (card.type === CardTypes.REVERSE)
            this._isReversed = !this._isReversed;
        else if (card.type === CardTypes.DRAW2)
            for (let i = 0; i < 2; i++)
                this.drawCard(this._players[this.nextPlayerIndex]!);
        else if (card.type === CardTypes.DRAW4) {
            if (wildColour !== undefined) this._wildColour = wildColour;
            else
                throw new Error(
                    "wild colour not provided for wild card action",
                );
            for (let i = 0; i < 4; i++)
                this.drawCard(this._players[this.nextPlayerIndex]!);
        } else if (card.type === CardTypes.WILD) {
            if (wildColour !== undefined) this._wildColour = wildColour;
            else
                throw new Error(
                    "wild colour not provided for wild card action",
                );
        }
    }

    toString() {
        let str = `==== discardPile (top to down) ====\n`;
        for (let i = this._discardPile.length - 1; i >= 0; i--)
            str += `${this._discardPile[i]!.toString()}\n`;
        str += `==== drawPile (top to down) ====\n`;
        for (let i = this._drawPile.length - 1; i >= 0; i--)
            str += `${this._drawPile[i]!.toString()}\n`;
        str += `==== Players: ====\n`;
        for (const player of this._players) str += `${player.toString()}\n`;
        return str;
    }
}

class Player {
    readonly hand: Card[] = [];
    readonly name: string;
    readonly isBot: boolean;

    constructor(name: string, isBot: boolean = false) {
        this.name = name;
        this.isBot = isBot;
    }

    toString() {
        let str = `=== ${this.isBot ? "bot" : ""} ${this.name} ===\n`;
        for (const card of this.hand) str += `${card.toString()}\n`;
        return str;
    }
}

class Card {
    readonly type: CardTypes;
    readonly colour?: Colours;
    readonly value?: number;

    /**
     * creates a new card with given type, colour value
     * @param type
     * @param colour
     * @param value
     * @throws error if any card apart from draw4 & wild cards is not provided with colour parameter,
     * @throws error if number type card is not provided with a value
     */
    constructor(type: CardTypes, colour?: Colours, value?: number) {
        this.type = type;
        if (type !== CardTypes.WILD && type != CardTypes.DRAW4) {
            if (colour === undefined)
                throw new Error(
                    `colour not initialized to card of type ${type}`,
                );
            else this.colour = colour;
        }
        if (type === CardTypes.NUMBER) {
            if (value === undefined)
                throw new Error(
                    `value not initialized to card of type ${type}`,
                );
            else this.value = value;
        }
    }

    toString() {
        let str = "";
        str += this.type === CardTypes.NUMBER ? this.value : "";
        str += " ";
        str +=
            this.type === CardTypes.WILD || this.type === CardTypes.DRAW4
                ? ""
                : Colours[this.colour!];
        str += " ";
        str += this.type !== CardTypes.NUMBER ? CardTypes[this.type] : "";
        return str;
    }
}

export interface IPlayer extends Player {}
export interface ICard extends Card {}
