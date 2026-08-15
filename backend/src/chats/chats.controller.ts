import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { CreateChatInput, SetChatVoteInput, UpdateChatInput } from '../../../shared/types';
import { R } from '../common/r';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async list() {
    return R.success().data(await this.chatsService.list());
  }

  @Post()
  @HttpCode(200)
  async create(@Body() body: CreateChatInput) {
    return R.success().data(await this.chatsService.create(body.input?.trim()));
  }

  @Get(':id/votes')
  async listVotes(@Param('id') id: string) {
    return R.success().data(await this.chatsService.listVotes(id));
  }

  @Post(':id/votes')
  @HttpCode(200)
  async setVote(@Param('id') id: string, @Body() body: SetChatVoteInput) {
    return R.success().data(await this.chatsService.setVote(id, body.messageId, body.isUpvoted) ?? null);
  }

  @Post(':id/messages/:messageId/delete')
  @HttpCode(200)
  async removeMessage(@Param('id') id: string, @Param('messageId') messageId: string) {
    await this.chatsService.removeMessage(id, messageId);
    return R.success().data(null);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return R.success().data(await this.chatsService.get(id));
  }

  @Post(':id/update')
  @HttpCode(200)
  async update(@Param('id') id: string, @Body() body: UpdateChatInput) {
    return R.success().data(await this.chatsService.update(id, body));
  }

  @Post(':id/delete')
  @HttpCode(200)
  async remove(@Param('id') id: string) {
    await this.chatsService.remove(id);
    return R.success().data(null);
  }
}
