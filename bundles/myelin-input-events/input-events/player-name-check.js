'use strict';

/**
 * Confirm new player name,
 * send to choose background or background tier.
 */
module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  return {
    event: state => (socket, args) => {
      const say = EventUtil.genSay(socket);
      const write = EventUtil.genWrite(socket);

      write(`<bold>NAME YOUR VESSEL '${args.name}'?</bold> <cyan>[y/n]</cyan> `);
      socket.once('data', confirmation => {
        say('');
        confirmation = confirmation.toString().trim().toLowerCase();

        if (!/[yn]/.test(confirmation)) {
          return socket.emit('player-name-check', socket, args);
        }

        if (confirmation === 'n') {
          say(`RETURNING...`);
          return socket.emit('create-player', socket, args);
        }

        // If they don't have enough karma, just send them right to the choosebackground menu.
        const memoryPoints = args.account.getMeta('memories');
        const tiers  = require(__dirname + '/../tiers');
        const costOfSecondTier = tiers[1].cost || 1;

        if (memoryPoints >= costOfSecondTier) {
          socket.emit('choose-bg-tier', socket, { playerName: args.name, account: args.account });
        } else {
          socket.emit('choose-background', socket, { playerName: args.name, account: args.account, tier: 0 });
        }

      });
    }
  };
};
