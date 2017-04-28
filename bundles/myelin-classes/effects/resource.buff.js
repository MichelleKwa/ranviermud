'use strict';

// Increases XP and resource gathering amount.

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Resource Buff',
      type: 'resource.buff',
    },
    flags: [Flag.BUFF],
    listeners: {
      reward(quest, player) {
        const bonus = Math.round(LevelUtil.mobExp(quest.config.level) * .5);
        Broadcast.sayAt(player, `You gain an experience bonus...`);
        player.emit('experience', bonus);
      },

      gather(resource, amount=0, name='resources') {
        const player = this.target;
        const currentResource = player.getMeta(resource) || 0;
        Broadcast.sayAt(player, `You are able to gather ${amount || 0} extra ${name}...`);
        player.setMeta(resource, currentResource + amount);
      },

      look(observer) {
        const player = this.target;
        if (observer.isNpc) { return; }
        if (player.isNpc) { return; }
        Broadcast.sayAt(observer, `Something about ${this.target.name} makes you want to give them a gift.`);
      }
    }
  };
};
