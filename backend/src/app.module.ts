import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GatewayModule } from './modules/gateway/gateway.module';
import { UsersModule } from './modules/users/users.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WithdrawalsModule } from './modules/withdrawals/withdrawals.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<string>('DB_PORT')),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    GatewayModule,
    UsersModule,
    CheckoutModule,
    OrdersModule,
    TransactionsModule,
    WithdrawalsModule,
    WebhooksModule,
  ],
})
export class AppModule {}
