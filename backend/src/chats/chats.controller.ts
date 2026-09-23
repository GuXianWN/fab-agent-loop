import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { R } from '../common/r';
import { CreateChatDto, SetMessageVoteDto, UpdateChatDto } from './dto/chat.dto';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  async list() {
    return R.success().data(await this.chatsService.list());
  }

  @Post()
  async create(@Body() body: CreateChatDto) {
    return R.success().data(await this.chatsService.create(body.input?.trim()));
  }

  @Get(':id/votes')
  async listVotes(@Param('id') chatId: string) {
    return R.success().data(await this.chatsService.listVotes(chatId));
  }

  @Post(':id/messages/:messageId/vote')
  async setVote(
    @Param('id') chatId: string,
    @Param('messageId') messageId: string,
    @Body() body: SetMessageVoteDto,
  ) {
    await this.chatsService.setVote(chatId, messageId, body.isUpvoted);
    return R.success().data(null);
  }

  @Post(':id/messages/:messageId/delete')
  async removeMessage(@Param('id') id: string, @Param('messageId') messageId: string) {
    await this.chatsService.removeMessage(id, messageId);
    return R.success().data(null);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return R.success().data(await this.chatsService.get(id));
  }

  @Post(':id/update')
  async update(@Param('id') id: string, @Body() body: UpdateChatDto) {
    return R.success().data(await this.chatsService.update(id, body));
  }

  @Post(':id/delete')
  async remove(@Param('id') id: string) {
    await this.chatsService.remove(id);
    return R.success().data(null);
  }
}
