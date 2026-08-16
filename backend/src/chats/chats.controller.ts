import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { R } from '../common/r';
import { CreateChatDto, SetChatVoteDto, UpdateChatDto } from './dto/chat.dto';
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
  async create(@Body() body: CreateChatDto) {
    return R.success().data(await this.chatsService.create(body.input?.trim()));
  }

  @Get(':id/votes')
  async listVotes(@Param('id', ParseUUIDPipe) id: string) {
    return R.success().data(await this.chatsService.listVotes(id));
  }

  @Post(':id/votes')
  @HttpCode(200)
  async setVote(@Param('id', ParseUUIDPipe) id: string, @Body() body: SetChatVoteDto) {
    return R.success().data(await this.chatsService.setVote(id, body.messageId, body.isUpvoted) ?? null);
  }

  @Post(':id/messages/:messageId/delete')
  @HttpCode(200)
  async removeMessage(@Param('id', ParseUUIDPipe) id: string, @Param('messageId', ParseUUIDPipe) messageId: string) {
    await this.chatsService.removeMessage(id, messageId);
    return R.success().data(null);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    return R.success().data(await this.chatsService.get(id));
  }

  @Post(':id/update')
  @HttpCode(200)
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateChatDto) {
    return R.success().data(await this.chatsService.update(id, body));
  }

  @Post(':id/delete')
  @HttpCode(200)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.chatsService.remove(id);
    return R.success().data(null);
  }
}
