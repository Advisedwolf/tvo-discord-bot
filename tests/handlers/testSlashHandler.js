import { expect } from 'chai';
import sinon from 'sinon';
import slashHandler from '../../src/handlers/slashHandler.js';
import * as replyHelpers from '../../src/utils/replyHelpers.js';

describe('slashHandler (production)', () => {
  let interaction, spyReplyError;

  beforeEach(() => {
    spyReplyError = sinon.stub(replyHelpers, 'replyError').resolves();
    interaction = {
      isChatInputCommand: () => true,
      commandName: 'nonexistent',
      client: { commands: new Map() },
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call replyError when command not found', async () => {
    await slashHandler.handle(interaction);
    expect(spyReplyError.calledOnceWith(interaction, 'error.command_not_found')).to.be.true;
  });
});
