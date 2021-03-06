import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { Categoria } from './interfaces/categorias/categoria.interface';
const ackErrors: string[] = ['E11000'];
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @EventPattern('crear-categoria')
  async crearCategoria(
    @Payload() categoria: Categoria,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`categoria: ${JSON.stringify(categoria)}`);
    try {
      await this.appService.crearCategoria(categoria);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);
      // ackErrors.map(async ackError => {
      //   if (err.message.includes(ackError)) {
      //     await channel.ack(originalMsg)
      //   }
      // })
      const filterAckError = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );
      if (filterAckError) {
        await channel.ack(originalMsg);
      }
    }
  }

  @MessagePattern('consultar-categorias')
  async consultarCategorias(@Payload() _id: string, @Ctx() context: RmqContext,) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      if (_id) {
        return await this.appService.consultarCategoriaPorId(_id);
      } else {
        return await this.appService.consultarCategorias();
      }
    } catch (err) {
      await channel.ack(originalMsg);
    }
  }

  @EventPattern('actualizar-categoria')
  async actualizarCategoria(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    this.logger.log(`categoria: ${JSON.stringify(data)}`);
    try {
      const _id: string = data.id
      const categoria: Categoria = data.categoria
      await this.appService.actualizarCategoria(_id, categoria);
      await channel.ack(originalMsg);
    } catch (err) {
      this.logger.error(`error: ${JSON.stringify(err.message)}`);
      const filterAckError = ackErrors.filter((ackError) =>
        err.message.includes(ackError),
      );
      if (filterAckError) {
        await channel.ack(originalMsg);
      }
    }
  }
}
