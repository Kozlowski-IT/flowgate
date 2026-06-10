import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './shared/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public() // health check — intentionally unauthenticated
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
