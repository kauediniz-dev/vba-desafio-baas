import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayModule } from './modules/gateway/gateway.module';
import { UsersModule } from './modules/users/users.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { AuthModule } from './modules/auth/auth.module';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        console.log('DB_HOST:', JSON.stringify(process.env.DB_HOST));
        console.log('DB_PORT:', JSON.stringify(process.env.DB_PORT));
        console.log('DB_DATABASE:', JSON.stringify(process.env.DB_DATABASE));

        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST'),
          port: Number(configService.get<string>('DB_PORT')),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),

          ssl: {
            rejectUnauthorized: false,
          },

          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    GatewayModule,
    UsersModule,
    CheckoutModule,
    OrdersModule,
    TransactionsModule,
    WithdrawalsModule,
    WebhooksModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
