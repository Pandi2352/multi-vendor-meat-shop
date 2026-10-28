import { Injectable } from '@nestjs/common';
import { NotFoundAppException } from '#common/exceptions';
import { maskEmail } from '#common/utils';
import { UsersService } from '#modules/users';
import { MailService } from '#infra/mail';

@Injectable()
export class DeliveryNotificationService {
  constructor(
    private readonly users: UsersService,
    private readonly mail: MailService,
  ) {}

  async sendDeliveryOtp(
    customerId: string,
    orderNumber: string,
    shopName: string,
    otp: string,
    totalPaise: number,
  ): Promise<string | null> {
    try {
      const customer = await this.users.findById(customerId);
      if (customer?.email) {
        await this.mail.sendDeliveryOtpEmail(customer.email, {
          orderNumber,
          otp,
          shopName,
          customerName: customer.name,
          totalAmountPaise: totalPaise,
        });
        return customer.email;
      }
    } catch {
      // Non-blocking mail failure logged inside MailService
    }
    return null;
  }

  async resendDeliveryOtp(
    customerId: string,
    orderNumber: string,
    shopName: string,
    otp: string,
    totalPaise: number,
  ): Promise<string> {
    const customer = await this.users.findById(customerId);
    if (!customer?.email) {
      throw new NotFoundAppException('User', customerId);
    }

    await this.mail.sendDeliveryOtpEmail(customer.email, {
      orderNumber,
      otp,
      shopName,
      customerName: customer.name,
      totalAmountPaise: totalPaise,
    });

    return maskEmail(customer.email);
  }
}
