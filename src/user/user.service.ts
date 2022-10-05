import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { CashDto } from './dto/cash.dto';
import axios from 'axios';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('users') private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ status: number; message: string; data: object }> {
    const existedUser = await this.userModel
      .findOne({
        name: createUserDto.name,
      })
      .exec();
    if (!existedUser) {
      const user = new this.userModel(createUserDto);
      await user.save();
      return this.response(
        HttpStatus.CREATED,
        'User has been successfully created.',
        user,
      );
    }
    return this.response(
      HttpStatus.BAD_REQUEST,
      'User with such name has already been created!',
      {},
    );
  }

  async getBalance(
    id: string,
    currency: string,
  ): Promise<{ status: number; message: string; data: object }> {
    const convertUrl = this.configService.get('CONVERT_URL');
    const user = await this.userModel.findById(id).exec();
    if (user) {
      if (currency) {
        let convertedData;
        const parsedUrl = `${convertUrl}?to=${currency}&from=${user.currency}&amount=${user.balance}`;
        const options = {
          headers: {
            apikey: this.configService.get('CONVERT_API_KEY'),
          },
        };
        await axios
          .get(parsedUrl, options)
          .then(({ data }) => {
            console.log(data);
            convertedData = data;
          })
          .catch(({ response }) => console.log(response));
        return this.response(
          HttpStatus.OK,
          `User balance from ${user.currency} to ${currency} has successfully received!`,
          {
            convertedData,
          },
        );
      } else {
        return this.response(
          HttpStatus.OK,
          'User balance received successfully!',
          user,
        );
      }
    } else {
      return this.response(HttpStatus.NOT_FOUND, 'User not found', {});
    }
  }

  async send(
    id: string,
    cashDto: CashDto,
  ): Promise<{ data: object; message: string; status: number }> {
    const user = await this.userModel.findById(id).exec();
    if (user) {
      user.balance += cashDto.cash;
      await user.save();
      return this.response(
        HttpStatus.OK,
        `${cashDto.cash}$ has been successfully sent to ${user.name}`,
        user,
      );
    } else {
      return this.response(HttpStatus.NOT_FOUND, `User with id ${id} was not found!`, {});
    }
  }

  async withdraw(
    id: string,
    cashDto: CashDto,
  ): Promise<{ status: number; message: string; data: object }> {
    const user = await this.userModel.findById(id).exec();
    if (user) {
      const newBalance = user.balance - cashDto.cash;
      if (newBalance > 0 || newBalance === 0) {
        user.balance -= cashDto.cash;
        await this.userModel
          .findByIdAndUpdate(id, { balance: newBalance })
          .exec();
        return this.response(
          HttpStatus.OK,
          `${cashDto.cash}$ was successfully withdraw!`,
          user,
        );
      } else {
        return this.response(
          HttpStatus.BAD_REQUEST,
          'User balance is not enough!',
          {},
        );
      }
    } else {
      return this.response(HttpStatus.NOT_FOUND, `User with id ${id} was not found!`, {});
    }
  }

  async transfer(from: string, to: string, cashDto: CashDto) {
    const userFrom = await this.userModel.findById(from).exec();
    if (userFrom) {
      const userTo = await this.userModel.findById(to).exec();
      if (userTo) {
        if (userFrom.balance >= cashDto.cash) {
          userFrom.balance -= cashDto.cash;
          userTo.balance += cashDto.cash;
          await userFrom.save();
          await userTo.save();
          return this.response(
            HttpStatus.OK,
            `${cashDto.cash}$ was successfully sent from ${userFrom.name} to ${userTo.name}`,
            {},
          );
        } else {
          return this.response(
            HttpStatus.BAD_REQUEST,
            'Not enough balance',
            {},
          );
        }
      } else {
        return this.response(
          HttpStatus.NOT_FOUND,
          `User: ${to} was not found`,
          {},
        );
      }
    } else {
      return this.response(
        HttpStatus.NOT_FOUND,
        `User: ${from} was not found`,
        {},
      );
    }
  }

  response(status: number, message: string, data: object) {
    return {
      status,
      message,
      data,
    };
  }
}
